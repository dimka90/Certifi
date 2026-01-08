#!/bin/bash
# Usage: ./verify_contract.sh <CONTRACT_ADDRESS> <RPC_URL> <ETHERSCAN_API_KEY>

if [ "$#" -ne 3 ]; then
    echo "Usage: ./verify_contract.sh <CONTRACT_ADDRESS> <RPC_URL> <ETHERSCAN_API_KEY>"
    exit 1
fi

ADDRESS=$1
RPC=$2
KEY=$3

echo "Verifying contract at $ADDRESS..."

forge verify-contract \
    --chain-id 8453 \
    --num-of-optimizations 200 \
    --compiler-version v0.8.20+commit.a1b79de6 \
    --etherscan-api-key $KEY \
    --rpc-url $RPC \
    $ADDRESS \
    src/core/CertificationNft.sol:CertificateNFT
