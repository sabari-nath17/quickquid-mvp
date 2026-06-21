"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/app/actions/reviews";

interface ReviewFormProps {
  connectionId: string;
  workerName: string;
}

const PARAMS = [
  { key: "qualityRating", label: "Quality of work" },
  { key: "communicationRating", label: "Communication" },
  { key: "professionalismRating", label: "Professionalism" },
  { key: "reliabilityRating", label: "Reliability" },
  { key: "flexibilityRating", label: "Flexibility" },
] as const;

type ParamKey = (typeof PARAMS)[number]["key"];

function StarRow({
  value,
  onChange,
  size = "w-5 h-5",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: string;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          <Star
            className={`${size} transition-colors ${
              star <= display ? "fill-amber-400 text-amber-400" : "fill-none text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({ connectionId, workerName }: ReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [subs, setSubs] = useState<Record<ParamKey, number>>({
    qualityRating: 0,
    communicationRating: 0,
    professionalismRating: 0,
    reliabilityRating: 0,
    flexibilityRating: 0,
  });
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (rating === 0) {
      setError("Please select an overall rating");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitReview(connectionId, {
        rating,
        comment: comment || undefined,
        ...Object.fromEntries(
          (Object.keys(subs) as ParamKey[]).filter((k) => subs[k] > 0).map((k) => [k, subs[k]])
        ),
      });
      if (result.error) setError(result.error);
      else setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-sm font-semibold text-green-700">Review submitted</p>
        <p className="text-xs text-green-600 mt-0.5">Thanks for rating {workerName}.</p>
      </div>
    );
  }

  const display = hovered || rating;

  return (
    <div className="bg-white rounded-xl border border-border p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Leave a Review</h3>

      <div className="space-y-1.5">
        <span className="text-xs font-medium text-foreground">Overall rating *</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none"
              aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= display ? "fill-amber-400 text-amber-400" : "fill-none text-muted-foreground/40"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-xs text-muted-foreground self-center ml-1">
              {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
            </span>
          )}
        </div>
      </div>

      {/* 5-parameter breakdown */}
      <div className="space-y-2 pt-1 border-t border-border">
        <p className="text-[11px] text-muted-foreground pt-2">Rate specific aspects (optional)</p>
        {PARAMS.map((p) => (
          <div key={p.key} className="flex items-center justify-between">
            <span className="text-xs text-foreground">{p.label}</span>
            <StarRow value={subs[p.key]} onChange={(v) => setSubs((s) => ({ ...s, [p.key]: v }))} />
          </div>
        ))}
      </div>

      <Textarea
        placeholder="Share your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
        className="text-sm resize-none"
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button size="sm" onClick={handleSubmit} disabled={isPending || rating === 0} className="w-full">
        {isPending ? "Submitting…" : "Submit Review"}
      </Button>
    </div>
  );
}
