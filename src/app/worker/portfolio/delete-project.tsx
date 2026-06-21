"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePortfolioProject } from "@/app/actions/portfolio";
import { Trash2 } from "lucide-react";

export function DeleteProject({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(async () => { await deletePortfolioProject(projectId); router.refresh(); })}
      disabled={isPending}
      aria-label="Delete project"
      className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
