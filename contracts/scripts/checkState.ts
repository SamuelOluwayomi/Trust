import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const LOAN_SBT = "0x27D6797BE55D0b5976aBF624A9EDC35D0604Ce74";
const LOAN_MANAGER = "0x1f093A6C32e908e41A8f884581FE7443A403736d";
const USER = "0x6e6f9005aDAA32650AEF2319bfE5c62258E5a413"; // from your error

const provider = new ethers.JsonRpcProvider("https://testnet.hsk.xyz");

const SBT_ABI = [
  "function loanManager() view returns (address)",
];

const MANAGER_ABI = [
  "function getActiveLoan(address) view returns (tuple(uint256 amount, uint256 collateral, uint256 startTime, uint256 dueDate, uint8 tier, uint8 status))",
  "function blacklisted(address) view returns (bool)",
  "function usedNullifiers(bytes32) view returns (bool)",
];

async function main() {
  const sbt = new ethers.Contract(LOAN_SBT, SBT_ABI, provider);
  const manager = new ethers.Contract(LOAN_MANAGER, MANAGER_ABI, provider);

  // Check linking
  const linkedManager = await sbt.loanManager();
  console.log("LoanManager set in SBT:", linkedManager);
  console.log("Expected (Your New One):", LOAN_MANAGER);
  console.log("Linked correctly:", linkedManager.toLowerCase() === LOAN_MANAGER.toLowerCase());

  // Check user's active loan
  const loan = await manager.getActiveLoan(USER);
  console.log("\nUser active loan:");
  console.log("  Amount:", ethers.formatEther(loan.amount), "HSK");
  console.log("  Collateral:", ethers.formatEther(loan.collateral), "HSK");
  console.log("  Status:", loan.status.toString()); // 1 = Active
  console.log("  Tier:", loan.tier.toString());

  // Check blacklist
  const isBlacklisted = await manager.blacklisted(USER);
  console.log("\nBlacklisted:", isBlacklisted);
}

main().catch(console.error);
