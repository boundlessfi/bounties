import { Milestone, ContributorProgress } from "@/types/bounty";

export const MOCK_MODEL4_MILESTONES: Milestone[] = [
  {
    id: "m1",
    title: "Milestone 1: Design",
    description: "Design the UI/UX for the feature.",
    isCompleted: true,
  },
  {
    id: "m2",
    title: "Milestone 2: Frontend",
    description: "Implement the frontend components.",
    isCompleted: true,
  },
  {
    id: "m3",
    title: "Milestone 3: Backend",
    description: "Develop the API and database integration.",
    isCompleted: false,
  },
  {
    id: "m4",
    title: "Milestone 4: Review",
    description: "Final review and testing.",
    isCompleted: false,
  },
  {
    id: "m5",
    title: "Milestone 5: Deployment",
    description: "Deploy to production.",
    isCompleted: false,
  },
];

export const MOCK_MODEL4_CONTRIBUTORS: ContributorProgress[] = [
  {
    userId: "u1",
    userName: "Alice",
    userAvatarUrl: "https://github.com/shadcn.png",
    currentMilestoneId: "m3",
  },
  {
    userId: "u2",
    userName: "Bob",
    userAvatarUrl: "https://github.com/vercel.png",
    currentMilestoneId: "m3",
  },
  {
    userId: "u3",
    userName: "Charlie",
    userAvatarUrl: "https://github.com/steven-tey.png",
    currentMilestoneId: "m3",
  },
  {
    userId: "u4",
    userName: "David",
    userAvatarUrl: "https://github.com/nutlope.png",
    currentMilestoneId: "m4",
  },
];
