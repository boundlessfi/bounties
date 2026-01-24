import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background-main-bg flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <FileQuestion className="mx-auto size-16 text-gray-600" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-50">Project Not Found</h1>
          <p className="text-gray-400">
            The project you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/projects">Back to Projects</Link>
        </Button>
      </div>
    </div>
  )
}

