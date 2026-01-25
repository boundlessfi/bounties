import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

interface SignOutOptions {
    redirectTo?: string;
}

export function useSignOut() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (options?: SignOutOptions) => {
            const { error } = await authClient.signOut();

            if (error) {
                throw new Error('Failed to sign out');
            }

            return { success: true, redirectTo: options?.redirectTo ?? '/auth' };
        },
        onSuccess: (data) => {
            // Clear all cached queries
            queryClient.clear();
            toast.success('Signed out successfully');
            router.push(data.redirectTo);
        },
        onError: (error: Error) => {
            // Still clear cache and redirect on error
            queryClient.clear();
            toast.error(error.message || 'Sign out failed');
            router.push('/auth');
        },
    });
}
