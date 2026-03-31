"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Trophy, Zap } from "lucide-react";

interface XpDisplayProps {
  xp: number;
  className?: string;
}

// XP thresholds for levels
const getLevelFromXp = (xp: number) => {
  // Clamp negative XP to 0
  const clampedXp = Math.max(0, xp);
  const level = Math.floor(clampedXp / 1000) + 1;
  const currentLevelXp = clampedXp % 1000;
  const nextLevelXp = 1000;
  const progress = (currentLevelXp / nextLevelXp) * 100;

  return {
    level,
    currentXp: currentLevelXp,
    nextLevelXp,
    progress,
  };
};

export function XpDisplay({ xp, className }: XpDisplayProps) {
  const { level, currentXp, nextLevelXp, progress } = getLevelFromXp(xp);

  return (
    <Card
      className={cn(
        "border-border/50 bg-gradient-to-br from-primary/10 to-primary/5",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Experience Points
              </p>
              <p className="text-2xl font-bold text-foreground">
                {xp.toLocaleString()} XP
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-primary">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-semibold">Level {level}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress to Level {level + 1}</span>
            <span>
              {currentXp} / {nextLevelXp} XP
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
