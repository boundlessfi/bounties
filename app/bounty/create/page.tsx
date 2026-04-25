"use client";

import { BountyCreateForm } from "@/components/bounty/bounty-create-form";

export default function CreateBountyPage() {
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
