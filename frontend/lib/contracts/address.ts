
// Contract addresses for different networks
export const CERTIFICATE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_CERTIFICATE_MANAGER_ADDRESS || '0x5C2EAEdb9F0cC9bCe87360A38dA0ae7e136ddDd5';

// Ensure the address is properly formatted
export const getFormattedContractAddress = (): `0x${string}` => {
  const address = CERTIFICATE_MANAGER_ADDRESS;
  if (!address.startsWith('0x')) {
    return `0x${address}` as `0x${string}`;
  }
  return address as `0x${string}`;
};

// Network-specific addresses (for future use)
export const CONTRACT_ADDRESSES = {
  // Base Mainnet
  base: process.env.NEXT_PUBLIC_CERTIFICATE_MANAGER_ADDRESS || '0x5C2EAEdb9F0cC9bCe87360A38dA0ae7e136ddDd5',
  
  // Base Sepolia (testnet) - This is what we're using
  baseSepolia: process.env.NEXT_PUBLIC_CERTIFICATE_MANAGER_ADDRESS || '0x5C2EAEdb9F0cC9bCe87360A38dA0ae7e136ddDd5',
  
  // Local development
  localhost: '0x0000000000000000000000000000000000000000',
} as const;

// Helper function to get contract address for current network
export const getContractAddress = (chainId?: number): string => {
  // Base Sepolia testnet chain ID is 84532
  if (chainId === 84532) {
    return CONTRACT_ADDRESSES.baseSepolia;
  }
  // Default to Base Sepolia for now since we're on testnet
  return CONTRACT_ADDRESSES.baseSepolia;
};