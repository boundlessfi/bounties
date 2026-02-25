import { useEffect } from 'react';
import { wsClient } from '@/lib/graphql/ws-client';
import { type DocumentNode, print } from 'graphql';

/**
 * Generic GraphQL Subscription Hook.
 * Manages the lifecycle of a graphql-ws subscription, ensuring cleanup on unmount.
 *
 * @template T - The response shape of the subscription
 * @param query - The subscription document (gql DocumentNode or string)
 * @param variables - Subscription variables
 * @param onData - Callback triggered on each data event
 * @param onError - Optional error callback
 */
export function useGraphQLSubscription<T>(
    query: DocumentNode | string,
    variables: Record<string, unknown>,
    onData: (data: T) => void,
    onError?: (error: unknown) => void
) {
    useEffect(() => {
        // Stringify query if it's a DocumentNode
        const queryString = typeof query === 'string' ? query : print(query);

        const unsubscribe = wsClient.subscribe<T>(
            { query: queryString, variables },
            {
                next: ({ data }) => data && onData(data),
                error: (err) => {
                    console.error('[GraphQL Subscription] Error:', err);
                    onError?.(err);
                },
                complete: () => { },
            }
        );

        return () => {
            unsubscribe();
        };
    }, [query, variables, onData, onError]);
}
