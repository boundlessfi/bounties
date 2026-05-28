import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server-auth";
import { BountyCreateWizard } from "@/components/bounty/bounty-create-wizard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function CreateBountyPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "sponsor") {
    redirect("/bounty");
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
        <CardHeader className="border-b border-primary/10 pb-4">
          <CardTitle className="text-2xl font-bold">Create a Bounty</CardTitle>
          <CardDescription>
            Post a new bounty to find contributors for your project.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <CardContent className="pt-6">
            <BountyCreateWizard />
          </CardContent>
        </CardContent>
      </Card>
    </div>
  );
}
