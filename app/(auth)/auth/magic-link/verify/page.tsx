"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCallback = "/bounty";
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");
      const rawCallbackURL = searchParams.get("callbackURL") ?? defaultCallback;
      const isSafeRelativeCallback =
        rawCallbackURL.startsWith("/") &&
        !rawCallbackURL.startsWith("//") &&
        !rawCallbackURL.includes("\\") &&
        !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(rawCallbackURL);
      const validatedCallback = isSafeRelativeCallback
        ? rawCallbackURL
        : defaultCallback;

      if (!token) {
        setStatus("error");
        setError("Missing verification token.");
        return;
      }

      try {
        const { error } = await authClient.magicLink.verify({
          query: {
            token,
          },
        });

        if (error) {
          setStatus("error");
          setError(error.message || "Failed to verify magic link.");
        } else {
          setStatus("success");
          toast.success("Successfully verified! Redirecting...");
          // Redirect is handled by Better Auth if successful,
          // but we can also manually redirect if needed after a short delay
          setTimeout(() => {
            router.push(validatedCallback);
          }, 2000);
        }
      } catch (err) {
        setStatus("error");
        setError("An unexpected error occurred. Please try again.");
        console.error(err);
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            )}
            {status === "error" && (
              <AlertCircle className="h-12 w-12 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Verifying your magic link"}
            {status === "success" && "Verification successful"}
            {status === "error" && "Verification failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" &&
              "Please wait while we confirm your identity..."}
            {status === "success" &&
              "You've been successfully signed in. Redirecting you now..."}
            {status === "error" &&
              (error || "The magic link is invalid or has expired.")}
          </CardDescription>
        </CardHeader>
        {status === "error" && (
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/auth">Back to Login</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function MagicLinkVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
