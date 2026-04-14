// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./LoanSBT.sol";
import "./IKycSBT.sol";
import "./LoanEligibilityVerifier.sol";

contract LoanManager is Ownable {
    LoanSBT public sbtContract;
    IKycSBT public kycSBT;  // HashKey Chain KYC SBT — set to address(0) to disable KYC checks
    Groth16Verifier public zkVerifier; // ZK Loan Eligibility Verifier — set to address(0) to disable

    // Tier limits in HSK (wei)
    uint256 public constant BRONZE_LIMIT = 0.02 ether;
    uint256 public constant SILVER_LIMIT = 0.05 ether;
    uint256 public constant GOLD_LIMIT = 0.1 ether;

    uint256 public constant LOAN_DURATION = 30 days;
    uint256 public constant COLLATERAL_PERCENT = 10; // 10% soft collateral

    enum Tier { None, Bronze, Silver, Gold }
    enum LoanStatus { None, Active, Repaid, Defaulted }

    struct Loan {
        uint256 amount;
        uint256 collateral;
        uint256 startTime;
        uint256 dueDate;
        Tier tier;
        LoanStatus status;
    }

    mapping(address => Loan) public activeLoans;
    mapping(address => bool) public blacklisted;
    mapping(address => uint256) public totalBorrowed;
    mapping(address => uint256) public totalRepaid;

    // Nullifier tracking for Sybil resistance
    mapping(bytes32 => bool) public usedNullifiers;

    event LoanIssued(address indexed borrower, uint256 amount, Tier tier);
    event LoanRepaid(address indexed borrower, uint256 amount, uint256 tokenId);
    event LoanDefaulted(address indexed borrower, uint256 amount);

    constructor(address _sbtContract, address _kycSBT, address _zkVerifier) Ownable(msg.sender) {
        sbtContract = LoanSBT(_sbtContract);
        kycSBT = IKycSBT(_kycSBT);
        zkVerifier = Groth16Verifier(_zkVerifier);
    }

    modifier notBlacklisted() {
        require(!blacklisted[msg.sender], "Blacklisted: previous default");
        _;
    }

    modifier noActiveLoan() {
        require(
            activeLoans[msg.sender].status != LoanStatus.Active,
            "Already have active loan"
        );
        _;
    }

    modifier requireKYC() {
        if (address(kycSBT) != address(0)) {
            (bool isValid, ) = kycSBT.isHuman(msg.sender);
            require(isValid, "HashKey KYC verification required");
        }
        _;
    }

    function _getTierForUser(address user) internal view returns (Tier) {
        uint256 sbtCount = sbtContract.getUserSBTCount(user);
        if (sbtCount >= 3) return Tier.Gold;
        if (sbtCount >= 1) return Tier.Silver;
        return Tier.Bronze;
    }

    function _getLimitForTier(Tier tier) internal pure returns (uint256) {
        if (tier == Tier.Gold) return GOLD_LIMIT;
        if (tier == Tier.Silver) return SILVER_LIMIT;
        return BRONZE_LIMIT;
    }

    function applyForLoan(
        uint256 amount,
        bytes32 nullifier  // from World ID / ZK proof
    ) external payable notBlacklisted noActiveLoan requireKYC {
        // Check nullifier hasn't been used
        require(!usedNullifiers[nullifier], "Identity already used for loan");

        Tier tier = _getTierForUser(msg.sender);
        uint256 limit = _getLimitForTier(tier);

        require(amount > 0 && amount <= limit, "Amount exceeds tier limit");

        // Require 10% collateral
        uint256 collateral = (amount * COLLATERAL_PERCENT) / 100;
        require(msg.value >= collateral, "Insufficient collateral (10% required)");

        // Store nullifier
        usedNullifiers[nullifier] = true;

        // Record loan
        activeLoans[msg.sender] = Loan({
            amount: amount,
            collateral: msg.value,
            startTime: block.timestamp,
            dueDate: block.timestamp + LOAN_DURATION,
            tier: tier,
            status: LoanStatus.Active
        });

        totalBorrowed[msg.sender] += amount;

        // Send loan to borrower
        require(address(this).balance >= amount, "Insufficient pool liquidity");
        payable(msg.sender).transfer(amount);

        emit LoanIssued(msg.sender, amount, tier);
    }

    /**
     * @notice Apply for a loan with a ZK eligibility proof generated client-side.
     * @dev The circuit proves sbtCount >= minSbtRequired and requestedAmount <= maxLoanAmount
     *      without revealing the actual sbtCount or repayment history.
     *      Falls back gracefully if zkVerifier is address(0) (i.e. disabled).
     *
     * Public signals layout (must match loan_eligibility.circom):
     *   [0] identityCommitment  — Poseidon(sbtCount, totalRepaid, salt)
     *   [1] eligible            — 1 if all ZK conditions pass
     *   [2] requestedAmount     — loan amount in wei
     *   [3] maxLoanAmount       — tier max in wei
     *   [4] minSbtRequired      — SBTs needed for the tier
     */
    function applyForLoanWithZK(
        uint256 amount,
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[5] calldata _pubSignals  // [identityCommitment, eligible, requestedAmount, maxLoanAmount, minSbtRequired]
    ) external payable notBlacklisted noActiveLoan requireKYC {
        // 1. Verify the ZK proof if verifier is configured
        if (address(zkVerifier) != address(0)) {
            require(
                zkVerifier.verifyProof(_pA, _pB, _pC, _pubSignals),
                "Invalid ZK eligibility proof"
            );
            // The circuit must output eligible = 1
            require(_pubSignals[1] == 1, "ZK proof: not eligible");
            // The proven requested amount must match what was sent
            require(_pubSignals[2] == amount, "ZK proof: amount mismatch");
        }

        // 2. Use identityCommitment as the uniqueness nullifier
        bytes32 nullifier = bytes32(_pubSignals[0]);
        require(!usedNullifiers[nullifier], "ZK identity already used for loan");

        Tier tier = _getTierForUser(msg.sender);
        uint256 limit = _getLimitForTier(tier);
        require(amount > 0 && amount <= limit, "Amount exceeds tier limit");

        // 3. Require 10% collateral
        uint256 collateral = (amount * COLLATERAL_PERCENT) / 100;
        require(msg.value >= collateral, "Insufficient collateral (10% required)");

        // 4. Store nullifier
        usedNullifiers[nullifier] = true;

        // 5. Record and disburse loan
        activeLoans[msg.sender] = Loan({
            amount: amount,
            collateral: msg.value,
            startTime: block.timestamp,
            dueDate: block.timestamp + LOAN_DURATION,
            tier: tier,
            status: LoanStatus.Active
        });

        totalBorrowed[msg.sender] += amount;

        require(address(this).balance >= amount, "Insufficient pool liquidity");
        payable(msg.sender).transfer(amount);

        emit LoanIssued(msg.sender, amount, tier);
    }

    function repayLoan() external payable {
        Loan storage loan = activeLoans[msg.sender];
        require(loan.status == LoanStatus.Active, "No active loan");
        require(msg.value >= loan.amount, "Insufficient repayment amount");

        loan.status = LoanStatus.Repaid;
        totalRepaid[msg.sender] += loan.amount;

        // Return collateral to borrower
        uint256 collateralToReturn = loan.collateral;
        loan.collateral = 0;
        payable(msg.sender).transfer(collateralToReturn);

        // Mint SBT as proof of repayment
        uint256 tokenId = sbtContract.mint(
            msg.sender,
            loan.amount,
            uint8(loan.tier)
        );

        emit LoanRepaid(msg.sender, loan.amount, tokenId);
    }

    function markDefault(address borrower) external onlyOwner {
        Loan storage loan = activeLoans[borrower];
        require(loan.status == LoanStatus.Active, "No active loan");
        require(block.timestamp > loan.dueDate, "Loan not yet due");

        loan.status = LoanStatus.Defaulted;
        blacklisted[borrower] = true;

        // Keep collateral as penalty
        emit LoanDefaulted(borrower, loan.amount);
    }

    function getActiveLoan(address user) external view returns (Loan memory) {
        return activeLoans[user];
    }

    function getUserTier(address user) external view returns (Tier) {
        return _getTierForUser(user);
    }

    function getLoanLimit(address user) external view returns (uint256) {
        return _getLimitForTier(_getTierForUser(user));
    }

    function getDaysUntilDue(address user) external view returns (uint256) {
        Loan memory loan = activeLoans[user];
        if (loan.status != LoanStatus.Active) return 0;
        if (block.timestamp >= loan.dueDate) return 0;
        return (loan.dueDate - block.timestamp) / 1 days;
    }

    // --- KYC Management ---

    /// @notice Update the ZK Verifier contract reference. Set to address(0) to disable ZK verification.
    function setZkVerifier(address _zkVerifier) external onlyOwner {
        zkVerifier = Groth16Verifier(_zkVerifier);
    }

    /// @notice Update the KYC SBT contract reference. Set to address(0) to disable KYC checks.
    function setKycSBT(address _kycSBT) external onlyOwner {
        kycSBT = IKycSBT(_kycSBT);
    }

    /// @notice Check a user's KYC status via the HashKey KYC SBT
    function getUserKycInfo(address user) external view returns (bool isVerified, uint8 level) {
        if (address(kycSBT) == address(0)) return (false, 0);
        return kycSBT.isHuman(user);
    }

    // Fund the loan pool
    receive() external payable {}

    function withdrawPool(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }
}