'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

// Get project ID from environment or use a development fallback
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'certifi-dev-project';

// Configure RainbowKit with Base as primary chain
const config = getDefaultConfig({
  appName: 'Certifi - Blockchain Credentials',
  projectId: projectId,
  chains: [base, mainnet, polygon, optimism, arbitrum],
  ssr: true, // Enable server-side rendering support
  batch: {
    multicall: true,
  },
  pollingInterval: 12_000,
  // Remove any custom RPC configuration that might be causing issues
});

// Create a client for React Query
const queryClient = new QueryClient();

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={base}
          showRecentTransactions={true}
          modalSize="compact"
          appInfo={{
            appName: 'Certifi',
            learnMoreUrl: 'https://certifi.app',
          }}
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
