import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient, getErrorMessage } from '@/lib/auth-client';
import { toast } from 'sonner';

interface RevokeSessionInput {
    sessionToken: string;
}

// Query key for sessions
export const sessionKeys = {
    all: ['sessions'] as const,
    list: () => [...sessionKeys.all, 'list'] as const,
};

export function useRevokeSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: RevokeSessionInput) => {
            const { error } = await authClient.revokeSession({
                token: input.sessionToken,
            });

            if (error) {
                throw new Error(getErrorMessage(error.code ?? '') || error.message || 'Failed to revoke session');
            }

            return { success: true, sessionToken: input.sessionToken };
        },
        onSuccess: () => {
            // Invalidate sessions list
            queryClient.invalidateQueries({ queryKey: sessionKeys.list() });
            toast.success('Session revoked successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to revoke session');
        },
    });
}

export function useRevokeOtherSessions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { error } = await authClient.revokeOtherSessions();

            if (error) {
                throw new Error(getErrorMessage(error.code ?? '') || error.message || 'Failed to revoke sessions');
            }

            return { success: true };
        },
        onSuccess: () => {
            // Invalidate sessions list
            queryClient.invalidateQueries({ queryKey: sessionKeys.list() });
            toast.success('All other sessions revoked');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to revoke sessions');
        },
    });
}
