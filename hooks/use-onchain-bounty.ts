"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc, xdr, scValToNative } from "@stellar/stellar-sdk";
import { useBounty } from "./use-bounty";
import {
  contractEventPoller,
  type ParsedContractEvent,
} from "@/lib/contracts/event-listener";
import {
  STELLAR_RPC_URL,
  BOUNTY_CONTRACT_ID,
  STELLAR_EXPLORER_URL,
} from "@/lib/contracts/config";

export type OnChainStatus =
  | "open"
  | "in_progress"
  | "submitted"
  | "approved"
  | "claimed"
  | "cancelled"
  | "unknown";

export interface OnChainBountyData {
  bountyId: string;
  status: OnChainStatus;
  creator?: string;
  assignee?: string;
  ledger?: number;
  lastTxHash?: string;
}

export type ConsistencyState =
  | "consistent"
  | "conflict"
  | "unverified"
  | "loading";

function mapGraphQLStatusToOnChain(
  graphqlStatus: string,
): OnChainStatus | null {
  const s = graphqlStatus.toUpperCase();
  if (s === "OPEN") return "open";
  if (s === "IN_PROGRESS") return "in_progress";
  if (s === "SUBMITTED" || s === "UNDER_REVIEW") return "submitted";
  if (s === "COMPLETED") return "approved";
  if (s === "CANCELLED") return "cancelled";
  // DRAFT and DISPUTED have no comparable on-chain state; skip conflict detection
  return null;
}

async function fetchOnChainBountyStatus(
  bountyId: string,
): Promise<OnChainBountyData> {
  if (!BOUNTY_CONTRACT_ID) {
    return { bountyId, status: "unknown" };
  }

  const server = new rpc.Server(STELLAR_RPC_URL, { allowHttp: false });

  try {
    const statusKey = xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol("BountyStatus"),
      xdr.ScVal.scvString(bountyId),
    ]);

    const response = await server.getContractData(
      BOUNTY_CONTRACT_ID,
      statusKey,
      rpc.Durability.Persistent,
    );

    const rawVal = response.val;
    let entryVal: xdr.ScVal | null = null;
    try {
      entryVal = rawVal.contractData().val();
    } catch {
      return { bountyId, status: "unknown" };
    }

    if (!entryVal) return { bountyId, status: "unknown" };

    const native = scValToNative(entryVal);
    const statusStr =
      typeof native === "string" ? native.toLowerCase() : "unknown";

    return {
      bountyId,
      status: statusStr as OnChainStatus,
      ledger: response.lastModifiedLedgerSeq,
    };
  } catch {
    return { bountyId, status: "unknown" };
  }
}

const onChainQueryKey = (bountyId: string) =>
  ["onchain-bounty", bountyId] as const;

export function useOnChainBounty(bountyId: string) {
  const queryClient = useQueryClient();
  const { data: graphqlBounty, isLoading: isGraphQLLoading } =
    useBounty(bountyId);

  const [lastEvent, setLastEvent] = useState<ParsedContractEvent | null>(null);

  const {
    data: onChainData,
    isLoading: isOnChainLoading,
    isError: isOnChainError,
    refetch,
  } = useQuery({
    queryKey: onChainQueryKey(bountyId),
    queryFn: () => fetchOnChainBountyStatus(bountyId),
    enabled: !!bountyId && !!BOUNTY_CONTRACT_ID,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    if (!bountyId) return;

    const unsub = contractEventPoller.subscribe((event) => {
      if (event.bountyId !== bountyId) return;
      setLastEvent(event);
      queryClient.invalidateQueries({ queryKey: onChainQueryKey(bountyId) });
    });

    return unsub;
  }, [bountyId, queryClient]);

  const consistencyState: ConsistencyState = (() => {
    if (isGraphQLLoading || isOnChainLoading) return "loading";
    if (!onChainData || onChainData.status === "unknown" || isOnChainError)
      return "unverified";
    if (!graphqlBounty) return "unverified";

    const expected = mapGraphQLStatusToOnChain(graphqlBounty.status);
    if (expected === null) return "unverified";
    return expected === onChainData.status ? "consistent" : "conflict";
  })();

  const explorerUrl = onChainData?.lastTxHash
    ? `${STELLAR_EXPLORER_URL}/tx/${onChainData.lastTxHash}`
    : BOUNTY_CONTRACT_ID
      ? `${STELLAR_EXPLORER_URL}/contract/${BOUNTY_CONTRACT_ID}`
      : null;

  return {
    onChainData,
    graphqlBounty,
    isLoading: isGraphQLLoading || isOnChainLoading,
    isOnChainError,
    consistencyState,
    lastEvent,
    explorerUrl,
    refetch,
  };
}
