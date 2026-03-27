"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { BountyApplicationProposal } from "@/hooks/use-bounty-application";

interface ApplicationDialogProps {
  bountyTitle: string;
  onApply: (data: BountyApplicationProposal) => Promise<boolean>;
  trigger: React.ReactNode;
}

export function ApplicationDialog({
  bountyTitle,
  onApply,
  trigger,
}: ApplicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [approach, setApproach] = useState("");
  const [timeline, setTimeline] = useState("");
  const [relevantExperience, setRelevantExperience] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");

  const proposal = useMemo<BountyApplicationProposal>(
    () => ({
      approach: approach.trim(),
      timeline: timeline.trim(),
      relevantExperience: relevantExperience.trim(),
      portfolioLinks: portfolioLinks
        .split("\n")
        .map((link) => link.trim())
        .filter(Boolean),
    }),
    [approach, timeline, relevantExperience, portfolioLinks],
  );

  const isComplete =
    Boolean(proposal.approach) &&
    Boolean(proposal.timeline) &&
    Boolean(proposal.relevantExperience);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isComplete) return;

    setLoading(true);
    try {
      const success = await onApply(proposal);
      if (success) {
        setOpen(false);
        setApproach("");
        setTimeline("");
        setRelevantExperience("");
        setPortfolioLinks("");
        setShowPreview(false);
      }
    } catch (error) {
      console.error("Failed to submit application", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[640px] bg-background text-foreground border-border">
        <DialogHeader>
          <DialogTitle>Apply for Bounty</DialogTitle>
          <DialogDescription>
            Submit a structured proposal for &quot;{bountyTitle}&quot; with your
            approach, timeline, and relevant proof of work.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Approach</Badge>
              <Badge variant="secondary">Timeline</Badge>
              <Badge variant="secondary">Experience</Badge>
              <Badge variant="secondary">Portfolio</Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview((current) => !current)}
            >
              {showPreview ? "Back to form" : "Preview proposal"}
            </Button>
          </div>

          {showPreview ? (
            <div className="grid gap-4 rounded-xl border border-border/70 bg-card/50 p-4">
              <div className="space-y-1">
                <Label>Approach</Label>
                <p className="text-sm text-muted-foreground">
                  {proposal.approach ||
                    "Add a short plan for how you will tackle the bounty."}
                </p>
              </div>
              <div className="space-y-1">
                <Label>Estimated timeline</Label>
                <p className="text-sm text-muted-foreground">
                  {proposal.timeline || "Share when you expect to deliver."}
                </p>
              </div>
              <div className="space-y-1">
                <Label>Relevant experience</Label>
                <p className="text-sm text-muted-foreground">
                  {proposal.relevantExperience ||
                    "Call out the work that makes you a strong fit."}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Portfolio links</Label>
                {proposal.portfolioLinks.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {proposal.portfolioLinks.map((link) => (
                      <a
                        key={link}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No portfolio links added yet.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="application-approach">Approach</Label>
                <Textarea
                  id="application-approach"
                  placeholder="Explain how you would break down the work, de-risk delivery, and communicate progress."
                  className="min-h-[120px]"
                  value={approach}
                  onChange={(event) => setApproach(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="application-timeline">Estimated Timeline</Label>
                <Input
                  id="application-timeline"
                  placeholder="Example: 3 business days for first draft, 5 days for final delivery"
                  value={timeline}
                  onChange={(event) => setTimeline(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="application-experience">
                  Relevant Experience
                </Label>
                <Textarea
                  id="application-experience"
                  placeholder="Summarize past work, similar bounties, or domain expertise."
                  className="min-h-[100px]"
                  value={relevantExperience}
                  onChange={(event) => setRelevantExperience(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="application-portfolio">
                  Portfolio / Past Work Links
                </Label>
                <Textarea
                  id="application-portfolio"
                  placeholder="One link per line"
                  className="min-h-[96px]"
                  value={portfolioLinks}
                  onChange={(event) => setPortfolioLinks(event.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !isComplete}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
