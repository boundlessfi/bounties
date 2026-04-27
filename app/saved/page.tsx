import { getCurrentUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import SavedBountiesClient from "./saved-client";

export default async function SavedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  return <SavedBountiesClient />;
}
