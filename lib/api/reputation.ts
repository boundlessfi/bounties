import { get, post } from "./client";
import {
  ContributorReputation,
  RateContributorInput,
  ReputationHistoryParams,
  ReputationHistoryResponse,
} from "@/types/reputation";

const REPUTATION_ENDPOINT = "/api/reputation";

export const reputationApi = {
  fetchContributorReputation: async (
    userId: string,
  ): Promise<ContributorReputation> => {
    return get<ContributorReputation>(`${REPUTATION_ENDPOINT}/${userId}`);
  },

  fetchCompletionHistory: async (
    userId: string,
    params?: Pick<ReputationHistoryParams, "limit" | "offset">,
  ): Promise<ReputationHistoryResponse> => {
    const queryParams: Record<string, string> = {};
    if (params?.limit != null) queryParams.limit = String(params.limit);
    if (params?.offset != null) queryParams.offset = String(params.offset);
    return get<ReputationHistoryResponse>(
      `${REPUTATION_ENDPOINT}/${userId}/completion-history`,
      { params: Object.keys(queryParams).length ? queryParams : undefined },
    );
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
};
