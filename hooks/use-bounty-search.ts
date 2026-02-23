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

const RECENT_SEARCHES_KEY = "bounties-recent-searches";
const MAX_RECENT_SEARCHES = 5;

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
