"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ReviewSubmission } from "@/types/participation";

type Action = "approve" | "reject" | "request_revision";

interface SponsorReviewDashboardProps {
  submissions: ReviewSubmission[];
  onAction?: (submissionId: string, action: Action) => Promise<void> | void;
}

export function SponsorReviewDashboard({
  submissions,
  onAction,
}: SponsorReviewDashboardProps) {
  const [items, setItems] = React.useState<ReviewSubmission[]>(
    () => submissions,
  );
  const [loadingIds, setLoadingIds] = React.useState<Record<string, boolean>>(
    {},
  );

  React.useEffect(() => {
    setItems((curr) => {
      const currIdMap = new Map(curr.map((it) => [it.submissionId, it]));
      return submissions.map(
        (sub) => (currIdMap.get(sub.submissionId) ?? sub) as ReviewSubmission,
      );
    });
  }, [submissions]);

  const handleAction = async (id: string, action: Action) => {
    setLoadingIds((s) => ({ ...s, [id]: true }));
    let prevItem: ReviewSubmission | undefined;

    setItems((curr) =>
      curr.map((it) => {
        if (it.submissionId === id) {
          prevItem = it;
          return {
            ...it,
            status:
              action === "approve"
                ? "approved"
                : action === "reject"
                  ? "rejected"
                  : "revision_requested",
          };
        }
        return it;
      }),
    );

    try {
      const maybe = onAction && onAction(id, action);
      if (maybe && maybe instanceof Promise) await maybe;
    } catch {
      if (prevItem) {
        setItems(
          (curr) =>
            curr.map((it) =>
              it.submissionId === id ? prevItem : it,
            ) as ReviewSubmission[],
        );
      }
    } finally {
      setLoadingIds((s) => {
        const copy = { ...s };
        delete copy[id];
        return copy;
      });
    }
  };

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No submissions to review.
        </div>
      )}

      <ul className="space-y-2">
        {items.map((sub) => (
          <li
            key={sub.submissionId}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-md border p-3"
          >
            <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
              <Avatar className="shrink-0">
                {sub.contributor.avatarUrl ? (
                  <AvatarImage
                    src={sub.contributor.avatarUrl}
                    alt={sub.contributor.username}
                  />
                ) : (
                  <AvatarFallback>
                    {sub.contributor.username?.charAt(0).toUpperCase() ?? "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">
                  {sub.contributor.username}
                </div>
                <div className="text-xs text-muted-foreground">
                  Submitted{" "}
                  {format(parseISO(sub.submittedAt), "MM/dd/yyyy, hh:mm aa")}
                </div>
                {sub.milestoneId && (
                  <div className="text-xs text-muted-foreground">
                    Milestone: {sub.milestoneId}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="text-sm shrink-0">
                {sub.status === "pending" && (
                  <span className="text-yellow-600 font-medium">Pending</span>
                )}
                {sub.status === "approved" && (
                  <span className="text-green-600 font-medium">Approved</span>
                )}
                {sub.status === "rejected" && (
                  <span className="text-red-600 font-medium">Rejected</span>
                )}
                {sub.status === "revision_requested" && (
                  <span className="text-blue-600 font-medium">
                    Revision Requested
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleAction(sub.submissionId, "request_revision")
                  }
                  disabled={!!loadingIds[sub.submissionId]}
                  className="flex-1 sm:flex-none"
                >
                  Request revision
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(sub.submissionId, "reject")}
                  disabled={!!loadingIds[sub.submissionId]}
                  className="text-red-600 flex-1 sm:flex-none"
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAction(sub.submissionId, "approve")}
                  disabled={!!loadingIds[sub.submissionId]}
                  className="text-green-600 flex-1 sm:flex-none"
                >
                  Approve
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SponsorReviewDashboard;
