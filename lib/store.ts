import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bounty } from "@/types/bounty";
import { Application, Submission, MilestoneParticipation, CompetitionParticipation } from "@/types/participation";
import { mockBounties } from "./mock-bounty";

/**
 * @deprecated The globalThis-based BountyStoreData is deprecated.
 * Server and local state are now managed entirely by TanStack Query.
 * Please use the exported React Query hooks for interacting with local state.
 */

export const localStoreKeys = {
    bounties: ["localStore", "bounties"] as const,
    applications: ["localStore", "applications"] as const,
    submissions: ["localStore", "submissions"] as const,
    milestoneParticipations: ["localStore", "milestoneParticipations"] as const,
    competitionParticipations: ["localStore", "competitionParticipations"] as const,
};

// --- Bounties ---
export function useLocalBounties() {
    return useQuery({
        queryKey: localStoreKeys.bounties,
        queryFn: () => [...mockBounties],
        initialData: () => [...mockBounties],
        staleTime: Infinity,
    });
}

export function useUpdateLocalBounty() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Bounty> }) => {
            const bounties = queryClient.getQueryData<Bounty[]>(localStoreKeys.bounties) || [...mockBounties];
            const index = bounties.findIndex((b) => b.id === id);
            if (index === -1) return null;
            const updated = [...bounties];
            updated[index] = { ...updated[index], ...updates };
            return updated;
        },
        onSuccess: (updated) => {
            if (updated) queryClient.setQueryData(localStoreKeys.bounties, updated);
        },
    });
}

// --- Applications ---
export function useLocalApplications(bountyId?: string) {
    return useQuery({
        queryKey: localStoreKeys.applications,
        queryFn: () => [] as Application[],
        initialData: [],
        staleTime: Infinity,
        select: (apps) => bountyId ? apps.filter((a) => a.bountyId === bountyId) : apps
    });
}

export function useAddLocalApplication() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (app: Application) => {
            const apps = queryClient.getQueryData<Application[]>(localStoreKeys.applications) || [];
            return [...apps, app];
        },
        onSuccess: (updated) => {
            queryClient.setQueryData(localStoreKeys.applications, updated);
        },
    });
}

export function useUpdateLocalApplication() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Application> }) => {
            const apps = queryClient.getQueryData<Application[]>(localStoreKeys.applications) || [];
            const index = apps.findIndex((a) => a.id === id);
            if (index === -1) return null;
            const updated = [...apps];
            updated[index] = { ...updated[index], ...updates };
            return updated;
        },
        onSuccess: (updated) => {
            if (updated) queryClient.setQueryData(localStoreKeys.applications, updated);
        },
    });
}

// --- Submissions ---
export function useLocalSubmissions(bountyId?: string) {
    return useQuery({
        queryKey: localStoreKeys.submissions,
        queryFn: () => [] as Submission[],
        initialData: [],
        staleTime: Infinity,
        select: (subs) => bountyId ? subs.filter((s) => s.bountyId === bountyId) : subs
    });
}

export function useAddLocalSubmission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sub: Submission) => {
            const subs = queryClient.getQueryData<Submission[]>(localStoreKeys.submissions) || [];
            return [...subs, sub];
        },
        onSuccess: (updated) => {
            queryClient.setQueryData(localStoreKeys.submissions, updated);
        },
    });
}

export function useUpdateLocalSubmission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Submission> }) => {
            const subs = queryClient.getQueryData<Submission[]>(localStoreKeys.submissions) || [];
            const index = subs.findIndex((s) => s.id === id);
            if (index === -1) return null;
            const updated = [...subs];
            updated[index] = { ...updated[index], ...updates };
            return updated;
        },
        onSuccess: (updated) => {
            if (updated) queryClient.setQueryData(localStoreKeys.submissions, updated);
        },
    });
}

// --- Milestone Participations ---
export function useLocalMilestoneParticipations(bountyId?: string) {
    return useQuery({
        queryKey: localStoreKeys.milestoneParticipations,
        queryFn: () => [] as MilestoneParticipation[],
        initialData: [],
        staleTime: Infinity,
        select: (mps) => bountyId ? mps.filter((m) => m.bountyId === bountyId) : mps
    });
}

export function useAddLocalMilestoneParticipation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (mp: MilestoneParticipation) => {
            const mps = queryClient.getQueryData<MilestoneParticipation[]>(localStoreKeys.milestoneParticipations) || [];
            return [...mps, mp];
        },
        onSuccess: (updated) => {
            queryClient.setQueryData(localStoreKeys.milestoneParticipations, updated);
        },
    });
}

export function useUpdateLocalMilestoneParticipation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<MilestoneParticipation> }) => {
            const mps = queryClient.getQueryData<MilestoneParticipation[]>(localStoreKeys.milestoneParticipations) || [];
            const index = mps.findIndex((m) => m.id === id);
            if (index === -1) return null;
            const updated = [...mps];
            updated[index] = { ...updated[index], ...updates };
            return updated;
        },
        onSuccess: (updated) => {
            if (updated) queryClient.setQueryData(localStoreKeys.milestoneParticipations, updated);
        },
    });
}

// --- Competition Participations ---
export function useLocalCompetitionParticipations(bountyId?: string) {
    return useQuery({
        queryKey: localStoreKeys.competitionParticipations,
        queryFn: () => [] as CompetitionParticipation[],
        initialData: [],
        staleTime: Infinity,
        select: (cps) => bountyId ? cps.filter((c) => c.bountyId === bountyId) : cps
    });
}

export function useAddLocalCompetitionParticipation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (cp: CompetitionParticipation) => {
            const cps = queryClient.getQueryData<CompetitionParticipation[]>(localStoreKeys.competitionParticipations) || [];
            return [...cps, cp];
        },
        onSuccess: (updated) => {
            queryClient.setQueryData(localStoreKeys.competitionParticipations, updated);
        },
    });
}
