"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Clock, X } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useBountySearch } from "@/hooks/use-bounty-search";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function SearchCommand() {
  const router = useRouter();
  const {
    searchTerm,
    setSearchTerm,
    isOpen,
    setIsOpen,
    toggleOpen,
    results,
    isLoading,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useBountySearch();

  // Platform detection for keyboard shortcut
  const [modifierKey, setModifierKey] = React.useState<string>("⌘");

  React.useEffect(() => {
    // Simple check for Mac vs others
    if (
      typeof navigator !== "undefined" &&
      !/Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
    ) {
      setModifierKey("Ctrl");
    }
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleOpen();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleOpen]);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setIsOpen(false);
      command();
    },
    [setIsOpen],
  );

  const handleSelect = (bountyId: string, title: string) => {
    addRecentSearch(title);
    runCommand(() => router.push(`/bounty/${bountyId}`));
  };

  const handleRecentSelect = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm sm:pr-12 md:w-40 lg:w-64 text-foreground"
        onClick={() => setIsOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search bounties...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border border-muted bg-muted text-muted-foreground px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">{modifierKey}</span>K
        </kbd>
      </Button>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput
          placeholder="Type a command or search..."
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {!searchTerm && recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((term) => (
                <CommandItem
                  key={term}
                  value={term}
                  onSelect={() => handleRecentSelect(term)}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{term}</span>
                  <button
                    type="button"
                    className="ml-auto flex h-4 w-4 items-center justify-center rounded-sm hover:bg-gray-200 opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(term);
                    }}
                    aria-label={`Remove recent search ${term}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </CommandItem>
              ))}
              <CommandItem
                onSelect={clearRecentSearches}
                className="text-xs text-muted-foreground justify-center"
              >
                Clear recent searches
              </CommandItem>
            </CommandGroup>
          )}

          {isLoading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[60%]" />
            </div>
          ) : (
            results.length > 0 && (
              <CommandGroup heading="Bounties">
                {results.map((bounty) => (
                  <CommandItem
                    key={bounty.id}
                    value={bounty.title}
                    onSelect={() => handleSelect(bounty.id, bounty.title)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{bounty.title}</span>
                      <span className="text-xs text-gray-500">
                        {bounty.organization?.name ?? "Unknown"} •{" "}
                        {bounty.status}
                      </span>
                    </div>
                    {bounty.rewardAmount && (
                      <Badge variant="secondary" className="ml-auto">
                        {bounty.rewardAmount} {bounty.rewardCurrency}
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
