"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { authClient, getErrorMessage } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "github",
      });
      // Success - Better Auth handles redirect and session
    } catch (err: any) {
      // Categorize error and provide specific messages
      let errorMessage = 'An error occurred during sign in. Please try again.';
      
      // Check for popup blocked error
      if (err?.message?.toLowerCase().includes('popup') || 
          err?.message?.toLowerCase().includes('blocked')) {
        errorMessage = 'Popup was blocked by your browser. Please allow popups and try again.';
      }
      // Check for OAuth failure (user denied or GitHub error)
      else if (err?.code === 'OAUTH_ERROR' || 
               err?.message?.toLowerCase().includes('oauth') ||
               err?.message?.toLowerCase().includes('denied') ||
               err?.message?.toLowerCase().includes('authorization')) {
        errorMessage = 'GitHub authorization failed. Please try again.';
      }
      // Check for network errors
      else if (err?.message?.toLowerCase().includes('network') ||
               err?.message?.toLowerCase().includes('fetch') ||
               err?.code === 'NETWORK_ERROR' ||
               err?.name === 'NetworkError') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      // Try to get message from Better Auth error codes
      else if (err?.code) {
        const betterAuthMessage = getErrorMessage(err.code);
        if (betterAuthMessage) {
          errorMessage = betterAuthMessage;
        }
      }
      
      // Display to user
      setError(errorMessage);
      
      // Log for debugging
      console.error('GitHub sign-in failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full px-6">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div
            className={cn(
              "w-full gap-2 flex items-center",
              "justify-between flex-col"
            )}
          >
            <Button
              variant="outline"
              className={cn("w-full gap-2 text-white")}
              disabled={loading}
              onClick={handleGitHubSignIn}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                  ></path>
                </svg>
              )}
              {loading ? "Signing in..." : "Sign in with GitHub"}
            </Button>
            {error && (
              <p className="text-sm text-red-500 text-center mt-2">
                {error}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-center w-full border-t py-4">
          <p className="text-center text-xs text-neutral-500">
            powered by stellar and{" "}
            <Link
              href="https://thirtn.com"
              className="underline"
              target="_blank"
            >
              <span className="dark:text-white/70 cursor-pointer">thirtn.</span>
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
