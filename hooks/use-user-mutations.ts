import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { authKeys } from "@/lib/query/query-keys";

export interface UpdateUserParams {
  name?: string;
  image?: string;
  bio?: string;
  github?: string;
  twitter?: string;
  website?: string;
}

export async function updateUser(params: UpdateUserParams) {
  try {
    const response = await authClient.updateUser(
      params as Parameters<typeof authClient.updateUser>[0],
    );

    if (!response.data) {
      throw new Error("Failed to update user profile");
    }

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`User update failed: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while updating user profile");
  }
}

export type UpdateUserData = Awaited<ReturnType<typeof updateUser>>;

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      toast.success("Profile updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user profile");
    },
  });
}

async function deleteAccount() {
  const response = await authClient.deleteUser();
  if (response.error) {
    throw new Error(response.error.message || "Failed to delete account");
  }
  return response.data;
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete account");
    },
  });
}
