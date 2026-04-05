import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  // Hardened RPC configuration for HashKey Testnet
  const RPC_URL = "https://testnet.hsk.xyz";
  const network = new ethers.Network("hashkey_testnet", 133);
  const provider = new ethers.JsonRpcProvider(RPC_URL, network, { staticNetwork: true });
  
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in contracts/.env");
  }

  const deployer = new ethers.Wallet(privateKey, provider);

  console.log("🚀 Deploying Faucet ONLY with account:", deployer.address);
  const balance = await provider.getBalance(deployer.address);
  console.log("💳 Account balance:", ethers.formatEther(balance), "HSK");

  if (balance === 0n) {
    throw new Error("❌ No HSK found in deployer wallet.");
  }

  // Load the Faucet artifact compiled by Hardhat
  const artifactPath = "./artifacts/contracts/Faucet.sol/Faucet.json";
  if (!fs.existsSync(artifactPath)) {
    throw new Error("Faucet artifact not found. Please run 'npx hardhat compile' first.");
  }
  const FaucetArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // 📦 Deploy Faucet
  console.log("\n📦 Starting deployment of Faucet...");
  const FaucetFactory = new ethers.ContractFactory(
    FaucetArtifact.abi, 
    FaucetArtifact.bytecode, 
    deployer
  );

  const faucet = await FaucetFactory.deploy();
  console.log("⏳ Deployment transaction sent. Waiting for confirmation...");
  
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();

  console.log("\n✅ SUCCESS!");
  console.log("=========================================");
  console.log("NEW FAUCET ADDRESS:", faucetAddress);
  console.log("=========================================");
  console.log("\n👉 ACTION: Update your frontend .env.local with:");
  console.log(`NEXT_PUBLIC_FAUCET_ADDRESS=${faucetAddress}`);
}

main().catch((error) => {
  console.error("\n❌ Deployment failed:", error.message);
  process.exit(1);
});
