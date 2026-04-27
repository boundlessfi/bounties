import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bounty } from "@/types/bounty";
import { Application, Submission, MilestoneParticipation, CompetitionParticipation } from "@/types/participation";
import { mockBounties } from "./mock-bounty";

/**
 * @deprecated The previous globalThis-based local store is deprecated.
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

function notFoundError(entity: string, id: string) {
  return new Error(`${entity} with id "${id}" was not found in the local query cache.`);
}

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
      let updatedBounty: Bounty | null = null;

      queryClient.setQueryData<Bounty[]>(localStoreKeys.bounties, (current = [...mockBounties]) => {
        const index = current.findIndex((bounty) => bounty.id === id);
        if (index === -1) {
          return current;
        }

        const next = [...current];
        updatedBounty = { ...next[index], ...updates };
        next[index] = updatedBounty;
        return next;
      });

      if (!updatedBounty) {
        throw notFoundError("Bounty", id);
      }

      return updatedBounty;
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
    select: (apps) => (bountyId ? apps.filter((app) => app.bountyId === bountyId) : apps),
  });
}

export function useAddLocalApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (application: Application) => {
      queryClient.setQueryData<Application[]>(localStoreKeys.applications, (current = []) => [
        ...current,
        application,
      ]);

      return application;
    },
  });
}

export function useUpdateLocalApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Application> }) => {
      let updatedApplication: Application | null = null;

      queryClient.setQueryData<Application[]>(localStoreKeys.applications, (current = []) => {
        const index = current.findIndex((application) => application.id === id);
        if (index === -1) {
          return current;
        }

        const next = [...current];
        updatedApplication = { ...next[index], ...updates };
        next[index] = updatedApplication;
        return next;
      });

      if (!updatedApplication) {
        throw notFoundError("Application", id);
      }

      return updatedApplication;
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
    select: (submissions) =>
      bountyId ? submissions.filter((submission) => submission.bountyId === bountyId) : submissions,
  });
}

export function useAddLocalSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (submission: Submission) => {
      queryClient.setQueryData<Submission[]>(localStoreKeys.submissions, (current = []) => [
        ...current,
        submission,
      ]);

      return submission;
    },
  });
}

export function useUpdateLocalSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Submission> }) => {
      let updatedSubmission: Submission | null = null;

      queryClient.setQueryData<Submission[]>(localStoreKeys.submissions, (current = []) => {
        const index = current.findIndex((submission) => submission.id === id);
        if (index === -1) {
          return current;
        }

        const next = [...current];
        updatedSubmission = { ...next[index], ...updates };
        next[index] = updatedSubmission;
        return next;
      });

      if (!updatedSubmission) {
        throw notFoundError("Submission", id);
      }

      return updatedSubmission;
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
    select: (participations) =>
      bountyId
        ? participations.filter((participation) => participation.bountyId === bountyId)
        : participations,
  });
}

export function useAddLocalMilestoneParticipation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (participation: MilestoneParticipation) => {
      queryClient.setQueryData<MilestoneParticipation[]>(
        localStoreKeys.milestoneParticipations,
        (current = []) => [...current, participation],
      );

      return participation;
    },
  });
}

export function useUpdateLocalMilestoneParticipation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<MilestoneParticipation>;
    }) => {
      let updatedParticipation: MilestoneParticipation | null = null;

      queryClient.setQueryData<MilestoneParticipation[]>(
        localStoreKeys.milestoneParticipations,
        (current = []) => {
          const index = current.findIndex((participation) => participation.id === id);
          if (index === -1) {
            return current;
          }

          const next = [...current];
          updatedParticipation = { ...next[index], ...updates };
          next[index] = updatedParticipation;
          return next;
        },
      );

      if (!updatedParticipation) {
        throw notFoundError("Milestone participation", id);
      }

      return updatedParticipation;
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
    select: (participations) =>
      bountyId
        ? participations.filter((participation) => participation.bountyId === bountyId)
        : participations,
  });
}

export function useAddLocalCompetitionParticipation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (participation: CompetitionParticipation) => {
      queryClient.setQueryData<CompetitionParticipation[]>(
        localStoreKeys.competitionParticipations,
        (current = []) => [...current, participation],
      );

      return participation;
    },
  });
}
