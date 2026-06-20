"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMatch } from "@/app/actions/admin";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

interface Worker {
  id: string;
  name: string;
  skills: string[];
}

interface Job {
  id: string;
  title: string;
  clientName: string;
  skills: string[];
}

export function MatchCreateForm({
  workers,
  jobs,
}: {
  workers: Worker[];
  jobs: Job[];
}) {
  const [workerId, setWorkerId] = useState("");
  const [jobId, setJobId] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedWorker = workers.find((w) => w.id === workerId);
  const selectedJob = jobs.find((j) => j.id === jobId);

  function handleCreate() {
    if (!workerId || !jobId) {
      toast.error("Please select both a worker and a job.");
      return;
    }
    startTransition(async () => {
      const result = await createMatch(workerId, jobId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Match created! You can now introduce them.");
        setWorkerId("");
        setJobId("");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Verified Worker</Label>
        <Select value={workerId} onValueChange={(v) => setWorkerId(v ?? "")}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select a worker..." />
          </SelectTrigger>
          <SelectContent>
            {workers.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedWorker && (
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedWorker.skills.slice(0, 4).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center">
        <Link2 className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <Label>Client Job Requirement</Label>
        <Select value={jobId} onValueChange={(v) => setJobId(v ?? "")}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select a job..." />
          </SelectTrigger>
          <SelectContent>
            {jobs.map((j) => (
              <SelectItem key={j.id} value={j.id}>
                <div>
                  <span className="font-medium">{j.title}</span>
                  <span className="text-muted-foreground text-xs ml-1">
                    — {j.clientName}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedJob && (
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedJob.skills.slice(0, 4).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={handleCreate}
        disabled={isPending || !workerId || !jobId}
        className="w-full gap-2"
      >
        <Link2 className="w-4 h-4" />
        {isPending ? "Creating..." : "Create Match"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Creating a match does not expose any data yet. You must explicitly
        &quot;Introduce&quot; after reviewing.
      </p>
    </div>
  );
}
