"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitWork } from "@/app/actions/submissions";
import { Upload, Eye, EyeOff } from "lucide-react";

export function WorkSubmitForm({ connectionId }: { connectionId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await submitWork(connectionId, {
        title,
        description: description || undefined,
        fileUrl: fileUrl || undefined,
        isPreview,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setTitle("");
        setDescription("");
        setFileUrl("");
        setIsPreview(false);
      }
    });
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Upload className="w-3.5 h-3.5" />
        Submit Deliverable
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground font-heading">Submit Work</h3>
      <div className="space-y-2">
        <Label htmlFor="sub-title">Title *</Label>
        <Input
          id="sub-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Homepage design — v1"
          className="h-9"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sub-desc">Description (optional)</Label>
        <textarea
          id="sub-desc"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={3}
          placeholder="What's included in this submission?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={3000}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sub-file">File / Link URL (optional)</Label>
        <Input
          id="sub-file"
          type="url"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://drive.google.com/... or Figma link"
          className="h-9"
        />
      </div>

      {/* Preview mode toggle */}
      <button
        type="button"
        onClick={() => setIsPreview(!isPreview)}
        className={`flex items-start gap-3 w-full p-3 rounded-lg border text-left transition-colors ${
          isPreview
            ? "border-amber-300 bg-amber-50"
            : "border-border bg-muted/30 hover:bg-muted/50"
        }`}
      >
        {isPreview ? (
          <EyeOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <Eye className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        )}
        <div>
          <p className={`text-sm font-medium ${isPreview ? "text-amber-700" : "text-foreground"}`}>
            {isPreview ? "Preview Mode ON" : "Preview Mode"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isPreview
              ? "Client sees title + description only. File URL is hidden until you choose to share it."
              : "Enable to share description only — keeps the file link private until client approval."}
          </p>
        </div>
      </button>

      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={isPending || !title.trim()} className="gap-1">
          <Upload className="w-3.5 h-3.5" />
          {isPending ? "Submitting…" : "Submit"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
