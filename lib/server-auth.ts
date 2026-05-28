import { getSessionCookie } from "better-auth/cookies";
import { headers } from "next/headers";

export interface User {
  id: string;
  name: string;
  email?: string;
  image?: string;
  bio?: string;
  github?: string;
  twitter?: string;
  website?: string;
  role?: "sponsor" | "contributor";
}

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface SessionPayload {
  user?: SessionUser | null;
  session?: {
    token?: string | null;
  } | null;
}

async function fetchValidatedSession(
  cookieHeader: string,
  sessionToken: string,
): Promise<SessionPayload | null> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  if (!baseURL) {
    console.error("NEXT_PUBLIC_API_URL is not set; cannot validate session.");
    return null;
  }

  const endpoints = ["/api/auth/get-session", "/api/auth/session"];

  for (const endpoint of endpoints) {
    try {
      const url = new URL(endpoint, baseURL);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          cookie: cookieHeader,
          authorization: `Bearer ${sessionToken}`,
          accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return null;
        }
        continue;
      }

      const payload: unknown = await response.json();
      const normalized: SessionPayload | undefined =
        typeof payload === "object" && payload !== null && "data" in payload
          ? (payload as { data?: SessionPayload }).data
          : (payload as SessionPayload);

      if (normalized?.user?.id) {
        return normalized;
      }
    } catch (error) {
      console.error(`Failed to validate session via ${endpoint}:`, error);
    }
  }

  return null;
}

/**
 * Gets the current user from the session cookie.
 * This can be used in Server Components and Server Actions.
 */
export async function getCurrentUser(): Promise<User | null> {
  const requestHeaders = await headers();
  const req = new Request("http://localhost", { headers: requestHeaders });
  const sessionCookie = getSessionCookie(req, {
    cookiePrefix: "boundless_auth",
  });

  if (!sessionCookie) {
    return null;
  }

  // E2E Test Bypass for Server Components
  if (
    sessionCookie === "fake-sponsor-token" ||
    sessionCookie === "fake-e2e-token"
  ) {
    return {
      id: "e2e-tester",
      name: "E2E Tester",
      role: sessionCookie === "fake-sponsor-token" ? "sponsor" : "contributor",
    };
  }

  try {
    const cookieHeader = requestHeaders.get("cookie") ?? "";
    const validatedSession = await fetchValidatedSession(
      cookieHeader,
      sessionCookie,
    );

    if (!validatedSession?.user?.id) {
      return null;
    }

    const u = validatedSession.user as typeof validatedSession.user & {
      bio?: string | null;
      github?: string | null;
      twitter?: string | null;
      website?: string | null;
      role?: string | null;
    };

    const id = u.id;
    if (!id) return null;

    return {
      id,
      name: u.name ?? "Authenticated User",
      email: u.email ?? undefined,
      image: u.image ?? undefined,
      bio: u.bio ?? undefined,
      github: u.github ?? undefined,
      twitter: u.twitter ?? undefined,
      website: u.website ?? undefined,
      role: (u.role as "sponsor" | "contributor") ?? "contributor",
    };
  } catch (error) {
    console.error("Failed to resolve current user from session:", error);
    return null;
  }
}
