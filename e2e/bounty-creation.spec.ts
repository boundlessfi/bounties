/**
 * E2E: Bounty Creation Flow (Sponsor Side)
 *
 * Tests the sponsor journey for creating a new bounty at /bounty/create:
 *   1. Navigate to /bounty/create while authenticated
 *   2. Step 1: fill title, description, organization, GitHub URL, bounty type
 *   3. Step 2: fill reward amount, currency, and deadline
 *   4. Step 3: review and click Create
 *   5. Assert redirect to /bounty/{newId} after successful creation
 *   6. Validation: submitting Step 1 with empty title shows error
 *
 * Stability strategy:
 *   - GraphQL intercepted via page.route() — hermetic, no live backend.
 *   - Session mocked via page.route() on auth endpoints.
 *   - Selectors use data-testid attributes only.
 *   - Timing via await expect(...) — no arbitrary sleeps.
 */

import { test, expect, type Page } from "@playwright/test";

// Realistic-looking UUID for the newly created bounty returned by the mock.
const CREATED_BOUNTY_ID = "e2ec0bcd-1234-abcd-ef01-234567890abc";

const MOCK_SESSION = {
  user: {
    id: "user-e2e-sponsor",
    name: "E2E Sponsor",
    email: "sponsor@test.com",
    image: null,
    walletAddress: "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGYWDOUALPIF5JD4PI21JQ",
  },
  session: { token: "fake-e2e-token" },
};

const MOCK_ORGANIZATIONS = [
  {
    __typename: "Organization",
    id: "org-stellar-core",
    name: "Stellar Core",
    logo: null,
    slug: "stellar-core",
  },
  {
    __typename: "Organization",
    id: "org-defi-protocol",
    name: "DeFi Protocol",
    logo: null,
    slug: "defi-protocol",
  },
];

const MOCK_CREATE_BOUNTY_RESPONSE = {
  data: {
    createBounty: {
      __typename: "Bounty",
      id: CREATED_BOUNTY_ID,
      title: "Implement multi-sig wallet support",
      description: "Add multi-signature wallet functionality for enhanced security.",
      status: "OPEN",
      type: "FIXED_PRICE",
      rewardAmount: 5000,
      rewardCurrency: "XLM",
      createdAt: "2026-05-27T10:00:00Z",
      updatedAt: "2026-05-27T10:00:00Z",
      organizationId: "org-stellar-core",
      projectId: null,
      bountyWindowId: null,
      githubIssueUrl: "https://github.com/stellar-core/multisig/issues/42",
      githubIssueNumber: 42,
      createdBy: "user-e2e-sponsor",
      organization: {
        __typename: "BountyOrganization",
        id: "org-stellar-core",
        name: "Stellar Core",
        logo: null,
        slug: "stellar-core",
      },
      project: null,
      bountyWindow: null,
      _count: { __typename: "BountyCount", submissions: 0 },
      submissions: [],
    },
  },
};

async function setupMocks(page: Page) {
  // ── Auth mock ──────────────────────────────────────────────────────────
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

  // ── GraphQL mock ───────────────────────────────────────────────────────
  await page.route("**/api/graphql", async (route) => {
    let body: { operationName?: string; variables?: Record<string, unknown> } =
      {};
    try {
      body = JSON.parse(route.request().postData() ?? "{}") as {
        operationName?: string;
        variables?: Record<string, unknown>;
      };
    } catch {
      /* ignore */
    }

    switch (body.operationName) {
      case "CreateBounty":
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_CREATE_BOUNTY_RESPONSE),
        });
        return;

      case "Organizations":
      case "GetOrganizations":
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: { organizations: MOCK_ORGANIZATIONS },
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
        // Fail loudly so tests surface unexpected GraphQL calls.
        await route.abort("failed");
    }
  });

  // ── Auth cookie ────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────

test.describe("Bounty creation flow", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  // ── 1. Navigation ──────────────────────────────────────────────────────

  test("navigates to /bounty/create and renders the creation form", async ({
    page,
  }) => {
    await page.goto("/bounty/create");
    // The page should render the first step of the multi-step form.
    await expect(page.getByTestId("bounty-create-form")).toBeVisible({
      timeout: 10_000,
    });
    // Step 1 heading or step indicator should be visible.
    await expect(page.getByTestId("step-indicator")).toBeVisible();
  });

  // ── 2. Happy path — full creation flow ─────────────────────────────────

  test("completes all three steps and redirects to the new bounty", async ({
    page,
  }) => {
    await page.goto("/bounty/create");

    // ── Step 1: Basic details ──────────────────────────────────────────
    await expect(page.getByTestId("bounty-create-form")).toBeVisible({
      timeout: 10_000,
    });

    await page.getByTestId("title-input").fill("Implement multi-sig wallet support");
    await page
      .getByTestId("description-input")
      .fill("Add multi-signature wallet functionality for enhanced security.");
    await page.getByTestId("github-url-input").fill("https://github.com/stellar-core/multisig/issues/42");
    await page.getByTestId("bounty-type-select").click();
    await page.getByRole("option", { name: /Fixed Price/i }).click();

    // Select organization from the dropdown.
    await page.getByTestId("organization-select").click();
    await page.getByRole("option", { name: /Stellar Core/i }).click();

    // Advance to Step 2.
    await page.getByTestId("next-step-btn").click();

    // ── Step 2: Reward details ─────────────────────────────────────────
    await expect(page.getByTestId("step-2-content")).toBeVisible({
      timeout: 5_000,
    });

    await page.getByTestId("reward-amount-input").fill("5000");
    await page.getByTestId("reward-currency-select").click();
    await page.getByRole("option", { name: "XLM" }).click();

    // Fill deadline — the DeadlineInput renders a date picker trigger.
    await page.getByTestId("deadline-input").click();
    // Select a future date: click the first available (non-disabled) day cell.
    await page.locator('[data-testid="deadline-calendar"] button:not([disabled]):not([aria-disabled="true"])').first().click();

    // Advance to Step 3.
    await page.getByTestId("next-step-btn").click();

    // ── Step 3: Review ─────────────────────────────────────────────────
    await expect(page.getByTestId("step-3-content")).toBeVisible({
      timeout: 5_000,
    });

    // Verify the review summary displays the entered values.
    await expect(page.getByTestId("review-title")).toContainText(
      "Implement multi-sig wallet support",
    );
    await expect(page.getByTestId("review-reward")).toContainText("5000");
    await expect(page.getByTestId("review-type")).toContainText(/Fixed Price/i);

    // Submit the creation form.
    await page.getByTestId("create-bounty-btn").click();

    // ── Assert redirect to the newly created bounty ────────────────────
    await expect(page).toHaveURL(`/bounty/${CREATED_BOUNTY_ID}`, {
      timeout: 10_000,
    });
  });

  // ── 3. Validation — empty title ────────────────────────────────────────

  test("submitting Step 1 with an empty title shows validation error", async ({
    page,
  }) => {
    await page.goto("/bounty/create");

    await expect(page.getByTestId("bounty-create-form")).toBeVisible({
      timeout: 10_000,
    });

    // Fill everything except the title.
    await page
      .getByTestId("description-input")
      .fill("Some description for validation test.");
    await page.getByTestId("github-url-input").fill("https://github.com/org/repo/issues/1");
    await page.getByTestId("bounty-type-select").click();
    await page.getByRole("option", { name: /Fixed Price/i }).click();
    await page.getByTestId("organization-select").click();
    await page.getByRole("option", { name: /Stellar Core/i }).click();

    // Attempt to advance without a title.
    await page.getByTestId("next-step-btn").click();

    // User should stay on Step 1 (step-2-content should NOT appear).
    await expect(page.getByTestId("step-2-content")).not.toBeVisible({
      timeout: 3_000,
    });

    // A title-specific error message should be visible.
    await expect(page.getByTestId("title-error")).toBeVisible({ timeout: 3_000 });
  });

  // ── 4. Validation — GitHub URL format ──────────────────────────────────

  test("submitting Step 1 with an invalid GitHub URL shows validation error", async ({
    page,
  }) => {
    await page.goto("/bounty/create");

    await expect(page.getByTestId("bounty-create-form")).toBeVisible({
      timeout: 10_000,
    });

    // Fill title and other required fields, but use an invalid GitHub URL.
    await page.getByTestId("title-input").fill("Test bounty");
    await page.getByTestId("description-input").fill("A valid description for the test.");
    await page.getByTestId("github-url-input").fill("not-a-valid-url");
    await page.getByTestId("bounty-type-select").click();
    await page.getByRole("option", { name: /Fixed Price/i }).click();
    await page.getByTestId("organization-select").click();
    await page.getByRole("option", { name: /Stellar Core/i }).click();

    await page.getByTestId("next-step-btn").click();

    // Should stay on Step 1 with a GitHub URL error.
    await expect(page.getByTestId("step-2-content")).not.toBeVisible({
      timeout: 3_000,
    });
    await expect(page.getByTestId("github-url-error")).toBeVisible({
      timeout: 3_000,
    });
  });

  // ── 5. Step navigation — back button ───────────────────────────────────

  test("can navigate back from Step 2 to Step 1 and retain values", async ({
    page,
  }) => {
    await page.goto("/bounty/create");

    await expect(page.getByTestId("bounty-create-form")).toBeVisible({
      timeout: 10_000,
    });

    // Fill Step 1.
    await page.getByTestId("title-input").fill("Persistent title");
    await page.getByTestId("description-input").fill("Persistent description text.");
    await page.getByTestId("github-url-input").fill("https://github.com/org/repo/issues/1");
    await page.getByTestId("bounty-type-select").click();
    await page.getByRole("option", { name: /Fixed Price/i }).click();
    await page.getByTestId("organization-select").click();
    await page.getByRole("option", { name: /Stellar Core/i }).click();

    // Advance to Step 2.
    await page.getByTestId("next-step-btn").click();
    await expect(page.getByTestId("step-2-content")).toBeVisible({
      timeout: 5_000,
    });

    // Go back to Step 1.
    await page.getByTestId("prev-step-btn").click();
    await expect(page.getByTestId("step-1-content")).toBeVisible({
      timeout: 5_000,
    });

    // Title field should retain the previously entered value.
    await expect(page.getByTestId("title-input")).toHaveValue("Persistent title");
  });

  // ── 6. Mutation error path ─────────────────────────────────────────────

  test("shows error toast when CreateBounty mutation fails", async ({
    page,
  }) => {
    // Override the GraphQL mock to return an error for CreateBounty.
    await page.route("**/api/graphql", async (route) => {
      let body: { operationName?: string } = {};
      try {
        body = JSON.parse(route.request().postData() ?? "{}") as {
          operationName?: string;
        };
      } catch {
        /* ignore */
      }

      if (body.operationName === "CreateBounty") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            errors: [{ message: "Insufficient permissions to create bounty" }],
          }),
        });
        return;
      }
      // Let other operations fall through to the default mock.
      await route.fallback();
    });

    await page.goto("/bounty/create");

    await expect(page.getByTestId("bounty-create-form")).toBeVisible({
      timeout: 10_000,
    });

    // Fill Step 1 quickly.
    await page.getByTestId("title-input").fill("Error test bounty");
    await page.getByTestId("description-input").fill("Description for error path test.");
    await page.getByTestId("github-url-input").fill("https://github.com/org/repo/issues/1");
    await page.getByTestId("bounty-type-select").click();
    await page.getByRole("option", { name: /Fixed Price/i }).click();
    await page.getByTestId("organization-select").click();
    await page.getByRole("option", { name: /Stellar Core/i }).click();
    await page.getByTestId("next-step-btn").click();

    // Fill Step 2.
    await expect(page.getByTestId("step-2-content")).toBeVisible({
      timeout: 5_000,
    });
    await page.getByTestId("reward-amount-input").fill("1000");
    await page.getByTestId("reward-currency-select").click();
    await page.getByRole("option", { name: "XLM" }).click();
    await page.getByTestId("deadline-input").click();
    await page.locator('[data-testid="deadline-calendar"] button:not([disabled]):not([aria-disabled="true"])').first().click();
    await page.getByTestId("next-step-btn").click();

    // Step 3: submit.
    await expect(page.getByTestId("step-3-content")).toBeVisible({
      timeout: 5_000,
    });
    await page.getByTestId("create-bounty-btn").click();

    // Should NOT navigate away — stay on the creation page.
    await expect(page).toHaveURL("/bounty/create", { timeout: 5_000 });

    // An error toast or inline error should be visible.
    await expect(
      page.getByText(/Insufficient permissions|error/i).first(),
    ).toBeVisible({ timeout: 5_000 });
  });
});
