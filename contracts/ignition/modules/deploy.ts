import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deployment module for Trust Protocol - ZK Hackathon Upgrade
 *
 * Deploys:
 *   1. Groth16Verifier (Zero-Knowledge Loan Eligibility Verifier)
 *   2. LoanManager (References existing LoanSBT, KYC SBT, and the new ZK Verifier)
 */

// Existing addresses from previous hackathon deploy
const EXISTING_LOAN_SBT = "0x27D6797BE55D0b5976aBF624A9EDC35D0604Ce74";
const EXISTING_KYC_SBT = "0x9957a43088C530cD23659ecc092A4a3367d6a328";

const TrustModule = buildModule("Trust", (m) => {
  // 1. Deploy the new ZK Verifier
  const zkVerifier = m.contract("Groth16Verifier");

  // 2. Deploy LoanManager using existing SBTs and new Verifier
  const loanSbtAddress = m.getParameter("loanSbtAddress", EXISTING_LOAN_SBT);
  const kycSbtAddress = m.getParameter("kycSbtAddress", EXISTING_KYC_SBT);
  
  const loanManager = m.contract("LoanManager", [loanSbtAddress, kycSbtAddress, zkVerifier]);

  // IMPORTANT: Since you are reusing the existing LoanSBT, you must manually call 
  // `setLoanManager(YOUR_NEW_LOAN_MANAGER_ADDRESS)` on the LoanSBT contract after deploy
  // so the new LoanManager has permission to mint SBTs to users.

  return { zkVerifier, loanManager };
});

export default TrustModule;
