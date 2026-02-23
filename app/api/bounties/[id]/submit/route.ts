import { NextResponse } from "next/server";
import { BountyStore } from "@/lib/store";
import { getCurrentUser } from "@/lib/server-auth";
import { Submission } from "@/types/participation";

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

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const contributorId = user.id;

    const bounty = BountyStore.getBountyById(bountyId);
    if (!bounty) {
      return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
    }

    // All bounty types can accept submissions
    if (bounty.status !== "OPEN" && bounty.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Bounty is not accepting submissions" },
        { status: 400 },
      );
    }

    const existingSubmission = BountyStore.getSubmissionsByBounty(
      bountyId,
    ).find((s) => s.contributorId === contributorId);

    if (existingSubmission) {
      return NextResponse.json(
        { error: "Duplicate submission" },
        { status: 409 },
      );
    }

    const submission: Submission = {
      id: generateId(),
      bountyId,
      contributorId,
      content,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    BountyStore.addSubmission(submission);

    return NextResponse.json({ success: true, data: submission });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
