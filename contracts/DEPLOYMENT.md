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

**Celo Alfajores Testnet:**
- RPC: https://alfajores-forno.celo-testnet.org
- Chain ID: 44787

### Setup

1. Update `.env` file with your private key:
```bash
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

2. Get a Celoscan API key from https://celoscan.io and add it to `.env`:
```bash
CELOSCAN_API_KEY=your_api_key_here
```

### Deploy to Celo Alfajores Testnet

```bash
forge script script/DeployCelo.s.sol:DeployCelo \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --broadcast \
  --verify \
  --verifier blockscout \
  --verifier-url https://alfajores-blockscout.celo-testnet.org/api
```

### Deploy to Celo Mainnet

```bash
forge script script/DeployCelo.s.sol:DeployCelo \
  --rpc-url https://forno.celo.org \
  --broadcast \
  --verify \
  --verifier blockscout \
  --verifier-url https://explorer.celo.org/api
```

### Verify Contract

If verification fails during deployment, verify manually:

```bash
forge verify-contract <CONTRACT_ADDRESS> CertificateNFT \
  --chain-id 44787 \
  --verifier blockscout \
  --verifier-url https://alfajores-blockscout.celo-testnet.org/api
```

### Check Deployment

After deployment, you'll see the contract address in the output. You can verify it on:
- Alfajores: https://alfajores-blockscout.celo-testnet.org
- Mainnet: https://explorer.celo.org

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
