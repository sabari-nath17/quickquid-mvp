import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { ArrowLeft, Users } from "lucide-react";
import { CreateSquadForm } from "./create-squad-form";

export default async function NewSquadPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <Link
        href="/worker/squads"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Squads
      </Link>

      <div className="flex items-center gap-2 mb-2">
        <Users className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-primary">New Squad</span>
      </div>
      <h1 className="text-3xl font-bold text-foreground font-heading mb-2">
        Create a Squad
      </h1>
      <p className="text-muted-foreground mb-8">
        Form a cross-functional team. Invite verified workers after creation.
      </p>

      <CreateSquadForm />
    </div>
  );
}
