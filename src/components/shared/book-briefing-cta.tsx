"use client";

import { useState } from "react";
import { CalendarClock, X, Mail } from "lucide-react";

// Persistent B2B CTA — sticky "Book a Briefing" affordance matching enterprise procurement habits.
export function BookBriefingCta() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg hover:bg-primary/90 transition-colors"
      >
        <CalendarClock className="w-4 h-4" />
        Book a Briefing
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-2xl border border-border shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CalendarClock className="w-4.5 h-4.5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground font-heading">Book a Talent Briefing</h3>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Need a team or a recurring talent pipeline? Our account managers will scope your needs and
              hand-pick verified freelancers — typically within one business day.
            </p>
            <a
              href="mailto:enterprise@quickquid.com?subject=Talent%20Briefing%20Request"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Request a Briefing
            </a>
            <p className="text-[11px] text-muted-foreground text-center mt-3">
              Or email enterprise@quickquid.com directly.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
