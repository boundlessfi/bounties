"use client";

import { Fragment, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Eye, Mail } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNotifications } from "@/hooks/use-notifications";
import { authClient } from "@/lib/auth-client";

interface NotificationPrefs {
  newBounty: { inApp: boolean; email: boolean };
  applicationUpdate: { inApp: boolean; email: boolean };
  bountyCompleted: { inApp: boolean; email: boolean };
  mentions: { inApp: boolean; email: boolean };
  digestCadence: "off" | "daily" | "weekly";
}

const defaultPrefs: NotificationPrefs = {
  newBounty: { inApp: true, email: false },
  applicationUpdate: { inApp: true, email: true },
  bountyCompleted: { inApp: true, email: true },
  mentions: { inApp: true, email: false },
  digestCadence: "off",
};

const STORAGE_KEY = "notification-prefs";

function loadPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return defaultPrefs;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as NotificationPrefs) : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

const eventLabels: Record<
  keyof Omit<NotificationPrefs, "digestCadence">,
  string
> = {
  newBounty: "New bounties posted",
  applicationUpdate: "Application status updates",
  bountyCompleted: "Bounty completed",
  mentions: "Mentions and replies",
};

export function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadPrefs);
  const [isPending, setIsPending] = useState(false);
  const { notifications } = useNotifications();
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name || "User";

  // Group notifications for digest
  const bountyUpdates = notifications
    .filter(
      (n) => n.type === "bounty-updated" || n.type === "saved-bounty-updated",
    )
    .slice(0, 3);
  const applications = notifications
    .filter((n) => n.type === "new-application")
    .slice(0, 3);
  const submissions = notifications
    .filter((n) => n.type === "submission-reviewed")
    .slice(0, 3);
  const mentions = notifications
    .filter((n) => n.type === ("mentions" as string))
    .slice(0, 3);

  const toggleChannel = (
    event: keyof Omit<NotificationPrefs, "digestCadence">,
    channel: "inApp" | "email",
  ) => {
    setPrefs((prev) => ({
      ...prev,
      [event]: { ...prev[event], [channel]: !prev[event][channel] },
    }));
  };

  const handleSave = async () => {
    setIsPending(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      toast.success("Notification preferences saved.");
    } catch {
      toast.error("Failed to save notification preferences.");
    } finally {
      setIsPending(false);
    }
  };

  const eventKeys = Object.keys(eventLabels) as Array<keyof typeof eventLabels>;

  return (
    <div className="space-y-6">
      <div>
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 gap-y-4">
          <div />
          <span className="text-sm font-medium text-muted-foreground text-center">
            In-app
          </span>
          <span className="text-sm font-medium text-muted-foreground text-center">
            Email
          </span>

          {eventKeys.map((key) => (
            <Fragment key={key}>
              <Label className="text-sm">{eventLabels[key]}</Label>
              <div className="flex justify-center">
                <Switch
                  checked={prefs[key].inApp}
                  onCheckedChange={() => toggleChannel(key, "inApp")}
                  aria-label={`${eventLabels[key]} in-app notification`}
                />
              </div>
              <div className="flex justify-center">
                <Switch
                  checked={prefs[key].email}
                  onCheckedChange={() => toggleChannel(key, "email")}
                  aria-label={`${eventLabels[key]} email notification`}
                />
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label>Email digest</Label>
          <p className="text-sm text-muted-foreground">
            Receive a summary of activity at your chosen cadence.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={prefs.digestCadence}
            onValueChange={(value: NotificationPrefs["digestCadence"]) =>
              setPrefs((prev) => ({ ...prev, digestCadence: value }))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Off</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={prefs.digestCadence === "off"}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Your Email Digest
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4 p-4 border rounded-md bg-muted/20">
                <div className="text-center space-y-1 pb-4 border-b">
                  <h3 className="font-semibold text-lg">Hi {userName},</h3>
                  <p className="text-sm text-muted-foreground">
                    Here is your {prefs.digestCadence} summary.
                    <br />
                    (Sent every{" "}
                    {prefs.digestCadence === "weekly" ? "Monday" : "morning"} at
                    9am)
                  </p>
                </div>

                {bountyUpdates.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-primary">
                      Bounty Updates
                    </h4>
                    <ul className="space-y-2">
                      {bountyUpdates.map((n) => (
                        <li
                          key={n.id}
                          className="text-sm border-l-2 border-primary/30 pl-3 py-1"
                        >
                          {n.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {applications.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-primary">
                      New Applications
                    </h4>
                    <ul className="space-y-2">
                      {applications.map((n) => (
                        <li
                          key={n.id}
                          className="text-sm border-l-2 border-primary/30 pl-3 py-1"
                        >
                          {n.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {submissions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-primary">
                      Reviewed Submissions
                    </h4>
                    <ul className="space-y-2">
                      {submissions.map((n) => (
                        <li
                          key={n.id}
                          className="text-sm border-l-2 border-primary/30 pl-3 py-1"
                        >
                          {n.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {mentions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-primary">
                      Mentions
                    </h4>
                    <ul className="space-y-2">
                      {mentions.map((n) => (
                        <li
                          key={n.id}
                          className="text-sm border-l-2 border-primary/30 pl-3 py-1"
                        >
                          {n.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {bountyUpdates.length === 0 &&
                  applications.length === 0 &&
                  submissions.length === 0 &&
                  mentions.length === 0 && (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      No recent activity to show in your digest.
                    </div>
                  )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Preferences"
        )}
      </Button>
    </div>
  );
}
