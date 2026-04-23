import { rpc, xdr, scValToNative } from "@stellar/stellar-sdk";
import { QueryClient } from "@tanstack/react-query";
import { bountyKeys, submissionKeys } from "@/lib/query/query-keys";
import { STELLAR_RPC_URL, BOUNTY_CONTRACT_ID } from "./config";

const POLL_INTERVAL_MS = 6000;
const LEDGER_LOOKBACK = 60;

export type ContractEventType =
  | "BountyCreated"
  | "BountyApplied"
  | "BountyAssigned"
  | "WorkSubmitted"
  | "SubmissionApproved"
  | "BountyClaimed"
  | "BountyCancelled"
  | "SplitApproved"
  | "ApplicationRejected";

export interface ParsedContractEvent {
  type: ContractEventType;
  bountyId: string;
  actor?: string;
  reason?: string;
  amount?: string;
  ledger: number;
  txHash: string;
}

function decodeSymbol(val: xdr.ScVal): string | null {
  try {
    const native = scValToNative(val);
    return typeof native === "string" ? native : null;
  } catch {
    return null;
  }
}

function decodeAddress(val: xdr.ScVal): string | null {
  try {
    const native = scValToNative(val);
    return typeof native === "string" ? native : null;
  } catch {
    return null;
  }
}

function parseRawEvent(
  event: rpc.Api.EventResponse,
): ParsedContractEvent | null {
  try {
    const topics = event.topic;
    if (!topics || topics.length < 2) return null;

    const eventName = decodeSymbol(topics[0]);
    if (!eventName) return null;

    const type = eventName as ContractEventType;
    const validTypes: ContractEventType[] = [
      "BountyCreated",
      "BountyApplied",
      "BountyAssigned",
      "WorkSubmitted",
      "SubmissionApproved",
      "BountyClaimed",
      "BountyCancelled",
      "SplitApproved",
      "ApplicationRejected",
    ];

    if (!validTypes.includes(type)) return null;

    const bountyId = decodeSymbol(topics[1]) ?? decodeAddress(topics[1]) ?? "";

    let actor: string | undefined;
    let reason: string | undefined;
    let amount: string | undefined;

    if (topics[2]) actor = decodeAddress(topics[2]) ?? undefined;

    if (event.value) {
      try {
        const valueNative = scValToNative(event.value);
        if (type === "BountyCancelled" && typeof valueNative === "string") {
          reason = valueNative;
        } else if (
          type === "SplitApproved" &&
          (typeof valueNative === "bigint" || typeof valueNative === "number")
        ) {
          amount = valueNative.toString();
        }
      } catch {
        // ignore decode failures for optional value
      }
    }

    return {
      type,
      bountyId,
      actor,
      reason,
      amount,
      ledger: event.ledger,
      txHash: event.txHash,
    };
  } catch {
    return null;
  }
}

function dispatchCacheInvalidations(
  event: ParsedContractEvent,
  queryClient: QueryClient,
) {
  const { type, bountyId } = event;

  const invalidateDetail = () =>
    queryClient.invalidateQueries({ queryKey: bountyKeys.detail(bountyId) });

  const invalidateLists = () =>
    bountyKeys.allListKeys.forEach((key) =>
      queryClient.invalidateQueries({ queryKey: key }),
    );

  switch (type) {
    case "BountyCreated":
      invalidateLists();
      break;
    case "BountyApplied":
    case "BountyAssigned":
    case "ApplicationRejected":
      invalidateDetail();
      break;
    case "WorkSubmitted":
      invalidateDetail();
      queryClient.invalidateQueries({
        queryKey: submissionKeys.byBounty(bountyId),
      });
      break;
    case "SubmissionApproved":
    case "BountyClaimed":
      invalidateDetail();
      invalidateLists();
      queryClient.invalidateQueries({
        queryKey: submissionKeys.byBounty(bountyId),
      });
      break;
    case "BountyCancelled":
      invalidateDetail();
      invalidateLists();
      break;
    case "SplitApproved":
      invalidateDetail();
      break;
  }
}

export type EventCallback = (event: ParsedContractEvent) => void;

class ContractEventPoller {
  private server: rpc.Server;
  private timer: ReturnType<typeof setInterval> | null = null;
  private latestLedger = 0;
  private isPolling = false;
  private subscribers: Set<EventCallback> = new Set();
  private queryClient: QueryClient | null = null;

  constructor() {
    this.server = new rpc.Server(STELLAR_RPC_URL, { allowHttp: false });
  }

  private async fetchLatestLedger(): Promise<number> {
    try {
      const resp = await this.server.getLatestLedger();
      return resp.sequence;
    } catch {
      return this.latestLedger;
    }
  }

  private async poll() {
    if (this.isPolling || !BOUNTY_CONTRACT_ID) return;
    this.isPolling = true;

    try {
      const currentLedger = await this.fetchLatestLedger();
      const startLedger = this.latestLedger
        ? this.latestLedger + 1
        : Math.max(1, currentLedger - LEDGER_LOOKBACK);

      if (startLedger > currentLedger) return;

      let cursor: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const request = cursor
          ? {
              cursor,
              filters: [
                {
                  type: "contract" as const,
                  contractIds: [BOUNTY_CONTRACT_ID],
                },
              ],
              limit: 100,
            }
          : {
              startLedger,
              filters: [
                {
                  type: "contract" as const,
                  contractIds: [BOUNTY_CONTRACT_ID],
                },
              ],
              limit: 100,
            };

        const response = await this.server.getEvents(request);

        if (response.events?.length) {
          for (const raw of response.events) {
            const parsed = parseRawEvent(raw);
            if (!parsed) continue;
            this.subscribers.forEach((cb) => cb(parsed));
            if (this.queryClient) {
              dispatchCacheInvalidations(parsed, this.queryClient);
            }
          }
          if (response.events.length === 100) {
            cursor = response.events[response.events.length - 1].id;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      this.latestLedger = currentLedger;
    } catch (err) {
      console.error("[ContractEventPoller] poll error:", err);
    } finally {
      this.isPolling = false;
    }
  }

  start(queryClient: QueryClient) {
    if (this.timer) return;
    this.queryClient = queryClient;
    this.timer = setInterval(() => this.poll(), POLL_INTERVAL_MS);
    this.poll();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  subscribe(cb: EventCallback): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  isRunning(): boolean {
    return this.timer !== null;
  }
}

export const contractEventPoller = new ContractEventPoller();
