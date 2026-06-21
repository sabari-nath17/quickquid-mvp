"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

interface PromoBannerProps {
  id: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
}

// Inline, dismissible banner nested in the content stream — replaces intrusive full-screen modals.
export function PromoBanner({ id, message, ctaLabel, ctaHref }: PromoBannerProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(`qq_promo_${id}`) === "1");
  }, [id]);

  if (dismissed) return null;

  function dismiss() {
    localStorage.setItem(`qq_promo_${id}`, "1");
    setDismissed(true);
  }

  return (
    <div className="relative flex items-center gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 mb-5">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <p className="flex-1 text-sm text-foreground">{message}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="shrink-0 text-xs font-semibold text-primary hover:underline whitespace-nowrap"
        >
          {ctaLabel} →
        </Link>
      )}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
