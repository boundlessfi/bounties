import { useState, useEffect } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getAllProjects } from "@/lib/mock/projects";
import { useDebounce } from "@/hooks/use-debounce";
import { fetcher } from "@/lib/graphql/client";
import {
  BountiesDocument,
  type BountiesQuery,
  type BountyQueryInput,
  type BountyFieldsFragment,
} from "@/lib/graphql/generated";
import { bountyKeys } from "@/lib/query/query-keys";

/** LocalStorage key for persisting recent searches */
const RECENT_SEARCHES_KEY = "bounties-recent-searches";
/** Maximum number of recent searches to persist */
const MAX_RECENT_SEARCHES = 5;

/**
 * Hook for searching bounties with debounced GraphQL queries
 *
 * Provides a complete search experience with:
 * - Debounced search queries (300ms delay)
 * - Recent searches persistence using localStorage
 * - Loading and fetching state management
 * - Keyboard-friendly open/close toggle
 *
 * The search is disabled until the user opens the search dialog and enters text,
 * preventing unnecessary API calls.
 *
 * @returns Object containing search state, results, and management functions:
 *   - searchTerm: Current search input text
 *   - setSearchTerm: Update search text
 *   - debouncedSearch: Debounced search term sent to API
 *   - isOpen: Whether search dialog is open
 *   - setIsOpen: Set search dialog visibility
 *   - toggleOpen: Toggle search dialog open/closed
 *   - results: Array of bounty results from GraphQL API
 *   - isLoading: Whether initial query is loading
 *   - recentSearches: Array of previously searched terms
 *   - addRecentSearch: Save a term to recent searches
 *   - removeRecentSearch: Remove a term from recent searches
 *   - clearRecentSearches: Clear all recent searches
 *
 * @example
 * const {
 *   searchTerm,
 *   setSearchTerm,
 *   results,
 *   isLoading,
 *   recentSearches
 * } = useBountySearch();
 *
 * return (
 *   <SearchDialog>
 *     <SearchInput value={searchTerm} onChange={setSearchTerm} />
 *     {isLoading ? (
 *       <Spinner />
 *     ) : (
 *       <>
 *         {recentSearches.length > 0 && <RecentSearches items={recentSearches} />}
 *         {results.length > 0 && <SearchResults items={results} />}
 *       </>
 *     )}
 *   </SearchDialog>
 * );
 */
export function useBountySearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: bountyKeys.list({ search: debouncedSearch, limit: 5 }),
    queryFn: async () => {
      const response = await fetcher<
        BountiesQuery,
        { query: BountyQueryInput }
      >(BountiesDocument, {
        query: { search: debouncedSearch, limit: 5 },
      })();
      return {
        data: response.bounties.bounties as BountyFieldsFragment[],
      };
    },
    enabled: debouncedSearch.length > 0 && isOpen,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addRecentSearch = (term: string) => {
    if (!term.trim()) return;

    const newRecent = [term, ...recentSearches.filter((t) => t !== term)].slice(
      0,
      MAX_RECENT_SEARCHES,
    );

    setRecentSearches(newRecent);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
  };

  const removeRecentSearch = (term: string) => {
    const newRecent = recentSearches.filter((t) => t !== term);
    setRecentSearches(newRecent);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const toggleOpen = () => setIsOpen((prev) => !prev);

  // Dynamic grouping logic
  const searchLower = debouncedSearch.toLowerCase().trim();

  // Local caching logic for Bounties
  let cachedBountyResults: BountyFieldsFragment[] = [];
  if (searchLower) {
    interface CachedQueryData {
      bounties?: { bounties?: BountyFieldsFragment[] };
      pages?: Array<{ bounties?: { bounties?: BountyFieldsFragment[] } }>;
    }
    const cachedQueries = queryClient.getQueriesData<CachedQueryData>({
      queryKey: ["Bounties"],
    });
    const allCachedBounties = new Map<string, BountyFieldsFragment>();

    cachedQueries.forEach(([_, queryData]) => {
      // Data might be paginated (pages) or just single list (bounties.bounties)
      // or from the specific search queries
      let items: BountyFieldsFragment[] = [];
      if (queryData?.pages) {
        items = queryData.pages.flatMap((p) => p.bounties?.bounties || []);
      } else if (queryData?.bounties?.bounties) {
        items = queryData.bounties.bounties;
      }

      if (Array.isArray(items)) {
        items.forEach((b) => {
          if (b && b.id) {
            allCachedBounties.set(b.id, b);
          }
        });
      }
    });

    cachedBountyResults = Array.from(allCachedBounties.values()).filter(
      (b) =>
        b.title.toLowerCase().includes(searchLower) ||
        (b.description && b.description.toLowerCase().includes(searchLower)),
    );
  }

  // Combine API results and Local Cache
  const apiBountyResults = data?.data ?? [];
  const mergedBounties = [...apiBountyResults];
  const mergedIds = new Set(apiBountyResults.map((b) => b.id));

  for (const b of cachedBountyResults) {
    if (!mergedIds.has(b.id)) {
      mergedBounties.push(b);
      mergedIds.add(b.id);
    }
  }

  const bountyResults = mergedBounties.slice(0, 5);

  // Projects
  const allProjects = typeof window !== "undefined" ? getAllProjects() : [];
  const projectResults = searchLower
    ? allProjects
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower),
        )
        .slice(0, 5)
    : [];

  // Pages
  const allPages = [
    { title: "Home", url: "/" },
    { title: "Discover", url: "/discover" },
    { title: "Leaderboard", url: "/leaderboard" },
    { title: "My Profile", url: "/profile" },
  ];
  const pageResults = searchLower
    ? allPages
        .filter((p) => p.title.toLowerCase().includes(searchLower))
        .slice(0, 5)
    : [];

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    isOpen,
    setIsOpen,
    toggleOpen,
    bountyResults,
    projectResults,
    pageResults,
    results: bountyResults, // maintain backwards compatibility if needed
    isLoading: isLoading || isFetching,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  };
}
