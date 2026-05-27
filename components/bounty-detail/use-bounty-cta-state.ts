import { useCancelBountyDialog } from "@/hooks/use-cancel-bounty-dialog";
import { useCanRaiseDispute } from "@/hooks/use-can-raise-dispute";
import { useCompetitionJoinState } from "@/hooks/use-competition-join-state";
import {
  useApplyToBounty,
  useApplyForSlot,
} from "@/hooks/use-bounty-application";
import { authClient } from "@/lib/auth-client";
import { SidebarBounty } from "./types";
import { ApplicationFormValues } from "@/components/bounty/application-dialog";
import type { CancellationRecord } from "@/types/escrow";

export function useBountyCtaState(
  bounty: SidebarBounty,
  onCancelled?: (record: CancellationRecord) => void,
) {
  const { data: session } = authClient.useSession();

  const cancelDialog = useCancelBountyDialog(bounty.id, onCancelled);

  const canAct = bounty.status === "OPEN";
  const isFcfs = bounty.type === "FIXED_PRICE";
  const isCompetition = bounty.type === "COMPETITION";
  const isMultiWinnerMilestone = bounty.type === "MULTI_WINNER_MILESTONE";

  const isCreator =
    (session?.user as { id?: string } | undefined)?.id === bounty.createdBy;

  const canRaiseDispute = useCanRaiseDispute(bounty);

  const canCancel =
    isCreator && (bounty.status === "OPEN" || bounty.status === "IN_PROGRESS");

  const joinState = useCompetitionJoinState(bounty);

  const { mutateAsync: applyToBounty } = useApplyToBounty();

  // MULTI_WINNER_MILESTONE state
  const { mutateAsync: applyForSlot, isPending: isApplyingForSlot } =
    useApplyForSlot();

  const isSlotFull =
    isMultiWinnerMilestone &&
    (bounty.totalSlotsOccupied || 0) >= (bounty.maxSlots || 0);
  const hasAppliedForSlot =
    isMultiWinnerMilestone &&
    (bounty.contributorProgress?.some(
      (cp) => cp.userId === joinState.walletAddress,
    ) ||
      false);

  const handleApply = async (values: ApplicationFormValues) => {
    if (!joinState.walletAddress) return;
    await applyToBounty({
      bountyId: bounty.id,
      applicantAddress: joinState.walletAddress,
      proposal: JSON.stringify(values),
    });
  };

  const handleApplyForSlot = async () => {
    if (!joinState.walletAddress || !session?.user) return;
    await applyForSlot({
      bountyId: bounty.id,
      applicantAddress: joinState.walletAddress,
      applicantName: session.user.name || "Anonymous",
      applicantAvatarUrl: session.user.image || "",
    });
  };

  const label = () => {
    if (!canAct) {
      switch (bounty.status) {
        case "IN_PROGRESS":
          return "In Progress";
        case "COMPLETED":
          return "Completed";
        default:
          return "Not Available";
      }
    }
    return "Submit to Bounty";
  };

  return {
    cancelDialog,
    canAct,
    isFcfs,
    isCompetition,
    isMultiWinnerMilestone,
    isCreator,
    canRaiseDispute,
    canCancel,
    joinState,
    handleApply,
    handleApplyForSlot,
    isApplyingForSlot,
    isSlotFull,
    hasAppliedForSlot,
    label,
  };
}
