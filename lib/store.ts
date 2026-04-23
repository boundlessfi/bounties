import { Bounty } from "@/types/bounty";
import { Application, Submission, MilestoneParticipation, CompetitionParticipation } from "@/types/participation";
import { mockBounties } from "./mock-bounty";

/**
 * @deprecated Use TanStack Query hooks (e.g., useBounty, useBounties) for data fetching.
 * For local state management, use queryClient.setQueryData with appropriate query keys.
 * globalThis.bountyStore is being removed to ensure SSR compatibility.
 */
class BountyStoreData {
    bounties: Bounty[] = [...mockBounties];
    applications: Application[] = [];
    submissions: Submission[] = [];
    milestoneParticipations: MilestoneParticipation[] = [];
    competitionParticipations: CompetitionParticipation[] = [];
}

// Internal mock store for API routes (Server-only persistence during dev)
const serverStore = new BountyStoreData();

/**
 * BountyStore provides imperative access to mock data.
 * This is being deprecated in favor of TanStack Query patterns for client state
 * and proper API/Database patterns for server state.
 */
export const BountyStore = {
    // Bounties
    getBounties: () => serverStore.bounties,
    getBountyById: (id: string) => serverStore.bounties.find((b: Bounty) => b.id === id),

    // Applications (Model 2)
    addApplication: (app: Application) => {
        serverStore.applications.push(app);
        return app;
    },
    getApplicationsByBounty: (bountyId: string) =>
        serverStore.applications.filter((a: Application) => a.bountyId === bountyId),
    getApplicationById: (appId: string) =>
        serverStore.applications.find((a: Application) => a.id === appId),
    updateApplication: (appId: string, updates: Partial<Application>) => {
        const index = serverStore.applications.findIndex((a: Application) => a.id === appId);
        if (index === -1) return null;
        serverStore.applications[index] = { ...serverStore.applications[index], ...updates };
        return serverStore.applications[index];
    },

    // Submissions (Model 3)
    addSubmission: (sub: Submission) => {
        serverStore.submissions.push(sub);
        return sub;
    },
    getSubmissionsByBounty: (bountyId: string) =>
        serverStore.submissions.filter((s: Submission) => s.bountyId === bountyId),
    getSubmissionById: (subId: string) =>
        serverStore.submissions.find((s: Submission) => s.id === subId),
    updateSubmission: (subId: string, updates: Partial<Submission>) => {
        const index = serverStore.submissions.findIndex((s: Submission) => s.id === subId);
        if (index === -1) return null;
        serverStore.submissions[index] = { ...serverStore.submissions[index], ...updates };
        return serverStore.submissions[index];
    },

    // Milestones (Model 4)
    addMilestoneParticipation: (mp: MilestoneParticipation) => {
        serverStore.milestoneParticipations.push(mp);
        return mp;
    },
    getMilestoneParticipationsByBounty: (bountyId: string) =>
        serverStore.milestoneParticipations.filter((m: MilestoneParticipation) => m.bountyId === bountyId),
    updateMilestoneParticipation: (participationId: string, updates: Partial<MilestoneParticipation>) => {
        const index = serverStore.milestoneParticipations.findIndex((m: MilestoneParticipation) => m.id === participationId);
        if (index === -1) return null;
        serverStore.milestoneParticipations[index] = { ...serverStore.milestoneParticipations[index], ...updates };
        return serverStore.milestoneParticipations[index];
    },

    // Competitions
    addCompetitionParticipation: (cp: CompetitionParticipation) => {
        serverStore.competitionParticipations.push(cp);
        return cp;
    },
    getCompetitionParticipationsByBounty: (bountyId: string) =>
        serverStore.competitionParticipations.filter((c: CompetitionParticipation) => c.bountyId === bountyId),

    // Generic Bounty Update (for status changes)
    updateBounty: (bountyId: string, updates: Partial<Bounty>) => {
        const index = serverStore.bounties.findIndex((b: Bounty) => b.id === bountyId);
        if (index === -1) return null;
        serverStore.bounties[index] = { ...serverStore.bounties[index], ...updates };
        return serverStore.bounties[index];
    }
};
