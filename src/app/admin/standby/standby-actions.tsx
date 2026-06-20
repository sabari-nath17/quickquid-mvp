"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { assignStandby, triggerReplacement } from "@/app/actions/standby";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface Worker {
  id: string;
  name: string;
}

export function AddStandbyForm({ jobId, workers }: { jobId: string; workers: Worker[] }) {
  const [selectedId, setSelectedId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handleAssign() {
    if (!selectedId) return;
    startTransition(async () => {
      const res = await assignStandby(jobId, selectedId);
      if (res.error) setResult(res.error);
      else { setResult("Assigned!"); setSelectedId(""); }
    });
  }

  if (workers.length === 0) {
    return <p className="text-xs text-muted-foreground">No additional verified workers available.</p>;
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="text-sm border border-border rounded-md px-2 py-1.5 bg-background flex-1"
      >
        <option value="">Select worker…</option>
        {workers.map((w) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </select>
      <Button size="sm" onClick={handleAssign} disabled={!selectedId || isPending}>
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Assign"}
      </Button>
      {result && <span className="text-xs text-muted-foreground">{result}</span>}
    </div>
  );
}

export function TriggerReplacementButton({ jobId }: { jobId: string }) {
  const [phase, setPhase] = useState<"idle" | "deploying" | "found" | "error">("idle");
  const [countdown, setCountdown] = useState(3);
  const [replacementName, setReplacementName] = useState("");

  async function handleTrigger() {
    setPhase("deploying");
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    const res = await triggerReplacement(jobId);

    setTimeout(() => {
      clearInterval(interval);
      if ("error" in res && res.error) {
        setPhase("error");
      } else if ("worker" in res && res.worker) {
        setReplacementName(`${res.worker.name} (${res.worker.fillRate}% fill rate)`);
        setPhase("found");
      }
    }, 3000);
  }

  if (phase === "idle") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="text-destructive border-destructive/40 hover:bg-destructive/5 gap-1.5"
        onClick={handleTrigger}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        Trigger Replacement
      </Button>
    );
  }

  if (phase === "deploying") {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
        <Loader2 className="w-4 h-4 animate-spin" />
        Deploying standby bench… {countdown > 0 ? `(${countdown}s)` : ""}
      </div>
    );
  }

  if (phase === "found") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
        <CheckCircle2 className="w-4 h-4" />
        Replacement found in 45s — {replacementName}
      </div>
    );
  }

  return (
    <p className="text-sm text-destructive">No standby workers available.</p>
  );
}
