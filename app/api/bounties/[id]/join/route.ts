import { NextResponse } from "next/server";
import { BountyStore } from "@/lib/store";
import { MilestoneParticipation } from "@/types/participation";
import { getCurrentUser } from "@/lib/server-auth";

const generateId = () => crypto.randomUUID();

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

    const contributorId = user.id;

    const bounty = BountyStore.getBountyById(bountyId);
    if (!bounty) {
      return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
    }

    if (bounty.type !== "MILESTONE_BASED") {
      return NextResponse.json(
        { error: "Invalid bounty type" },
        { status: 400 },
      );
    }

    // Only allow joining when bounty is open
    if (bounty.status !== "OPEN") {
      return NextResponse.json({ error: "Bounty not open" }, { status: 400 });
    }

    // Check if already joined
    const existing = BountyStore.getMilestoneParticipationsByBounty(
      bountyId,
    ).find((p) => p.contributorId === contributorId);

    if (existing) {
      return NextResponse.json(
        { error: "Already joined this bounty" },
        { status: 409 },
      );
    }

    const participation: MilestoneParticipation = {
      id: generateId(),
      bountyId,
      contributorId,
      currentMilestone: 1, // Start at milestone 1
      status: "active",
      joinedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    BountyStore.addMilestoneParticipation(participation);

    return NextResponse.json({ success: true, data: participation });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
