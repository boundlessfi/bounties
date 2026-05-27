import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllProjects, getProjectById } from "@/lib/mock";
import { truncateAtWordBoundary } from "@/lib/truncate";
import { ProjectLogo } from "@/components/projects/project-logo";
import { ProjectBounties } from "@/components/projects/project-bounties";
import { ProjectMaintainers } from "@/components/projects/project-maintainers";
import { ProjectSidebar } from "@/components/projects/project-sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Globe, ExternalLink } from "lucide-react";
import Markdown from "react-markdown";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return getAllProjects().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.name} | Projects`,
    description: truncateAtWordBoundary(project.description, 160),
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) notFound();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Header Section */}
            <header className="space-y-6">
              <div className="flex items-start gap-4">
                <ProjectLogo
                  name={project.name}
                  logoUrl={project.logoUrl}
                  className="size-16"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold">
                      {project.name}
                    </h1>
                    <Badge>{project.openBountyCount} open</Badge>
                    {project.websiteUrl && (
                      <a
                        href={project.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm hover:underline group"
                      >
                        <Globe className="size-4" />
                        <span>Website</span>
                        <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}
                  </div>
                  <p className="text-lg leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Maintainers */}
              {project.maintainers && project.maintainers.length > 0 && (
                <>
                  <Separator />
                  <ProjectMaintainers maintainers={project.maintainers} />
                </>
              )}
            </header>

            <Separator />

            {/* Stats Cards */}
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border p-6">
                <div className="text-sm font-medium">Open Bounties</div>
                <div className="mt-2 text-3xl font-bold">
                  {project.openBountyCount}
                </div>
              </div>
              <div className="rounded-xl border p-6">
                <div className="text-sm font-medium">Total Bounties</div>
                <div className="mt-2 text-3xl font-bold">
                  {project.bountyCount}
                </div>
              </div>
              <div className="rounded-xl border p-6">
                <div className="text-sm font-medium">Prize Pool</div>
                <div className="mt-2 text-3xl font-bold">
                  {project.prizeAmount}
                </div>
              </div>
            </section>

            {/* Full Description Section */}
            <section className="rounded-xl border p-8 space-y-4">
              <h2 className="text-2xl font-bold">About This Project</h2>
              <div className="prose prose-sm max-w-none">
                <Markdown>{project.description}</Markdown>
              </div>
              <div className="pt-4">
                <a
                  href="#bounties"
                  className="inline-flex items-center gap-2 font-medium hover:underline"
                >
                  View Open Bounties
                  <ChevronDown className="size-4" />
                </a>
              </div>
            </section>

            <Separator />

            {/* Bounties Section */}
            <section id="bounties" className="scroll-mt-8">
              <ProjectBounties projectId={id} />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-8 lg:self-start space-y-6">
            <ProjectSidebar project={project} />
          </aside>
        </div>
      </div>
    </div>
  );
}
