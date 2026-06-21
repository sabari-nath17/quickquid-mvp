"use client";

import { useTransition, useState } from "react";
import {
  suspendUser,
  adminSetPackageVisibility,
  adminRemoveReview,
  adminCancelOrder,
} from "@/app/actions/admin-oversight";
import { Ban, ShieldCheck, EyeOff, Eye, Trash2, XCircle } from "lucide-react";

function useAction() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (fn: () => Promise<{ error?: string; success?: boolean }>) => {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (r.error) setError(r.error);
    });
  };
  return { isPending, error, run };
}

export function SuspendToggle({ userId, suspended }: { userId: string; suspended: boolean }) {
  const { isPending, error, run } = useAction();
  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <button
        onClick={() => run(() => suspendUser(userId, !suspended))}
        disabled={isPending}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
          suspended
            ? "text-green-700 border-green-300 hover:bg-green-50"
            : "text-red-600 border-red-200 hover:bg-red-50"
        }`}
      >
        {suspended ? <ShieldCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
        {suspended ? "Reinstate" : "Suspend"}
      </button>
      {error && <span className="text-[10px] text-destructive">{error}</span>}
    </span>
  );
}

export function PackageVisibilityToggle({ packageId, isActive }: { packageId: string; isActive: boolean }) {
  const { isPending, error, run } = useAction();
  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <button
        onClick={() => run(() => adminSetPackageVisibility(packageId, !isActive))}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
      >
        {isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        {isActive ? "Hide" : "Show"}
      </button>
      {error && <span className="text-[10px] text-destructive">{error}</span>}
    </span>
  );
}

export function RemoveReviewButton({ reviewId }: { reviewId: string }) {
  const { isPending, error, run } = useAction();
  const [removed, setRemoved] = useState(false);
  if (removed) return <span className="text-[10px] text-muted-foreground">Removed</span>;
  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <button
        onClick={() => { run(() => adminRemoveReview(reviewId).then((r) => { if (r.success) setRemoved(true); return r; })); }}
        disabled={isPending}
        aria-label="Remove review"
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-3 h-3" />
        Remove
      </button>
      {error && <span className="text-[10px] text-destructive">{error}</span>}
    </span>
  );
}

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const { isPending, error, run } = useAction();
  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <button
        onClick={() => run(() => adminCancelOrder(orderId))}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        <XCircle className="w-3 h-3" />
        Cancel
      </button>
      {error && <span className="text-[10px] text-destructive">{error}</span>}
    </span>
  );
}
