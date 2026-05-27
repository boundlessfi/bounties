import { useCancelBountyDialog } from "@/hooks/use-cancel-bounty-dialog";
import { useCanRaiseDispute } from "@/hooks/use-can-raise-dispute";
import { useCompetitionJoinState } from "@/hooks/use-competition-join-state";
import { useApplyToBounty } from "@/hooks/use-bounty-application";
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
  const isCreator =
    (session?.user as { id?: string } | undefined)?.id === bounty.createdBy;

  const canRaiseDispute = useCanRaiseDispute(bounty);

  const canCancel =
    isCreator && (bounty.status === "OPEN" || bounty.status === "IN_PROGRESS");

  const joinState = useCompetitionJoinState(bounty);

  const { mutateAsync: applyToBounty } = useApplyToBounty();

  const handleApply = async (values: ApplicationFormValues) => {
    if (!joinState.walletAddress) return;
    await applyToBounty({
      bountyId: bounty.id,
      applicantAddress: joinState.walletAddress,
      proposal: JSON.stringify(values),
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
    isCreator,
    canRaiseDispute,
    canCancel,
    joinState,
    handleApply,
    label,
  };
}
