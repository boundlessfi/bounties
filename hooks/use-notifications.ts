import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import {
  ON_BOUNTY_UPDATED_SUBSCRIPTION,
  ON_NEW_APPLICATION_SUBSCRIPTION,
  ON_SUBMISSION_REVIEWED_SUBSCRIPTION,
  type OnBountyUpdatedData,
  type OnNewApplicationData,
  type OnSubmissionReviewedData,
} from "@/lib/graphql/subscriptions";
import {
  bountyKeys,
  submissionKeys,
  bookmarkKeys,
} from "@/lib/query/query-keys";
import type { Bookmark } from "@/lib/graphql/generated";

import { useGraphQLSubscription } from "./use-graphql-subscription";

export type NotificationType =
  | "bounty-updated"
  | "new-application"
  | "submission-reviewed"
  | "saved-bounty-updated";

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
}

const MAX_NOTIFICATIONS = 25;
const STORAGE_KEY = "boundless:notifications";

function normaliseTimestamp(value?: string | null): string {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
}

function notificationKey(item: Pick<NotificationItem, "id" | "type">): string {
  return `${item.type}:${item.id}`;
}

function upsertNotification(
  previous: NotificationItem[],
  incoming: NotificationItem,
): NotificationItem[] {
  const key = notificationKey(incoming);
  const next = previous.filter((item) => notificationKey(item) !== key);

  next.unshift({ ...incoming, read: false });
  next.sort(
    (left, right) =>
      new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );

  return next.slice(0, MAX_NOTIFICATIONS);
}

function loadFromStorage(userId: string): NotificationItem[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_NOTIFICATIONS);
  } catch {
    return [];
  }
}

function saveToStorage(userId: string, items: NotificationItem[]): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEY}:${userId}`,
      JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)),
    );
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

/**
 * Get a Map of bountyId -> status for currently bookmarked bounties.
 * Uses Set for O(1) membership filtering.
 * Returns null if list cache is missing (no data available).
 */
function getBookmarkedStatusMap(
  queryClient: QueryClient,
): Map<string, string> | null {
  const ids = queryClient.getQueryData<string[]>(bookmarkKeys.ids()) ?? [];
  const idsSet = new Set(ids);
  const list = queryClient.getQueryData<Bookmark[]>(bookmarkKeys.list());

  // If list cache is missing or empty, return null to signal "no data"
  if (!list || list.length === 0) {
    return null;
  }

  const statusMap = new Map<string, string>();
  for (const b of list) {
    if (b.bounty && idsSet.has(b.bountyId)) {
      statusMap.set(b.bountyId, b.bounty.status);
    }
  }
  return statusMap;
}

export function useNotifications() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const isEnabled = Boolean(session?.user);
  const userId = session?.user?.id ?? null;

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window === "undefined" || !userId) return [];
    return loadFromStorage(userId);
  });

  const prevHydratedUserIdRef = useRef(userId);
  if (prevHydratedUserIdRef.current !== userId) {
    prevHydratedUserIdRef.current = userId;
    setNotifications(userId ? loadFromStorage(userId) : []);
  }

  useEffect(() => {
    if (userId) {
      saveToStorage(userId, notifications);
    }
  }, [notifications, userId]);

  const addNotification = useCallback(
    (
      item: NotificationItem,
      invalidateKeys?: readonly (readonly string[])[],
    ) => {
      setNotifications((prev) => upsertNotification(prev, item));

      if (invalidateKeys) {
        for (const key of invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key as string[] });
        }
      }
    },
    [queryClient],
  );

  // Subscription: bounty updated
  useGraphQLSubscription<OnBountyUpdatedData>(
    ON_BOUNTY_UPDATED_SUBSCRIPTION,
    {},
    useCallback(
      (data: OnBountyUpdatedData) => {
        const bounty = data.bountyUpdated;

        addNotification(
          {
            id: bounty.id,
            message: `Bounty "${bounty.title}" was updated.`,
            type: "bounty-updated",
            timestamp: normaliseTimestamp(bounty.updatedAt),
            read: false,
          },
          bountyKeys.allListKeys,
        );

        // Check bookmark membership using ONLY ids cache (O(1) via Set)
        const bookmarkedIds = queryClient.getQueryData<string[]>(
          bookmarkKeys.ids(),
        );
        const bookmarkedIdsSet = new Set(bookmarkedIds ?? []);
        const isBookmarked = bookmarkedIdsSet.has(bounty.id);

        if (isBookmarked) {
          // Get previous status from status map (derived from list cache)
          const statusMap = getBookmarkedStatusMap(queryClient);

          // Only process notification if cached data exists (avoid false positives)
          if (statusMap !== null) {
            const previousStatus = statusMap.get(bounty.id);

            // Only notify if status changed (meaningful update)
            if (
              previousStatus === undefined ||
              previousStatus !== bounty.status
            ) {
              const timestamp = Date.now();
              addNotification(
                {
                  id: `saved-bounty-updated-${bounty.id}-${timestamp}`,
                  message: `Saved bounty "${bounty.title}" was updated.`,
                  type: "saved-bounty-updated",
                  timestamp: normaliseTimestamp(bounty.updatedAt),
                  read: false,
                },
                [],
              );

              // Update status cache to prevent duplicate notifications
              queryClient.setQueryData<Record<string, string>>(
                bookmarkKeys.statusCache(),
                (old = {}) => ({
                  ...old,
                  [bounty.id]: bounty.status,
                }),
              );
            }
          }
        }

        queryClient.invalidateQueries({
          queryKey: bountyKeys.detail(bounty.id),
        });
      },
      [addNotification, queryClient],
    ),
    undefined,
    isEnabled,
  );

  // Subscription: new application/submission created
  useGraphQLSubscription<OnNewApplicationData>(
    ON_NEW_APPLICATION_SUBSCRIPTION,
    {},
    useCallback(
      (data: OnNewApplicationData) => {
        const application = data.submissionCreated;
        const actor = application.submittedByUser?.name || "A contributor";

        addNotification(
          {
            id: application.id,
            message: `${actor} submitted a new application for bounty ${application.bountyId}.`,
            type: "new-application",
            timestamp: normaliseTimestamp(application.createdAt),
            read: false,
          },
          [submissionKeys.all],
        );

        queryClient.invalidateQueries({
          queryKey: submissionKeys.byBounty(application.bountyId),
        });
      },
      [addNotification, queryClient],
    ),
    undefined,
    isEnabled,
  );

  // Subscription: submission reviewed (application reviewed)
  useGraphQLSubscription<OnSubmissionReviewedData>(
    ON_SUBMISSION_REVIEWED_SUBSCRIPTION,
    {},
    useCallback(
      (data: OnSubmissionReviewedData) => {
        const submission = data.submissionReviewed;
        const statusLabel =
          submission.status === "approved" ? "approved" : "reviewed";

        addNotification(
          {
            id: submission.id,
            message: `Your application for bounty ${submission.bountyId} has been ${statusLabel}.`,
            type: "submission-reviewed",
            timestamp: normaliseTimestamp(submission.reviewedAt),
            read: false,
          },
          [submissionKeys.all],
        );

        queryClient.invalidateQueries({
          queryKey: submissionKeys.byBounty(submission.bountyId),
        });
      },
      [addNotification, queryClient],
    ),
    undefined,
    isEnabled,
  );

  const unreadCount = useMemo(
    () => notifications.reduce((count, item) => count + (item.read ? 0 : 1), 0),
    [notifications],
  );

  const isLoading = session === undefined;

  const markAsRead = useCallback((id: string, type: NotificationType) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id && item.type === type ? { ...item, read: true } : item,
      ),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((previous) =>
      previous.map((item) => ({ ...item, read: true })),
    );
  }, []);

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
