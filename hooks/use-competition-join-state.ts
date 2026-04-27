"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  useJoinCompetition,
  ContestError,
} from "@/hooks/use-competition-bounty";
import { useDeadlinePassed } from "@/hooks/use-deadline-passed";
import type { BountyFieldsFragment } from "@/lib/graphql/generated";

interface CompetitionJoinState {
  walletAddress: string | null;
  hasJoined: boolean;
  isPastDeadline: boolean;
  joinMutation: ReturnType<typeof useJoinCompetition>;
  handleJoin: () => Promise<void>;
}

export function useCompetitionJoinState(
  bounty: BountyFieldsFragment,
): CompetitionJoinState {
  const { data: session } = authClient.useSession();
  const joinMutation = useJoinCompetition();
  const [localJoined, setLocalJoined] = useState(false);

  const walletAddress =
    (session?.user as { walletAddress?: string; address?: string } | undefined)
      ?.walletAddress ||
    (session?.user as { walletAddress?: string; address?: string } | undefined)
      ?.address ||
    null;

  const deadline = bounty.bountyWindow?.endDate ?? null;
  const isPastDeadline = useDeadlinePassed(deadline);

  // Derive from server payload (submissions list on BountyQuery) + local optimism.
  // BountyFieldsFragment (list queries) doesn't include submissions, so falls
  // back to false until the detail query resolves.
  const bountySubmissions = (
    bounty as { submissions?: Array<{ submittedBy: string }> | null }
  ).submissions;
  const serverHasJoined =
    walletAddress != null &&
    (bountySubmissions?.some((s) => s.submittedBy === walletAddress) ?? false);
  const hasJoined = serverHasJoined || localJoined;

  const handleJoin = async () => {
    if (!walletAddress) {
      toast.error("Connect your wallet to join this competition.");
      return;
    }
    try {
      await joinMutation.mutateAsync({
        bountyId: bounty.id,
        contributorAddress: walletAddress,
      });
      setLocalJoined(true);
      toast.success("You've joined the competition!");
    } catch (err) {
      if (err instanceof ContestError && err.code === "already_joined") {
        setLocalJoined(true);
        return;
      }
      toast.error(err instanceof Error ? err.message : "Failed to join.");
    }
  };

  return { walletAddress, hasJoined, isPastDeadline, joinMutation, handleJoin };
}
