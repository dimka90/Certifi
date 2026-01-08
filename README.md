# Certifi - Blockchain-Powered Credential Verification on Base
## Restoring Global Trust in Academic Credentials

![Built on Base](https://img.shields.io/badge/Built%20on-Base-0052FF?style=for-the-badge&logo=base&logoColor=white)

> [!IMPORTANT]
> **Certifi Smart Contract is DEPLOYED and LIVE!**  
> **Network**: Base Mainnet  
> **Contract Address**: `0x33A21018CF5Ccf399f98DeDfc29eAa1AbEEF0AAB`

# The Problem
### African academic institutions face a critical trust crisis globally. Employers worldwide struggle to verify African qualifications, leading to:
### Delayed hiring processes due to lengthy verification procedures
### Millions in fraud losses from fake certificates and credentials
### Loss of opportunities for qualified African graduates
### Erosion of trust in African educational institutions

# The Solution
## Certifi is a revolutionary platform built on the **Base network** that restores global trust in academic credentials through:
1. Tamper-Proof Certificates
   Immutable blockchain storage ensures certificates cannot be forged
Cryptographic verification guarantees authenticity
Permanent record of all credential transactions

2. Instant Verification
   
Real-time credential verification in seconds
Global accessibility 24/7
No more waiting for manual verification processes

3. Complete Ecosystem
   Institution registration and management
   Student certificate issuance
   Employer verification tools
   Comprehensive audit trails

# System Architecture

```mermaid
graph TB
    subgraph Actors ["Users & Actors"]
        Inst["Educational Institution"]
        Emp["Employers / Verifiers"]
    end

    subgraph App_Layer ["Frontend Application (Next.js 15)"]
        UI["UI Layer (Tailwind + Lucide)"]
        Wagmi["Web3 Layer (Wagmi + RainbowKit)"]
        Pinata["IPFS Integration (Pinata)"]
    end

    subgraph Storage_Layer ["Storage & Ledger"]
        IPFS["IPFS (Decentralized Storage)"]
        Base["Base Blockchain (L2)"]
        BC_Contract["Certifi Smart Contract (ERC-721)"]
    end

    %% Flow: Issuance
    Inst -- "1. Upload Credential" --> UI
    UI -- "2. Store Metadata" --> Pinata
    Pinata -- "3. Return IPFS CID" --> IPFS
    IPFS -- "4. CID Path" --> Pinata
    Pinata -- "5. Hash" --> UI
    UI -- "6. Sign Transaction" --> Wagmi
    Wagmi -- "7. issueCertificate(CID)" --> BC_Contract
    BC_Contract -- "8. Mint NFT" --> Base

    %% Flow: Verification
    Emp -- "9. Enter Certificate ID" --> UI
    UI -- "10. Query Validity" --> Wagmi
    Wagmi -- "11. isCertificateValid(id)" --> BC_Contract
    BC_Contract -- "12. Return Status + CID" --> Wagmi
    Wagmi -- "13. Fetch JSON" --> IPFS
    IPFS -- "14. Display Proof" --> UI
    UI -- "15. Trust Established" --> Emp

    style Inst fill:#22c55e,stroke:#15803d,color:#fff
    style Emp fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style BC_Contract fill:#f59e0b,stroke:#b45309,color:#fff
```

# Premium User Experience
## Certifi features a state-of-the-art interface designed for the next generation of trust:
- **Glassmorphism Design**: High-end translucent cards and navigation elements using `backdrop-blur` and `zinc` shades.
- **Premium Dark Theme**: A refined black-zinc color palette with emerald accents for a "pro" fintech appearance.
- **Micro-Animations**: Fluid motion using `framer-motion` and custom CSS `float` animations.
- **Responsive Architecture**: Fully optimized for all device sizes.

# Tech Stack Highlights
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Custom Glassmorphism Utilities
- **Motion**: Framer Motion
- **Web3**: Wagmi & RainbowKit
- **Icons**: Lucide React

# Getting Started
## Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask wallet
- Base Sepolia testnet access

# Installation
```bash
# Clone the repository
git clone https://github.com/dimka90/Certifi.git
cd Certifi/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

# License
This project is licensed under the MIT License.

## Recent Updates
- **Emergency Pause**: Contract can be paused by admin for safety.
- **Metadata Updates**: Correct typos in issued certificates without revoking.
- **Batch Revocation**: Efficiently revoke multiple credentials in one go.
- **Soulbound Tokens**: Certificates are now non-transferable (bound to student wallets).
- **Batch Issuance**: Institutions can now issue up to 50 certificates in a single transaction.
- **Expiration**: Certificates now support expiration dates and validation checks.
