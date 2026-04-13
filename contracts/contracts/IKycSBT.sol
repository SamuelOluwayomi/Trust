// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IKycSBT
 * @notice Interface for HashKey Chain's native KYC Soul Bound Token contract.
 *         See: https://docs.hashkeychain.net/docs/Build-on-HashKey-Chain/Tools/KYC
 *
 *         The KYC SBT is deployed by HashKey — we only reference it via this interface.
 */
interface IKycSBT {
    enum KycLevel { NONE, BASIC, ADVANCED, PREMIUM, ULTIMATE }
    enum KycStatus { NONE, APPROVED, REVOKED }

    /// @notice Request KYC verification by registering an ENS name (payable — requires fee)
    function requestKyc(string calldata ensName) external payable;

    /// @notice Revoke a user's KYC (admin only on the KYC contract)
    function revokeKyc(address user) external;

    /// @notice Restore a previously revoked KYC (admin only)
    function restoreKyc(address user) external;

    /// @notice Check if an address is a verified human
    /// @return isValid Whether the address has a valid, approved KYC
    /// @return level The KYC level (0=NONE, 1=BASIC, 2=ADVANCED, 3=PREMIUM, 4=ULTIMATE)
    function isHuman(address account) external view returns (bool isValid, uint8 level);

    /// @notice Get detailed KYC info for an address
    function getKycInfo(address account) external view returns (
        string memory ensName,
        KycLevel level,
        KycStatus status,
        uint256 createTime
    );

    /// @notice Get the total fee required to request KYC
    function getTotalFee() external view returns (uint256);

    /// @notice Check if an ENS name is approved for a user
    function isEnsNameApproved(address user, string calldata ensName) external view returns (bool);

    /// @notice Approve an ENS name for a user (admin only)
    function approveEnsName(address user, string calldata ensName) external;
}
