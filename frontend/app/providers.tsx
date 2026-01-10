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
  baseSepolia,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { ToastProvider } from './providers/ToastProvider';

// Get project ID from environment or use a development fallback
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'certifi-dev-project';

// Disable all tracking and analytics
if (typeof window !== 'undefined') {
  // Disable WalletConnect analytics
  process.env.NEXT_PUBLIC_WALLETCONNECT_DISABLE_ANALYTICS = 'true';
  // Disable Coinbase analytics
  process.env.NEXT_PUBLIC_COINBASE_DISABLE_ANALYTICS = 'true';

  // Suppress console errors from analytics
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('Analytics SDK') ||
      message.includes('Analytics blocked') ||
      message.includes('pulse.walletconnect.org') ||
      message.includes('cca-lite.coinbase.com') ||
      message.includes('ERR_BLOCKED_BY_CLIENT') ||
      message.includes('Failed to fetch')
    ) {
      return; // Suppress these errors
    }
    originalError.apply(console, args);
  };

  // Block analytics requests silently
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0]?.toString() || '';
    if (
      url.includes('pulse.walletconnect.org') ||
      url.includes('cca-lite.coinbase.com') ||
      url.includes('analytics') ||
      url.includes('telemetry')
    ) {
      // Return a successful response instead of rejecting
      return Promise.resolve(new Response('{}', { status: 200 }));
    }
    return originalFetch.apply(this, args);
  };
}

// Configure RainbowKit with Base Sepolia as primary chain (testnet)
const config = getDefaultConfig({
  appName: 'Certifi - Blockchain Credentials',
  projectId: projectId,
  chains: [baseSepolia, base, mainnet, polygon, optimism, arbitrum],
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
          initialChain={baseSepolia}
          showRecentTransactions={true}
          modalSize="compact"
          appInfo={{
            appName: 'Certifi',
            learnMoreUrl: 'https://certifi.app',
          }}
          // Disable additional tracking features
          coolMode={false}
        >
          <ToastProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                className: '!bg-zinc-900 !text-white !border !border-white/10 !backdrop-blur-xl',
                duration: 4000,
                style: {
                  background: '#18181b',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </ToastProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
