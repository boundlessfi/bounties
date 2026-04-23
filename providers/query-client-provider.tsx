"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect, type ReactNode } from "react";
import { QueryErrorBoundary } from "./query-error-boundary";
import { useBountySubscription } from "@/hooks/use-bounty-subscription";
import { contractEventPoller } from "@/lib/contracts/event-listener";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1, // Usually want fewer retries for mutations
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always create a new QueryClient
    return makeQueryClient();
  }
  // Browser: reuse existing client or create new one
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

interface QueryClientProviderProps {
  children: ReactNode;
}

function RealtimeSync() {
  useBountySubscription();
  return null;
}

function OnChainSync() {
  const queryClient = useQueryClient();
  useEffect(() => {
    contractEventPoller.start(queryClient);
    return () => contractEventPoller.stop();
  }, [queryClient]);
  return null;
}

/**
 * Standard QueryClientProvider for the application.
 * Centralizes TanStack Query configuration and provides the client to the tree.
 */
export function QueryClientProvider({ children }: QueryClientProviderProps) {
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeSync />
      <OnChainSync />
      <QueryErrorBoundary>{children}</QueryErrorBoundary>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
