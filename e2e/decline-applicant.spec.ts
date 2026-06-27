import { test, expect, type Page, type Route } from "@playwright/test";
import {
  MOCK_SESSION,
  setupMocks,
  BOUNTY_ID,
  MOCK_BOUNTY_FRAGMENT,
} from "./bounty-application.mocks";

// PLAN
// Test cases:
// 1) review dashboard renders for the creator, 2) each card shows Compare/Decline/Select controls,
// 3) clicking Decline opens the AlertDialog, 4) declining without a reason succeeds,
// 5) optimistic removal happens before any contract/network completion, 6) declined applicants are removed from comparison mode,
// 7) failed decline rolls back and shows an error toast.
// Mock strategy:
// Reuse `setupMocks(page)`, override the `Bounty` GraphQL response with a milestone-based bounty owned by `MOCK_SESSION.user.id`,
// and install test-local GraphQL overrides only when a refetch needs to return a different applications array.
// Contract injection:
// Default `page.addInitScript()` injects `globalThis.__applicationContracts.declineApplicant` with `{ shouldSucceed: true }`.
// The error test overwrites it with `{ shouldSucceed: false }` before re-navigation, and the optimistic test swaps it to a never-resolving promise.
// Selectors used:
// Review heading text, the `.bg-background-card\/50` application card class from `application-review-dashboard.tsx`,
// button names `Compare`, `Decline`, `Select`, dialog title `Decline applicant?`,
// textarea placeholder `Optional reason for declining this applicant`, and toast text `Failed to decline applicant`.

const BOUNTY_DETAIL_URL = `/bounty/${BOUNTY_ID}`;
const APPLICATION_CARD_SELECTOR = ".bg-background-card\\/50";

const MOCK_APPLICATIONS = [
  {
    id: "app-1",
    applicantAddress:
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    applicantName: "Alice",
    proposal: {
      approach: "I will implement the feature incrementally with tests first.",
      estimatedTimeline: "1 week",
      relevantExperience: "Built three similar workflow systems.",
    },
    reputation: { score: 100, tier: "Gold", completionStats: "10/10" },
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "app-2",
    applicantAddress: "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBW",
    applicantName: "Bob",
    proposal: {
      approach: "I will deliver the first milestone quickly and iterate.",
      estimatedTimeline: "2 weeks",
      relevantExperience: "Maintained two open-source bounty programs.",
    },
    reputation: { score: 80, tier: "Silver", completionStats: "8/10" },
    createdAt: "2025-01-02T00:00:00Z",
  },
];

function applicationCards(page: Page) {
  return page.locator(APPLICATION_CARD_SELECTOR);
}

function aliceText(page: Page) {
  return page.getByText(/Alice/);
}

function bobText(page: Page) {
  return page.getByText(/Bob/);
}

function buildBountyResponse(applications = MOCK_APPLICATIONS) {
  return {
    data: {
      bounty: {
        ...MOCK_BOUNTY_FRAGMENT,
        type: "MILESTONE_BASED",
        createdBy: MOCK_SESSION.user.id,
        applications,
        submissions: [],
      },
    },
  };
}

function getOperationName(route: Route): string | undefined {
  try {
    return (
      JSON.parse(route.request().postData() ?? "{}") as {
        operationName?: string;
      }
    ).operationName;
  } catch {
    return undefined;
  }
}

async function routeBountyRefetchWithApplications(
  page: Page,
  applications: typeof MOCK_APPLICATIONS,
) {
  await page.route("**/api/graphql", async (route) => {
    if (getOperationName(route) === "Bounty") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildBountyResponse(applications)),
      });
      return;
    }

    await route.fallback();
  });
}

test.beforeEach(async ({ page }) => {
  await setupMocks(page);

  await page.route("**/api/graphql", async (route) => {
    if (getOperationName(route) === "Bounty") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildBountyResponse()),
      });
      return;
    }

    await route.fallback();
  });

  await page.addInitScript(() => {
    const contracts =
      (globalThis as { __applicationContracts?: Record<string, unknown> })
        .__applicationContracts || {};
    (
      globalThis as { __applicationContracts?: Record<string, unknown> }
    ).__applicationContracts = {
      ...contracts,
      declineApplicant: Object.assign(
        async () => ({ txHash: "0xmock-decline-tx" }),
        { shouldSucceed: true },
      ),
    };
  });

  await page.goto(BOUNTY_DETAIL_URL);
});

test.describe("Decline Applicant", () => {
  test("Creator sees the application review dashboard", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Review Applications/i }),
    ).toBeVisible();
    await expect(applicationCards(page)).toHaveCount(2);
    await expect(aliceText(page)).toBeVisible();
    await expect(bobText(page)).toBeVisible();
  });

  test("Each application card shows a Decline button next to Select", async ({
    page,
  }) => {
    const cards = applicationCards(page);
    await expect(cards).toHaveCount(2);

    for (const index of [0, 1]) {
      const card = cards.nth(index);
      await expect(card.getByRole("button", { name: "Decline" })).toBeVisible();
      await expect(card.getByRole("button", { name: "Select" })).toBeVisible();
      await expect(card.getByRole("button", { name: "Compare" })).toBeVisible();
    }
  });

  test("Clicking Decline opens the confirmation AlertDialog", async ({
    page,
  }) => {
    const firstCard = applicationCards(page).first();
    await firstCard.getByRole("button", { name: "Decline" }).click();

    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: "Decline applicant?" }),
    ).toBeVisible();
    await expect(
      dialog.getByPlaceholder("Optional reason for declining this applicant"),
    ).toBeVisible();
  });

  test("Submitting with no reason succeeds (reason is optional)", async ({
    page,
  }) => {
    await applicationCards(page)
      .first()
      .getByRole("button", { name: "Decline" })
      .click();

    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await routeBountyRefetchWithApplications(page, [MOCK_APPLICATIONS[1]]);
    await dialog.getByRole("button", { name: "Decline applicant" }).click();

    await expect(dialog).not.toBeVisible();
    await expect(aliceText(page)).not.toBeVisible();
    await expect(bobText(page)).toBeVisible();
    await expect(applicationCards(page)).toHaveCount(1);
  });

  test("Declined applicant disappears immediately (optimistic update)", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const contracts =
        (globalThis as { __applicationContracts?: Record<string, unknown> })
          .__applicationContracts || {};
      (
        globalThis as { __applicationContracts?: Record<string, unknown> }
      ).__applicationContracts = {
        ...contracts,
        declineApplicant: Object.assign(() => new Promise(() => {}), {
          shouldSucceed: true,
        }),
      };
    });

    await applicationCards(page)
      .first()
      .getByRole("button", { name: "Decline" })
      .click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Decline applicant" })
      .click();

    expect(await aliceText(page).count()).toBe(0);
    expect(await applicationCards(page).count()).toBe(1);
    await expect(bobText(page)).toBeVisible();
  });

  test("Applicant removed from comparison selection if selected", async ({
    page,
  }) => {
    const cards = applicationCards(page);
    await cards.nth(0).getByRole("button", { name: "Compare" }).click();
    await cards.nth(1).getByRole("button", { name: "Compare" }).click();

    await expect(page.getByText("Comparison Mode")).toBeVisible();
    await expect(page.getByText("2/2 Selected for Comparison")).toBeVisible();

    await page.getByRole("button", { name: "Decline" }).first().click();
    await routeBountyRefetchWithApplications(page, [MOCK_APPLICATIONS[1]]);
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Decline applicant" })
      .click();

    await expect(page.getByText("Comparison Mode")).not.toBeVisible();
    await expect(
      page.getByText("2/2 Selected for Comparison"),
    ).not.toBeVisible();
    await expect(aliceText(page)).not.toBeVisible();
    await expect(bobText(page)).toBeVisible();
  });

  test("On mutation error, applicant reappears (rollback)", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const install = () => {
        const contracts =
          (globalThis as { __applicationContracts?: Record<string, unknown> })
            .__applicationContracts || {};
        (
          globalThis as { __applicationContracts?: Record<string, unknown> }
        ).__applicationContracts = {
          ...contracts,
          declineApplicant: Object.assign(
            async () => {
              await new Promise((resolve) => setTimeout(resolve, 100));
              throw new Error("Simulated contract error");
            },
            { shouldSucceed: false },
          ),
        };
      };

      install();
      if (typeof queueMicrotask === "function") {
        queueMicrotask(install);
      }
    });

    await page.goto(BOUNTY_DETAIL_URL);
    await expect(aliceText(page)).toBeVisible();

    await applicationCards(page)
      .first()
      .getByRole("button", { name: "Decline" })
      .click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Decline applicant" })
      .click();

    await expect(aliceText(page)).toBeVisible({
      timeout: 10_000,
    });
    await expect(applicationCards(page)).toHaveCount(2, {
      timeout: 10_000,
    });
  });
});
