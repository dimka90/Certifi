#!/bin/bash

# Check if environment variables are set
if [ -z "$RPC_URL" ]; then
    echo "Error: RPC_URL is not set."
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY is not set."
    exit 1
fi

# Execute deployment
cd contracts || exit
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  -vvvv \
  --via-ir \
  --private-key $PRIVATE_KEY
