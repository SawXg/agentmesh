# AgentMesh Protocol ($AUN)

> Production-ready, zero-capital utility token & decentralized AI Agent gateway built on Base.

---

## Architecture Overview

1. **`AgentUtilityToken.sol` ($AUN)**:
   - Fixed supply of 100,000,000 tokens.
   - Built with OpenZeppelin `ERC20`, `ERC20Burnable`, and `ERC20Permit` (EIP-2612 gasless approvals).
   - Zero backdoor minting or arbitrary blacklist functions.

2. **`AIServiceGateway.sol`**:
   - Manages pay-per-query access to autonomous AI agents & micro-services.
   - **50% Fee Burn:** 50% of the token fee is burned on-chain permanently, creating algorithmic deflation.
   - **50% Real Yield:** 50% of the token fee is sent directly to the community/node reward pool.
   - Protected with `ReentrancyGuard` and `Ownable2Step`.

---

## Quickstart (Local Testing)

All dependencies are self-contained using Node.js and Hardhat.

### 1. Run the Test Suite
```bash
npm test
```

### 2. Check Gas Usage and Coverage
```bash
npm run coverage
```

---

## Free Testnet Deployment (Base Sepolia)

### 1. Get Free Testnet ETH ($0 Cost)
- [Coinbase Developer Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your test wallet private key.

### 3. Deploy to Base Sepolia
```bash
npm run deploy:base-sepolia
```

### 4. Verify on BaseScan
```bash
npx hardhat verify --network baseSepolia <TOKEN_ADDRESS> "<DEPLOYER_ADDRESS>"
```
