// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Faucet {
    uint256 public constant DRIP_AMOUNT = 0.002 ether; // 0.002 HSK
    uint256 public constant COOLDOWN = 24 hours;

    mapping(address => uint256) public lastClaim;
    address public owner;

    event Claimed(address indexed user, uint256 amount);
    event FaucetFunded(address indexed funder, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function claim() external {
        require(
            block.timestamp >= lastClaim[msg.sender] + COOLDOWN,
            "Wait 24 hours between claims"
        );
        require(address(this).balance >= DRIP_AMOUNT, "Faucet empty");

        lastClaim[msg.sender] = block.timestamp;
        payable(msg.sender).transfer(DRIP_AMOUNT);

        emit Claimed(msg.sender, DRIP_AMOUNT);
    }

    function timeUntilNextClaim(address user) external view returns (uint256) {
        if (block.timestamp >= lastClaim[user] + COOLDOWN) return 0;
        return (lastClaim[user] + COOLDOWN) - block.timestamp;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {
        emit FaucetFunded(msg.sender, msg.value);
    }

    function drain() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}