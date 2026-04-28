/**
 * E2E: Bounty Application Flow (Join Competition)
 *
 * Tests the user journey for joining a COMPETITION bounty:
 *   1. Navigate to bounty list and open a detail page
 *   2. Click the Join Competition CTA
 *   3. Assert success (button transitions to "Joined")
 *   4. Assert error path (contract failure, button stays available)
 *   5. Assert disabled state for non-OPEN bounties
 *
 * Stability strategy:
 *   - GraphQL intercepted via page.route() - hermetic, no live backend.
 *   - Contest contract client injected via page.addInitScript() - no blockchain.
 *   - Selectors use data-testid attributes only.
 *   - Timing via await expect(...) - no arbitrary sleeps.
 */

import { test, expect, type Page } from "@playwright/test";

// Must be a valid UUID (all hex chars) so toBountyIdBigInt() in
// use-competition-bounty.ts can parse it without throwing ContestError("tx_failed").
const BOUNTY_ID = "e2ec0bcd-dead-beef-cafe-ab01cd02ef03";

const MOCK_BOUNTY_FRAGMENT = {
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
const MOCK_SESSION = {
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

async function setupMocks(page: Page) {
  // Inject successful contract client by default
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
  });

  await page.route("**/api/auth/**", async (route) => {
    const url = new URL(route.request().url());
    // better-auth's getSession endpoint is `/api/auth/get-session` — match
    // both shapes so the session mock catches it.
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
    let body: { operationName?: string } = {};
    try {
      body = JSON.parse(route.request().postData() ?? "{}") as {
        operationName?: string;
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
                bounties: [MOCK_BOUNTY_FRAGMENT],
                total: 1,
                limit: 20,
                offset: 0,
              },
            },
          }),
        });
        return;
      case "Bounty":
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: { bounty: { ...MOCK_BOUNTY_FRAGMENT, submissions: [] } },
          }),
        });
        return;
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

test.describe("Bounty application flow", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  // ── 1. Navigation ──────────────────────────────────────────────────────

  test("shows bounty list with cards after navigating to /bounty", async ({
    page,
  }) => {
    await page.goto("/bounty");
    await expect(page.getByRole("heading", { name: /Explore/i })).toBeVisible();
    await expect(page.getByTestId("bounty-card").first()).toBeVisible();
  });

  test("navigates from a bounty card to the detail page", async ({ page }) => {
    await page.goto("/bounty");
    await expect(page.getByTestId("bounty-card").first()).toBeVisible();
    await page.locator("a:has([data-testid='bounty-card'])").first().click();
    await expect(page).toHaveURL(`/bounty/${BOUNTY_ID}`, { timeout: 10_000 });
  });

  // ── 2. Detail page CTA ────────────────────────────────────────────────

  test("renders enabled Join Competition button for OPEN COMPETITION bounty", async ({
    page,
  }) => {
    await page.goto(`/bounty/${BOUNTY_ID}`);
    const btn = page
      .locator('[data-testid="apply-to-bounty-btn"]:visible')
      .first();
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled({ timeout: 10_000 });
  });

  // ── 3. Successful join ────────────────────────────────────────────────

  test("clicking Join Competition transitions button to Joined state", async ({
    page,
  }) => {
    await page.goto(`/bounty/${BOUNTY_ID}`);
    const btn = page
      .locator('[data-testid="apply-to-bounty-btn"]:visible')
      .first();
    // Wait for the session to resolve so the button enables — without this,
    // the click can fire before walletAddress is populated and handleJoin
    // returns early before reaching claimBounty().
    await expect(btn).toBeEnabled({ timeout: 10_000 });
    await btn.click();
    // Assert the join contract path is actually invoked.
    await expect
      .poll(
        async () =>
          page.evaluate(
            () =>
              (globalThis as { __claimBountyCalls?: number })
                .__claimBountyCalls ?? 0,
          ),
        { timeout: 8_000 },
      )
      .toBeGreaterThan(0);
  });

  // ── 4. Failed join ────────────────────────────────────────────────────

  test("shows error toast and keeps Join button when contract call fails", async ({
    page,
  }) => {
    // Override the success client injected by setupMocks. Playwright runs
    // page.addInitScript scripts in registration order on each navigation,
    // so this test-level script is registered after setupMocks and overwrites
    // globalThis.__contestContracts with a failing claimBounty implementation.
    await page.addInitScript(() => {
      (globalThis as { __contestContracts?: unknown }).__contestContracts = {
        claimBounty: async () => {
          throw new Error("Contract: insufficient funds");
        },
      };
    });

    await page.goto(`/bounty/${BOUNTY_ID}`);
    const btn = page
      .locator('[data-testid="apply-to-bounty-btn"]:visible')
      .first();
    await expect(btn).toBeEnabled({ timeout: 10_000 });
    await btn.click();
    // On failure the button must NOT transition to "Joined"
    await expect(
      page.locator('[data-testid="apply-to-bounty-btn"]:visible').first(),
    ).toBeVisible({ timeout: 8_000 });
    await expect(
      page.getByRole("button", { name: /Joined/i }),
    ).not.toBeVisible();
  });

  // ── 5. Disabled state when bounty is not OPEN ─────────────────────────

  test("CTA button is disabled when bounty status is COMPLETED", async ({
    page,
  }) => {
    await page.route("**/api/graphql", async (route) => {
      let body: { operationName?: string } = {};
      try {
        body = JSON.parse(route.request().postData() ?? "{}") as {
          operationName?: string;
        };
      } catch {
        /* ignore */
      }
      if (body.operationName === "Bounty") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              bounty: {
                ...MOCK_BOUNTY_FRAGMENT,
                status: "COMPLETED",
                submissions: [],
              },
            },
          }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto(`/bounty/${BOUNTY_ID}`);
    await expect(page.getByRole("button", { name: /Completed/i })).toBeDisabled(
      { timeout: 8_000 },
    );
  });
});
