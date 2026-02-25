import { useEffect, useRef } from 'react';
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
    // Hold latest callbacks in refs so we don't restart the subscription when they change
    const onDataRef = useRef(onData);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onDataRef.current = onData;
        onErrorRef.current = onError;
    }, [onData, onError]);

    // Track variables as a string to avoid reference-based flapping
    const variablesString = JSON.stringify(variables);

    // Track query as a string
    const queryString = typeof query === 'string' ? query : print(query);

    useEffect(() => {
        const unsubscribe = wsClient.subscribe<T>(
            { query: queryString, variables: JSON.parse(variablesString) },
            {
                next: ({ data }) => data && onDataRef.current(data),
                error: (err) => {
                    console.error('[GraphQL Subscription] Error:', err);
                    onErrorRef.current?.(err);
                },
                complete: () => { },
            }
        );

        return () => {
            unsubscribe();
        };
    }, [queryString, variablesString]);
}
