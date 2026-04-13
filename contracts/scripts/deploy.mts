import { ethers } from "ethers";
import hardhat from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  // Connect to HashKey testnet directly
  const provider = new ethers.JsonRpcProvider("https://testnet.hsk.xyz");
  const privateKey = process.env.PRIVATE_KEY!;
  const deployer = new ethers.Wallet(privateKey, provider);

  console.log("Deploying with account:", deployer.address);
  const balance = await provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "HSK");

  if (balance === 0n) {
    throw new Error("❌ Wallet has no HSK — get testnet tokens first!");
  }

  // Load artifacts compiled by Hardhat
  const artifactsPath = "./artifacts/contracts";

  const FaucetArtifact = JSON.parse(fs.readFileSync(`${artifactsPath}/Faucet.sol/Faucet.json`, "utf8"));
  const LoanSBTArtifact = JSON.parse(fs.readFileSync(`${artifactsPath}/LoanSBT.sol/LoanSBT.json`, "utf8"));
  const LoanManagerArtifact = JSON.parse(fs.readFileSync(`${artifactsPath}/LoanManager.sol/LoanManager.json`, "utf8"));
  const MockKycSBTArtifact = JSON.parse(fs.readFileSync(`${artifactsPath}/MockKycSBT.sol/MockKycSBT.json`, "utf8"));

  // Use existing deployed Faucet and LoanSBT from previous runs to save gas/time
  const faucetAddress = "0xCaB6c9B74b202cc7E2c8A56078Bd87a09dd5038A";
  const loanSBTAddress = "0x27D6797BE55D0b5976aBF624A9EDC35D0604Ce74";

  console.log("\n📦 Reusing existing Faucet at:", faucetAddress);
  console.log("📦 Reusing existing LoanSBT at:", loanSBTAddress);

  // 1. Deploy MockKycSBT
  console.log("\n📦 Deploying MockKycSBT for Hackathon Demo...");
  const MockKycFactory = new ethers.ContractFactory(MockKycSBTArtifact.abi, MockKycSBTArtifact.bytecode, deployer);
  const mockKyc = await MockKycFactory.deploy();
  await mockKyc.waitForDeployment();
  const mockKycAddress = await mockKyc.getAddress();
  console.log("✅ MockKycSBT deployed to:", mockKycAddress);

  // 2. Deploy LoanManager (requires 2 args now: sbtContract, kycContract)
  console.log("\n📦 Deploying LoanManager...");
  const LoanManagerFactory = new ethers.ContractFactory(LoanManagerArtifact.abi, LoanManagerArtifact.bytecode, deployer);
  
  // Pass the newly deployed MockKycSBT address to strictly enforce KYC rules!
  const loanManager = await LoanManagerFactory.deploy(loanSBTAddress, mockKycAddress);
  await loanManager.waitForDeployment();
  const loanManagerAddress = await loanManager.getAddress();
  console.log("✅ LoanManager deployed to:", loanManagerAddress);

  // 2. Link LoanSBT → LoanManager
  console.log("\n🔗 Linking LoanSBT to new LoanManager...");
  const loanSBTContract = new ethers.Contract(loanSBTAddress, LoanSBTArtifact.abi, deployer);
  const tx = await loanSBTContract.setLoanManager(loanManagerAddress);
  await tx.wait();
  console.log("✅ LoanSBT linked to LoanManager");

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(`NEXT_PUBLIC_FAUCET_ADDRESS=${faucetAddress}`);
  console.log(`NEXT_PUBLIC_LOAN_SBT_ADDRESS=${loanSBTAddress}`);
  console.log(`NEXT_PUBLIC_LOAN_MANAGER_ADDRESS=${loanManagerAddress}`);
  console.log(`NEXT_PUBLIC_KYC_SBT_ADDRESS=${mockKycAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});