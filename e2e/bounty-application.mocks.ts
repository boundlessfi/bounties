import type { Page } from "@playwright/test";

// Must be a valid UUID (all hex chars) so toBountyIdBigInt() in
// use-competition-bounty.ts can parse it without throwing ContestError("tx_failed").
export const BOUNTY_ID = "e2ec0bcd-dead-beef-cafe-ab01cd02ef03";
export const BOUNTY_ID_MULTI = "e2ec0bcd-dead-beef-cafe-ab01cd02ef04";

export const MOCK_MULTI_WINNER_BOUNTY_FRAGMENT = {
  __typename: "Bounty",
  id: BOUNTY_ID_MULTI,
  title: "Multi-winner milestone bounty",
  description: "Test multi-winner milestone bounty description.",
  status: "OPEN",
  type: "MULTI_WINNER_MILESTONE",
  rewardAmount: 2000,
  rewardCurrency: "XLM",
  createdAt: "2025-01-10T09:00:00Z",
  updatedAt: "2025-01-24T14:20:00Z",
  organizationId: "org-privacy-lab",
  projectId: "proj-zkp",
  bountyWindowId: null,
  githubIssueUrl: "https://github.com/stellar-privacy/zkp/issues/4",
  githubIssueNumber: 4,
  createdBy: "user-other",
  organization: {
    __typename: "BountyOrganization",
    id: "org-privacy-lab",
    name: "Stellar Privacy Lab",
    logo: null,
    slug: "stellar-privacy-lab",
  },
  project: {
    __typename: "BountyProject",
    id: "proj-zkp",
    title: "ZKP",
    description: null,
  },
  bountyWindow: null,
  _count: { __typename: "BountyCount", submissions: 0 },
  submissions: [],
  milestones: [
    {
      id: "m1",
      title: "Milestone 1: Design",
      description: "Design the UI/UX for the feature.",
      isCompleted: false,
    },
  ],
  contributorProgress: [],
  maxSlots: 5,
  totalSlotsOccupied: 0,
};

export const MOCK_BOUNTY_FRAGMENT = {
  __typename: "Bounty",
  id: BOUNTY_ID,
  title: "Add zero-knowledge proof primitives",
  description: "Implement ZKP primitives for private Stellar transactions.",
  status: "OPEN",
  type: "COMPETITION",
  rewardAmount: 2000,
  rewardCurrency: "XLM",
  createdAt: "2025-01-10T09:00:00Z",
  updatedAt: "2025-01-24T14:20:00Z",
  organizationId: "org-privacy-lab",
  projectId: "proj-zkp",
  bountyWindowId: null,
  githubIssueUrl: "https://github.com/stellar-privacy/zkp/issues/3",
  githubIssueNumber: 3,
  createdBy: "user-other",
  organization: {
    __typename: "BountyOrganization",
    id: "org-privacy-lab",
    name: "Stellar Privacy Lab",
    logo: null,
    slug: "stellar-privacy-lab",
  },
  project: {
    __typename: "BountyProject",
    id: "proj-zkp",
    title: "ZKP",
    description: null,
  },
  bountyWindow: null,
  _count: { __typename: "BountyCount", submissions: 0 },
  submissions: [],
};

// Session includes walletAddress so handleJoin() passes the wallet guard.
export const MOCK_SESSION = {
  user: {
    id: "user-e2e-tester",
    name: "E2E Tester",
    email: "e2e@test.com",
    image: null,
    walletAddress: "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGYWDOUALPIF5JD4PI21JQ",
  },
  session: { token: "fake-e2e-token" },
};

type ContestContracts = {
  claimBounty: (args: {
    contributor: string;
    bountyId: bigint;
  }) => Promise<{ txHash: string }>;
};

export async function setupMocks(page: Page) {
  await page.addInitScript(() => {
    (globalThis as { __claimBountyCalls?: number }).__claimBountyCalls = 0;
    (globalThis as { __contestContracts?: unknown }).__contestContracts = {
      claimBounty: async () => {
        (globalThis as { __claimBountyCalls?: number }).__claimBountyCalls =
          ((globalThis as { __claimBountyCalls?: number }).__claimBountyCalls ??
            0) + 1;
        return { txHash: "0xfake-e2e-txhash" };
      },
    } as ContestContracts;

    (globalThis as { __applyForSlotCalls?: number }).__applyForSlotCalls = 0;
    (
      globalThis as { __applicationContracts?: unknown }
    ).__applicationContracts = {
      applyForSlot: async () => {
        (globalThis as { __applyForSlotCalls?: number }).__applyForSlotCalls =
          ((globalThis as { __applyForSlotCalls?: number })
            .__applyForSlotCalls ?? 0) + 1;
        return { txHash: "0xfake-e2e-slot-txhash" };
      },
    };
  });

  await page.route("**/api/auth/**", async (route) => {
    const url = new URL(route.request().url());
    if (
      url.pathname.endsWith("/get-session") ||
      url.pathname.endsWith("/session")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SESSION),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "{}",
      });
    }
  });

  await page.route("**/api/graphql", async (route) => {
    let body: {
      operationName?: string;
      variables?: { id?: string };
    } = {};
    try {
      body = JSON.parse(route.request().postData() ?? "{}") as {
        operationName?: string;
        variables?: { id?: string };
      };
    } catch {
      /* ignore */
    }

    switch (body.operationName) {
      case "Bounties":
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              bounties: {
                bounties: [
                  MOCK_BOUNTY_FRAGMENT,
                  MOCK_MULTI_WINNER_BOUNTY_FRAGMENT,
                ],
                total: 2,
                limit: 20,
                offset: 0,
              },
            },
          }),
        });
        return;
      case "Bounty": {
        const requestedId = body.variables?.id;
        const bountyData =
          requestedId === BOUNTY_ID_MULTI
            ? MOCK_MULTI_WINNER_BOUNTY_FRAGMENT
            : MOCK_BOUNTY_FRAGMENT;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: { bounty: { ...bountyData, submissions: [] } },
          }),
        });
        return;
      }
      case "TopContributors":
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: { topContributors: [] } }),
        });
        return;
      case "Leaderboard":
      case "GetLeaderboardUser":
      case "LeaderboardUser":
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              leaderboard: { contributors: [], total: 0, limit: 10, offset: 0 },
              userLeaderboard: null,
            },
          }),
        });
        return;
      default:
        await route.abort("failed");
    }
  });

  await page.context().addCookies([
    {
      name: "boundless_auth.session_token",
      value: "fake-e2e-token",
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}
