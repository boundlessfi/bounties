import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { BountyDetailClient } from "@/components/bounty-detail/bounty-detail-client";

type Props = {
  params: Promise<{ bountyId: string }>;
};

export default async function BountyDetailPage({ params }: Props) {
  const { bountyId } = await params;

  return (
    <div className="min-h-screen text-foreground pb-24 lg:pb-16 relative overflow-hidden">
      {/* Ambient glow – matches BountiesPage */}
      <div className="fixed top-0 left-0 w-full h-125 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 py-10 relative z-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-gray-500 mb-8"
        >
          <Link
            href="/bounty"
            className="hover:text-gray-300 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="size-3" /> Bounties
          </Link>
          <ChevronRight className="size-3" />
          <span aria-current="page" className="text-gray-400">
            Detail
          </span>
        </nav>

        <BountyDetailClient bountyId={bountyId} />
      </div>
    </div>
  );
}
