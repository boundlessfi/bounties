"use client";

import { Calendar, Clock, CheckCircle2, Pause, Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/project";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusConfig = {
    Active: {
      icon: Activity,
      label: "Active",
      className:
        "bg-success-green/20 text-success-green-darker border-success-green/30",
    },
    Ended: {
      icon: CheckCircle2,
      label: "Ended",
      className: "bg-blue-ish/10 text-blue-800 border-blue-ish/30",
    },
    Draft: {
      icon: Pause,
      label: "Draft",
      className:
        "bg-warning-orange/20 text-warning-orange-darker border-warning-orange/30",
    },
  };

  const status = statusConfig[project.status] || statusConfig.Active;
  const StatusIcon = status.icon;

  return (
    <div className="block group">
      <Card className="h-full bg-background-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold text-gray-100 group-hover:text-primary transition-colors line-clamp-2">
              {project.name}
            </CardTitle>
            <Badge variant="outline" className={`${status.className} shrink-0`}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {status.label}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2 text-gray-400">
            {project.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20 text-xs"
              >
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground text-xs"
              >
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Progress Bar (Removed for Canonical Project) */}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(project.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Created by {project.creatorName}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
