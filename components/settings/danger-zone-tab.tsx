"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, TriangleAlert } from "lucide-react";
import { useDeleteAccountMutation } from "@/hooks/use-user-mutations";
import { useRouter } from "next/navigation";

const CONFIRM_PHRASE = "delete my account";

export function DangerZoneTab() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();
  const { mutateAsync, isPending } = useDeleteAccountMutation();

  const handleDelete = async () => {
    try {
      await mutateAsync();
      setOpen(false);
      router.push("/auth");
    } catch {
      // error toast handled in mutation
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setConfirmText("");
    setOpen(next);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 flex gap-3">
        <TriangleAlert className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-destructive">Delete account</p>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
        </div>
      </div>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete Account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account, profile, and all
              activity. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-delete">
              Type{" "}
              <span className="font-mono font-semibold">{CONFIRM_PHRASE}</span>{" "}
              to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              autoComplete="off"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={confirmText !== CONFIRM_PHRASE || isPending}
              onClick={handleDelete}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
