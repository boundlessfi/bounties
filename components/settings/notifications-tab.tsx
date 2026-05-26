"use client";

import { Fragment, useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MailOpen } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import {
  useNotifications,
  type NotificationItem,
  type NotificationType,
} from "@/hooks/use-notifications";

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

const digestTypeLabels: Record<NotificationType, string> = {
  "bounty-updated": "New bounties",
  "saved-bounty-updated": "New bounties",
  "new-application": "Application updates",
  "submission-reviewed": "Application updates",
};

const digestGroupOrder = [
  "New bounties",
  "Application updates",
  "Bounty completed",
  "Mentions and replies",
] as const;

function formatDigestTime(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadPrefs);
  const [isPending, setIsPending] = useState(false);
  const { data: session } = authClient.useSession();
  const { notifications } = useNotifications();

  const digestGroups = useMemo(() => {
    const groups = new Map<string, NotificationItem[]>();

    for (const item of notifications) {
      const label = digestTypeLabels[item.type];
      if (!label) continue;

      const current = groups.get(label) ?? [];
      if (current.length < 3) {
        groups.set(label, [...current, item]);
      }
    }

    return digestGroupOrder
      .map((label) => ({ label, items: groups.get(label) ?? [] }))
      .filter((group) => group.items.length > 0);
  }, [notifications]);

  const digestSubtitle =
    prefs.digestCadence === "weekly"
      ? "Sent every Monday at 9am"
      : "Sent every morning at 9am";

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

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label>Email digest</Label>
          <p className="text-sm text-muted-foreground">
            Receive a summary of activity at your chosen cadence.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
                type="button"
                variant="outline"
                disabled={prefs.digestCadence === "off"}
              >
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Email digest preview</DialogTitle>
                <DialogDescription>
                  A representative {prefs.digestCadence} summary for{" "}
                  {session?.user?.name ?? "your account"}. {digestSubtitle}.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border bg-muted/20 p-5">
                <div className="mb-5 flex items-start gap-3">
                  <div className="rounded-full bg-background p-2">
                    <MailOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Hi {session?.user?.name ?? "there"},
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Here is your latest Boundless bounty activity.
                    </p>
                  </div>
                </div>

                {digestGroups.length > 0 ? (
                  <div className="space-y-5">
                    {digestGroups.map((group) => (
                      <section key={group.label} className="space-y-2">
                        <h4 className="text-sm font-semibold">
                          {group.label}
                        </h4>
                        <div className="space-y-2">
                          {group.items.map((item) => (
                            <div
                              key={`${item.type}-${item.id}`}
                              className="rounded-md border bg-background p-3"
                            >
                              <p className="text-sm">{item.message}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatDigestTime(item.timestamp)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
                    Recent notification activity will appear here before each
                    digest is sent.
                  </p>
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
