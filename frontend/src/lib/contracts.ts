import { ethers } from "ethers";

// Contract addresses from .env.local
export const ADDRESSES = {
  faucet: process.env.NEXT_PUBLIC_FAUCET_ADDRESS!,
  loanSBT: process.env.NEXT_PUBLIC_LOAN_SBT_ADDRESS!,
  loanManager: process.env.NEXT_PUBLIC_LOAN_MANAGER_ADDRESS!,
  kycSBT: process.env.NEXT_PUBLIC_KYC_SBT_ADDRESS || "",  // HashKey KYC SBT — optional
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
  "function applyForLoanWithZK(uint256 amount, uint256[2] calldata _pA, uint256[2][2] calldata _pB, uint256[2] calldata _pC, uint256[5] calldata _pubSignals) external payable",
  "function repayLoan() external payable",
  "function getActiveLoan(address user) external view returns (tuple(uint256 amount, uint256 collateral, uint256 startTime, uint256 dueDate, uint8 tier, uint8 status))",
  "function getUserTier(address user) external view returns (uint8)",
  "function getLoanLimit(address user) external view returns (uint256)",
  "function getDaysUntilDue(address user) external view returns (uint256)",
  "function totalBorrowed(address) external view returns (uint256)",
  "function totalRepaid(address) external view returns (uint256)",
  "function blacklisted(address) external view returns (bool)",
  "function getUserKycInfo(address user) external view returns (bool isVerified, uint8 level)",
  "event LoanApplied(address indexed user, uint256 amount, uint8 tier, bytes32 nullifier)",
  "event LoanRepaid(address indexed user, uint256 amount)",
];

// HashKey KYC SBT ABI — read-only functions for checking verification status
export const KYC_SBT_ABI = [
  "function isHuman(address account) external view returns (bool isValid, uint8 level)",
  "function getKycInfo(address account) external view returns (string ensName, uint8 level, uint8 status, uint256 createTime)",
  "function getTotalFee() external view returns (uint256)",
  "function requestKyc(string ensName) external payable",
];

// Get a provider connected to HashKey testnet via local proxy to bypass browser CORS
export function getProvider() {
  // Ethers requires an absolute URL with a protocol (http/https). 
  // We use our local proxy to avoid CORS issues in the browser.
  if (typeof window !== 'undefined') {
    const baseUrl = window.location.origin;
    return new ethers.JsonRpcProvider(`${baseUrl}/api/rpc`);
  }
  // Server-side default
  return new ethers.JsonRpcProvider('https://testnet.hsk.xyz');
}

/**
 * Get a signer from either a Privy Wallet object or the window.ethereum provider.
 * This function is designed to prefer the Privy Embedded Wallet.
 */
export async function getSigner(connectedWallet?: any) {
  if (typeof window === "undefined") throw new Error("No window");
  
  // 1. If a Privy wallet was passed in, use it
  if (connectedWallet) {
    const provider = await connectedWallet.getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(provider);
    return ethersProvider.getSigner();
  }
  
  throw new Error("No wallet signer available. Please ensure your embedded wallet is ready.");
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
export async function getFaucetContractSigned(connectedWallet?: any) {
  const signer = await getSigner(connectedWallet);
  return new ethers.Contract(ADDRESSES.faucet, FAUCET_ABI, signer);
}

export async function getLoanManagerContractSigned(connectedWallet?: any) {
  const signer = await getSigner(connectedWallet);
  return new ethers.Contract(ADDRESSES.loanManager, LOAN_MANAGER_ABI, signer);
}

// KYC SBT contract instance (read-only)
export function getKycSBTContract() {
  if (!ADDRESSES.kycSBT) return null;
  return new ethers.Contract(ADDRESSES.kycSBT, KYC_SBT_ABI, getProvider());
}

// KYC SBT contract instance (write — needs signer for requestKyc)
export async function getKycSBTContractSigned(connectedWallet?: any) {
  if (!ADDRESSES.kycSBT) return null;
  const signer = await getSigner(connectedWallet);
  return new ethers.Contract(ADDRESSES.kycSBT, KYC_SBT_ABI, signer);
}
