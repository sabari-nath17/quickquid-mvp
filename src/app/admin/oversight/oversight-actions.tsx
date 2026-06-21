"use client";

import { useTransition, useState } from "react";
import {
  suspendUser,
  adminSetPackageVisibility,
  adminRemoveReview,
  adminCancelOrder,
  seedDemoData,
  clearDemoData,
} from "@/app/actions/admin-oversight";
import { Ban, ShieldCheck, EyeOff, Eye, Trash2, XCircle, Database, Eraser } from "lucide-react";

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

export function MockDataPanel() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function run(fn: () => Promise<{ error?: string; message?: string; success?: boolean }>) {
    setMessage(null);
    setIsError(false);
    startTransition(async () => {
      const r = await fn();
      if (r.error) { setMessage(r.error); setIsError(true); }
      else if (r.message) { setMessage(r.message); setIsError(false); }
    });
  }

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-1">
        <Database className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground font-heading">Demo Data</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Seed creates 4 workers, 1 client, 3 service packages, sandbox challenges, and 2 jobs. Clear removes all demo accounts and their data.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => run(seedDemoData)}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Database className="w-3.5 h-3.5" />
          {isPending ? "Working…" : "Load Demo Data"}
        </button>
        <button
          onClick={() => run(clearDemoData)}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Eraser className="w-3.5 h-3.5" />
          Clear Demo Data
        </button>
      </div>
      {message && (
        <p className={`text-xs mt-3 ${isError ? "text-destructive" : "text-green-700"}`}>{message}</p>
      )}
    </div>
  );
}
