import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const RPC_URL = "https://testnet.hsk.xyz";
const LOAN_MANAGER_ADDRESS = "0xE80197da2Ce1E8ee156bE3F7d04795a7B227a1Bf";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: 133, name: 'hashkey_testnet' }, { staticNetwork: true });
  
  // Use lowercase to avoid checksum errors in the diagnostic tool
  const loanManager = ethers.getAddress(LOAN_MANAGER_ADDRESS.toLowerCase());
  const testUser = ethers.getAddress("0x6e6f9005adaa32650aef2319bfe5c62258e5a413");

  console.log("--- FINAL DIAGNOSTIC ---");
  console.log("LoanManager:", loanManager);
  console.log("User:", testUser);

  const abi = [
    "function sbtContract() view returns (address)",
    "function getUserTier(address) view returns (uint8)",
    "function blacklisted(address) view returns (bool)",
    "function activeLoans(address) view returns (uint256 amount, uint256 collateral, uint256 startTime, uint256 dueDate, uint8 tier, uint8 status)"
  ];

  const contract = new ethers.Contract(loanManager, abi, provider);

  try {
    const sbtAddr = await contract.sbtContract();
    console.log("Linked SBT Address:", sbtAddr);
    
    const balance = await provider.getBalance(loanManager);
    console.log("Contract Liquidity:", ethers.formatUnits(balance, 18), "HSK");

    const blacklisted = await contract.blacklisted(testUser);
    console.log("User Blacklisted:", blacklisted);

    const tier = await contract.getUserTier(testUser);
    console.log("User Tier Result:", tier.toString());

    const loan = await contract.activeLoans(testUser);
    console.log("User Loan Status:", loan.status.toString());

  } catch (err: any) {
    console.error("\n❌ FAILED:", err.message);
  }
}

main().catch(console.error);
