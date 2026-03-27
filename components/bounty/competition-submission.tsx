"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCompetitionBounty } from "@/hooks/use-competition-bounty";

type SessionUser = {
  id: string;
  name?: string | null;
};

export function CompetitionSubmission({
  bountyId,
  deadline,
  maxParticipants = 5,
}: {
  bountyId: string;
  deadline?: string | null;
  maxParticipants?: number;
}) {
  const { data: session } = authClient.useSession();
  const user = session?.user as SessionUser | undefined;
  const [workCid, setWorkCid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    state,
    participantCount,
    isAfterDeadline,
    joinCompetition,
    submitWork,
  } = useCompetitionBounty({
    bountyId,
    submissionDeadline: deadline,
    maxParticipants,
  });

  const displayName = user?.name?.trim() || "Contributor";
  const isParticipant = Boolean(
    user?.id && state.participants.some((it) => it.userId === user.id),
  );
  const hasSubmitted = Boolean(
    user?.id &&
    state.submissions.some((it) => it.participantUserId === user.id),
  );
  const isFull = participantCount >= maxParticipants;

  const deadlineLabel = useMemo(() => {
    if (!deadline) return "No deadline configured";
    const asDate = new Date(deadline);
    if (Number.isNaN(asDate.getTime())) return "No deadline configured";
    if (isAfterDeadline) return "Submission window closed";
    return `${formatDistanceToNowStrict(asDate)} remaining`;
  }, [deadline, isAfterDeadline]);

  const handleJoin = () => {
    if (!user?.id) {
      toast.error("Sign in to join this competition.");
      return;
    }
    if (isFull && !isParticipant) {
      toast.error("Competition is full.");
      return;
    }
    joinCompetition({ userId: user.id, displayName });
    toast.success("Joined competition.");
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error("Sign in to submit work.");
      return;
    }
    if (!isParticipant) {
      toast.error("Join the competition before submitting.");
      return;
    }
    if (!workCid.trim()) return;
    setIsSubmitting(true);
    try {
      submitWork({
        participantUserId: user.id,
        participantDisplayName: displayName,
        workCid: workCid.trim(),
      });
      toast.success(
        hasSubmitted ? "Submission updated." : "Submission received.",
      );
      setWorkCid("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 rounded-xl border border-gray-800 bg-background-card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">
            Competition Entry
          </h3>
          <p className="text-xs text-gray-400">
            {participantCount}/{maxParticipants} joined
          </p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <div className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {deadlineLabel}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {state.participants.length > 0 ? (
          state.participants.map((participant) => (
            <span
              key={participant.userId}
              className="px-2.5 py-1 rounded-full text-xs border border-gray-700 bg-gray-900/40 text-gray-300"
            >
              {participant.displayName}
            </span>
          ))
        ) : (
          <p className="text-xs text-gray-500">No participants yet.</p>
        )}
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={isAfterDeadline || (isFull && !isParticipant)}
        onClick={handleJoin}
      >
        {isParticipant ? "Joined Competition" : "Join Competition"}
      </Button>

      {isParticipant && !isAfterDeadline && (
        <div className="space-y-2">
          <Input
            placeholder="Paste work CID / submission URL"
            value={workCid}
            onChange={(event) => setWorkCid(event.target.value)}
          />
          <Button
            type="button"
            className="w-full"
            variant="secondary"
            disabled={!workCid.trim() || isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {hasSubmitted ? "Update Submission" : "Submit Work"}
          </Button>
          <p className="text-xs text-gray-500">
            Submissions remain hidden from all participants until deadline.
          </p>
        </div>
      )}

      {isAfterDeadline && (
        <p className="text-xs text-amber-400">
          Submission window closed. All entries are now revealed for judging.
        </p>
      )}
    </div>
  );
}
