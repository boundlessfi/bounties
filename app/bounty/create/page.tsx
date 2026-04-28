import { getCurrentUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { BountyCreateForm } from "@/components/bounty/bounty-create-form";

export default async function CreateBountyPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <main className="min-h-screen bg-background text-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <BountyCreateForm />
        </div>
      </div>
    </main>
  );
}
