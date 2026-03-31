import { get } from "./client";
import {
  SparkCreditsBalance,
  SparkCreditsHistoryResponse,
} from "@/types/spark-credits";

const SPARK_CREDITS_ENDPOINT = "/api/spark-credits";

export const sparkCreditsApi = {
  fetchBalance: async (userId: string): Promise<SparkCreditsBalance> => {
    return get<SparkCreditsBalance>(`${SPARK_CREDITS_ENDPOINT}/${userId}`);
  },

  fetchHistory: async (
    userId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<SparkCreditsHistoryResponse> => {
    const query = new URLSearchParams();
    if (params?.limit != null) query.set("limit", String(params.limit));
    if (params?.offset != null) query.set("offset", String(params.offset));
    const url = `${SPARK_CREDITS_ENDPOINT}/${userId}/history${query.toString() ? `?${query.toString()}` : ""}`;
    return get<SparkCreditsHistoryResponse>(url);
  },
};
