'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '@/lib/socket/client';
import { setupSocketSync } from '@/lib/query/sync/socket-sync';
import { authClient } from '@/lib/auth-client';

export function useSocketSync() {
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (isSessionLoading) return;

    // Connect socket if authenticated
    if (session) {
      console.log('[Socket] Connecting...');
      socket.connect();

      // Setup synchronization listeners
      const cleanupSync = setupSocketSync(queryClient);

      return () => {
        console.log('[Socket] Disconnecting...');
        cleanupSync();
        socket.disconnect();
      };
    } else {
      // Ensure socket is disconnected if session is lost
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }, [session, isSessionLoading, queryClient]);

  return {
    socket,
    isConnected,
  };
}
