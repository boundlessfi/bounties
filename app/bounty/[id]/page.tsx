import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getBountyById } from "@/lib/mock-bounty"
import { truncateAtWordBoundary } from "@/lib/truncate"
import { BountyHeader } from "@/components/bounty/bounty-header"
import { BountyContent } from "@/components/bounty/bounty-content"
import { BountySidebar } from "@/components/bounty/bounty-sidebar"
import { Separator } from "@/components/ui/separator"

interface BountyPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: BountyPageProps): Promise<Metadata> {
  const { id } = await params
  const bounty = getBountyById(id)

  if (!bounty) {
    return { title: "Bounty Not Found" }
  }

  return {
    title: `${bounty.issueTitle} | ${bounty.projectName}`,
    description: truncateAtWordBoundary(bounty.description, 160),
  }
}

export default async function BountyPage({ params }: BountyPageProps) {
  const { id } = await params
  const bounty = getBountyById(id)

  if (!bounty) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background-main-bg text-gray-50 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 py-12 relative z-10">
        {/* Breadcrumb or Back Link could go here */}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 lg:gap-14">
          <main className="space-y-8 min-w-0">
            <BountyHeader bounty={bounty} />
            <Separator className="bg-gray-800/50" />
            <BountyContent bounty={bounty} />
          </main>

          <aside className="lg:sticky lg:top-8 h-fit space-y-8">
            <BountySidebar bounty={bounty} />
          </aside>
        </div>
      </div>
    </div>
  )
}
