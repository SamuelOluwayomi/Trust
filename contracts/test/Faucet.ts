// @ts-nocheck
import { expect } from "chai";
import hre from "hardhat";

const ethers = (hre as any).ethers;

describe("Faucet", function () {
  async function deployFaucet() {
    const [owner, user1, user2] = await ethers.getSigners();
    const faucet = (await ethers.deployContract("Faucet")) as any;

    // Fund the faucet with 1 ETH
    await owner.sendTransaction({
      to: await faucet.getAddress(),
      value: ethers.parseEther("1"),
    });

    return { faucet, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the deployer as owner", async function () {
      const { faucet, owner } = await deployFaucet();
      expect(await faucet.owner()).to.equal(owner.address);
    });

    it("Should have correct DRIP_AMOUNT", async function () {
      const { faucet } = await deployFaucet();
      expect(await faucet.DRIP_AMOUNT()).to.equal(ethers.parseEther("0.002"));
    });

    it("Should have correct COOLDOWN", async function () {
      const { faucet } = await deployFaucet();
      expect(await faucet.COOLDOWN()).to.equal(86400n); // 24 hours
    });
  });

  describe("Claiming", function () {
    it("Should allow first-time claim", async function () {
      const { faucet, user1 } = await deployFaucet();
      const balanceBefore = await ethers.provider.getBalance(user1.address);

      const tx = await faucet.connect(user1).claim();
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(user1.address);
      expect(balanceAfter).to.equal(
        balanceBefore + ethers.parseEther("0.002") - BigInt(Math.floor(gasCost))
      );
    });

    it("Should emit Claimed event", async function () {
      const { faucet, user1 } = await deployFaucet();
      await expect(faucet.connect(user1).claim())
        .to.emit(faucet, "Claimed")
        .withArgs(user1.address, ethers.parseEther("0.002"));
    });

    it("Should reject claim within cooldown period", async function () {
      const { faucet, user1 } = await deployFaucet();
      await faucet.connect(user1).claim();

      await expect(faucet.connect(user1).claim()).to.be.revertedWith(
        "Wait 24 hours between claims"
      );
    });

    it("Should allow claim after cooldown expires", async function () {
      const { faucet, user1 } = await deployFaucet();
      await faucet.connect(user1).claim();

      // Fast-forward 24 hours + 1 second
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);

      await expect(faucet.connect(user1).claim()).to.emit(faucet, "Claimed");
    });

    it("Should allow different users to claim independently", async function () {
      const { faucet, user1, user2 } = await deployFaucet();
      await expect(faucet.connect(user1).claim()).to.emit(faucet, "Claimed");
      await expect(faucet.connect(user2).claim()).to.emit(faucet, "Claimed");
    });
  });

  describe("timeUntilNextClaim", function () {
    it("Should return 0 for first-time user", async function () {
      const { faucet, user1 } = await deployFaucet();
      expect(await faucet.timeUntilNextClaim(user1.address)).to.equal(0n);
    });

    it("Should return positive value during cooldown", async function () {
      const { faucet, user1 } = await deployFaucet();
      await faucet.connect(user1).claim();
      const time = await faucet.timeUntilNextClaim(user1.address);
      expect(time).to.be.greaterThan(0n);
    });
  });

  describe("Balance & Admin", function () {
    it("Should report correct balance", async function () {
      const { faucet } = await deployFaucet();
      expect(await faucet.getBalance()).to.equal(ethers.parseEther("1"));
    });

    it("Should allow owner to drain", async function () {
      const { faucet, owner } = await deployFaucet();
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await faucet.drain();
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(balanceAfter).to.be.greaterThan(balanceBefore - BigInt(Math.floor(gasCost)));
    });

    it("Should reject drain from non-owner", async function () {
      const { faucet, user1 } = await deployFaucet();
      await expect(faucet.connect(user1).drain()).to.be.revertedWith("Not owner");
    });

    it("Should revert claim when faucet is empty", async function () {
      const { faucet, owner, user1 } = await deployFaucet();
      await faucet.drain(); // Empty the faucet
      await expect(faucet.connect(user1).claim()).to.be.revertedWith("Faucet empty");
    });

    it("Should emit FaucetFunded when receiving ETH", async function () {
      const { faucet, owner } = await deployFaucet();
      await expect(
        owner.sendTransaction({
          to: await faucet.getAddress(),
          value: ethers.parseEther("0.5"),
        })
      ).to.emit(faucet, "FaucetFunded");
    });
  });
});
