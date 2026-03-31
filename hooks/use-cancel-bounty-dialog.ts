import { useState } from "react";
import { toast } from "sonner";
import { useCancelBounty } from "@/hooks/use-bounty-mutations";
import { EscrowService } from "@/lib/services/escrow";
import { authClient } from "@/lib/auth-client";
import type { CancellationRecord } from "@/types/escrow";

export function useCancelBountyDialog(
  bountyId: string,
  onCancelled?: (record: CancellationRecord) => void,
) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const { data: session } = authClient.useSession();
  const cancelBountyMutation = useCancelBounty();

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    setIsCancelling(true);
    let record: CancellationRecord | null = null;

    try {
      // 1. Trigger escrow refund first (simulates on-chain call)
      record = await EscrowService.cancelBounty(
        bountyId,
        session?.user?.id ?? "",
        cancelReason.trim(),
      );

      // 2. Update bounty status via GraphQL
      // If this fails, we must revert the escrow state
      try {
        await cancelBountyMutation.cancelAsync({
          id: bountyId,
          reason: cancelReason.trim(),
        });
      } catch (mutationErr) {
        console.error(
          "GraphQL mutation failed, reverting escrow:",
          mutationErr,
        );
        await EscrowService.revertCancel(bountyId);
        throw mutationErr;
      }

      toast.success("Bounty cancelled and refund initiated", {
        description: `${record.refund?.refundedAmount ?? 0} ${record.refund?.asset ?? ""} refunded`,
      });

      onCancelled?.(record);
      setCancelDialogOpen(false);
      setCancelReason("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to cancel bounty",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    cancelDialogOpen,
    setCancelDialogOpen,
    cancelReason,
    setCancelReason,
    isCancelling,
    handleCancel,
  };
}
