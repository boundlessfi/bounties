import { NextResponse } from "next/server";
import { BountyStore } from "@/lib/store";
import { CompetitionParticipation } from "@/types/participation";
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

    const bounty = BountyStore.getBountyById(bountyId);
    if (!bounty) {
      return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
    }

    if (bounty.type !== "COMPETITION") {
      return NextResponse.json(
        { error: "Invalid bounty type for this action" },
        { status: 400 },
      );
    }

    // Validate status is open
    if (bounty.status !== "OPEN") {
      return NextResponse.json(
        { error: "Bounty is not open for registration" },
        { status: 409 },
      );
    }

    const existing = BountyStore.getCompetitionParticipationsByBounty(
      bountyId,
    ).find((p) => p.contributorId === user.id);

    if (existing) {
      return NextResponse.json(
        { error: "Already joined this competition" },
        { status: 409 },
      );
    }

    const participation: CompetitionParticipation = {
      id: generateId(),
      bountyId,
      contributorId: user.id, // Use authenticated user ID
      status: "registered",
      registeredAt: new Date().toISOString(),
    };

    BountyStore.addCompetitionParticipation(participation);

    return NextResponse.json({ success: true, data: participation });
  } catch (error) {
    console.error("Error joining competition:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
