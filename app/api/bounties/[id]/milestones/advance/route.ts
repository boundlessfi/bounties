import { NextResponse } from "next/server";
import { BountyStore } from "@/lib/store";
import { getCurrentUser } from "@/lib/server-auth";
// import { MilestoneStatus } from '@/types/participation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bountyId } = await params;

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contributorId, action } = body; // action: 'advance' | 'complete' | 'remove'

    // Ensure the authenticated user matches the contributor being modified
    if (contributorId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!contributorId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["advance", "complete", "remove"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const participations =
      BountyStore.getMilestoneParticipationsByBounty(bountyId);
    const participation = participations.find(
      (p) => p.contributorId === contributorId,
    );

    if (!participation) {
      return NextResponse.json(
        { error: "Participation not found" },
        { status: 404 },
      );
    }

    const bounty = BountyStore.getBountyById(bountyId);

    if (!bounty) {
      return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
    }

    const updates: Partial<typeof participation> = {
      lastUpdatedAt: new Date().toISOString(),
    };

    const totalMilestones = participation.totalMilestones;

    if (action === "advance") {
      if (participation.status === "completed") {
        return NextResponse.json(
          { error: "Cannot advance completed participation" },
          { status: 409 },
        );
      }
      if (!totalMilestones) {
        return NextResponse.json(
          { error: "Cannot determine total milestones" },
          { status: 500 },
        );
      }
      if (participation.currentMilestone >= totalMilestones) {
        return NextResponse.json(
          { error: "Already at last milestone" },
          { status: 409 },
        );
      }
      updates.currentMilestone = participation.currentMilestone + 1;
      updates.status = "advanced";
    } else if (action === "complete") {
      if (participation.status === "completed") {
        return NextResponse.json(
          { error: "Already completed" },
          { status: 409 },
        );
      }
      updates.status = "completed";
    } else if (action === "remove") {
      return NextResponse.json(
        { error: "Remove action not supported yet" },
        { status: 400 },
      );
    }

    const updated = BountyStore.updateMilestoneParticipation(
      participation.id,
      updates,
    );

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
