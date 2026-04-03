"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock3, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FcfsError,
  useClaimBounty,
  useUnclaimBounty,
} from "@/hooks/use-claim-bounty";

type FcfsBounty = {
  id: string;
  type: string;
  status: string;
  createdBy: string;
  updatedAt?: string | null;
  claimsLastMilestoneAt?: string | null;
  claimsLastResponseAt?: string | null;
  claimedBy?: string | null;
  claimedByUser?: { name?: string | null } | null;
  submissions?: Array<{
    submittedBy?: string;
    submittedByUser?: { name?: string | null } | null;
  }> | null;
};

function getClaimOwner(bounty: FcfsBounty): {
  address: string | null;
  label: string | null;
} {
  const address =
    bounty.claimedBy || bounty.submissions?.[0]?.submittedBy || null;
  const label =
    bounty.claimedByUser?.name ||
    bounty.submissions?.[0]?.submittedByUser?.name ||
    address;
  return { address, label: label ? `@${label}` : null };
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "Expired";
  const totalHours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return `${days}d ${hours}h`;
}

export function FcfsClaimButton({ bounty }: { bounty: FcfsBounty }) {
  const { data: session } = authClient.useSession();
  const [unclaimOpen, setUnclaimOpen] = useState(false);
  const [justification, setJustification] = useState("");
  const [now, setNow] = useState<number>(() => Date.now());
  const claimMutation = useClaimBounty();
  const unclaimMutation = useUnclaimBounty();

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const currentUserId = (session?.user as { id?: string } | undefined)?.id;
  const walletAddress =
    (session?.user as { walletAddress?: string; address?: string } | undefined)
      ?.walletAddress ||
    (session?.user as { walletAddress?: string; address?: string } | undefined)
      ?.address ||
    null;

  const isFcfs = bounty.type === "FIXED_PRICE";
  const isOpen = bounty.status === "OPEN";
  const isClaimed = bounty.status === "IN_PROGRESS";
  const isCreator = Boolean(
    currentUserId && currentUserId === bounty.createdBy,
  );
  const owner = getClaimOwner(bounty);
  const isOwner = Boolean(owner.address && owner.address === walletAddress);

  const milestoneBase = bounty.claimsLastMilestoneAt || bounty.updatedAt;
  const responseBase = bounty.claimsLastResponseAt || bounty.updatedAt;

  const milestoneMsLeft = useMemo(() => {
    if (!milestoneBase) return null;
    return new Date(milestoneBase).getTime() + 7 * 24 * 60 * 60 * 1000 - now;
  }, [milestoneBase, now]);
  const responseMsLeft = useMemo(() => {
    if (!responseBase) return null;
    return new Date(responseBase).getTime() + 3 * 24 * 60 * 60 * 1000 - now;
  }, [responseBase, now]);

  if (!isFcfs) return null;

  const handleClaim = async () => {
    if (!walletAddress) {
      toast.error("Connect your wallet to claim this bounty.");
      return;
    }
    try {
      await claimMutation.mutateAsync({
        bountyId: bounty.id,
        contributorAddress: walletAddress,
      });
      toast.success("Bounty claimed successfully.");
    } catch (error) {
      if (error instanceof FcfsError) {
        toast.error(error.message);
        return;
      }
      toast.error(error instanceof Error ? error.message : "Claim failed.");
    }
  };

  const handleUnclaim = async () => {
    if (!walletAddress) return;
    try {
      await unclaimMutation.mutateAsync({
        bountyId: bounty.id,
        creatorAddress: walletAddress,
        justification: justification.trim(),
      });
      toast.success("Bounty was unclaimed.");
      setUnclaimOpen(false);
      setJustification("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unclaim failed.");
    }
  };

  return (
    <div className="space-y-3">
      {isOpen && !isCreator && !walletAddress && (
        <p className="text-sm text-amber-400 text-center py-2">
          Connect your wallet to claim this bounty.
        </p>
      )}

      {isOpen && !isCreator && walletAddress && (
        <Button
          className="w-full h-11 font-bold tracking-wide"
          size="lg"
          onClick={() => void handleClaim()}
          disabled={claimMutation.isPending}
        >
          {claimMutation.isPending && (
            <Loader2 className="mr-2 size-4 animate-spin" />
          )}
          Claim Bounty
        </Button>
      )}

      {isClaimed && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-3 space-y-3">
          <p className="text-xs text-gray-300">
            {isOwner
              ? "This FCFS bounty is currently claimed by your wallet."
              : `Already Claimed${owner.label ? ` by ${owner.label}` : ""}`}
          </p>

          <div className="space-y-1.5 text-xs text-gray-400">
            {milestoneMsLeft != null && (
              <p className="flex items-center gap-1.5">
                <Clock3 className="size-3.5" />
                Auto-release in {formatRemaining(milestoneMsLeft)} (7d no
                milestone)
              </p>
            )}
            {responseMsLeft != null && (
              <p className="flex items-center gap-1.5">
                <Clock3 className="size-3.5" />
                Auto-release in {formatRemaining(responseMsLeft)} (3d no
                response)
              </p>
            )}
          </div>

          {isOwner &&
            ((milestoneMsLeft != null &&
              milestoneMsLeft > 0 &&
              milestoneMsLeft < 24 * 60 * 60 * 1000) ||
              (responseMsLeft != null &&
                responseMsLeft > 0 &&
                responseMsLeft < 24 * 60 * 60 * 1000)) && (
              <p className="text-xs text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" />
                Your claim is close to auto-release. Post progress to avoid
                abandonment.
              </p>
            )}

          {isCreator && (
            <Dialog open={unclaimOpen} onOpenChange={setUnclaimOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  Unclaim
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Unclaim bounty</DialogTitle>
                  <DialogDescription>
                    Provide a justification before releasing this claim.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="fcfs-unclaim-justification">
                    Justification
                  </Label>
                  <Textarea
                    id="fcfs-unclaim-justification"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Explain why this claim should be released..."
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setUnclaimOpen(false)}
                    disabled={unclaimMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => void handleUnclaim()}
                    disabled={
                      !justification.trim() || unclaimMutation.isPending
                    }
                  >
                    {unclaimMutation.isPending && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Confirm Unclaim
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
}
