import { renderHook } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { useBountySubscription } from '../use-bounty-subscription';
import { wsClient } from '@/lib/graphql/ws-client';
import {
    BOUNTY_CREATED_SUBSCRIPTION,
    BOUNTY_UPDATED_SUBSCRIPTION,
    BOUNTY_DELETED_SUBSCRIPTION,
} from '@/lib/graphql/subscriptions';
import { bountyKeys } from '@/lib/query/query-keys';

// Mock dependencies
jest.mock('@tanstack/react-query', () => ({
    useQueryClient: jest.fn(),
}));

jest.mock('@/lib/graphql/ws-client', () => ({
    wsClient: {
        subscribe: jest.fn(),
    },
}));

// Mock query keys factory
jest.mock('@/lib/query/query-keys', () => ({
    bountyKeys: {
        lists: jest.fn(() => ['Bounties', 'lists']),
        detail: jest.fn((id: string) => ['Bounty', { id }]),
        allListKeys: [
            ['Bounties', 'lists'],
            ['ActiveBounties'],
            ['OrganizationBounties'],
            ['ProjectBounties'],
        ],
    },
}));

// Mock graphql-tag
jest.mock('graphql-tag', () => ({
    gql: (strings: string[]) => ({
        kind: 'Document',
        definitions: [],
        loc: { source: { body: strings[0].trim() } },
    }),
}));

// Mock graphql print
jest.mock('graphql', () => ({
    print: jest.fn((query: { loc?: { source?: { body: string } } }) => query.loc?.source?.body ?? ''),
}));

describe('useBountySubscription', () => {
    let mockInvalidateQueries: jest.Mock;
    let mockRemoveQueries: jest.Mock;
    let mockSubscribe: jest.Mock;
    const mockUnsubscribe = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockInvalidateQueries = jest.fn();
        mockRemoveQueries = jest.fn();
        (useQueryClient as jest.Mock).mockReturnValue({
            invalidateQueries: mockInvalidateQueries,
            removeQueries: mockRemoveQueries,
        });

        mockSubscribe = wsClient.subscribe as jest.Mock;
        mockSubscribe.mockReturnValue(mockUnsubscribe);
    });

    it('should subscribe to all three bounty events on mount', () => {
        renderHook(() => useBountySubscription());

        expect(mockSubscribe).toHaveBeenCalledTimes(3);

        // Check if it subscribes with the correct queries
        const subscribedQueries = mockSubscribe.mock.calls.map(call => call[0].query);
        expect(subscribedQueries).toContain((BOUNTY_CREATED_SUBSCRIPTION as unknown as { loc: { source: { body: string } } }).loc.source.body);
        expect(subscribedQueries).toContain((BOUNTY_UPDATED_SUBSCRIPTION as unknown as { loc: { source: { body: string } } }).loc.source.body);
        expect(subscribedQueries).toContain((BOUNTY_DELETED_SUBSCRIPTION as unknown as { loc: { source: { body: string } } }).loc.source.body);
    });

    it('should cleanup subscriptions on unmount', () => {
        const { unmount } = renderHook(() => useBountySubscription());
        unmount();
        expect(mockUnsubscribe).toHaveBeenCalledTimes(3);
    });

    it('should invalidate lists when bountyCreated arrives', () => {
        renderHook(() => useBountySubscription());

        // Find the call for bountyCreated and trigger its callback
        const call = mockSubscribe.mock.calls.find(c => c[0].query.includes('subscription BountyCreated'));
        const callback = call[1].next;

        // Simulate incoming data
        callback({
            data: {
                bountyCreated: {
                    id: 'bounty-1',
                    title: 'New Bounty',
                    status: 'OPEN',
                    rewardAmount: 100,
                    rewardCurrency: 'XLM'
                }
            }
        });

        expect(mockInvalidateQueries).toHaveBeenCalledTimes(4); // Once for each entry in allListKeys
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['Bounties', 'lists']
        });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['ActiveBounties']
        });
    });

    it('should invalidate detail and lists when bountyUpdated arrives', () => {
        renderHook(() => useBountySubscription());

        // Find the call for bountyUpdated and trigger its callback
        const call = mockSubscribe.mock.calls.find(c => c[0].query.includes('subscription BountyUpdated'));
        const callback = call[1].next;

        // Simulate incoming data
        callback({
            data: {
                bountyUpdated: {
                    id: 'bounty-1',
                    title: 'Updated Bounty',
                    status: 'IN_PROGRESS',
                    rewardAmount: 200,
                    rewardCurrency: 'XLM'
                }
            }
        });

        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: bountyKeys.detail('bounty-1')
        });
        expect(mockInvalidateQueries).toHaveBeenCalledTimes(5); // 4 for lists + 1 for detail
    });

    it('should remove detail and invalidate lists when bountyDeleted arrives', () => {
        renderHook(() => useBountySubscription());

        // Find the call for bountyDeleted and trigger its callback
        const call = mockSubscribe.mock.calls.find(c => c[0].query.includes('subscription BountyDeleted'));
        const callback = call[1].next;

        // Simulate incoming data
        callback({
            data: {
                bountyDeleted: { id: 'bounty-1' }
            }
        });

        expect(mockRemoveQueries).toHaveBeenCalledWith({
            queryKey: bountyKeys.detail('bounty-1')
        });
        expect(mockInvalidateQueries).toHaveBeenCalledTimes(4);
    });
});
