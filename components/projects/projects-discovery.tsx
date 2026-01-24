"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/types/project";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ProjectCard } from "@/components/projects/project-card";
import { Search, ArrowDown, ListFilter, LayoutGrid } from "lucide-react";

type SortKey = "newest" | "mostOpen" | "recentlyUpdated";

function includesQuery(haystack: string, q: string) {
  return haystack.toLowerCase().includes(q);
}

export function ProjectsDiscovery({
  projects,
}: {
  projects: Project[];
  allTags: string[];
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = projects.filter((p) => {
      if (!q) return true;
      return (
        includesQuery(p.name, q) ||
        includesQuery(p.description, q) ||
        includesQuery(p.creatorName, q)
      );
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
  }, [projects, query, sortKey]);

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

            <Button className="bg-[#B4FF39] hover:bg-[#a3e635] text-black font-bold h-14 px-8 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-green-500/20">
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

              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-[150px] h-12 bg-[#1A1F21] border-white/5 rounded-xl text-white/90 font-medium focus:ring-green-500/20 px-4">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F21] border-white/10 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-[180px] h-12 bg-[#1A1F21] border-white/5 rounded-xl text-white/90 font-medium focus:ring-green-500/20 px-4">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F21] border-white/10 text-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="defi">DeFi</SelectItem>
                  <SelectItem value="infra">Infrastructure</SelectItem>
                  <SelectItem value="tooling">Tooling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full md:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/20 group-focus-within:text-green-400 transition-colors" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search project or creator..."
                className="h-12 w-full pl-12 bg-[#0A0C0D] border-white/5 rounded-xl text-white placeholder:text-white/20 focus-visible:ring-green-500/20 focus-visible:border-white/10 transition-all font-medium"
              />
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
                    you're looking for.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
