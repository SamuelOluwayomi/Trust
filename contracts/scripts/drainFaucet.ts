import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const RPC_URLS = [
  "https://testnet.hsk.xyz",
  "https://rpc.testnet.hsk.xyz",
];

const OLD_FAUCET_ADDRESS = "";

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in contracts/.env");
  }

  // Define network explicitly to skip the "failed to detect network" hang
  const network = new ethers.Network("hashkey_testnet", 133);
  
  let success = false;
  let lastError = null;

  for (const url of RPC_URLS) {
    console.log(`Attempting to connect to ${url}...`);
    
    try {
      // Use staticNetwork: true to bypass the eth_chainId ping on startup
      const provider = new ethers.JsonRpcProvider(url, network, { 
        staticNetwork: network,
      });

      const wallet = new ethers.Wallet(privateKey, provider);
      const abi = [
        "function drain() external",
        "function getBalance() external view returns (uint256)"
      ];

      const Faucet = new ethers.Contract(OLD_FAUCET_ADDRESS, abi, wallet);

      // Check balance with a longer timeout
      const balanceBefore = await Faucet.getBalance().catch(e => { throw new Error("Contract unreachable") });
      console.log("Current Faucet Balance:", ethers.formatEther(balanceBefore), "HSK");

      if (balanceBefore === 0n) {
        console.log("Faucet is already empty.");
        return;
      }

      console.log("Calling drain()...");
      const tx = await Faucet.drain();
      console.log("Transaction sent! Hash:", tx.hash);
      await tx.wait();
      
      console.log("Success! Funds reclaimed.");
      success = true;
      break; 
    } catch (err: any) {
      console.warn(`Node ${url} failed:`, err.message);
      lastError = err;
    }
  }

  if (!success) {
    throw new Error(`Reclaim failed on all nodes. Last error: ${lastError?.message}`);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
});
