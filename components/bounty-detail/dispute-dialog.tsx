"use client";

import { useState } from "react";
import { Loader2, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRaiseDispute } from "@/hooks/use-bounty-application";
import { DisputeReasonEnum } from "@/lib/graphql/generated";

interface DisputeDialogProps {
  bountyId: string;
  trigger: React.ReactNode;
}

export function DisputeDialog({ bountyId, trigger }: DisputeDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<DisputeReasonEnum | "">("");
  const [description, setDescription] = useState("");
  const { mutate: raiseDispute, isPending } = useRaiseDispute();
  const router = useRouter();

  const handleSubmit = () => {
    if (!reason || !description.trim()) {
      toast.error("Please provide both a reason and a description");
      return;
    }

    raiseDispute(
      { bountyId, reason: reason as DisputeReasonEnum, description },
      {
        onSuccess: (data) => {
          toast.success("Dispute raised successfully");
          setOpen(false);
          router.push(`/dispute/${data.disputeId}`);
        },
        onError: () => {
          toast.error("Failed to raise dispute");
        },
      },
    );
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className="w-full">
        {trigger}
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-background border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Gavel className="size-5" />
              Raise a Dispute
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Provide details for this dispute. Our arbitration team will review
              the information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 my-2">
            <div className="space-y-2">
              <Label>
                Reason <span className="text-red-400">*</span>
              </Label>
              <Select
                value={reason}
                onValueChange={(val) => setReason(val as DisputeReasonEnum)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DisputeReasonEnum).map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Description <span className="text-red-400">*</span>
              </Label>
              <Textarea
                placeholder="Explain the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24 resize-none bg-gray-800/50"
                disabled={isPending}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={!reason || !description.trim() || isPending}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Submit Dispute
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
