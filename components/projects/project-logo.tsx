"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function ProjectLogo({
  name,
  logoUrl,
  className,
}: {
  name: string
  logoUrl: string | null
  className?: string
}) {
  return (
    <Avatar className={cn("size-10 rounded-md", className)}>
      {logoUrl ? <AvatarImage src={logoUrl} alt={name} /> : null}
      <AvatarFallback className="rounded-md bg-gray-900 text-gray-200 border border-gray-800">
        <span className="text-xs font-semibold">{getInitials(name)}</span>
      </AvatarFallback>
    </Avatar>
  )
}

