import { NextResponse } from "next/server";
import { BountyStore } from "@/lib/store";
import { Submission } from "@/types/participation";
import { submissionFormSchema } from "@/components/bounty/forms/schemas";
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

    const body = await request.json();
    const { contributorId: _clientContributorId, ...formData } = body;

    const parsed = submissionFormSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", fieldErrors },
        { status: 400 },
      );
    }

    const bounty = BountyStore.getBountyById(bountyId);
    if (!bounty) {
      return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
    }

    if (bounty.status !== "open") {
      return NextResponse.json(
        { error: "Submissions are not accepted for this bounty" },
        { status: 400 },
      );
    }

    const allowedModels = [
      "single-claim",
      "competition",
      "multi-winner",
      "application",
    ];
    if (!allowedModels.includes(bounty.claimingModel)) {
      return NextResponse.json(
        { error: "Submission not allowed for this bounty type" },
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

    const { explanation, walletAddress, githubUrl, demoUrl, attachments } =
      parsed.data;

    const submission: Submission = {
      id: generateId(),
      bountyId,
      contributorId,
      content: explanation,
      explanation,
      walletAddress,
      githubUrl: githubUrl || undefined,
      demoUrl: demoUrl || undefined,
      attachments: attachments?.length ? attachments : undefined,
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
