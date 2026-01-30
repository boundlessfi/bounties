import { get, post } from './client'; // Assumes a generic HTTP client exists based on recent logs
import {
    ContributorReputation,
    RateContributorInput
} from '@/types/reputation';

const REPUTATION_ENDPOINT = '/api/reputation';

export const reputationApi = {
    fetchContributorReputation: async (userId: string): Promise<ContributorReputation> => {
        return get<ContributorReputation>(`${REPUTATION_ENDPOINT}/${userId}`);
    },

    fetchContributorByWallet: async (address: string): Promise<ContributorReputation> => {
        return get<ContributorReputation>(`${REPUTATION_ENDPOINT}/wallet/${address}`);
    },

    fetchMyReputation: async (): Promise<ContributorReputation> => {
        return get<ContributorReputation>(`${REPUTATION_ENDPOINT}/me`);
    },

    rateContributor: async (data: RateContributorInput): Promise<{ success: boolean }> => {
        return post<{ success: boolean }>(`${REPUTATION_ENDPOINT}/rate`, data);
    },

    linkWalletToReputation: async (data: { userId: string, address: string, signature: string }): Promise<{ success: boolean }> => {
        return post<{ success: boolean }>(`${REPUTATION_ENDPOINT}/link-wallet`, data);
    }
};
