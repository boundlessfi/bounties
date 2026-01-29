import { Bounty } from "@/types/bounty";
import { Application, Submission, MilestoneParticipation } from "@/types/participation";
import { mockBounties } from "./mock-bounty";

class BountyStoreData {
    bounties: Bounty[] = [...mockBounties];
    applications: Application[] = [];
    submissions: Submission[] = [];
    milestoneParticipations: MilestoneParticipation[] = [];
}

const globalStore: BountyStoreData = (global as any).bountyStore || new BountyStoreData();
if (process.env.NODE_ENV !== 'production') (global as any).bountyStore = globalStore;

export const BountyStore = {
    // Bounties
    getBounties: () => globalStore.bounties,
    getBountyById: (id: string) => globalStore.bounties.find((b: Bounty) => b.id === id),

    // Applications (Model 2)
    addApplication: (app: Application) => {
        globalStore.applications.push(app);
        return app;
    },
    getApplicationsByBounty: (bountyId: string) =>
        globalStore.applications.filter((a: Application) => a.bountyId === bountyId),
    getApplicationById: (appId: string) =>
        globalStore.applications.find((a: Application) => a.id === appId),
    updateApplication: (appId: string, updates: Partial<Application>) => {
        const index = globalStore.applications.findIndex((a: Application) => a.id === appId);
        if (index === -1) return null;
        globalStore.applications[index] = { ...globalStore.applications[index], ...updates };
        return globalStore.applications[index];
    },

    // Submissions (Model 3)
    addSubmission: (sub: Submission) => {
        globalStore.submissions.push(sub);
        return sub;
    },
    getSubmissionsByBounty: (bountyId: string) =>
        globalStore.submissions.filter((s: Submission) => s.bountyId === bountyId),
    getSubmissionById: (subId: string) =>
        globalStore.submissions.find((s: Submission) => s.id === subId),
    updateSubmission: (subId: string, updates: Partial<Submission>) => {
        const index = globalStore.submissions.findIndex((s: Submission) => s.id === subId);
        if (index === -1) return null;
        globalStore.submissions[index] = { ...globalStore.submissions[index], ...updates };
        return globalStore.submissions[index];
    },

    // Milestones (Model 4)
    addMilestoneParticipation: (mp: MilestoneParticipation) => {
        globalStore.milestoneParticipations.push(mp);
        return mp;
    },
    getMilestoneParticipationsByBounty: (bountyId: string) =>
        globalStore.milestoneParticipations.filter((m: MilestoneParticipation) => m.bountyId === bountyId),
    updateMilestoneParticipation: (participationId: string, updates: Partial<MilestoneParticipation>) => {
        const index = globalStore.milestoneParticipations.findIndex((m: MilestoneParticipation) => m.id === participationId);
        if (index === -1) return null;
        globalStore.milestoneParticipations[index] = { ...globalStore.milestoneParticipations[index], ...updates };
        return globalStore.milestoneParticipations[index];
    }
};
