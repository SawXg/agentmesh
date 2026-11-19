# AgentMesh Protocol ($AUN)

> Production-ready, zero-capital utility token & decentralized AI Agent gateway built on Base.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSawXg%2Fagentmesh&root-directory=frontend)
[![Base Network](https://img.shields.io/badge/Network-Base_Sepolia-blue)](https://sepolia.basescan.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-purple)](https://soliditylang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## Live Smart Contracts (Base Sepolia)

| Contract | Address | BaseScan |
| :--- | :--- | :--- |
| **AgentUtilityToken ($AUN)** | `0x6D06b8a4cBea909B6902ec561fF8981F71C4e64e` | [View Token](https://sepolia.basescan.org/address/0x6D06b8a4cBea909B6902ec561fF8981F71C4e64e) |
| **AIServiceGateway** | `0x31C9d8Ab663f8a862d2B6931c6bCFA8B50235A4A` | [View Gateway](https://sepolia.basescan.org/address/0x31C9d8Ab663f8a862d2B6931c6bCFA8B50235A4A) |
| **TestnetFaucet** | `0xd1D797B7e477De76e1A85dD2aD054159C755A951` | [View Faucet](https://sepolia.basescan.org/address/0xd1D797B7e477De76e1A85dD2aD054159C755A951) |

---

## Architecture & Genuine Utility

1. **`AgentUtilityToken.sol` ($AUN)**:
   - Fixed supply of 100,000,000 tokens.
   - Built with OpenZeppelin `ERC20`, `ERC20Burnable`, and `ERC20Permit` (EIP-2612 gasless approvals).
   - Zero backdoor minting or arbitrary blacklist functions.

2. **`AIServiceGateway.sol`**:
   - Manages pay-per-query access to autonomous AI agents & micro-services.
   - **50% Permanent Burn:** 50% of the token fee is burned on-chain permanently (`0x00...dEaD`), creating algorithmic deflation.
   - **50% Real Yield:** 50% of the token fee is sent directly to the community staker reward pool.
   - Protected with OpenZeppelin `ReentrancyGuard` and `Ownable2Step`.

3. **`TestnetFaucet.sol`**:
   - Self-serve community faucet pre-funded with 5,000,000 $AUN.
   - Anyone on Base Sepolia can claim 100 free $AUN once every 24 hours.

---

## Local Development & Testing

### 1. Run the Contract Test Suite
```bash
npm install
npm test
```

### 2. Run the Frontend dApp
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to test the wallet connection, faucet, and AI prompt terminal.
