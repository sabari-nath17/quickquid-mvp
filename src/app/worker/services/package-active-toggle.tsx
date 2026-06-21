"use client";

import { useTransition } from "react";
import { togglePackageActive } from "@/app/actions/services";

export function PackageActiveToggle({ packageId, isActive }: { packageId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => togglePackageActive(packageId).then(() => {}))}
      disabled={isPending}
      className="text-xs font-medium px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
    >
      {isActive ? "Hide" : "Publish"}
    </button>
  );
}
