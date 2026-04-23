"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  FileText,
  User,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResolveDisputeMutation } from "@/hooks/use-dispute-mutations";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/graphql/client";

export default function DisputeReviewPage() {
  const params = useParams();
  const disputeId = params.disputeId as string;
  const { mutateAsync: resolveDispute, isPending: isResolving } = useResolveDisputeMutation();
  const { data: session } = authClient.useSession();

  const [requestInfoDialogOpen, setRequestInfoDialogOpen] = useState(false);
  const [additionalInfoRequest, setAdditionalInfoRequest] = useState("");

  // Fetch dispute details using standard query (placeholder for generated hook)
  const { data: disputeData, isLoading, isError, error } = useQuery({
    queryKey: ["dispute", disputeId],
    queryFn: fetcher<any, { id: string }>(`
      query AdminDisputeDetail($id: ID!) {
        adminDisputeDetail(id: $id) {
          id
          status
          reason
          description
          createdAt
          updatedAt
          resolutionNotes
          bounty {
            title
            organization { name }
          }
          contributor {
            id
            name
            username
          }
          submission {
            githubPullRequestUrl
            createdAt
          }
        }
      }
    `, { id: disputeId }),
    enabled: !!disputeId,
  });

  const dispute = disputeData?.adminDisputeDetail;
  const isReviewer = session?.user?.role === "ADMIN" || session?.user?.role === "REVIEWER";

  const handleResolve = async (resolution: "APPROVED_CONTRIBUTOR" | "APPROVED_SPONSOR") => {
    try {
      await resolveDispute({
        id: disputeId,
        input: {
          resolution: resolution === "APPROVED_CONTRIBUTOR" ? "DISMISSED" : "FULL_REFUND",
          resolutionNotes: `Decision made by reviewer. Result: ${resolution}.`,
        },
      });
      toast.success("Dispute resolved successfully");
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
      toast.error("Failed to resolve dispute. Please try again.");
    }
  };

  const handleRequestAdditionalInfo = async () => {
    toast.success("Request for additional information sent.");
    setRequestInfoDialogOpen(false);
    setAdditionalInfoRequest("");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-32 text-center">
        <Loader2 className="size-8 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading dispute details...</p>
      </div>
    );
  }

  if (isError || !dispute) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-32 text-center">
        <AlertCircle className="size-8 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-200 mt-4">Failed to load dispute</h2>
        <p className="text-gray-400 text-sm mt-2">{error?.message || "Not found"}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/bounty/review">Back to Reviews</Link>
        </Button>
      </div>
    );
  }

  if (!isReviewer) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-32 text-center">
        <XCircle className="size-8 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-200 mt-4">Access Denied</h2>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/bounty/review">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reviews
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Dispute Resolution</h1>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 capitalize">
              {dispute.status.replace(/_/g, ' ').toLowerCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Mediating conflict for: <span className="font-medium text-foreground">{dispute.bounty?.title || 'N/A'}</span>
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setRequestInfoDialogOpen(true)} disabled={isResolving}>
            Request Info
          </Button>
          <Button 
            variant="outline" 
            className="border-green-500/50 text-green-500 hover:bg-green-500/10"
            onClick={() => handleResolve("APPROVED_CONTRIBUTOR")}
            disabled={isResolving}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve Contributor
          </Button>
          <Button variant="destructive" onClick={() => handleResolve("APPROVED_SPONSOR")} disabled={isResolving}>
            <XCircle className="mr-2 h-4 w-4" />
            Approve Sponsor
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <User className="h-5 w-5" />
            <h2 className="font-semibold text-lg">Contributor</h2>
          </div>
          <Separator />
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">User</p>
              <p>{dispute.contributor?.name || 'N/A'} (@{dispute.contributor?.username || 'N/A'})</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Submission</p>
              {dispute.submission?.githubPullRequestUrl ? (
                <a href={dispute.submission.githubPullRequestUrl} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                  <FileText className="h-3 w-3" /> View on GitHub
                </a>
              ) : <p className="text-sm">No URL provided</p>}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Submitted At</p>
              <p className="text-sm">{dispute.submission?.createdAt ? new Date(dispute.submission.createdAt).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Building2 className="h-5 w-5" />
            <h2 className="font-semibold text-lg">Sponsor</h2>
          </div>
          <Separator />
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Organization</p>
              <p>{dispute.bounty?.organization?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Latest Feedback</p>
              <p className="text-sm bg-muted/50 p-3 rounded-lg italic border-l-4 border-primary">
                "{dispute.resolutionNotes || 'No specific feedback provided yet.'}"
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6 space-y-4">
        <div className="flex items-center gap-2 text-yellow-500">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="font-semibold text-lg">Grounds for Dispute</h2>
        </div>
        <Separator className="bg-yellow-500/20" />
        <div className="space-y-3">
          <p className="font-medium text-foreground capitalize">{dispute.reason.replace(/_/g, ' ').toLowerCase()}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{dispute.description || 'No detailed description provided.'}</p>
        </div>
      </div>

      <Dialog open={requestInfoDialogOpen} onOpenChange={setRequestInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Additional Information</DialogTitle>
            <DialogDescription>Describe what information is needed from the participants.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., Please provide screenshots or clarify requirements..."
            value={additionalInfoRequest}
            onChange={(e) => setAdditionalInfoRequest(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestInfoDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRequestAdditionalInfo} disabled={!additionalInfoRequest.trim()}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}