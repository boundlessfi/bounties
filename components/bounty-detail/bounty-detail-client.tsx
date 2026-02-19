"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ClaimModelInfo,
  MobileCTA,
  SidebarCTA,
} from "./bounty-detail-sidebar-cta";
import { RequirementsCard, ScopeCard } from "./bounty-detail-requirements-card";
import { useBountyDetail } from "@/hooks/Use-bounty-detail";
import { HeaderCard } from "./bounty-detail-header-card";
import { DescriptionCard } from "./bounty-detail-description-card";
import { BountyDetailSkeleton } from "./bounty-detail-bounty-detail-skeleton";

export function BountyDetailClient({ bountyId }: { bountyId: string }) {
  const router = useRouter();
  const { data: bounty, isLoading, isError, error } = useBountyDetail(bountyId);

  if (isLoading) return <BountyDetailSkeleton />;

  if (isError || !bounty) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="size-16 rounded-full bg-gray-800/50 flex items-center justify-center">
          <AlertCircle className="size-8 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-200">Bounty not found</h2>
        <p className="text-gray-400 max-w-sm text-sm">
          {error instanceof Error
            ? error.message
            : "We couldn't load this bounty."}
        </p>
        <Button
          variant="outline"
          className="border-gray-700 hover:bg-gray-800 mt-2"
          onClick={() => router.push("/bounties")}
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to bounties
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        <HeaderCard bounty={bounty} />
        <DescriptionCard description={bounty.description} />
        {bounty.requirements && bounty.requirements.length > 0 && (
          <RequirementsCard requirements={bounty.requirements} />
        )}
        {bounty.scope && <ScopeCard scope={bounty.scope} />}
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-72 shrink-0">
        <div className="lg:sticky lg:top-24 space-y-4">
          <SidebarCTA bounty={bounty} />
          <ClaimModelInfo claimingModel={bounty.claimingModel} />
        </div>
      </aside>

      {/* Mobile sticky CTA */}
      <MobileCTA bounty={bounty} />
    </div>
  );
}
