export interface SparkCreditsBalance {
  userId: string;
  balance: number;
}

export type CreditEventType = "EARNED" | "SPENT";

export interface SparkCreditEvent {
  id: string;
  userId: string;
  type: CreditEventType;
  amount: number;
  bountyId: string | null;
  bountyTitle: string | null;
  description: string;
  balance: number; // running balance after this event
  createdAt: string;
}

export interface SparkCreditsHistoryResponse {
  events: SparkCreditEvent[];
  totalCount: number;
  hasMore: boolean;
}
