import {
  SparkCreditsBalance,
  SparkCreditEvent,
  SparkCreditsHistoryResponse,
} from "@/types/spark-credits";

// Mock Data Store (In-memory for prototype)
const MOCK_CREDITS_DB: Record<string, number> = {
  "user-1": 6,
  "user-2": 2,
  "user-3": 0,
};

const MOCK_CREDIT_EVENTS: Record<string, SparkCreditEvent[]> = {
  "user-1": [
    {
      id: "evt-1",
      userId: "user-1",
      type: "EARNED",
      amount: 1,
      bountyId: "bounty-12",
      bountyTitle: "Fix authentication bug in login flow",
      description: "Earned for completing bounty",
      balance: 6,
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "evt-2",
      userId: "user-1",
      type: "SPENT",
      amount: 1,
      bountyId: "bounty-11",
      bountyTitle: "Add dark mode support",
      description: "Spent to claim FCFS bounty",
      balance: 5,
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "evt-3",
      userId: "user-1",
      type: "EARNED",
      amount: 1,
      bountyId: "bounty-10",
      bountyTitle: "Migrate API to GraphQL",
      description: "Earned for completing bounty",
      balance: 6,
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "evt-4",
      userId: "user-1",
      type: "SPENT",
      amount: 1,
      bountyId: "bounty-9",
      bountyTitle: "Implement search functionality",
      description: "Spent to claim FCFS bounty",
      balance: 5,
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "evt-5",
      userId: "user-1",
      type: "EARNED",
      amount: 2,
      bountyId: "bounty-8",
      bountyTitle: "Build notification system",
      description: "Earned for completing bounty",
      balance: 6,
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    },
  ],
};

export class SparkCreditsService {
  static async getBalance(userId: string): Promise<SparkCreditsBalance> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      userId,
      balance: MOCK_CREDITS_DB[userId] ?? 0,
    };
  }

  static async getCreditHistory(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<SparkCreditsHistoryResponse> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const events = MOCK_CREDIT_EVENTS[userId] ?? [];
    const totalCount = events.length;
    const sliced = events.slice(offset, offset + limit);
    return {
      events: sliced,
      totalCount,
      hasMore: offset + limit < totalCount,
    };
  }
}
