#!/bin/bash

# --- Interaction Script for Base ---

# Check if environment variables are set
if [ -z "$RPC_URL" ]; then
    echo "❌ Error: RPC_URL is not set."
    echo "   Please run: export RPC_URL=your_rpc_url"
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY is not set."
    echo "   Please run: export PRIVATE_KEY=your_private_key"
    exit 1
fi

# Latest deployed address
LATEST_ADDR="0x14a4751fE6a7C2eD2F939E164da05dc25b913688"
export CONTRACT_ADDRESS=${CONTRACT_ADDRESS:-$LATEST_ADDR}

echo "🎯 Interacting with CertificateNFT at: $CONTRACT_ADDRESS"
echo "🚀 Sending transactions..."

# Execute interaction
cd contracts || exit
export CONTRACT_ADDRESS=$CONTRACT_ADDRESS # Ensure it is exported for Forge
forge script script/Interact.s.sol:InteractScript \
  --rpc-url "$RPC_URL" \
  --broadcast \
  -vvvv \
  --via-ir \
  --private-key "$PRIVATE_KEY" \
  --slow

echo "✨ Interaction finished."
