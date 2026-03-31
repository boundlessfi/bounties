import { renderHook, act } from "@testing-library/react";
import { useBountyFilters } from "../use-bounty-filters";
import { type BountyFieldsFragment } from "@/lib/graphql/generated";

// ---------------------------------------------------------------------------
// Minimal fixture data — 3 bounties covering different types, orgs, statuses
// ---------------------------------------------------------------------------
const mockBounties: BountyFieldsFragment[] = [
  {
    __typename: "Bounty",
    id: "1",
    title: "Fix login bug",
    description: "There is a critical bug in the authentication flow",
    status: "OPEN",
    type: "FIXED_PRICE",
    rewardAmount: 500,
    rewardCurrency: "USDC",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
    organizationId: "org-1",
    projectId: null,
    bountyWindowId: null,
    githubIssueUrl: "https://github.com/test/repo/issues/1",
    githubIssueNumber: 1,
    createdBy: "user-1",
    organization: {
      __typename: "BountyOrganization",
      id: "org-1",
      name: "Acme",
      logo: null,
      slug: null,
    },
    project: null,
    bountyWindow: null,
    _count: { __typename: "BountyCount", submissions: 0 },
  },
  {
    __typename: "Bounty",
    id: "2",
    title: "Build analytics dashboard",
    description: "Build a new real-time analytics dashboard",
    status: "IN_PROGRESS",
    type: "MILESTONE_BASED",
    rewardAmount: 2000,
    rewardCurrency: "USDC",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    organizationId: "org-2",
    projectId: null,
    bountyWindowId: null,
    githubIssueUrl: "https://github.com/test/repo/issues/2",
    githubIssueNumber: 2,
    createdBy: "user-2",
    organization: {
      __typename: "BountyOrganization",
      id: "org-2",
      name: "Beta Corp",
      logo: null,
      slug: null,
    },
    project: null,
    bountyWindow: null,
    _count: { __typename: "BountyCount", submissions: 1 },
  },
  {
    __typename: "Bounty",
    id: "3",
    title: "Smart contract security audit",
    description: "Perform a full security audit of the smart contracts",
    status: "OPEN",
    type: "COMPETITION",
    rewardAmount: 5000,
    rewardCurrency: "USDC",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    organizationId: "org-1",
    projectId: null,
    bountyWindowId: null,
    githubIssueUrl: "https://github.com/test/repo/issues/3",
    githubIssueNumber: 3,
    createdBy: "user-1",
    organization: {
      __typename: "BountyOrganization",
      id: "org-1",
      name: "Acme",
      logo: null,
      slug: null,
    },
    project: null,
    bountyWindow: null,
    _count: { __typename: "BountyCount", submissions: 5 },
  },
];

// ---------------------------------------------------------------------------

describe("useBountyFilters", () => {
  // ── 1. Initial State ─────────────────────────────────────────────────────
  describe("initial state", () => {
    it("returns correct default values for all 6 state slices", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      expect(result.current.searchQuery).toBe("");
      expect(result.current.selectedTypes).toEqual([]);
      expect(result.current.selectedOrgs).toEqual([]);
      expect(result.current.rewardRange).toEqual([0, 5000]);
      expect(result.current.statusFilter).toBe("open");
      expect(result.current.sortOption).toBe("newest");
    });

    it("hasActiveFilters is false with default state", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("filters to only open bounties by default (statusFilter = 'open')", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));
      // bounty 2 is 'IN_PROGRESS' — should be excluded
      expect(result.current.filteredBounties).toHaveLength(2);
      expect(result.current.filteredBounties.map((b) => b.id)).toEqual(
        expect.arrayContaining(["1", "3"]),
      );
    });

    it("derives organizations list from allBounties, sorted and deduplicated", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));
      expect(result.current.organizations).toEqual(["Acme", "Beta Corp"]);
    });
  });

  // ── 2. Search Logic ──────────────────────────────────────────────────────
  describe("search logic", () => {
    it("filters by title match (case-insensitive)", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      act(() => {
        result.current.setSearchQuery("LOGIN");
      });

      expect(result.current.filteredBounties).toHaveLength(1);
      expect(result.current.filteredBounties[0].id).toBe("1");
    });

    it("filters by description match", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      act(() => {
        result.current.setSearchQuery("security audit");
      });

      expect(result.current.filteredBounties).toHaveLength(1);
      expect(result.current.filteredBounties[0].id).toBe("3");
    });

    it("returns empty array when no bounty matches the search", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      act(() => {
        result.current.setSearchQuery("xyznonexistent");
      });

      expect(result.current.filteredBounties).toHaveLength(0);
    });

    it("restores full list when searchQuery is cleared", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      act(() => {
        result.current.setSearchQuery("login");
      });
      expect(result.current.filteredBounties).toHaveLength(1);

      act(() => {
        result.current.setSearchQuery("");
      });
      // back to default: 2 open bounties
      expect(result.current.filteredBounties).toHaveLength(2);
    });

    it("marks hasActiveFilters true when searchQuery is set", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      act(() => {
        result.current.setSearchQuery("login");
      });
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  // ── 3. Filter Logic ──────────────────────────────────────────────────────
  describe("type filter", () => {
    it("toggleType reduces the list to matching type only", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      act(() => {
        result.current.toggleType("FIXED_PRICE");
      });

      expect(result.current.filteredBounties).toHaveLength(1);
      expect(result.current.filteredBounties[0].id).toBe("1");
    });

    it("toggleType adds the type when not selected, removes when selected again", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      act(() => {
        result.current.toggleType("COMPETITION");
      });
      expect(result.current.selectedTypes).toEqual(["COMPETITION"]);

      act(() => {
        result.current.toggleType("COMPETITION");
      });
      expect(result.current.selectedTypes).toEqual([]);
    });

    it("selecting two types returns union of both", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      act(() => {
        result.current.toggleType("FIXED_PRICE");
      });
      act(() => {
        result.current.toggleType("COMPETITION");
      });

      expect(result.current.filteredBounties).toHaveLength(2);
      expect(result.current.filteredBounties.map((b) => b.id)).toEqual(
        expect.arrayContaining(["1", "3"]),
      );
    });
  });

  describe("organization filter", () => {
    it("toggleOrg filters to bounties from that org (within active statusFilter)", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));
      // statusFilter is 'open' by default — bounty 2 (Beta Corp) is IN_PROGRESS
      act(() => {
        result.current.toggleOrg("Acme");
      });

      expect(result.current.filteredBounties).toHaveLength(2);
      expect(result.current.filteredBounties.map((b) => b.id)).toEqual(
        expect.arrayContaining(["1", "3"]),
      );
    });

    it("org filter works across all statuses when statusFilter is 'all'", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      act(() => {
        result.current.setStatusFilter("all");
      });
      act(() => {
        result.current.toggleOrg("Beta Corp");
      });

      expect(result.current.filteredBounties).toHaveLength(1);
      expect(result.current.filteredBounties[0].id).toBe("2");
    });
  });

  describe("reward range filter", () => {
    it("excludes bounties below the minimum reward", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      // Only bounty 3 ($5000) should pass; bounty 1 ($500) is excluded
      act(() => {
        result.current.setRewardRange([1000, 5000]);
      });
      // statusFilter is still 'open' → toUpperCase() = 'OPEN', bounty 2 (IN_PROGRESS) is excluded
      expect(result.current.filteredBounties).toHaveLength(1);
      expect(result.current.filteredBounties[0].id).toBe("3");
    });
  });

  // ── 4. Reset Logic & hasActiveFilters fix ────────────────────────────────
  describe("clearFilters", () => {
    it("restores all 6 states to their default values", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      // Dirty every state
      act(() => {
        result.current.setSearchQuery("login");
        result.current.toggleType("FIXED_PRICE");
        result.current.toggleOrg("Acme");
        result.current.setRewardRange([500, 3000]);
        result.current.setStatusFilter("completed");
        result.current.setSortOption("highest_reward");
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.searchQuery).toBe("");
      expect(result.current.selectedTypes).toEqual([]);
      expect(result.current.selectedOrgs).toEqual([]);
      expect(result.current.rewardRange).toEqual([0, 5000]);
      expect(result.current.statusFilter).toBe("open");
      expect(result.current.sortOption).toBe("newest");
    });

    it("hasActiveFilters becomes false after clearFilters", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      act(() => {
        result.current.setSearchQuery("login");
      });
      expect(result.current.hasActiveFilters).toBe(true);

      act(() => {
        result.current.clearFilters();
      });
      expect(result.current.hasActiveFilters).toBe(false);
    });

    // Regression test for the 'OPEN' vs 'open' bug in the original page.tsx
    it("hasActiveFilters is true when statusFilter is changed from default, and false after reset", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      // Changing status to anything other than lowercase 'open' must activate the flag
      act(() => {
        result.current.setStatusFilter("in_progress");
      });
      expect(result.current.hasActiveFilters).toBe(true);

      act(() => {
        result.current.setStatusFilter("all");
      });
      expect(result.current.hasActiveFilters).toBe(true);

      // Reset must bring it back to false (would have failed with 'OPEN' comparison)
      act(() => {
        result.current.clearFilters();
      });
      expect(result.current.statusFilter).toBe("open");
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  // ── 5. Sort Logic ────────────────────────────────────────────────────────
  describe("sort logic", () => {
    it("newest (default) orders by createdAt descending", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      // statusFilter='open': bounties 1 (Jan 3) and 3 (Jan 1)
      const ids = result.current.filteredBounties.map((b) => b.id);
      expect(ids).toEqual(["1", "3"]);
    });

    it("highest_reward orders by rewardAmount descending", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      act(() => {
        result.current.setSortOption("highest_reward");
      });

      // bounty 3 ($5000) before bounty 1 ($500)
      const ids = result.current.filteredBounties.map((b) => b.id);
      expect(ids).toEqual(["3", "1"]);
    });

    it("recently_updated orders by updatedAt descending", () => {
      const { result } = renderHook(() => useBountyFilters(mockBounties));

      act(() => {
        result.current.setSortOption("recently_updated");
      });

      // bounty 1 (Jan 3) before bounty 3 (Jan 1)
      const ids = result.current.filteredBounties.map((b) => b.id);
      expect(ids).toEqual(["1", "3"]);
    });
  });
});
