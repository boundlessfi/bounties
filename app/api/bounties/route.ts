import { NextResponse } from "next/server";
import { getAllBounties } from "@/lib/mock-bounty";
import { BountyLogic } from "@/lib/logic/bounty-logic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const allBounties = getAllBounties().map((b) =>
    BountyLogic.processBountyStatus(b),
  );

  // Apply filters from params
  let filtered = allBounties;

  const status = searchParams.get("status");
  if (status) filtered = filtered.filter((b) => b.status === status);

  const type = searchParams.get("type");
  if (type) filtered = filtered.filter((b) => b.type === type);

  const organizationId = searchParams.get("organizationId");
  if (organizationId)
    filtered = filtered.filter((b) => b.organizationId === organizationId);

  const projectId = searchParams.get("projectId");
  if (projectId) filtered = filtered.filter((b) => b.projectId === projectId);

  const search = searchParams.get("search");
  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.title.toLowerCase().includes(lower) ||
        b.description.toLowerCase().includes(lower),
    );
  }

  return NextResponse.json({
    data: filtered,
    pagination: {
      page: 1,
      limit: 20,
      total: filtered.length,
      totalPages: 1,
    },
  });
}
