"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSubJob } from "@/app/actions/submissions";
import { Plus } from "lucide-react";

export function SubJobForm({ connectionId }: { connectionId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);
      const result = await createSubJob(connectionId, {
        title,
        description,
        skills: skillList,
        budget: budget || undefined,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setTitle("");
        setDescription("");
        setSkills("");
        setBudget("");
      }
    });
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Plus className="w-3.5 h-3.5" />
        Post Sub-Job
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground font-heading">Post a Sub-Job</h3>
      <p className="text-xs text-muted-foreground">
        Open this task to other freelancers in the network. You stay responsible to the client — sub-workers deliver to you.
      </p>
      <div className="space-y-2">
        <Label htmlFor="sj-title">Title *</Label>
        <Input
          id="sj-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. UI component library in Figma"
          className="h-9"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sj-desc">Description *</Label>
        <textarea
          id="sj-desc"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={3}
          placeholder="What needs to be done? Be specific."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sj-skills">Required Skills * (comma-separated)</Label>
        <Input
          id="sj-skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Figma, UI Design, Prototyping"
          className="h-9"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sj-budget">Budget in ₹ (optional)</Label>
        <Input
          id="sj-budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="e.g. 8000"
          className="h-9"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isPending || !title.trim() || !description.trim() || !skills.trim()}
          className="gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          {isPending ? "Posting…" : "Post Sub-Job"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
