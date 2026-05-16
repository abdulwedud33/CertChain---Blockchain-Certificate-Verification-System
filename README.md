# 🔗 CertChain — Blockchain Certificate Verification System

> **Special Topics in CSE** — University Assignment Project  
> A full-stack Web3 application that issues and verifies academic certificates using Ethereum smart contracts.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Guide](#setup-guide)
  - [Prerequisites](#prerequisites)
  - [1. Smart Contract Setup](#1-smart-contract-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [MetaMask Setup](#metamask-setup)
- [Neon DB Setup](#neon-db-setup)
- [Running the Application](#running-the-application)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Deployment](#deployment)

---

## Overview

CertChain allows a university instructor (admin) to:
1. **Issue** digital certificates stored permanently on the Ethereum blockchain
2. **Verify** any certificate by ID — checked against both a PostgreSQL database and the blockchain

The blockchain acts as an immutable, tamper-proof source of truth. Even if the database is deleted, certificates can still be verified on-chain.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  Landing → Verify Page → Admin Dashboard → Issue Form   │
└──────────────────┬──────────────────┬───────────────────┘
                   │                  │
         REST API  │         ethers.js│(MetaMask)
                   ▼                  ▼
┌──────────────────┐       ┌──────────────────────────────┐
│  Backend (Express)│       │  Ethereum Sepolia Testnet    │
│  + Prisma ORM    │       │  CertificateRegistry.sol     │
└──────────┬───────┘       └──────────────────────────────┘
           │
           ▼
┌──────────────────┐
│  PostgreSQL DB   │
│  (Neon DB)       │
└──────────────────┘
```

**Certificate issuance flow:**
1. Admin fills form → MetaMask signs & sends tx to smart contract
2. On success, frontend calls backend with tx hash
3. Backend saves metadata to PostgreSQL

**Verification flow:**
1. User enters certificate ID
2. Frontend calls backend → checks PostgreSQL
3. Frontend also calls smart contract directly → confirms on-chain
4. Shows VALID/INVALID with details

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| Blockchain | ethers.js, MetaMask, Solidity, Hardhat |
| Backend | Express.js, TypeScript, Prisma ORM |
| Database | PostgreSQL (Neon DB) |
| Network | Ethereum Sepolia Testnet |

---

## Project Structure

```
cert-chain/
├── client/                    # Next.js frontend
│   └── src/
│       ├── app/               # Pages (App Router)
│       │   ├── page.tsx       # Landing page
│       │   ├── verify/        # Public verification page
│       │   └── admin/         # Admin pages
│       │       ├── dashboard/ # Stats + certificates table
│       │       └── issue/     # Issue certificate form
│       ├── components/        # Reusable UI components
│       │   ├── ui/            # Base components (Button, Card, etc.)
│       │   └── layout/        # Navbar
│       ├── hooks/             # useWallet (MetaMask)
│       ├── lib/               # blockchain.ts, api.ts, utils.ts
│       └── types/             # TypeScript interfaces
│
├── server/                    # Express backend
│   └── src/
│       ├── controllers/       # Request handlers
│       ├── routes/            # Express routers
│       ├── services/          # Business logic
│       ├── middleware/        # Validation + error handler
│       └── prisma/            # Schema + Prisma client
│
└── contracts/                 # Hardhat project
    ├── contracts/
    │   └── CertificateRegistry.sol
    └── scripts/
        └── deploy.ts
```

---

## Setup Guide

### Prerequisites

Install these before starting:

- **Node.js** v18+ — https://nodejs.org
- **MetaMask** browser extension — https://metamask.io
- **Git** — https://git-scm.com

---

### 1. Smart Contract Setup

```bash
cd contracts
cp .env.example .env
npm install
```

**Fill in `contracts/.env`:**
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_metamask_private_key
ETHERSCAN_API_KEY=optional_for_verification
```

#### Option A: Deploy to Sepolia Testnet (recommended for demo)

```bash
# Compile the contract
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia
```

You'll see output like:
```
✅ CertificateRegistry deployed to: 0xAbCd...1234
Add to your .env files:
NEXT_PUBLIC_CONTRACT_ADDRESS=0xAbCd...1234
CONTRACT_ADDRESS=0xAbCd...1234
```

**Copy this address — you'll need it for both client and server `.env` files.**

#### Option B: Local Hardhat Network (for quick testing)

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy locally
npm run deploy:local
```

---

### 2. Backend Setup

```bash
cd server
cp .env.example .env
npm install
```

**Fill in `server/.env`:**
```
DATABASE_URL=postgresql://user:pass@host/certchain?sslmode=require
PORT=4000
CLIENT_URL=http://localhost:3000
```

**Initialize the database:**
```bash
# Generate Prisma client
npm run db:generate

# Create the tables in your database
npm run db:push
```

**Start the server:**
```bash
npm run dev
```

Server runs at `http://localhost:4000`

---

### 3. Frontend Setup

```bash
cd client
cp .env.example .env.local
npm install
```

**Fill in `client/.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddressHere
NEXT_PUBLIC_NETWORK=sepolia
```

**Start the frontend:**
```bash
npm run dev
```

App runs at `http://localhost:3000`

---

## MetaMask Setup

1. Install the [MetaMask browser extension](https://metamask.io)
2. Create or import a wallet
3. Add the **Sepolia Testnet** network:
   - Network Name: `Sepolia Testnet`
   - RPC URL: `https://rpc.sepolia.org`
   - Chain ID: `11155111`
   - Symbol: `ETH`
4. Get free Sepolia ETH from a faucet:
   - https://sepoliafaucet.com
   - https://faucet.quicknode.com/ethereum/sepolia

---

## Neon DB Setup

[Neon](https://neon.tech) provides free serverless PostgreSQL, perfect for this project.

1. Go to https://neon.tech and sign up (free)
2. Create a new project → name it `certchain`
3. Copy the **connection string** from the dashboard:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/certchain?sslmode=require
   ```
4. Paste it as `DATABASE_URL` in `server/.env`
5. Run `npm run db:push` to create the `certificates` table

---

## Running the Application

You need **3 terminals** running simultaneously:

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev

# Terminal 3 — (optional) Hardhat local node
cd contracts && npm run node
```

Open http://localhost:3000 in your browser.

---

## How It Works

### Issuing a Certificate

1. Admin visits `/admin/dashboard` and clicks "Issue Certificate"
2. MetaMask prompts for wallet connection
3. Admin fills in: Student Name, Course, Certificate ID, Date
4. On submit:
   - `issueCertificate()` is called on the smart contract via MetaMask
   - MetaMask shows a transaction confirmation popup
   - Admin confirms → transaction is mined on Ethereum
   - Frontend receives the transaction hash
   - Backend API saves all details + tx hash to PostgreSQL
5. Dashboard updates with the new certificate

### Verifying a Certificate

1. Anyone visits `/verify` and enters a Certificate ID
2. Frontend calls `GET /api/certificates/verify/:id`
3. Backend checks PostgreSQL — returns certificate data or 404
4. Frontend also calls `verifyCertificate()` on the smart contract (read-only, no gas)
5. Result shown: ✅ VALID (with details) or ❌ INVALID

---

## API Reference

**Base URL:** `http://localhost:4000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/certificates/stats` | Dashboard statistics |
| `GET` | `/certificates` | List all certificates |
| `POST` | `/certificates` | Issue a new certificate |
| `GET` | `/certificates/verify/:id` | Verify by certificate ID |

### POST /certificates — Request Body

```json
{
  "studentName": "Alice Johnson",
  "courseName": "Special Topics in CSE",
  "certificateId": "CERT-2024-001",
  "issueDate": "2024-05-15T00:00:00.000Z",
  "transactionHash": "0x4a3b...",
  "issuerWallet": "0xAbCd..."
}
```

---

## Deployment

### Frontend (Vercel)

```bash
cd client
npx vercel deploy
# Follow prompts, add environment variables in Vercel dashboard
```

### Backend (Railway or Render)

```bash
# Build
cd server && npm run build

# Deploy to Railway:
# 1. Push to GitHub
# 2. Connect repo to Railway
# 3. Set environment variables
# 4. Deploy
```

### Contract (already on Sepolia)

Your contract is already live if you ran `npm run deploy:sepolia`.
Optionally verify it on Etherscan:
```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

---

## Presentation Tips

When presenting this project:

1. **Show the smart contract** on Remix IDE or Etherscan — explain struct, mapping, events
2. **Issue a live certificate** — show MetaMask popup, waiting for tx
3. **Show the tx on Sepolia Etherscan** — real blockchain proof
4. **Verify the certificate** — show it returns VALID from both DB and chain
5. **Try an invalid ID** — show INVALID response
6. **Explain the tamper-proof aspect** — the blockchain record can never be changed

---

*Built for Special Topics in CSE | CertChain v1.0*
