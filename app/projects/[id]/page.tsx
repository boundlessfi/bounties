import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getAllProjects, getProjectById } from "@/lib/mock-project"
import { truncateAtWordBoundary } from "@/lib/truncate"
import { ProjectLogo } from "@/components/projects/project-logo"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDistanceToNow } from "date-fns"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return getAllProjects().map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params
  const project = getProjectById(id)

  if (!project) return { title: "Project Not Found" }

  return {
    title: `${project.name} | Projects`,
    description: truncateAtWordBoundary(project.description, 160),
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const project = getProjectById(id)

  if (!project) notFound()

  const createdTimeAgo = formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })
  const updatedTimeAgo = formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })

  return (
    <div className="min-h-screen bg-background-main-bg text-gray-50">
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        <header className="space-y-4">
          <div className="flex items-start gap-4">
            <ProjectLogo name={project.name} logoUrl={project.logoUrl} className="size-14" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-semibold">{project.name}</h1>
                <Badge className="bg-success-500 text-white border-transparent">
                  {project.openBountyCount} open bounties
                </Badge>
              </div>
              <p className="mt-2 text-gray-400 max-w-3xl">{project.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-gray-700 text-gray-300 bg-transparent"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <Separator className="bg-gray-800" />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-background-card p-6">
            <div className="text-sm text-gray-500">Open bounties</div>
            <div className="mt-2 text-3xl font-semibold text-primary">
              {project.openBountyCount}
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-background-card p-6">
            <div className="text-sm text-gray-500">Total bounties</div>
            <div className="mt-2 text-3xl font-semibold text-gray-50">
              {project.bountyCount}
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-background-card p-6">
            <div className="text-sm text-gray-500">Recently updated</div>
            <div className="mt-2 text-lg font-medium text-gray-50">{updatedTimeAgo}</div>
            <div className="mt-1 text-xs text-gray-500">Created {createdTimeAgo}</div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-800 bg-background-card p-6">
          <h2 className="text-lg font-semibold text-gray-50">Bounties</h2>
          <p className="mt-2 text-sm text-gray-400">
            Project bounties will appear here once wired to a real data source.
          </p>
        </section>
      </div>
    </div>
  )
}

