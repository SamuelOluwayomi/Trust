// @ts-nocheck
import { expect } from "chai";
import hre from "hardhat";

const ethers = (hre as any).ethers;

describe("LoanManager", function () {
  async function deployLoanManager() {
    const [owner, borrower1, borrower2] = await ethers.getSigners();

    // Deploy LoanSBT first
    const sbt = (await ethers.deployContract("LoanSBT")) as any;

    // Deploy MockKycSBT
    const kycSBT = (await ethers.deployContract("MockKycSBT")) as any;

    // Deploy LoanManager with both dependencies
    const loanManager = (await ethers.deployContract("LoanManager", [
      await sbt.getAddress(),
      await kycSBT.getAddress(),
    ])) as any;

    // Authorize LoanManager to mint SBTs
    await sbt.setLoanManager(await loanManager.getAddress());

    // Fund the loan pool
    await owner.sendTransaction({
      to: await loanManager.getAddress(),
      value: ethers.parseEther("10"),
    });

    // Approve borrowers for KYC
    await kycSBT.setKycStatus(
      borrower1.address,
      1, // BASIC level
      1  // APPROVED status
    );
    await kycSBT.setKycStatus(
      borrower2.address,
      1, // BASIC level
      1  // APPROVED status
    );

    return { loanManager, sbt, kycSBT, owner, borrower1, borrower2 };
  }

  // Deploy without KYC (address(0)) for testing backward compatibility
  async function deployWithoutKYC() {
    const [owner, borrower1, borrower2] = await ethers.getSigners();
    const sbt = (await ethers.deployContract("LoanSBT")) as any;
    const loanManager = (await ethers.deployContract("LoanManager", [
      await sbt.getAddress(),
      ethers.ZeroAddress,
    ])) as any;
    await sbt.setLoanManager(await loanManager.getAddress());
    await owner.sendTransaction({
      to: await loanManager.getAddress(),
      value: ethers.parseEther("10"),
    });
    return { loanManager, sbt, owner, borrower1, borrower2 };
  }

  describe("Deployment", function () {
    it("Should set correct SBT contract reference", async function () {
      const { loanManager, sbt } = await deployLoanManager();
      expect(await loanManager.sbtContract()).to.equal(await sbt.getAddress());
    });

    it("Should set correct KYC SBT reference", async function () {
      const { loanManager, kycSBT } = await deployLoanManager();
      expect(await loanManager.kycSBT()).to.equal(await kycSBT.getAddress());
    });

    it("Should set deployer as owner", async function () {
      const { loanManager, owner } = await deployLoanManager();
      expect(await loanManager.owner()).to.equal(owner.address);
    });
  });

  describe("Tier Calculation", function () {
    it("Should return Bronze for new user (0 SBTs)", async function () {
      const { loanManager, borrower1 } = await deployLoanManager();
      expect(await loanManager.getUserTier(borrower1.address)).to.equal(1); // Bronze
    });

    it("Should return correct loan limit for Bronze", async function () {
      const { loanManager, borrower1 } = await deployLoanManager();
      expect(await loanManager.getLoanLimit(borrower1.address)).to.equal(
        ethers.parseEther("0.02")
      );
    });
  });

  describe("Loan Application (with KYC)", function () {
    it("Should allow KYC-verified user to apply for loan", async function () {
      const { loanManager, borrower1 } = await deployLoanManager();
      const amount = ethers.parseEther("0.02");
      const collateral = (amount * 10n) / 100n;
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("test_nullifier_1"));

      await expect(
        loanManager.connect(borrower1).applyForLoan(amount, nullifier, {
          value: collateral,
        })
      )
        .to.emit(loanManager, "LoanIssued")
        .withArgs(borrower1.address, amount, 1); // tier 1 = Bronze
    });

    it("Should reject non-KYC user", async function () {
      const { loanManager, kycSBT, owner } = await deployLoanManager();
      const [, , , unverifiedUser] = await ethers.getSigners();

      const amount = ethers.parseEther("0.02");
      const collateral = (amount * 10n) / 100n;
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("unverified_null"));

      await expect(
        loanManager.connect(unverifiedUser).applyForLoan(amount, nullifier, {
          value: collateral,
        })
      ).to.be.revertedWith("HashKey KYC verification required");
    });

    it("Should reject duplicate nullifier", async function () {
      const { loanManager, borrower1, borrower2 } = await deployLoanManager();
      const amount = ethers.parseEther("0.02");
      const collateral = (amount * 10n) / 100n;
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("shared_nullifier"));

      // First loan succeeds
      await loanManager.connect(borrower1).applyForLoan(amount, nullifier, {
        value: collateral,
      });

      // Repay first loan to clear active loan state
      await loanManager.connect(borrower1).repayLoan({ value: amount });

      // Second user tries the same nullifier — should fail
      await expect(
        loanManager.connect(borrower2).applyForLoan(amount, nullifier, {
          value: collateral,
        })
      ).to.be.revertedWith("Identity already used for loan");
    });

    it("Should reject amount exceeding tier limit", async function () {
      const { loanManager, borrower1 } = await deployLoanManager();
      const amount = ethers.parseEther("0.05"); // Silver limit, but user is Bronze
      const collateral = (amount * 10n) / 100n;
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("over_limit"));

      await expect(
        loanManager.connect(borrower1).applyForLoan(amount, nullifier, {
          value: collateral,
        })
      ).to.be.revertedWith("Amount exceeds tier limit");
    });

    it("Should reject insufficient collateral", async function () {
      const { loanManager, borrower1 } = await deployLoanManager();
      const amount = ethers.parseEther("0.02");
      const tooLittle = ethers.parseEther("0.001"); // Less than 10%
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("low_collateral"));

      await expect(
        loanManager.connect(borrower1).applyForLoan(amount, nullifier, {
          value: tooLittle,
        })
      ).to.be.revertedWith("Insufficient collateral (10% required)");
    });

    it("Should reject second loan while first is active", async function () {
      const { loanManager, borrower1 } = await deployLoanManager();
      const amount = ethers.parseEther("0.02");
      const collateral = (amount * 10n) / 100n;

      await loanManager
        .connect(borrower1)
        .applyForLoan(amount, ethers.keccak256(ethers.toUtf8Bytes("n1")), {
          value: collateral,
        });

      await expect(
        loanManager
          .connect(borrower1)
          .applyForLoan(amount, ethers.keccak256(ethers.toUtf8Bytes("n2")), {
            value: collateral,
          })
      ).to.be.revertedWith("Already have active loan");
    });
  });

  describe("Loan Application (without KYC — bypass mode)", function () {
    it("Should allow any user when kycSBT is address(0)", async function () {
      const { loanManager, borrower1 } = await deployWithoutKYC();
      const amount = ethers.parseEther("0.02");
      const collateral = (amount * 10n) / 100n;
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("no_kyc_null"));

      await expect(
        loanManager.connect(borrower1).applyForLoan(amount, nullifier, {
          value: collateral,
        })
      ).to.emit(loanManager, "LoanIssued");
    });
  });

  describe("Repayment", function () {
    it("Should allow repayment and mint SBT", async function () {
      const { loanManager, sbt, borrower1 } = await deployLoanManager();
      const amount = ethers.parseEther("0.02");
      const collateral = (amount * 10n) / 100n;
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("repay_test"));

      await loanManager.connect(borrower1).applyForLoan(amount, nullifier, {
        value: collateral,
      });

      await expect(loanManager.connect(borrower1).repayLoan({ value: amount }))
        .to.emit(loanManager, "LoanRepaid");

      // SBT should have been minted
      expect(await sbt.getUserSBTCount(borrower1.address)).to.equal(1n);
    });

    it("Should return collateral on repayment", async function () {
      const { loanManager, borrower1 } = await deployLoanManager();
      const amount = ethers.parseEther("0.02");
      const collateral = (amount * 10n) / 100n;
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("collateral_return"));

      await loanManager.connect(borrower1).applyForLoan(amount, nullifier, {
        value: collateral,
      });

      const balanceBefore = await ethers.provider.getBalance(borrower1.address);
      const tx = await loanManager.connect(borrower1).repayLoan({ value: amount });
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(borrower1.address);

      // Balance should decrease by (amount - collateral_returned) + gasCost
      // i.e., user pays `amount` and gets `collateral` back
      const expected = balanceBefore - amount + collateral - BigInt(Math.floor(gasCost));
      expect(balanceAfter).to.equal(expected);
    });

    it("Should reject repayment with no active loan", async function () {
      const { loanManager, borrower1 } = await deployLoanManager();
      await expect(
        loanManager.connect(borrower1).repayLoan({ value: ethers.parseEther("0.02") })
      ).to.be.revertedWith("No active loan");
    });

    it("Should reject insufficient repayment amount", async function () {
      const { loanManager, borrower1 } = await deployLoanManager();
      const amount = ethers.parseEther("0.02");
      const collateral = (amount * 10n) / 100n;
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("low_repay"));

      await loanManager.connect(borrower1).applyForLoan(amount, nullifier, {
        value: collateral,
      });

      await expect(
        loanManager.connect(borrower1).repayLoan({ value: ethers.parseEther("0.01") })
      ).to.be.revertedWith("Insufficient repayment amount");
    });
  });

  describe("Tier Upgrades via SBTs", function () {
    it("Should upgrade to Silver after 1 SBT", async function () {
      const { loanManager, borrower1 } = await deployLoanManager();
      const amount = ethers.parseEther("0.02");

      // Get first loan and repay → 1 SBT
      await loanManager.connect(borrower1).applyForLoan(
        amount,
        ethers.keccak256(ethers.toUtf8Bytes("tier_up_1")),
        { value: (amount * 10n) / 100n }
      );
      await loanManager.connect(borrower1).repayLoan({ value: amount });

      expect(await loanManager.getUserTier(borrower1.address)).to.equal(2); // Silver
      expect(await loanManager.getLoanLimit(borrower1.address)).to.equal(
        ethers.parseEther("0.05")
      );
    });
  });

  describe("Default & Blacklist", function () {
    it("Should mark loan as defaulted after due date", async function () {
      const { loanManager, owner, borrower1 } = await deployLoanManager();
      const amount = ethers.parseEther("0.02");
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("default_test"));

      await loanManager.connect(borrower1).applyForLoan(amount, nullifier, {
        value: (amount * 10n) / 100n,
      });

      // Fast-forward past due date (30 days + 1 second)
      await ethers.provider.send("evm_increaseTime", [30 * 86400 + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(loanManager.connect(owner).markDefault(borrower1.address))
        .to.emit(loanManager, "LoanDefaulted");

      expect(await loanManager.blacklisted(borrower1.address)).to.equal(true);
    });

    it("Should prevent blacklisted user from borrowing", async function () {
      const { loanManager, owner, borrower1 } = await deployLoanManager();
      const amount = ethers.parseEther("0.02");

      await loanManager.connect(borrower1).applyForLoan(
        amount,
        ethers.keccak256(ethers.toUtf8Bytes("bl_1")),
        { value: (amount * 10n) / 100n }
      );

      await ethers.provider.send("evm_increaseTime", [30 * 86400 + 1]);
      await ethers.provider.send("evm_mine", []);
      await loanManager.connect(owner).markDefault(borrower1.address);

      await expect(
        loanManager.connect(borrower1).applyForLoan(
          amount,
          ethers.keccak256(ethers.toUtf8Bytes("bl_2")),
          { value: (amount * 10n) / 100n }
        )
      ).to.be.revertedWith("Blacklisted: previous default");
    });

    it("Should reject markDefault before due date", async function () {
      const { loanManager, owner, borrower1 } = await deployLoanManager();
      const amount = ethers.parseEther("0.02");
      const nullifier = ethers.keccak256(ethers.toUtf8Bytes("early_default"));

      await loanManager.connect(borrower1).applyForLoan(amount, nullifier, {
        value: (amount * 10n) / 100n,
      });

      await expect(
        loanManager.connect(owner).markDefault(borrower1.address)
      ).to.be.revertedWith("Loan not yet due");
    });
  });

  describe("KYC Management", function () {
    it("Should allow owner to update KYC SBT address", async function () {
      const { loanManager, owner } = await deployLoanManager();
      await loanManager.connect(owner).setKycSBT(ethers.ZeroAddress);
      expect(await loanManager.kycSBT()).to.equal(ethers.ZeroAddress);
    });

    it("Should reject setKycSBT from non-owner", async function () {
      const { loanManager, borrower1 } = await deployLoanManager();
      await expect(
        loanManager.connect(borrower1).setKycSBT(ethers.ZeroAddress)
      ).to.be.reverted;
    });

    it("Should return KYC info for verified user", async function () {
      const { loanManager, borrower1 } = await deployLoanManager();
      const [isVerified, level] = await loanManager.getUserKycInfo(borrower1.address);
      expect(isVerified).to.equal(true);
      expect(level).to.equal(1); // BASIC
    });

    it("Should return false for unverified user", async function () {
      const { loanManager } = await deployLoanManager();
      const [, , , , unverifiedUser] = await ethers.getSigners();
      const [isVerified] = await loanManager.getUserKycInfo(unverifiedUser.address);
      expect(isVerified).to.equal(false);
    });
  });

  describe("View Functions", function () {
    it("Should return active loan details", async function () {
      const { loanManager, borrower1 } = await deployLoanManager();
      const amount = ethers.parseEther("0.02");
      const collateral = (amount * 10n) / 100n;

      await loanManager.connect(borrower1).applyForLoan(
        amount,
        ethers.keccak256(ethers.toUtf8Bytes("view_test")),
        { value: collateral }
      );

      const loan = await loanManager.getActiveLoan(borrower1.address);
      expect(loan.amount).to.equal(amount);
      expect(loan.collateral).to.equal(collateral);
      expect(loan.status).to.equal(1); // Active
    });

    it("Should track totalBorrowed and totalRepaid", async function () {
      const { loanManager, borrower1 } = await deployLoanManager();
      const amount = ethers.parseEther("0.02");

      await loanManager.connect(borrower1).applyForLoan(
        amount,
        ethers.keccak256(ethers.toUtf8Bytes("tracking")),
        { value: (amount * 10n) / 100n }
      );

      expect(await loanManager.totalBorrowed(borrower1.address)).to.equal(amount);

      await loanManager.connect(borrower1).repayLoan({ value: amount });
      expect(await loanManager.totalRepaid(borrower1.address)).to.equal(amount);
    });
  });
});
