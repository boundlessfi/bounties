"use client";

import { SponsorReviewDashboard } from "@/components/bounty/sponsor-review-dashboard";
import { ReviewSubmission } from "@/types/participation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

// Mock data for the dashboard
const mockSubmissions: ReviewSubmission[] = [
  {
    submissionId: "sub-1",
    contributor: {
      username: "alex_dev",
      avatarUrl: "https://github.com/shadcn.png",
    },
    milestoneId: "Milestone 1",
    submittedAt: new Date().toISOString(),
    status: "pending",
  },
  {
    submissionId: "sub-2",
    contributor: {
      username: "sarah_smith",
    },
    milestoneId: "Milestone 2",
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    status: "pending",
  },
];

export default function ReviewDashboardPage() {
  const handleAction = async (id: string, action: string) => {
    console.log(`Action ${action} on submission ${id}`);
    // In a real app, this would be an API call
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground"
          >
            <Link href="/bounty">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Bounties
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Review Submissions
          </h1>
          <p className="text-muted-foreground">
            Manage and review contributions submitted for your bounties.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <SponsorReviewDashboard
          submissions={mockSubmissions}
          onAction={handleAction}
        />
      </div>
    </div>
  );
}
