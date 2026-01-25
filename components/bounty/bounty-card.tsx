import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Github, Bug, Sparkles, FileText, RefreshCw, Circle } from "lucide-react"
import { Bounty, BountyType } from "@/types/bounty"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BountyCardProps {
    bounty: Bounty
}

const typeConfig: Record<BountyType, { label: string; icon: React.ReactNode; className: string }> = {
    bug: { label: "Bug", icon: <Bug className="size-3" />, className: "bg-error-500 text-white border-transparent" },
    feature: { label: "Feature", icon: <Sparkles className="size-3" />, className: "bg-primary text-primary-foreground border-transparent" },
    documentation: { label: "Docs", icon: <FileText className="size-3" />, className: "bg-secondary-500 text-white border-transparent" },
    refactor: { label: "Refactor", icon: <RefreshCw className="size-3" />, className: "bg-gray-700 text-gray-100 border-transparent" },
    other: { label: "Other", icon: <Circle className="size-3" />, className: "bg-gray-800 text-gray-300 border-gray-600" },
}

const difficultyColors: Record<string, string> = {
    beginner: "text-success-400",
    intermediate: "text-warning-400",
    advanced: "text-error-400",
}

const statusColors: Record<string, string> = {
    open: "bg-success-500/10 text-success-500 border-success-500/20",
    claimed: "bg-warning-500/10 text-warning-500 border-warning-500/20",
    closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

export function BountyCard({ bounty }: BountyCardProps) {
    const typeInfo = typeConfig[bounty.type]
    const difficultyColor = bounty.difficulty ? difficultyColors[bounty.difficulty] : "text-gray-400"
    const statusColor = statusColors[bounty.status] || statusColors.closed

    // Prevent card click when clicking interactive elements
    const handleInteractiveClick = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    return (
        <Card className="group h-full flex flex-col bg-background-card border-gray-800 transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 relative">
            <CardHeader className="p-5 pb-3 space-y-3">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                        {bounty.projectLogoUrl ? (
                            <div className="relative size-8 shrink-0 overflow-hidden rounded-md border border-gray-800">
                                <Image
                                    src={bounty.projectLogoUrl}
                                    alt={bounty.projectName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="size-8 shrink-0 rounded-md bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                                {(bounty.projectName || "Unknown").substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h3 className="text-sm font-medium text-gray-300 line-clamp-1">{bounty.projectName}</h3>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                {formatDistanceToNow(new Date(bounty.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                        <Badge variant="outline" className={cn("shrink-0 gap-1.5", typeInfo.className)}>
                            {typeInfo.icon}
                            {typeInfo.label}
                        </Badge>
                        <Badge variant="outline" className={cn("shrink-0 text-[10px] px-1.5 py-0 h-5 lowercase", statusColor)}>
                            {bounty.status}
                        </Badge>
                    </div>
                </div>

                <h2 className="text-lg font-bold text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    <Link href={`/bounty/${bounty.id}`} className="focus:outline-none after:absolute after:inset-0">
                        {bounty.issueTitle}
                    </Link>
                </h2>
            </CardHeader>

            <CardContent className="p-5 py-2 flex-grow">
                <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                    {bounty.description.replace(/[#*`_]/g, '') /* Simple stripped markdown preview */}
                </p>

                <div className="flex flex-wrap gap-2 mb-2">
                    {bounty.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-gray-800/50 text-gray-400 border-gray-700/50 text-xs font-normal">
                            {tag}
                        </Badge>
                    ))}
                    {bounty.tags.length > 3 && (
                        <span className="text-xs text-gray-500 self-center">+{bounty.tags.length - 3}</span>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-3 mt-auto border-t border-gray-800/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {(bounty.rewardAmount !== null && bounty.rewardAmount !== undefined) ? (
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Reward</span>
                            <span className="font-bold text-primary">
                                {bounty.rewardAmount} {bounty.rewardCurrency}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Reward</span>
                            <span className="text-gray-400 text-sm">-</span>
                        </div>
                    )}

                    {bounty.difficulty && (
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Difficulty</span>
                            <span className={cn("text-sm font-medium capitalize", difficultyColor)}>
                                {bounty.difficulty}
                            </span>
                        </div>
                    )}
                </div>

                <a
                    href={bounty.githubIssueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-full transition-colors relative z-10"
                    onClick={handleInteractiveClick}
                    title="View GitHub Issue"
                >
                    <Github className="size-5" />
                </a>
            </CardFooter>
        </Card>
    )
}
