import { test, expect, type Page } from "@playwright/test";

const MOCK_SESSION = {
  user: {
    id: "sponsor-1",
    name: "Sponsor Tester",
    email: "sponsor@test.com",
    image: null,
    walletAddress: "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGYWDOUALPIF5JD4PI21JQ",
    role: "sponsor", // Crucial for getting past the gate
  },
  session: { token: "fake-sponsor-token" },
};

async function setupMocks(page: Page) {
  // Auth mock
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

  // GraphQL mock
  await page.route("**/api/graphql", async (route) => {
    let body: { operationName?: string } = {};
    try {
      body = JSON.parse(route.request().postData() ?? "{}");
    } catch {
      /* ignore */
    }

    if (body.operationName === "CreateBounty") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            createBounty: {
              id: "new-bounty-123",
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
      value: "fake-sponsor-token",
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

  test("validation path: prevents advancing with empty title", async ({
    page,
  }) => {
    await page.goto("/bounty/create");

    // Attempt to proceed without filling anything
    await page.getByRole("button", { name: /Next/i }).click();

    // Should stay on step 1 and show an error for title
    await expect(page.getByText(/Title is required/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Step 1/i })).toBeVisible();
  });

  test("happy path: creates a bounty successfully", async ({ page }) => {
    await page.goto("/bounty/create");

    // Step 1: Basic Info
    await page.getByLabel(/Title/i).fill("My New E2E Bounty");
    await page
      .getByLabel(/Description/i)
      .fill("This is a detailed description for the bounty.");

    // Select Organization
    await page.getByLabel(/Organization/i).click();
    await page.getByRole("option", { name: "Stellar Privacy Lab" }).click();

    await page
      .getByLabel(/GitHub URL/i)
      .fill("https://github.com/stellar/stellar-core/issues/1");

    // Select Bounty Type
    await page.getByLabel(/Bounty Type/i).click();
    await page.getByRole("option", { name: /Fixed Price/i }).click();

    await page.getByRole("button", { name: /Next/i }).click();

    // Step 2: Rewards and Timeline
    await expect(page.getByRole("heading", { name: /Step 2/i })).toBeVisible();

    await page.getByLabel(/Reward Amount/i).fill("1000");
    await page.getByLabel(/Currency/i).click();
    await page.getByRole("option", { name: "XLM" }).click();

    await page.getByLabel(/Deadline/i).fill("2026-12-31");

    await page.getByRole("button", { name: /Next/i }).click();

    // Step 3: Review
    await expect(page.getByRole("heading", { name: /Step 3/i })).toBeVisible();
    await expect(page.getByText("My New E2E Bounty")).toBeVisible();
    await expect(page.getByText("1000 XLM")).toBeVisible();

    // Submit
    await page.getByRole("button", { name: /Create Bounty/i }).click();

    // Assert redirection to the new bounty page
    await expect(page).toHaveURL(/\/bounty\/new-bounty-123/, {
      timeout: 10_000,
    });
  });
});
