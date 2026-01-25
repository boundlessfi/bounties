import { useQuery } from '@tanstack/react-query';
import { bountiesApi, type Bounty } from '@/lib/api';
import { bountyKeys } from './use-bounties';

interface UseBountyOptions {
    enabled?: boolean;
}

export function useBounty(id: string, options?: UseBountyOptions) {
    return useQuery<Bounty>({
        queryKey: bountyKeys.detail(id),
        queryFn: () => bountiesApi.getById(id),
        enabled: options?.enabled ?? !!id,
    });
}
