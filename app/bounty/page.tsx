"use client"

import { useState, useMemo, useCallback } from "react"
import { getAllBounties } from "@/lib/mock-bounty"
import { BountyCard } from "@/components/bounty/bounty-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, Filter, X, ArrowUpDown } from "lucide-react"

export default function BountiesPage() {
    const allBounties = useMemo(() => getAllBounties(), [])

    // Derived lists for filters
    const projects = useMemo(() => Array.from(new Set(allBounties.map(b => b.projectName))).sort(), [allBounties])
    const allTags = useMemo(() => Array.from(new Set(allBounties.flatMap(b => b.tags))).sort(), [allBounties])

    // Filters state
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
    const [selectedProjects, setSelectedProjects] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [rewardRange, setRewardRange] = useState<[number, number]>([0, 5000])
    const [statusFilter, setStatusFilter] = useState<string>("open")
    const [sortOption, setSortOption] = useState<string>("newest")

    // Constants for filters
    const BOUNTY_TYPES = ['feature', 'bug', 'documentation', 'refactor', 'other']
    const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']
    const STATUSES = ['open', 'claimed', 'closed', 'all']

    // Filter Logic
    const filteredBounties = useMemo(() => {
        return allBounties.filter((bounty) => {
            // Search (Title, Description) - removed tags/project from search text logic if specific filters are used? 
            // Better to keep search broad or restrict? Let's keep it checking main text fields.
            const searchLower = searchQuery.toLowerCase()
            const matchesSearch =
                searchQuery === "" ||
                bounty.issueTitle.toLowerCase().includes(searchLower) ||
                bounty.description.toLowerCase().includes(searchLower)

            // Type Filter
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(bounty.type)

            // Difficulty Filter
            const matchesDifficulty = selectedDifficulties.length === 0 || (bounty.difficulty && selectedDifficulties.includes(bounty.difficulty))

            // Project Filter
            const matchesProject = selectedProjects.length === 0 || selectedProjects.includes(bounty.projectName)

            // Tag Filter (Match ANY selected tag? or ALL? Usually ANY is friendlier)
            const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => bounty.tags.includes(tag))

            // Reward Filter
            const amount = bounty.rewardAmount || 0
            const matchesReward = amount >= rewardRange[0] && amount <= rewardRange[1]

            // Status Filter
            const matchesStatus = statusFilter === 'all' || bounty.status === statusFilter

            return matchesSearch && matchesType && matchesDifficulty && matchesProject && matchesTags && matchesReward && matchesStatus
        }).sort((a, b) => {
            switch (sortOption) {
                case "highest_reward":
                    return (b.rewardAmount || 0) - (a.rewardAmount || 0)
                case "recently_updated":
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                case "newest":
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
        })
    }, [allBounties, searchQuery, selectedTypes, selectedDifficulties, selectedProjects, selectedTags, rewardRange, statusFilter, sortOption])

    // Handlers
    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        )
    }

    const toggleDifficulty = (diff: string) => {
        setSelectedDifficulties(prev =>
            prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]
        )
    }

    const toggleProject = useCallback((project: string) => {
        setSelectedProjects(prev =>
            prev.includes(project) ? prev.filter(p => p !== project) : [...prev, project]
        )
    }, [])

    const toggleTag = useCallback((tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }, [setSelectedTags])

    const clearFilters = () => {
        setSearchQuery("")
        setSelectedTypes([])
        setSelectedDifficulties([])
        setSelectedProjects([])
        setSelectedTags([])
        setRewardRange([0, 5000])
        setStatusFilter("open")
        setSortOption("newest")
    }

    return (
        <div className="min-h-screen bg-background-main-bg text-foreground pb-20 relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="fixed top-0 left-0 w-full h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 py-12 relative z-10">
                <header className="mb-10 text-center lg:text-left border-b border-gray-800/50 pb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Explore <span className="text-primary">Bounties</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
                        Discover and contribute to open source projects. Fix bugs, build features, and earn rewards in crypto.
                    </p>
                </header>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-[280px] shrink-0 space-y-8">
                        <div className="lg:sticky lg:top-24 space-y-6">

                            <div className="p-5 rounded-xl border border-gray-800 bg-background-card/50 backdrop-blur-xl shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                        <Filter className="size-4" /> Filters
                                    </h2>
                                    {(searchQuery || selectedTypes.length > 0 || selectedDifficulties.length > 0 || selectedProjects.length > 0 || selectedTags.length > 0 || rewardRange[0] !== 0 || rewardRange[1] !== 5000 || statusFilter !== 'open') && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-[10px] text-primary hover:text-primary/80 p-0 hover:bg-transparent">
                                            Reset
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {/* Search */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-gray-400">Search</Label>
                                        <div className="relative group">
                                            <Search className="absolute left-3 top-2.5 size-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                placeholder="Keywords, tags..."
                                                className="pl-9 bg-background/50 border-gray-700 hover:border-gray-600 focus:border-primary/50 transition-colors h-9 text-sm"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-gray-400">Status</Label>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-full bg-background/50 border-gray-700 hover:border-gray-600 focus:border-primary/50 h-9">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUSES.map(status => (
                                                    <SelectItem key={status} value={status} className="capitalize">
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Separator className="bg-gray-800/50" />

                                    {/* Bounty Type */}
                                    <Accordion type="single" collapsible defaultValue="type" className="w-full">
                                        <AccordionItem value="type" className="border-none">
                                            <AccordionTrigger className="text-xs font-medium text-gray-400 py-2 hover:no-underline hover:text-gray-200">
                                                BOUNTY TYPE
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2 pt-2">
                                                    {BOUNTY_TYPES.map(type => (
                                                        <div key={type} className="flex items-center space-x-2.5 group">
                                                            <Checkbox
                                                                id={`type-${type}`}
                                                                checked={selectedTypes.includes(type)}
                                                                onCheckedChange={() => toggleType(type)}
                                                                className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                            />
                                                            <Label
                                                                htmlFor={`type-${type}`}
                                                                className="text-sm font-normal text-gray-400 capitalize cursor-pointer group-hover:text-gray-200 transition-colors"
                                                            >
                                                                {type}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Difficulty */}
                                        <AccordionItem value="difficulty" className="border-none mt-2">
                                            <AccordionTrigger className="text-xs font-medium text-gray-400 py-2 hover:no-underline hover:text-gray-200">
                                                DIFFICULTY
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2 pt-2">
                                                    {DIFFICULTIES.map(diff => (
                                                        <div key={diff} className="flex items-center space-x-2.5 group">
                                                            <Checkbox
                                                                id={`diff-${diff}`}
                                                                checked={selectedDifficulties.includes(diff)}
                                                                onCheckedChange={() => toggleDifficulty(diff)}
                                                                className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                            />
                                                            <Label
                                                                htmlFor={`diff-${diff}`}
                                                                className="text-sm font-normal text-gray-400 capitalize cursor-pointer group-hover:text-gray-200 transition-colors"
                                                            >
                                                                {diff}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Project */}
                                        <AccordionItem value="project" className="border-none mt-2">
                                            <AccordionTrigger className="text-xs font-medium text-gray-400 py-2 hover:no-underline hover:text-gray-200">
                                                PROJECT
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2 pt-2 max-h-40 overflow-y-auto slim-scrollbar pr-2 leading-none">
                                                    {projects.map(project => (
                                                        <div key={project} className="flex items-center space-x-2.5 group py-0.5">
                                                            <Checkbox
                                                                id={`proj-${project}`}
                                                                checked={selectedProjects.includes(project)}
                                                                onCheckedChange={() => toggleProject(project)}
                                                                className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                            />
                                                            <Label
                                                                htmlFor={`proj-${project}`}
                                                                className="text-sm font-normal text-gray-400 capitalize cursor-pointer group-hover:text-gray-200 transition-colors truncate"
                                                                title={project}
                                                            >
                                                                {project}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Tags */}
                                        <AccordionItem value="tags" className="border-none mt-2">
                                            <AccordionTrigger className="text-xs font-medium text-gray-400 py-2 hover:no-underline hover:text-gray-200">
                                                TAGS
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2 pt-2 max-h-40 overflow-y-auto slim-scrollbar pr-2 leading-none">
                                                    {allTags.map(tag => (
                                                        <div key={tag} className="flex items-center space-x-2.5 group py-0.5">
                                                            <Checkbox
                                                                id={`tag-${tag}`}
                                                                checked={selectedTags.includes(tag)}
                                                                onCheckedChange={() => toggleTag(tag)}
                                                                className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                            />
                                                            <Label
                                                                htmlFor={`tag-${tag}`}
                                                                className="text-sm font-normal text-gray-400 lowercase cursor-pointer group-hover:text-gray-200 transition-colors truncate"
                                                                title={tag}
                                                            >
                                                                {tag}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Reward Range */}
                                        <AccordionItem value="reward" className="border-none mt-2">
                                            <AccordionTrigger className="text-xs font-medium text-gray-400 py-2 hover:no-underline hover:text-gray-200">
                                                REWARD RANGE
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-4 pt-2 px-1">
                                                    <Slider
                                                        defaultValue={[0, 5000]}
                                                        max={5000}
                                                        step={100}
                                                        value={[rewardRange[0], rewardRange[1]]}
                                                        onValueChange={(val) => setRewardRange([val[0], val[1] ?? 5000])}
                                                        className="my-4"
                                                    />
                                                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
                                                        <span>${rewardRange[0]}</span>
                                                        <span>${rewardRange[1]}+</span>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background-card/30 p-4 rounded-xl border border-gray-800/50 backdrop-blur-sm">
                            <div className="text-sm text-gray-400">
                                <span className="font-semibold text-primary">{filteredBounties.length}</span> results found
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 hidden sm:inline font-medium">Sort by:</span>
                                <Select value={sortOption} onValueChange={setSortOption}>
                                    <SelectTrigger className="w-[180px] bg-background/50 border-gray-700 hover:border-gray-600 focus:border-primary/50 h-9">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent align="end">
                                        <SelectItem value="newest">Newest First</SelectItem>
                                        <SelectItem value="highest_reward">Highest Reward</SelectItem>
                                        <SelectItem value="recently_updated">Recently Updated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {filteredBounties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                                {filteredBounties.map((bounty) => (
                                    <div key={bounty.id} className="h-full">
                                        <BountyCard bounty={bounty} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-800 rounded-2xl bg-background-card/30">
                                <div className="size-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                                    <Search className="size-8 text-gray-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-200">No bounties found</h3>
                                <p className="text-gray-400 max-w-md mx-auto mb-6">
                                    We couldn&apos;t find any bounties matching your current filters.
                                    Try adjusting your search terms or filters.
                                </p>
                                <Button onClick={clearFilters} variant="outline" className="border-gray-700 hover:bg-gray-800">
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
