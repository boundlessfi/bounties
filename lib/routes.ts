/**
 * Centralized application route constants.
 * Use these instead of hardcoding path strings throughout the codebase.
 */
export const ROUTES = {
  /** Sign-in page */
  AUTH: "/auth",

  /** Profile page for a given user ID */
  PROFILE: (userId: string) => `/profile/${userId}`,

  /** Main leaderboard page */
  LEADERBOARD: "/leaderboard",
} as const;
