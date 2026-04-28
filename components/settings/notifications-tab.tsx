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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

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
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [isPending, setIsPending] = useState(false);

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
      // TODO: wire to backend notification preferences endpoint
      toast.info(
        "Notification preferences saved locally. Backend sync coming soon.",
      );
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
