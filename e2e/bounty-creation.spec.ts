/**
 * E2E: Bounty Creation Flow
 *
 * Covers the sponsor-side creation wizard at /bounty/create:
 *   1. Authenticated navigation
 *   2. Step 1 details and bounty type
 *   3. Step 2 reward, currency, deadline, and type-specific fields
 *   4. Step 3 review and successful CreateBounty mutation redirect
 *   5. Step 1 validation when title is empty
 */

import { expect, test, type Page } from "@playwright/test";

const CREATED_BOUNTY_ID = "created-bounty-e2e";

const MOCK_SESSION = {
  user: {
    id: "sponsor-e2e-tester",
    name: "Sponsor E2E Tester",
    email: "sponsor-e2e@test.com",
    image: null,
    walletAddress: "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGYWDOUALPIF5JD4PI21JQ",
  },
  session: { token: "fake-e2e-token" },
};

async function setupMocks(page: Page) {
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

    if (body.operationName === "CreateBounty") {
      const input = body.variables?.input as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            createBounty: {
              __typename: "Bounty",
              id: CREATED_BOUNTY_ID,
              title: input.title,
              description: input.description,
              status: "OPEN",
              type: input.type,
              rewardAmount: input.rewardAmount,
              rewardCurrency: input.rewardCurrency,
              createdAt: "2026-05-27T10:00:00Z",
              updatedAt: "2026-05-27T10:00:00Z",
              organizationId: input.organizationId,
              projectId: null,
              bountyWindowId: null,
              githubIssueUrl: input.githubIssueUrl,
              githubIssueNumber: null,
              createdBy: MOCK_SESSION.user.id,
              organization: {
                __typename: "BountyOrganization",
                id: input.organizationId,
                name: "Boundless Labs",
                logo: null,
                slug: "boundless-labs",
              },
              project: null,
              bountyWindow: null,
              _count: { __typename: "BountyCount", submissions: 0 },
              submissions: [],
            },
          },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: {} }),
    });
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

test.describe("Bounty creation flow", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  test("creates a competition bounty and redirects to the new detail page", async ({
    page,
  }) => {
    await page.goto("/bounty/create");

    await expect(
      page.getByRole("heading", { name: "Create Bounty" }),
    ).toBeVisible();
    await expect(page.getByTestId("create-step-1")).toBeVisible();

    await page.getByLabel("Title").fill("Add sponsor onboarding checklist");
    await page
      .getByLabel("Description")
      .fill("Build a reliable checklist for new sponsor onboarding.");
    await page.getByLabel("Organization").fill("org-boundless-labs");
    await page
      .getByLabel("GitHub URL")
      .fill("https://github.com/boundlessfi/bounties/issues/215");
    await page.getByLabel("Bounty type").click();
    await page.getByRole("option", { name: "Competition" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByTestId("create-step-2")).toBeVisible();
    await page.getByLabel("Reward amount").fill("1500");
    await page.getByLabel("Currency").click();
    await page.getByRole("option", { name: "USDC" }).click();
    await page.getByLabel("Deadline").fill("2026-12-31");
    await page.getByLabel("Winner seats").fill("5");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByTestId("create-step-3")).toBeVisible();
    await expect(
      page.getByText("Add sponsor onboarding checklist"),
    ).toBeVisible();
    await expect(page.getByText("1500 USDC")).toBeVisible();

    await page.getByRole("button", { name: "Create" }).click();
    await expect(page).toHaveURL(`/bounty/${CREATED_BOUNTY_ID}`, {
      timeout: 10_000,
    });
  });

  test("keeps users on step 1 and shows title validation when title is empty", async ({
    page,
  }) => {
    await page.goto("/bounty/create");

    await page
      .getByLabel("Description")
      .fill("Build a reliable checklist for new sponsor onboarding.");
    await page.getByLabel("Organization").fill("org-boundless-labs");
    await page
      .getByLabel("GitHub URL")
      .fill("https://github.com/boundlessfi/bounties/issues/215");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByTestId("create-step-1")).toBeVisible();
    await expect(page.getByText("Title is required")).toBeVisible();
    await expect(page.getByTestId("create-step-2")).not.toBeVisible();
  });
});
