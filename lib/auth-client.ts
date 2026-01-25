 import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://staging-api.boundlessfi.xyz",
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
