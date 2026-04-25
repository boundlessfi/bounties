import { getAccessToken } from "@/lib/auth-utils";
import { TypedDocumentString } from "@/lib/graphql/generated";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "/api/graphql";

/**
 * Server-side GraphQL client using fetch with cookie-based auth
 * Use this in Server Components and Route Handlers
 */
export async function graphqlRequest<T>(
  query: string | TypedDocumentString<unknown, Record<string, unknown>>,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  // Normalize: if TypedDocumentString, convert to string
  const queryString = typeof query === "string" ? query : query.toString();

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    // Don't cache - always get fresh data
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message || "GraphQL error");
  }

  return json.data;
}
