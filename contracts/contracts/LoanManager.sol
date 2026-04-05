// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./LoanSBT.sol";

contract LoanManager is Ownable {
    LoanSBT public sbtContract;

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

    constructor(address _sbtContract) Ownable(msg.sender) {
        sbtContract = LoanSBT(_sbtContract);
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
    ) external payable notBlacklisted noActiveLoan {
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

    // Fund the loan pool
    receive() external payable {}

    function withdrawPool(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }
}