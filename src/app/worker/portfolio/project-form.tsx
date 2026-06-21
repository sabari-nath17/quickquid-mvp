"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPortfolioProject } from "@/app/actions/portfolio";
import { Plus } from "lucide-react";

export function ProjectForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createPortfolioProject({
        title,
        description,
        imageUrl: imageUrl || undefined,
        projectUrl: projectUrl || undefined,
        role: role || undefined,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      if (result.error) setError(result.error);
      else {
        setOpen(false);
        setTitle(""); setDescription(""); setImageUrl(""); setProjectUrl(""); setRole(""); setSkills("");
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Add Project
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground font-heading">New Portfolio Project</h3>
      <div className="space-y-2">
        <Label htmlFor="p-title">Title *</Label>
        <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E-commerce dashboard redesign" className="h-10" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-desc">Description *</Label>
        <textarea
          id="p-desc"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What you built, the impact, and your specific contribution."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="p-role">Your role (optional)</Label>
          <Input id="p-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Lead Developer" className="h-10" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-skills">Skills (comma-separated)</Label>
          <Input id="p-skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Figma" className="h-10" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="p-img">Image URL (optional)</Label>
          <Input id="p-img" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" className="h-10" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-url">Project URL (optional)</Label>
          <Input id="p-url" type="url" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://…" className="h-10" />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={isPending || !title.trim() || !description.trim()} size="sm" className="gap-1">
          <Plus className="w-3.5 h-3.5" />
          {isPending ? "Saving…" : "Save Project"}
        </Button>
        <Button onClick={() => setOpen(false)} variant="ghost" size="sm">Cancel</Button>
      </div>
    </div>
  );
}
