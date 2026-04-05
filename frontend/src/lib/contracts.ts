import { ethers } from "ethers";

// Contract addresses from .env.local
export const ADDRESSES = {
  faucet: process.env.NEXT_PUBLIC_FAUCET_ADDRESS!,
  loanSBT: process.env.NEXT_PUBLIC_LOAN_SBT_ADDRESS!,
  loanManager: process.env.NEXT_PUBLIC_LOAN_MANAGER_ADDRESS!,
};

// ABIs — only the functions we need on the frontend
export const FAUCET_ABI = [
  "function claim() external",
  "function timeUntilNextClaim(address user) external view returns (uint256)",
  "function getBalance() external view returns (uint256)",
  "function lastClaim(address) external view returns (uint256)",
];

export const LOAN_SBT_ABI = [
  "function getUserSBTCount(address user) external view returns (uint256)",
  "function getUserTokens(address user) external view returns (uint256[])",
  "function tokenMetadata(uint256 tokenId) external view returns (address borrower, uint256 loanAmount, uint8 tier, uint256 repaidAt)",
];

export const LOAN_MANAGER_ABI = [
  "function applyForLoan(uint256 amount, bytes32 nullifier) external payable",
  "function repayLoan() external payable",
  "function getActiveLoan(address user) external view returns (tuple(uint256 amount, uint256 collateral, uint256 startTime, uint256 dueDate, uint8 tier, uint8 status))",
  "function getUserTier(address user) external view returns (uint8)",
  "function getLoanLimit(address user) external view returns (uint256)",
  "function getDaysUntilDue(address user) external view returns (uint256)",
  "function totalRepaid(address) external view returns (uint256)",
  "function blacklisted(address) external view returns (bool)",
  "event LoanApplied(address indexed user, uint256 amount, uint8 tier, bytes32 nullifier)",
  "event LoanRepaid(address indexed user, uint256 amount)",
];

// Get a provider connected to HashKey testnet
export function getProvider() {
  return new ethers.JsonRpcProvider("https://hashkey-testnet.alt.technology");
}

// Get a signer from the browser wallet
export async function getSigner() {
  if (typeof window === "undefined") throw new Error("No window");
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  return provider.getSigner();
}

// Contract instances (read-only)
export function getFaucetContract() {
  return new ethers.Contract(ADDRESSES.faucet, FAUCET_ABI, getProvider());
}

export function getLoanSBTContract() {
  return new ethers.Contract(ADDRESSES.loanSBT, LOAN_SBT_ABI, getProvider());
}

export function getLoanManagerContract() {
  return new ethers.Contract(ADDRESSES.loanManager, LOAN_MANAGER_ABI, getProvider());
}

// Contract instances (write — needs signer)
export async function getFaucetContractSigned() {
  const signer = await getSigner();
  return new ethers.Contract(ADDRESSES.faucet, FAUCET_ABI, signer);
}

export async function getLoanManagerContractSigned() {
  const signer = await getSigner();
  return new ethers.Contract(ADDRESSES.loanManager, LOAN_MANAGER_ABI, signer);
}
