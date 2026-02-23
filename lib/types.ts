// Tab types
export type TabType = "projects" | "bounties";

// Sort options
export type SortOption = "newest" | "recentlyUpdated" | "highestReward";

// Filter state
export interface FilterState {
  search: string;
  tags: string[];
  sort: SortOption;
}

// Project status
export type ProjectStatus = "active" | "completed" | "paused";

// Re-export canonical Bounty types from the central types folder
export type {
  Bounty,
  BountyType,
  BountyStatus,
  BountyOrganization,
  BountyProject,
  BountySubmission,
  BountyWindowType,
  BountySubmissionUser,
  BountyCount,
} from "../types/bounty";

// Project interface
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  creator: string;
  category: string;
  milestones?: number;
  completedMilestones?: number;
}

// Bounty types are provided by `types/bounty.ts` (re-exported above)

// Available tags
export const AVAILABLE_TAGS = [
  "DeFi",
  "NFT",
  "Smart Contracts",
  "Frontend",
  "Backend",
  "Full Stack",
  "Design",
  "Documentation",
  "Testing",
  "Security",
  "Analytics",
  "Infrastructure",
  "Mobile",
  "Web3",
  "Stellar",
] as const;

// Sort options configuration
export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "recentlyUpdated", label: "Recently Updated" },
  { value: "highestReward", label: "Highest Reward" },
];

// Tab configuration
export const TABS: { value: TabType; label: string }[] = [
  { value: "projects", label: "Projects" },
  { value: "bounties", label: "Bounties" },
];
