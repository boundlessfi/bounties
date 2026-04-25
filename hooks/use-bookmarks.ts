import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookmarkKeys } from "@/lib/query/query-keys";
import { get, post } from "@/lib/api/client";
import { toast } from "sonner";
import type { Bookmark } from "@/lib/graphql/generated";

const BOOKMARKS_ENDPOINT = "/api/bookmarks";
const BOOKMARKS_IDS_ENDPOINT = "/api/bookmarks/ids";
const BOOKMARK_STALE_TIME = 5 * 60 * 1000; // 5 minutes

async function fetchBookmarks(): Promise<Bookmark[]> {
  return get<Bookmark[]>(BOOKMARKS_ENDPOINT);
}

async function fetchBookmarkIds(): Promise<string[]> {
  return get<string[]>(BOOKMARKS_IDS_ENDPOINT);
}

/**
 * Hook to fetch and manage bookmarked bounties
 */
export function useBookmarks() {
  return useQuery<Bookmark[]>({
    queryKey: bookmarkKeys.list(),
    queryFn: fetchBookmarks,
    staleTime: BOOKMARK_STALE_TIME,
  });
}

/**
 * Hook to fetch just the bookmarked bounty IDs.
 * Use this for O(1) bookmark state checks (backed by Set).
 *
 * NOTE: Derives from the full bookmarks query when available to keep caches in sync.
 * Only falls back to independent fetch when the list cache is empty (e.g., on first load
 * of a fresh session, or on the /saved page where the list is the primary source).
 */
export function useBookmarkIds() {
  const queryClient = useQueryClient();
  const listData = queryClient.getQueryData<Bookmark[]>(bookmarkKeys.list());

  return useQuery<string[]>({
    queryKey: bookmarkKeys.ids(),
    queryFn: fetchBookmarkIds,
    staleTime: BOOKMARK_STALE_TIME,
    initialData: listData?.map((b) => b.bounty.id) ?? undefined,
  });
}

/**
 * Hook to toggle bookmark status for a bounty
 *
 * Optimistic update strategy:
 * - IDs cache is the source of truth for UI state
 * - List cache is derived and kept in sync when possible
 * - Both caches are rolled back atomically on error
 * - No fake bounty objects ever constructed
 *
 * All membership checks use Set for O(1) performance.
 */
export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bountyId: string) => {
      const response = await post<Bookmark | null>(
        `${BOOKMARKS_ENDPOINT}/${bountyId}`,
        {},
      );
      return response;
    },
    onMutate: async (bountyId: string) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: bookmarkKeys.list() }),
        queryClient.cancelQueries({ queryKey: bookmarkKeys.ids() }),
      ]);

      // Snapshot with safe fallbacks
      const previousList =
        queryClient.getQueryData<Bookmark[]>(bookmarkKeys.list()) ?? [];
      const previousIds =
        queryClient.getQueryData<string[]>(bookmarkKeys.ids()) ?? [];

      // Build Sets for O(1) membership checks
      const prevIdsSet = new Set(previousIds);
      const existsInIds = prevIdsSet.has(bountyId);

      // Check if real bookmark data exists in list cache
      const existsInList = previousList.some((b) => b.bountyId === bountyId);

      // OPTIMISTIC UPDATE: IDs cache is authoritative
      const newIds = existsInIds
        ? previousIds.filter((id) => id !== bountyId)
        : [bountyId, ...previousIds];

      queryClient.setQueryData<string[]>(bookmarkKeys.ids(), newIds);

      // Update list cache derivatively, only if we have real data
      if (existsInList) {
        const newList = previousList.filter((b) => b.bountyId !== bountyId);
        queryClient.setQueryData<Bookmark[]>(bookmarkKeys.list(), newList);
      }
      // If adding a new bookmark without cached bounty data, skip list mutation
      // Server response will populate it after settlement.

      return { previousList, previousIds };
    },
    onError: (err, bountyId, context) => {
      if (context) {
        queryClient.setQueryData(bookmarkKeys.list(), context.previousList);
        queryClient.setQueryData(bookmarkKeys.ids(), context.previousIds);
      }
      toast.error(`Failed to bookmark: ${err.message}`);
    },
    onSettled: () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: bookmarkKeys.list() }),
        queryClient.invalidateQueries({ queryKey: bookmarkKeys.ids() }),
      ]);
    },
    onSuccess: (_result, variables) => {
      // Source of truth: check current IDs cache using Set for O(1)
      const currentIds =
        queryClient.getQueryData<string[]>(bookmarkKeys.ids()) ?? [];
      const currentIdsSet = new Set(currentIds);
      const isBookmarked = currentIdsSet.has(variables as string);
      toast.success(isBookmarked ? "Bounty bookmarked!" : "Bookmark removed");
    },
  });
}
