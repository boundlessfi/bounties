"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  useAdminDisputeDetailQuery, 
  useResolveDisputeMutation,
  DisputeResolutionEnum 
} from "@/lib/graphql/generated";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Gavel, ArrowLeft, ShieldCheck, ShieldX, Info } from "lucide-react";

interface DisputePageProps {
  params: Promise<{ disputeId: string }>;
}

export default function DisputeReviewPage({ params }: DisputePageProps) {
  const { disputeId } = use(params);
  const router = useRouter();
  const [resolutionNotes, setResolutionNotes] = useState("");

  const { data, isLoading, error } = useAdminDisputeDetailQuery({
    id: disputeId,
  });

  const resolveMutation = useResolveDisputeMutation({
    onSuccess: () => {
      toast.success("Dispute resolved successfully");
      router.push("/admin/disputes");
    },
    onError: (err: Error) => {
      toast.error(`Failed to resolve dispute: ${err.message}`);
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.adminDisputeDetail) {
    return (
      <div className="p-8 text-center border rounded-xl bg-muted/20">
        <h1 className="text-2xl font-bold">Dispute not found</h1>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const dispute = data.adminDisputeDetail;

  const handleResolve = (resolution: DisputeResolutionEnum) => {
    if (!resolutionNotes.trim()) {
      toast.error("Please provide resolution notes");
      return;
    }

    resolveMutation.mutate({
      id: disputeId,
      input: {
        resolution,
        resolutionNotes,
      }
    });
  };

  return (
    <div className="container max-w-4xl py-10 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Disputes
      </Button>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gavel className="h-8 w-8 text-primary" />
            Dispute Review
          </h1>
          <p className="text-muted-foreground font-mono text-sm">Case #{disputeId}</p>
        </div>
        <Badge variant={dispute.status === 'OPEN' ? 'default' : 'secondary'} className="px-3 py-1">
          {dispute.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-800 bg-background-card">
          <CardHeader>
            <CardTitle className="text-lg">Dispute Statement</CardTitle>
            <CardDescription>Filed by participant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase text-gray-500 tracking-wider">Reason</Label>
              <p className="font-medium text-gray-200">{dispute.reason.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <Label className="text-[10px] uppercase text-gray-500 tracking-wider">Description</Label>
              <p className="mt-1 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {dispute.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-background-card">
          <CardHeader>
            <CardTitle className="text-lg">Reference Context</CardTitle>
            <CardDescription>Targeted campaign data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase text-gray-500 tracking-wider">Campaign ID</Label>
              <p className="text-sm font-mono text-gray-400">{dispute.campaignId}</p>
            </div>
            {dispute.milestoneId && (
              <div>
                <Label className="text-[10px] uppercase text-gray-500 tracking-wider">Milestone ID</Label>
                <p className="text-sm font-mono text-gray-400">{dispute.milestoneId}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-2xl">
        <CardHeader>
          <CardTitle>Arbitration Decision</CardTitle>
          <CardDescription>Select a resolution and provide justification.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Resolution Notes</Label>
            <Textarea
              id="notes"
              placeholder="Explain the evidence considered and the reasoning behind your decision..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="min-h-[120px] bg-background"
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button 
              onClick={() => handleResolve(DisputeResolutionEnum.Dismissed)}
              className="flex-1 gap-2 h-11"
              variant="default"
              disabled={resolveMutation.isPending}
            >
              <ShieldCheck className="h-4 w-4" />
              Approve Contributor
            </Button>
            <Button 
              onClick={() => handleResolve(DisputeResolutionEnum.FullRefund)}
              className="flex-1 gap-2 h-11"
              variant="destructive"
              disabled={resolveMutation.isPending}
            >
              <ShieldX className="h-4 w-4" />
              Approve Sponsor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}