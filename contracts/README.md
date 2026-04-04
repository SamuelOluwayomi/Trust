# Trust: Smart Contracts

This directory contains the core smart contracts for the **Trust** undercollateralized lending protocol, built on the **HashKey Chain**.

## 🏦 Core Contracts

### 1. `LoanManager.sol`
The central logic contract for the protocol. It handles:
- Loan requests and approvals.
- Collateral management.
- Interest calculation and repayments.
- Dynamic borrowing limits based on user "Trust Scores" (SBT balance).

### 2. `LoanSBT.sol`
A Soul-Bound Token (ERC-721 based) that serves as a non-transferable credit identity.
- Stores user reputation and credit history.
- Minted upon World ID verification.
- Metadata is updated dynamically based on repayment behavior.

### 3. `Faucet.sol`
A utility contract for testnet users to claim mock tokens (USDT/USDC) for testing the lending features on the HashKey Testnet.

## 🛠️ Setup & Deployment

### Installation
```bash
npm install
```

### Environment Configuration
Create a `.env` file in this directory with the following:
```env
HASHKEY_TESTNET_RPC_URL=https://hashkey-testnet.rpc
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_key (optional)
```

### Compilation
```bash
npx hardhat compile
```

### Deployment to HashKey Testnet
```bash
npx hardhat ignition deploy ignition/modules/deploy.ts --network hashkey_testnet
```

## 🧪 Testing
Run the test suite using Hardhat:
```bash
npx hardhat test
```

For Solidity unit tests:
```bash
npx hardhat test solidity
```

---
Part of the **Trust Protocol** ecosystem.
