"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppealService } from "@/lib/services/appeal";

interface AppealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verificationRequestId: string;
  userId: string;
  rejectionReason?: string;
}

export function AppealDialog({
  open,
  onOpenChange,
  verificationRequestId,
  userId,
  rejectionReason,
}: AppealDialogProps) {
  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      await AppealService.submitAppeal(
        userId,
        verificationRequestId,
        reason,
        additionalInfo,
      );
      alert(
        "Appeal submitted successfully. Our team will review it within 3-5 business days.",
      );
      onOpenChange(false);
      setReason("");
      setAdditionalInfo("");
    } catch (error) {
      alert((error as Error).message || "Failed to submit appeal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Appeal Verification Decision</DialogTitle>
          <DialogDescription>
            Explain why you believe the rejection should be reconsidered.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {rejectionReason && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium mb-1">
                Original Rejection Reason:
              </p>
              <p className="text-sm text-muted-foreground">{rejectionReason}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Why should we reconsider?</Label>
            <Textarea
              id="reason"
              placeholder="Explain your situation..."
              className="min-h-25"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">
              Additional Information (Optional)
            </Label>
            <Textarea
              id="additionalInfo"
              placeholder="Any additional context..."
              className="min-h-20"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || submitting}
          >
            {submitting ? "Submitting..." : "Submit Appeal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
