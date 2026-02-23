import { getSessionCookie } from "better-auth/cookies";
import { headers } from "next/headers";

export interface User {
  id: string;
  name: string;
  email?: string;
  image?: string;
}

/**
 * Gets the current user from the session cookie.
 * This can be used in Server Components and Server Actions.
 */
export async function getCurrentUser(): Promise<User | null> {
  const sessionCookie = getSessionCookie(await headers(), {
    cookiePrefix: "boundless_auth",
  });

  if (!sessionCookie) {
    return null;
  }

  // In a production environment, the session token should be validated
  // against the backend or a session store.
  // For now, we return a partial user from the cookie if present,
  // or rely on the middleware/proxy for strict enforcement.

  // Note: Better Auth session cookie contains the session token.
  // To get full user data, we would usually call:
  // const { data } = await authClient.getSession({ fetchOptions: { headers: await headers() } });

  return {
    id: sessionCookie, // This is the session token
    name: "Authenticated User",
    // email and other details would come from a backend call or session data
  };
}
