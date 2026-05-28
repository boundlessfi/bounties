import { useQueryClient } from "@tanstack/react-query";
import { useCreateBountyMutation } from "@/lib/graphql/generated";
import { toast } from "sonner";
import { bountyKeys } from "@/lib/query/query-keys";

export function useCreateBounty() {
  const queryClient = useQueryClient();

  return useCreateBountyMutation({
    onSuccess: () => {
      toast.success("Bounty created successfully");
      queryClient.invalidateQueries({
        queryKey: bountyKeys.lists(),
      });
    },
    onError: (error) => {
      toast.error("Failed to create bounty");
      console.error("Create bounty error:", error);
    },
  });
}
