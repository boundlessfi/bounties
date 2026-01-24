import Link from "next/link";
import type { Project } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-xl"
      aria-label={`View project ${project.name}`}
    >
      <Card className="h-full overflow-hidden bg-[#0A0C0D] border-gray-800 transition-all duration-300 group-hover:border-gray-700 group-hover:shadow-2xl group-hover:shadow-green-500/10 py-0">
        <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-[#0D1A1E] to-[#0A1214] flex items-center justify-center p-6 border-b border-white/5">
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-[#1A1F21]/80 backdrop-blur-sm border-white/10 text-white/90 text-[10px] px-2 py-0 h-6 font-medium"
              >
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge
                variant="outline"
                className="bg-[#1A1F21]/80 backdrop-blur-sm border-white/10 text-white/60 text-[10px] px-2 py-0 h-6 font-medium"
              >
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>

          <Badge
            className={cn(
              "absolute top-3 right-3 z-10 bg-[#1A1F21]/80 backdrop-blur-sm border-white/10 text-white/90 text-[10px] px-3 py-1 h-6 font-medium",
              project.status === "Active" &&
                "text-green-400 border-green-500/20",
            )}
          >
            {project.status}
          </Badge>

          {/* Project Logo/Title in Banner */}
          <div className="flex flex-col items-center justify-center space-y-3">
            {project.logoUrl ? (
              <img
                src={project.logoUrl}
                alt={project.name}
                className="h-10 object-contain brightness-90 grayscale hover:grayscale-0 transition-all opacity-80"
              />
            ) : (
              <span className="text-2xl font-bold tracking-tighter text-white/40 italic">
                {project.name}
              </span>
            )}

            <div className="flex items-center gap-2 mt-4">
              <Avatar className="size-6 border border-white/10">
                <AvatarImage src={project.creatorAvatarUrl || ""} />
                <AvatarFallback className="bg-gray-800 text-[10px]">
                  {project.creatorName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-white/50 font-medium">
                {project.creatorName}
              </span>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="p-4 pt-5 space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight leading-tight group-hover:text-green-400 transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-white/50 line-clamp-2 leading-relaxed font-medium">
                {project.description}
              </p>
            </div>
          </div>

          {/* Prize Section */}
          <div className="border-t border-white/5 px-4 py-3 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-green-400">
                {project.prizeAmount}
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
                Prize Pool
              </span>
            </div>
          </div>

          {/* Footer Section */}
          <div className="border-t border-white/5 px-4 py-3 bg-[#0D0F10]/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-semibold uppercase tracking-widest">
                {project.status}
              </span>
              <span className="text-[10px] text-white/30 font-medium">
                Updated 2d ago
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
