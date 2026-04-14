const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

const snarkjsPath = path.join(
  "C:\\Users\\SAMUEL\\AppData\\Roaming\\npm\\node_modules\\snarkjs"
);

async function main() {
  console.log("Step 1: Powers of Tau new...");
  await snarkjs.powersOfTau.newAccumulator(
    "bn128",
    14,
    "pot14_0000.ptau",
    console
  );

  console.log("Step 2: Contribute...");
  await snarkjs.powersOfTau.contribute(
    "pot14_0000.ptau",
    "pot14_0001.ptau",
    "Trust Protocol",
    "TrustProtocolHackathonZKEntropy2026"
  );

  console.log("Step 3: Prepare Phase 2...");
  await snarkjs.powersOfTau.preparePhase2(
    "pot14_0001.ptau",
    "pot14_final.ptau",
    console
  );

  console.log("Step 4: Groth16 setup...");
  await snarkjs.groth16.setup(
    "../loan_eligibility.r1cs",
    "pot14_final.ptau",
    "loan_eligibility_0000.zkey"
  );

  console.log("Step 5: Contribute to zkey...");
  await snarkjs.zKey.contribute(
    "loan_eligibility_0000.zkey",
    "loan_eligibility_final.zkey",
    "Trust Protocol",
    "TrustProtocolHackathonZKEntropy2026"
  );

  console.log("Step 6: Export verification key...");
  const vKey = await snarkjs.zKey.exportVerificationKey(
    "loan_eligibility_final.zkey"
  );
  fs.writeFileSync(
    "verification_key.json",
    JSON.stringify(vKey, null, 2)
  );

  console.log("Step 7: Export Solidity verifier...");
  const templates = {};
  const solidityVerifier = await snarkjs.zKey.exportSolidityVerifier(
    "loan_eligibility_final.zkey",
    templates
  );
  fs.writeFileSync("LoanEligibilityVerifier.sol", solidityVerifier);

  console.log("All done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
