import { createAuthClient } from "better-auth/react";
import {
  magicLinkClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  cookiePrefix: "boundless_auth",
  plugins: [
    magicLinkClient(),
    // Mirror the user.additionalFields configured on the better-auth backend
    // so authClient.updateUser is typed for these fields and no cast is
    // needed in use-user-mutations.ts.
    inferAdditionalFields({
      user: {
        bio: { type: "string", required: false },
        github: { type: "string", required: false },
        twitter: { type: "string", required: false },
        website: { type: "string", required: false },
        role: { type: "string", required: false },
      },
    }),
  ],
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
