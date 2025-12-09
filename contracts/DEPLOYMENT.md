# Certifi Contract Deployment Guide

## Deploying to Celo

### Prerequisites
- Foundry installed (`curl -L https://foundry.paradigm.xyz | bash`)
- Private key with funds on Celo network
- Celo RPC URL configured

### Networks

**Celo Mainnet:**
- RPC: https://forno.celo.org
- Chain ID: 42220

**Celo Sepolia Testnet:**
- RPC: https://forno.celo-sepolia.celo-testnet.org
- Chain ID: 44787

### Setup

Get your private key ready (without 0x prefix if needed).

### Deploy to Celo Sepolia Testnet

```bash
cd contracts
forge script script/DeployCelo.s.sol:DeployCelo \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org \
  --private-key <your_private_key> \
  --broadcast \
  -vvvv \
  --via-ir
```

### Deploy to Celo Mainnet

```bash
cd contracts
forge script script/DeployCelo.s.sol:DeployCelo \
  --rpc-url https://forno.celo.org \
  --private-key <your_private_key> \
  --broadcast \
  -vvvv \
  --via-ir
```

### Check Deployment

After deployment, you'll see the contract address in the output. You can verify it on:
- Celo Sepolia: https://sepolia.celoscan.io
- Celo Mainnet: https://celoscan.io

The deployment output will show:
- Transaction hash
- Contract address
- Gas used
- Block number

## Contract Functions

### Institution Management
- `registerInstitution()` - Register as an institution
- `authorizeInstitution()` - Authorize institution (owner only)
- `deauthorizeInstitution()` - Deauthorize institution (owner only)

### Certificate Operations
- `issueCertificate()` - Issue a certificate NFT
- `revokeCertificate()` - Revoke a certificate
- `verifyCertificate()` - Verify certificate authenticity

### Query Functions
- `getCertificatesByStudent()` - Get all certificates for a student
- `getCertificatesByInstitution()` - Get all certificates issued by institution
- `getInstitution()` - Get institution details
- `getCertificate()` - Get certificate details

## Gas Optimization

The contract uses:
- Optimizer enabled with 200 runs
- Via IR compilation for better optimization
- Efficient storage layout

## Support

For issues or questions, refer to:
- Celo Documentation: https://docs.celo.org
- Foundry Book: https://book.getfoundry.sh
