import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deployment module for Trust Protocol
 *
 * Deploys:
 *   1. LoanSBT
 *   2. LoanManager (with references to LoanSBT and HashKey KYC SBT)
 *   3. Configures LoanSBT to accept mints from LoanManager
 *
 * The KYC SBT address should be the HashKey Chain's deployed KYC SBT contract.
 * Set to ethers.ZeroAddress (0x000...000) to disable KYC checks.
 */

// HashKey Testnet KYC SBT address — update this with the actual address
// Set to 0x0000000000000000000000000000000000000000 to disable KYC gating
const KYC_SBT_ADDRESS = "0x0000000000000000000000000000000000000000";

const TrustModule = buildModule("Trust", (m) => {
  // 1. Deploy LoanSBT
  const loanSBT = m.contract("LoanSBT");

  // 2. Deploy LoanManager with references to LoanSBT and KYC SBT
  const kycSbtAddress = m.getParameter("kycSbtAddress", KYC_SBT_ADDRESS);
  const loanManager = m.contract("LoanManager", [loanSBT, kycSbtAddress]);

  // 3. Authorize LoanManager to mint SBTs
  m.call(loanSBT, "setLoanManager", [loanManager]);

  return { loanSBT, loanManager };
});

export default TrustModule;
