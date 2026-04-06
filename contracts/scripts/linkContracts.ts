import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const LOAN_SBT_ADDRESS = "0x27D6797BE55D0b5976aBF624A9EDC35D0604Ce74";
const LOAN_MANAGER_ADDRESS = "0x1f093A6C32e908e41A8f884581FE7443A403736d";

const ABI = [
  "function setLoanManager(address _loanManager) external",
  "function loanManager() view returns (address)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider("https://testnet.hsk.xyz");
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY not found in contracts/.env");
  
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Wallet:", wallet.address);

  const loanSBT = new ethers.Contract(LOAN_SBT_ADDRESS, ABI, wallet);

  // Check current state first
  const current = await loanSBT.loanManager();
  console.log("Current loanManager set:", current);

  if (current.toLowerCase() === LOAN_MANAGER_ADDRESS.toLowerCase()) {
    console.log("✅ Already linked! No action needed.");
    return;
  }

  // Link them
  console.log("Setting LoanManager on SBT contract...");
  const tx = await loanSBT.setLoanManager(LOAN_MANAGER_ADDRESS);
  console.log("Tx sent:", tx.hash);
  await tx.wait();

  // Verify
  const updated = await loanSBT.loanManager();
  console.log("✅ Done! LoanManager is now:", updated);
}

main().catch(console.error);
