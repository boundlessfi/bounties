import { useState, useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
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

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    isOpen,
    setIsOpen,
    toggleOpen,
    results: data?.data ?? [],
    isLoading: isLoading || isFetching,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  };
}
