import { getSessionCookie } from "better-auth/cookies";
import { headers } from "next/headers";

export interface User {
  id: string;
  name: string;
  email?: string;
  image?: string;
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
  const sessionCookie = getSessionCookie(requestHeaders, {
    cookiePrefix: "boundless_auth",
  });

  if (!sessionCookie) {
    return null;
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

    return {
      id: validatedSession.user.id,
      name: validatedSession.user.name ?? "Authenticated User",
      email: validatedSession.user.email ?? undefined,
      image: validatedSession.user.image ?? undefined,
    };
  } catch (error) {
    console.error("Failed to resolve current user from session:", error);
    return null;
  }
}
