// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LoanSBT is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    // Soulbound — cannot be transferred
    mapping(uint256 => bool) public isSoulbound;

    struct SBTMetadata {
        address borrower;
        uint256 loanAmount;
        uint8 tier;        // 1=Bronze, 2=Silver, 3=Gold
        uint256 repaidAt;
    }

    mapping(uint256 => SBTMetadata) public tokenMetadata;
    mapping(address => uint256[]) public userTokens;

    // Only LoanManager can mint
    address public loanManager;

    event SBTMinted(address indexed borrower, uint256 tokenId, uint8 tier);

    constructor() ERC721("Trust Loan SBT", "TSBT") Ownable(msg.sender) {}

    modifier onlyLoanManager() {
        require(msg.sender == loanManager, "Only LoanManager");
        _;
    }

    function setLoanManager(address _loanManager) external onlyOwner {
        loanManager = _loanManager;
    }

    function mint(
        address borrower,
        uint256 loanAmount,
        uint8 tier
    ) external onlyLoanManager returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;

        _safeMint(borrower, tokenId);
        isSoulbound[tokenId] = true;

        tokenMetadata[tokenId] = SBTMetadata({
            borrower: borrower,
            loanAmount: loanAmount,
            tier: tier,
            repaidAt: block.timestamp
        });

        userTokens[borrower].push(tokenId);

        emit SBTMinted(borrower, tokenId, tier);
        return tokenId;
    }

    function getUserSBTCount(address user) external view returns (uint256) {
        return userTokens[user].length;
    }

    function getUserTokens(address user) external view returns (uint256[] memory) {
        return userTokens[user];
    }

    // Block all transfers — soulbound
    function transferFrom(address, address, uint256) public pure override {
        revert("SBT: non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("SBT: non-transferable");
    }
}