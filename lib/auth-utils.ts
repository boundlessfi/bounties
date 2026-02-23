import { authClient } from "./auth-client";

/**
 * Shared utility to get the access token from cookies or Better Auth client.
 * Works in both client-side and server-side (Next.js) environments.
 */
export async function getAccessToken(): Promise<string | null> {
  // Server-side
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const cookie = cookieStore.get("boundless_auth.session_token");
      return cookie?.value ?? null;
    } catch {
      return null;
    }
  }

  // Client-side: Extract the session token from document.cookie
  // Better Auth tokens can contain dots and special characters.
  // We use a regex to extract the value precisely.
  const name = "boundless_auth.session_token";
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp("(^| )" + escapedName + "=([^;]+)"),
  );
  if (match) {
    // We return the decoded value from the cookie.
    // If it's URL encoded (e.g. contains %3D), we decode it for use in headers.
    return decodeURIComponent(match[2]);
  }

  // Client-side fallback: Use Better Auth client's getSession
  // This is a last resort if cookies are not accessible via document.cookie (e.g. httpOnly)
  try {
    const { data } = await authClient.getSession();
    return data?.session?.token ?? null;
  } catch {
    return null;
  }
}
