import Markdown from "react-markdown"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Bounty } from "@/types/bounty"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface BountyContentProps {
  bounty: Bounty
}

export function BountyContent({ bounty }: BountyContentProps) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-100">Description</h2>
        <div className="prose prose-sm prose-invert max-w-none prose-headings:text-gray-100 prose-p:text-gray-400 prose-li:text-gray-400 prose-strong:text-gray-200 prose-code:text-primary prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
          <Markdown>{bounty.description}</Markdown>
        </div>
      </section>

      {bounty.requirements && bounty.requirements.length > 0 && (
        <>
          <Separator className="bg-gray-800" />
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-100">
              <CheckCircle2 className="size-5 text-primary" />
              Acceptance Criteria
            </h2>
            <ul className="space-y-2">
              {bounty.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {req}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {bounty.scope && (
        <>
          <Separator className="bg-gray-800" />
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-100">
              <AlertCircle className="size-5 text-warning-300" />
              Scope
            </h2>
            <p className="text-sm text-gray-400">{bounty.scope}</p>
          </section>
        </>
      )}

      {bounty.tags.length > 0 && (
        <>
          <Separator className="bg-gray-800" />
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-100">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {bounty.tags.map((tag) => (
                <Badge key={tag} className="bg-gray-800 text-gray-300 border-gray-700 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
