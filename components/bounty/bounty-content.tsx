import Markdown from "react-markdown";
import { Separator } from "@/components/ui/separator";
import type { Bounty } from "@/types/bounty";

interface BountyContentProps {
  bounty: Bounty;
}

export function BountyContent({ bounty }: BountyContentProps) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Description</h2>
        <div className="prose prose-sm prose-invert max-w-none prose-headings:text-gray-100 prose-p:text-gray-400 prose-li:text-gray-400 prose-strong:text-gray-200 prose-code:text-primary prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
          <Markdown>{bounty.description}</Markdown>
        </div>
      </section>

      {bounty.project && (
        <>
          <Separator className="bg-gray-800" />
          <section>
            <h2 className="mb-3 text-lg font-semibold">Project</h2>
            <p className="text-sm">{bounty.project.title}</p>
            {bounty.project.description && (
              <p className="text-sm text-gray-400 mt-1">
                {bounty.project.description}
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
