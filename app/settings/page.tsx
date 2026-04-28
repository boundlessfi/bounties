import { getCurrentUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  return <SettingsClient user={user} />;
}
