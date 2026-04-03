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

  // 1. Deploy Faucet
  console.log("\n📦 Deploying Faucet...");
  const FaucetFactory = new ethers.ContractFactory(FaucetArtifact.abi, FaucetArtifact.bytecode, deployer);
  const faucet = await FaucetFactory.deploy();
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("✅ Faucet deployed to:", faucetAddress);

  // 2. Deploy LoanSBT
  console.log("\n📦 Deploying LoanSBT...");
  const LoanSBTFactory = new ethers.ContractFactory(LoanSBTArtifact.abi, LoanSBTArtifact.bytecode, deployer);
  const loanSBT = await LoanSBTFactory.deploy();
  await loanSBT.waitForDeployment();
  const loanSBTAddress = await loanSBT.getAddress();
  console.log("✅ LoanSBT deployed to:", loanSBTAddress);

  // 3. Deploy LoanManager
  console.log("\n📦 Deploying LoanManager...");
  const LoanManagerFactory = new ethers.ContractFactory(LoanManagerArtifact.abi, LoanManagerArtifact.bytecode, deployer);
  const loanManager = await LoanManagerFactory.deploy(loanSBTAddress);
  await loanManager.waitForDeployment();
  const loanManagerAddress = await loanManager.getAddress();
  console.log("✅ LoanManager deployed to:", loanManagerAddress);

  // 4. Link LoanSBT → LoanManager
  console.log("\n🔗 Linking LoanSBT to LoanManager...");
  const loanSBTContract = new ethers.Contract(loanSBTAddress, LoanSBTArtifact.abi, deployer);
  const tx = await loanSBTContract.setLoanManager(loanManagerAddress);
  await tx.wait();
  console.log("✅ LoanSBT linked to LoanManager");

  // 5. Summary
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(`NEXT_PUBLIC_FAUCET_ADDRESS=${faucetAddress}`);
  console.log(`NEXT_PUBLIC_LOAN_SBT_ADDRESS=${loanSBTAddress}`);
  console.log(`NEXT_PUBLIC_LOAN_MANAGER_ADDRESS=${loanManagerAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});