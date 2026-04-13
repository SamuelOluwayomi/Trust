// @ts-nocheck
import { expect } from "chai";
import hre from "hardhat";

const ethers = (hre as any).ethers;

describe("LoanSBT", function () {
  async function deployLoanSBT() {
    const [owner, loanManager, user1, user2] = await ethers.getSigners();
    const sbt = (await ethers.deployContract("LoanSBT")) as any;

    // Set loanManager as the authorized minter
    await sbt.setLoanManager(loanManager.address);

    return { sbt, owner, loanManager, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set correct name and symbol", async function () {
      const { sbt } = await deployLoanSBT();
      expect(await sbt.name()).to.equal("Trust Loan SBT");
      expect(await sbt.symbol()).to.equal("TSBT");
    });

    it("Should set deployer as owner", async function () {
      const { sbt, owner } = await deployLoanSBT();
      expect(await sbt.owner()).to.equal(owner.address);
    });
  });

  describe("LoanManager Authorization", function () {
    it("Should allow owner to set loan manager", async function () {
      const { sbt, loanManager } = await deployLoanSBT();
      expect(await sbt.loanManager()).to.equal(loanManager.address);
    });

    it("Should reject setLoanManager from non-owner", async function () {
      const { sbt, user1 } = await deployLoanSBT();
      await expect(
        sbt.connect(user1).setLoanManager(user1.address)
      ).to.be.reverted;
    });
  });

  describe("Minting", function () {
    it("Should allow LoanManager to mint SBT", async function () {
      const { sbt, loanManager, user1 } = await deployLoanSBT();
      const tx = await sbt
        .connect(loanManager)
        .mint(user1.address, ethers.parseEther("0.02"), 1);
      await expect(tx)
        .to.emit(sbt, "SBTMinted")
        .withArgs(user1.address, 0n, 1);
    });

    it("Should reject mint from non-LoanManager", async function () {
      const { sbt, user1 } = await deployLoanSBT();
      await expect(
        sbt.connect(user1).mint(user1.address, ethers.parseEther("0.02"), 1)
      ).to.be.revertedWith("Only LoanManager");
    });

    it("Should increment token IDs", async function () {
      const { sbt, loanManager, user1 } = await deployLoanSBT();
      
      await sbt.connect(loanManager).mint(user1.address, ethers.parseEther("0.02"), 1);
      await sbt.connect(loanManager).mint(user1.address, ethers.parseEther("0.05"), 2);

      const tokens = await sbt.getUserTokens(user1.address);
      expect(tokens.length).to.equal(2);
      expect(tokens[0]).to.equal(0n);
      expect(tokens[1]).to.equal(1n);
    });

    it("Should store correct metadata", async function () {
      const { sbt, loanManager, user1 } = await deployLoanSBT();
      const amount = ethers.parseEther("0.05");
      
      await sbt.connect(loanManager).mint(user1.address, amount, 2);

      const meta = await sbt.tokenMetadata(0);
      expect(meta.borrower).to.equal(user1.address);
      expect(meta.loanAmount).to.equal(amount);
      expect(meta.tier).to.equal(2);
      expect(meta.repaidAt).to.be.greaterThan(0n);
    });
  });

  describe("SBT Count", function () {
    it("Should return 0 for new user", async function () {
      const { sbt, user1 } = await deployLoanSBT();
      expect(await sbt.getUserSBTCount(user1.address)).to.equal(0n);
    });

    it("Should accurately track SBT count", async function () {
      const { sbt, loanManager, user1 } = await deployLoanSBT();
      
      await sbt.connect(loanManager).mint(user1.address, ethers.parseEther("0.02"), 1);
      expect(await sbt.getUserSBTCount(user1.address)).to.equal(1n);

      await sbt.connect(loanManager).mint(user1.address, ethers.parseEther("0.02"), 1);
      expect(await sbt.getUserSBTCount(user1.address)).to.equal(2n);

      await sbt.connect(loanManager).mint(user1.address, ethers.parseEther("0.05"), 2);
      expect(await sbt.getUserSBTCount(user1.address)).to.equal(3n);
    });

    it("Should track counts per user independently", async function () {
      const { sbt, loanManager, user1, user2 } = await deployLoanSBT();
      
      await sbt.connect(loanManager).mint(user1.address, ethers.parseEther("0.02"), 1);
      await sbt.connect(loanManager).mint(user1.address, ethers.parseEther("0.02"), 1);
      await sbt.connect(loanManager).mint(user2.address, ethers.parseEther("0.05"), 2);

      expect(await sbt.getUserSBTCount(user1.address)).to.equal(2n);
      expect(await sbt.getUserSBTCount(user2.address)).to.equal(1n);
    });
  });

  describe("Soulbound (Non-Transferable)", function () {
    it("Should revert transferFrom", async function () {
      const { sbt, loanManager, user1, user2 } = await deployLoanSBT();
      await sbt.connect(loanManager).mint(user1.address, ethers.parseEther("0.02"), 1);

      await expect(
        sbt.connect(user1).transferFrom(user1.address, user2.address, 0)
      ).to.be.revertedWith("SBT: non-transferable");
    });

    it("Should revert safeTransferFrom", async function () {
      const { sbt, loanManager, user1, user2 } = await deployLoanSBT();
      await sbt.connect(loanManager).mint(user1.address, ethers.parseEther("0.02"), 1);

      await expect(
        sbt.connect(user1)["safeTransferFrom(address,address,uint256,bytes)"](
          user1.address, user2.address, 0, "0x"
        )
      ).to.be.revertedWith("SBT: non-transferable");
    });
  });
});
