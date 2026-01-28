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

// Bounty status
export type BountyStatus = "open" | "in-progress" | "completed";

// Project interface
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  creator: string;
  category: string;
  milestones?: number;
  completedMilestones?: number;
}

// Bounty interface
export interface Bounty {
  id: string;
  title: string;
  description: string;
  tags: string[];
  reward: number;
  currency: string;
  claimingModel: "single-claim" | "application" | "competition" | "multi-winner";
  status: BountyStatus;
  createdAt: Date;
  updatedAt: Date;
  creator: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  deadline?: Date;
}

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
