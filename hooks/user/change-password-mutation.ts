import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authClient, getErrorMessage } from '@/lib/auth-client';
import { toast } from 'sonner';

/**
 * Input for change password mutation
 * Note: confirmPassword validation should be done at the form level
 * before calling this mutation
 */
interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
    revokeOtherSessions?: boolean;
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain a lowercase letter' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain an uppercase letter' };
    }
    if (!/\d/.test(password)) {
        return { valid: false, message: 'Password must contain a number' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { valid: false, message: 'Password must contain a special character' };
    }
    return { valid: true };
}

export function useChangePassword() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (input: ChangePasswordInput) => {
            // Validate new password strength
            const validation = validatePassword(input.newPassword);
            if (!validation.valid) {
                throw new Error(validation.message);
            }

            const { error } = await authClient.changePassword({
                currentPassword: input.currentPassword,
                newPassword: input.newPassword,
                revokeOtherSessions: input.revokeOtherSessions ?? false,
            });

            if (error) {
                throw new Error(getErrorMessage(error.code ?? '') || error.message || 'Failed to change password');
            }

            return { success: true };
        },
        onSuccess: async (_data, variables) => {
            toast.success('Password changed successfully');

            // If revoking other sessions, sign out current session and redirect
            if (variables.revokeOtherSessions) {
                await authClient.signOut();
                queryClient.clear();
                router.push('/auth');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to change password');
        },
    });
}
