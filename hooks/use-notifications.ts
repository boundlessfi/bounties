"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import {
  ON_BOUNTY_UPDATED_SUBSCRIPTION,
  ON_NEW_APPLICATION_SUBSCRIPTION,
  ON_SUBMISSION_REVIEWED_SUBSCRIPTION,
  type OnBountyUpdatedData,
  type OnNewApplicationData,
  type OnSubmissionReviewedData,
} from "@/lib/graphql/subscriptions";
import { bountyKeys, submissionKeys } from "@/lib/query/query-keys";

import { useGraphQLSubscription } from "./use-graphql-subscription";

export type NotificationType =
  | "bounty-updated"
  | "new-application"
  | "submission-reviewed";

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

export function useNotifications() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const isEnabled = Boolean(session?.user);
  const userId = session?.user?.id ?? null;
  const prevUserIdRef = useRef(userId);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Sync state with userId changes during render
  // This is faster than useEffect and avoids cascading renders
  if (prevUserIdRef.current !== userId) {
    prevUserIdRef.current = userId;
    setNotifications(userId ? loadFromStorage(userId) : []);
  }

  // Handle initial client-side hydration
  useEffect(() => {
    if (!hydrated) {
      if (userId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNotifications(loadFromStorage(userId));
      }
      setHydrated(true);
    }
  }, [userId, hydrated]);

  // Persist to localStorage whenever notifications change
  useEffect(() => {
    if (userId && hydrated) {
      saveToStorage(userId, notifications);
    }
  }, [notifications, userId, hydrated]);

  // Helper to update notifications with cache invalidation
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

  const isLoading = session === undefined || !hydrated;

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
