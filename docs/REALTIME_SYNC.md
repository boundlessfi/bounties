# Real-Time Synchronization with GraphQL Subscriptions

This document describes the real-time synchronization architecture that replaced the previous Socket.IO-based system.

## Overview

The application uses **GraphQL Subscriptions** via [graphql-ws](https://github.com/enisdenjo/graphql-ws) to receive real-time updates for bounty-related events. When an event occurs on the server (e.g., a bounty is created), a message is sent over a WebSocket connection to all subscribed clients, triggering automatic React Query cache invalidation.

## Architecture

1. **`lib/graphql/ws-client.ts`**: A singleton instance of the `graphql-ws` client.
   - Handles WebSocket connection management.
   - Injects authentication tokens via `connectionParams`.
   - Manages automatic reconnection and retry logic.
2. **`lib/graphql/subscriptions.ts`**: Contains the typed GraphQL subscription documents and their response payload interfaces.
3. **`hooks/use-graphql-subscription.ts`**: A generic React hook that wraps the `wsClient.subscribe` method. 
   - Manages the subscription lifecycle (subscribes on mount, unsubscribes on unmount).
   - Handles cleanup to prevent memory leaks.
4. **`hooks/use-bounty-subscription.ts`**: A high-level hook that aggregates subscriptions for `bountyCreated`, `bountyUpdated`, and `bountyDeleted`.
   - Maps each event to specific React Query cache invalidation strategies using the global `bountyKeys` factory.

## Cache Invalidation Strategy

| Event | Action on Client | Cache Affected |
|-------|------------------|----------------|
| `bountyCreated` | `invalidateQueries` | `bountyKeys.lists()` |
| `bountyUpdated` | `invalidateQueries` | `bountyKeys.detail(id)`, `bountyKeys.lists()` |
| `bountyDeleted` | `removeQueries`, `invalidateQueries` | `bountyKeys.detail(id)`, `bountyKeys.lists()` |

## Configuration

The WebSocket endpoint is configured via an environment variable:

```bash
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://your-backend-url/graphql
```

Default value for local development: `ws://localhost:4000/graphql`.

## Authentication

Authentication is handled via the `Better Auth` session token. The `wsClient` automatically retrieves the latest access token and injects it into the WebSocket handshake through the `authorization` header within `connectionParams`.

## Usage

To enable real-time updates in a component or globally:

```tsx
import { useBountySubscription } from '@/hooks/use-bounty-subscription';

function MyComponent() {
  // Activate bounty synchronization
  useBountySubscription();
  
  return (
    // ... UI that React Query will automatically update
  );
}
```
