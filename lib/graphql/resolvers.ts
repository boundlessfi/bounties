import { getCurrentUser } from "@/lib/server-auth";

/**
 * Minimal resolver overrides for GraphQL fields that require
 * authorization checks before returning PII.
 *
 * This file only implements gating for `BountySubmissionUser.email`.
 * If you have a GraphQL server that loads resolvers, include this
 * object when creating the executable schema.
 */
export const resolvers = {
  BountySubmissionUser: {
    email: async (parent: { id: string; email?: string }) => {
      // Only return email to the owner (same id) or in development.
      // This is intentionally conservative — expand checks (roles/admin)
      // when your auth model supports them.
      try {
        const user = await getCurrentUser();
        if (!user) return null;
        if (process.env.NODE_ENV === "development") return parent.email ?? null;
        if (user.id === parent.id) return parent.email ?? null;
        return null;
      } catch {
        return null;
      }
    },
  },
};

export default resolvers;
