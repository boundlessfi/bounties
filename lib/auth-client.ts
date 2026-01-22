
import { createAuthClient } from "better-auth/react";

// Use the staging API for Better Auth
const BASE_URL = "https://staging-api.boundlessfi.xyz";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  providers: {
    github: {
      clientId: process.env.NEXT_PUBLIC_BETTER_AUTH_GITHUB_CLIENT_ID,
      // No client secret on frontend
      callbackURL: "/auth/callback/github", // This should match your Next.js route
    },
    // Add more providers here in the future
  },
  cookiePrefix: "boundless_auth",
});

const errorMessages: Record<string, string> = Object.fromEntries(
  Object.keys(authClient.$ERROR_CODES).map((code) => [
    code,
    code.replace(/_/g, " ").toLowerCase(),
  ])
);

export const getErrorMessage = (code: string): string => {
  return errorMessages[code] ?? "";
};
