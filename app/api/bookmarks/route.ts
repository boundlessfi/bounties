import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { graphqlRequest } from "@/lib/server-graphql";
import { BookmarksDocument } from "@/lib/graphql/generated";
import type { Bookmark } from "@/lib/graphql/generated";

/**
 * GET /api/bookmarks
 * Returns all bookmarked bounties for the current user
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use generated GraphQL document for type safety
    const data = await graphqlRequest<{ bookmarks: Bookmark[] }>(
      BookmarksDocument,
    );

    return NextResponse.json(data.bookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 },
    );
  }
}
