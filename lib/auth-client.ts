import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [magicLinkClient()],
});

const errorMessages: Record<string, string> = Object.fromEntries(
  Object.keys(authClient.$ERROR_CODES).map((code) => [
    code,
    code.replace(/_/g, " ").toLowerCase(),
  ]),
);

export const getErrorMessage = (code: string): string => {
  return errorMessages[code] ?? "";
};
