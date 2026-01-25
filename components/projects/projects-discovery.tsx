"use client";

import { useMemo, useRef, useState } from "react";
import type { Project } from "@/types/project";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ProjectCard } from "@/components/projects/project-card";
import { Search, ArrowDown, ListFilter, X } from "lucide-react";

type SortKey = "newest" | "mostOpen" | "recentlyUpdated";

function includesQuery(haystack: string, q: string) {
  return haystack.toLowerCase().includes(q);
}

export function ProjectsDiscovery({
  projects,
  allTags,
}: {
  projects: Project[];
  allTags: string[];
}) {
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hasOpenBounties, setHasOpenBounties] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = projects.filter((p) => {
      if (hasOpenBounties && p.openBountyCount <= 0) return false;

      if (selectedTags.length > 0) {
        const tagSet = new Set(p.tags.map((t) => t.toLowerCase()));
        for (const t of selectedTags) {
          if (!tagSet.has(t.toLowerCase())) return false;
        }
      }

      if (!q) return true;
      return includesQuery(p.name, q) || includesQuery(p.description, q);
    });

    list = list.sort((a, b) => {
      if (sortKey === "mostOpen") return b.openBountyCount - a.openBountyCount;
      if (sortKey === "recentlyUpdated")
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [projects, query, sortKey, selectedTags, hasOpenBounties]);

  const showClear =
    query.trim() !== "" ||
    selectedTags.length > 0 ||
    hasOpenBounties ||
    sortKey !== "newest";

  const clearAll = () => {
    setQuery("");
    setSelectedTags([]);
    setHasOpenBounties(false);
    setSortKey("newest");
  };

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-green-500/30">
      <div className="container mx-auto max-w-7xl px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[32px] bg-[#0A0C0D] border border-white/5 p-8 md:p-16">
          <div className="relative z-10 max-w-2xl space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                <span className="text-[#39FF14]">Discover projects</span> that
                are shaping the future on Stellar
              </h1>
              <p className="text-white/50 text-lg font-medium max-w-md leading-relaxed">
                Validated by the community. Backed milestone by milestone.
              </p>
            </div>

            <Button
              className="bg-[#B4FF39] hover:bg-[#a3e635] text-black font-bold h-14 px-8 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-green-500/20"
              onClick={scrollToResults}
            >
              Start Exploring Projects
              <ArrowDown className="size-5" />
            </Button>
          </div>

          {/* Abstract Background Element */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#39FF14] rounded-full blur-[120px]" />
          </div>
        </section>

        <div className="space-y-10">
          <header className="flex flex-col md:flex-row md:items-end justify-between items-start gap-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Explore Boundless Projects
            </h2>
          </header>

          {/* Filter Section */}
          <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <Select
                value={sortKey}
                onValueChange={(v) => setSortKey(v as SortKey)}
              >
                <SelectTrigger className="w-full md:w-[180px] h-12 bg-[#1A1F21] border-white/5 rounded-xl text-white/90 font-medium focus:ring-green-500/20 px-4">
                  <div className="flex items-center gap-2">
                    <ListFilter className="size-4 text-white/40" />
                    <SelectValue placeholder="Sort..." />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F21] border-white/10 text-white">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="mostOpen">Most Open</SelectItem>
                  <SelectItem value="recentlyUpdated">
                    Recently Updated
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="h-12 px-4 rounded-xl bg-[#1A1F21] border border-white/5 flex items-center gap-3">
                <Switch checked={hasOpenBounties} onCheckedChange={setHasOpenBounties} />
                <Label className="text-white/80 font-medium text-sm">Has open bounties</Label>
              </div>

              {showClear ? (
                <Button
                  variant="outline"
                  className="h-12 bg-transparent border-white/10 rounded-xl text-white/80 font-medium px-4 hover:bg-white/5"
                  onClick={clearAll}
                >
                  <X className="size-4" />
                  Clear
                </Button>
              ) : null}
            </div>

            <div className="relative w-full md:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/20 group-focus-within:text-green-400 transition-colors" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search project..."
                className="h-12 w-full pl-12 bg-[#0A0C0D] border-white/5 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-green-500/20 focus-visible:border-white/10 transition-all font-medium"
              />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/70 font-medium">Tags</Label>
              {selectedTags.length > 0 ? (
                <button
                  type="button"
                  className="text-xs text-white/40 hover:text-white/70 underline underline-offset-4"
                  onClick={() => setSelectedTags([])}
                >
                  Clear tags
                </button>
              ) : null}
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <ToggleGroup
                type="multiple"
                value={selectedTags}
                onValueChange={(v) => setSelectedTags(v)}
                className="flex w-max gap-2 py-1"
              >
                {allTags.map((tag) => (
                  <ToggleGroupItem
                    key={tag}
                    value={tag}
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-white/80 data-[state=on]:bg-white/10 data-[state=on]:text-white"
                  >
                    {tag}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </section>

          {/* Grid Section */}
          <section className="pt-4">
            {filtered.length === 0 ? (
              <Empty className="border-white/5 bg-[#0A0C0D] rounded-3xl py-20 px-4">
                <EmptyHeader>
                  <EmptyTitle className="text-white">
                    No projects found
                  </EmptyTitle>
                  <EmptyDescription className="text-white/40">
                    Try adjusting your filters or search terms to find what
                    you&apos;re looking for.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div ref={resultsRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
