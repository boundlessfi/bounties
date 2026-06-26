"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { bountyKeys } from "@/lib/query/query-keys";
import { getAllProjects } from "@/lib/mock/projects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type BountyFieldsFragment } from "@/lib/graphql/generated";

const PAGES = [
  { title: "Bounties", href: "/bounty" },
  { title: "Projects", href: "/projects" },
  { title: "Leaderboard", href: "/leaderboard" },
  { title: "Wallet", href: "/wallet" },
];

interface SearchProject {
  id: string;
  name: string;
  description: string;
  logoUrl: string | null;
}

type CacheRecord =
  | BountyFieldsFragment
  | { bounties: { bounties: unknown[] } }
  | { data: unknown[] }
  | { pages: unknown[] }
  | unknown[];

function isBountyFragment(obj: unknown): obj is BountyFieldsFragment {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    typeof (obj as Record<string, unknown>).id === "string" &&
    "title" in obj &&
    typeof (obj as Record<string, unknown>).title === "string"
  );
}

function isProjectRecord(obj: unknown): obj is {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  logoUrl?: string;
  logo?: string;
} {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    typeof (obj as Record<string, unknown>).id === "string"
  );
}

export function SearchCommand() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [cachedBounties, setCachedBounties] = React.useState<
    BountyFieldsFragment[]
  >([]);
  const [cachedProjects, setCachedProjects] = React.useState<SearchProject[]>(
    [],
  );

  const toggleOpen = React.useCallback(() => setIsOpen((prev) => !prev), []);

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

  // Extract unique bounties and projects from TanStack Query cache on dialog open
  React.useEffect(() => {
    if (!isOpen) return;

    const bounties: BountyFieldsFragment[] = [];
    const projects: SearchProject[] = [];
    const seenBounties = new Set<string>();
    const seenProjects = new Set<string>();

    const extractFromObject = (obj: unknown) => {
      if (!obj || typeof obj !== "object") return;

      // Directly check for BountyFieldsFragment/Bounty properties
      if (isBountyFragment(obj)) {
        if (!seenBounties.has(obj.id)) {
          seenBounties.add(obj.id);
          bounties.push(obj);
        }

        // Dynamically extract cached project from bounty fields
        if (obj.project && isProjectRecord(obj.project)) {
          const projId = obj.project.id;
          if (!seenProjects.has(projId)) {
            seenProjects.add(projId);
            const proj = obj.project;
            projects.push({
              id: projId,
              name: proj.title || proj.name || "Unnamed Project",
              description: proj.description || "",
              logoUrl: proj.logoUrl || proj.logo || null,
            });
          }
        }
        return;
      }

      const record = obj as CacheRecord;

      // BountiesQuery structure
      if (
        "bounties" in record &&
        record.bounties &&
        typeof record.bounties === "object" &&
        "bounties" in record.bounties &&
        Array.isArray((record.bounties as Record<string, unknown>).bounties)
      ) {
        (record.bounties as Record<string, unknown>).bounties.forEach((b: unknown) => extractFromObject(b));
        return;
      }

      // Array structure (PaginatedResponse.data or raw array)
      if ("data" in record && Array.isArray(record.data)) {
        record.data.forEach((b: unknown) => extractFromObject(b));
        return;
      }
      if (Array.isArray(record)) {
        record.forEach((b: unknown) => extractFromObject(b));
        return;
      }

      // InfiniteQuery pages structure
      if ("pages" in record && Array.isArray(record.pages)) {
        record.pages.forEach((page: unknown) => extractFromObject(page));
        return;
      }
    };

    // 1. Query the cache across all known list keys
    const listKeys = bountyKeys.allListKeys || [["Bounties"]];
    listKeys.forEach((queryKey) => {
      const queries = queryClient.getQueriesData({ queryKey });
      queries.forEach((entry) => {
        extractFromObject(entry[1]);
      });
    });

    // 2. Fetch mock projects as a robust fallback/seed to guarantee 100% coverage
    try {
      const allMockProjects = getAllProjects();
      allMockProjects.forEach((p) => {
        if (!seenProjects.has(p.id)) {
          seenProjects.add(p.id);
          projects.push({
            id: p.id,
            name: p.name,
            description: p.description || "",
            logoUrl: p.logoUrl || null,
          });
        }
      });
    } catch (e) {
      console.error("Failed to load static projects fallback", e);
    }

    setCachedBounties(bounties);
    setCachedProjects(projects);
  }, [isOpen, queryClient]);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setSearchTerm("");
    router.push(href);
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

          {/* Pages heading - always rendered, filtered natively by cmdk */}
          <CommandGroup heading="Pages">
            {PAGES.map((page) => (
              <CommandItem
                key={page.href}
                value={page.title}
                onSelect={() => handleSelect(page.href)}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>{page.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Bounties and Projects groups are only shown if searchTerm is non-empty */}
          {searchTerm.trim() !== "" && (
            <>
              {cachedBounties.length > 0 && (
                <CommandGroup heading="Bounties">
                  {cachedBounties.map((bounty) => (
                    <CommandItem
                      key={bounty.id}
                      value={bounty.title}
                      onSelect={() => handleSelect(`/bounty/${bounty.id}`)}
                    >
                      <Avatar className="mr-2 size-5 rounded-sm">
                        {bounty.organization?.logo ? (
                          <AvatarImage
                            src={bounty.organization.logo}
                            alt={bounty.organization.name}
                          />
                        ) : null}
                        <AvatarFallback className="rounded-sm text-[10px] font-semibold">
                          {(bounty.organization?.name ?? "Unknown")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
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
              )}

              {cachedProjects.length > 0 && (
                <CommandGroup heading="Projects">
                  {cachedProjects.map((project) => (
                    <CommandItem
                      key={project.id}
                      value={project.name}
                      onSelect={() => handleSelect(`/projects/${project.id}`)}
                    >
                      <Avatar className="mr-2 size-5 rounded-sm">
                        {project.logoUrl ? (
                          <AvatarImage
                            src={project.logoUrl}
                            alt={project.name}
                          />
                        ) : null}
                        <AvatarFallback className="rounded-sm text-[10px] font-semibold">
                          {project.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span>{project.name}</span>
                        {project.description && (
                          <span className="text-xs text-gray-500 line-clamp-1">
                            {project.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
