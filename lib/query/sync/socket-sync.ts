import { QueryClient } from '@tanstack/react-query';
import { socket } from '@/lib/socket/client';
import * as handlers from './handlers';

export function setupSocketSync(queryClient: QueryClient) {
  console.log('[Sync] Setting up socket listeners...');

  // Bounties
  socket.on('bounty.created', (payload) => {
    handlers.handleBountyCreated(queryClient, payload);
  });

  socket.on('bounty.updated', (payload) => {
    handlers.handleBountyUpdated(queryClient, payload);
  });

  socket.on('bounty.deleted', (payload) => {
    // payload might be the ID string or an object with id
    const bountyId = typeof payload === 'string' ? payload : payload.id;
    handlers.handleBountyDeleted(queryClient, bountyId);
  });

  // Add more entity listeners here as needed

  return () => {
    console.log('[Sync] Removing socket listeners...');
    socket.off('bounty.created');
    socket.off('bounty.updated');
    socket.off('bounty.deleted');
  };
}
