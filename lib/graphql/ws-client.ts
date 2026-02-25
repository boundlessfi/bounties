import { createClient } from 'graphql-ws';
import { getAccessToken } from '@/lib/auth-utils';

/**
 * Configure the graphql-ws client for real-time subscriptions.
 * It uses a singleton pattern to ensure only one connection is maintained.
 */
export const wsClient = createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL ?? 'ws://localhost:4000/graphql',
  connectionParams: async () => {
    const token = await getAccessToken();
    return {
      authorization: token ? `Bearer ${token}` : undefined,
    };
  },
  // Reconnection logic
  retryAttempts: 5,
  shouldRetry: () => true,
});
