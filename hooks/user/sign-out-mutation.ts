import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

interface SignOutOptions {
    redirectTo?: string;
}

// Allowed paths for redirect to prevent open-redirect vulnerabilities
const ALLOWED_REDIRECT_PATHS = ['/auth', '/login', '/', '/bounty', '/projects'];

function isValidRedirect(path: string): boolean {
    // Only allow internal paths starting with /
    if (!path.startsWith('/') || path.startsWith('//')) {
        return false;
    }
    // Check against allowlist or allow any internal path
    return ALLOWED_REDIRECT_PATHS.some(allowed => path === allowed || path.startsWith(allowed + '/'));
}

function getSafeRedirect(redirectTo?: string): string {
    const defaultPath = '/auth';
    if (!redirectTo) return defaultPath;
    return isValidRedirect(redirectTo) ? redirectTo : defaultPath;
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

            return { success: true, redirectTo: getSafeRedirect(options?.redirectTo) };
        },
        onSuccess: (data) => {
            queryClient.clear();
            toast.success('Signed out successfully');
            router.push(data.redirectTo);
        },
        onError: (error: Error) => {
            // Clear cache even on error - better to force re-auth than have stale state
            queryClient.clear();

            // Force clear cookies as fallback if signOut failed
            if (typeof document !== 'undefined') {
                document.cookie.split(';').forEach(cookie => {
                    const name = cookie.split('=')[0].trim();
                    if (name.includes('auth') || name.includes('session')) {
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
                    }
                });
            }

            toast.error(error.message || 'Sign out failed');
            router.push('/auth');
        },
    });
}
