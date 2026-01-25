import { getAllProjects, getAllProjectTags } from "@/lib/mock-project"
import { ProjectsDiscovery } from "@/components/projects/projects-discovery"

export default async function ProjectsPage() {
  const projects = getAllProjects()
  const allTags = getAllProjectTags(projects)

  return <ProjectsDiscovery projects={projects} allTags={allTags} />
}

