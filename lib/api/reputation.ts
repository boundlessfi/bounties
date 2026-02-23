import { get, post } from "./client";
import {
  ContributorReputation,
  RateContributorInput,
  ReputationHistoryResponse,
} from "@/types/reputation";

const REPUTATION_ENDPOINT = "/api/reputation";

export const reputationApi = {
  fetchContributorReputation: async (
    userId: string,
  ): Promise<ContributorReputation> => {
    return get<ContributorReputation>(`${REPUTATION_ENDPOINT}/${userId}`);
  },

  fetchContributorByWallet: async (
    address: string,
  ): Promise<ContributorReputation> => {
    return get<ContributorReputation>(
      `${REPUTATION_ENDPOINT}/wallet/${address}`,
    );
  },

  fetchMyReputation: async (): Promise<ContributorReputation> => {
    return get<ContributorReputation>(`${REPUTATION_ENDPOINT}/me`);
  },

  rateContributor: async (
    data: RateContributorInput,
  ): Promise<{ success: boolean }> => {
    return post<{ success: boolean }>(`${REPUTATION_ENDPOINT}/rate`, data);
  },

  linkWalletToReputation: async (data: {
    userId: string;
    address: string;
    signature: string;
  }): Promise<{ success: boolean }> => {
    return post<{ success: boolean }>(
      `${REPUTATION_ENDPOINT}/link-wallet`,
      data,
    );
  },
  fetchCompletionHistory: async (
    userId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<ReputationHistoryResponse> => {
    const query = new URLSearchParams();
    if (params?.limit != null) query.set("limit", String(params.limit));
    if (params?.offset != null) query.set("offset", String(params.offset));
    const url = `${REPUTATION_ENDPOINT}/${userId}/history${query.toString() ? `?${query.toString()}` : ""}`;
    return get<ReputationHistoryResponse>(url);
  },
};
