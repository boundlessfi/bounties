import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { graphqlRequest } from "@/lib/server-graphql";

/**
 * GET /api/bookmarks/ids
 * Returns an array of bookmarked bounty IDs for the current user
 * Optimized for O(1) bookmark existence checks
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query GraphQL for bookmarks - we only need the IDs
    const BOOKMARKS_QUERY = `
      query GetBookmarkIds {
        bookmarks {
          bountyId
        }
      }
    `;

    const data = await graphqlRequest<{
      bookmarks: Array<{ bountyId: string }>;
    }>(BOOKMARKS_QUERY);

    // Extract just the bounty IDs as a simple array
    const bountyIds = data.bookmarks.map((b) => b.bountyId);

    return NextResponse.json(bountyIds);
  } catch (error) {
    console.error("Error fetching bookmark IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmark IDs" },
      { status: 500 },
    );
  }
}
