// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IKycSBT.sol";

/**
 * @title MockKycSBT
 * @notice A mock implementation of the HashKey KYC SBT for local testing.
 *         Allows the owner to manually approve/revoke users for testing flows.
 */
contract MockKycSBT is IKycSBT {
    address public owner;

    struct KycRecord {
        string ensName;
        KycLevel level;
        KycStatus status;
        uint256 createTime;
    }

    mapping(address => KycRecord) public kycRecords;
    mapping(address => mapping(string => bool)) public ensApprovals;

    uint256 public totalFee = 0.001 ether;

    event KycRequested(address indexed user, string ensName);
    event KycStatusUpdated(address indexed user, KycStatus status);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    function requestKyc(string calldata ensName) external payable override {
        require(msg.value >= totalFee, "Insufficient fee");
        require(kycRecords[msg.sender].status == KycStatus.NONE, "KYC already requested");

        kycRecords[msg.sender] = KycRecord({
            ensName: ensName,
            level: KycLevel.BASIC,
            status: KycStatus.APPROVED,
            createTime: block.timestamp
        });

        emit KycRequested(msg.sender, ensName);
    }

    function revokeKyc(address user) external override onlyOwner {
        kycRecords[user].status = KycStatus.REVOKED;
        emit KycStatusUpdated(user, KycStatus.REVOKED);
    }

    function restoreKyc(address user) external override onlyOwner {
        kycRecords[user].status = KycStatus.APPROVED;
        emit KycStatusUpdated(user, KycStatus.APPROVED);
    }

    function isHuman(address account) external view override returns (bool, uint8) {
        KycRecord memory record = kycRecords[account];
        bool isValid = record.status == KycStatus.APPROVED;
        return (isValid, uint8(record.level));
    }

    function getKycInfo(address account) external view override returns (
        string memory ensName,
        KycLevel level,
        KycStatus status,
        uint256 createTime
    ) {
        KycRecord memory record = kycRecords[account];
        return (record.ensName, record.level, record.status, record.createTime);
    }

    function getTotalFee() external view override returns (uint256) {
        return totalFee;
    }

    function isEnsNameApproved(address user, string calldata ensName) external view override returns (bool) {
        return ensApprovals[user][ensName];
    }

    function approveEnsName(address user, string calldata ensName) external override onlyOwner {
        ensApprovals[user][ensName] = true;
    }

    // --- Test helpers ---

    /// @notice Directly set a user's KYC level and status (for testing)
    function setKycStatus(address user, KycLevel level, KycStatus status) external onlyOwner {
        kycRecords[user].level = level;
        kycRecords[user].status = status;
        if (kycRecords[user].createTime == 0) {
            kycRecords[user].createTime = block.timestamp;
        }
    }

    function setTotalFee(uint256 _fee) external onlyOwner {
        totalFee = _fee;
    }
}
