"use client";

import { useState, useEffect } from "react";
import { Activity } from "lucide-react";

export function TickerRotator({ events }: { events: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (events.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % events.length), 3500);
    return () => clearInterval(id);
  }, [events.length]);

  if (events.length === 0) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-border text-xs text-muted-foreground shadow-sm">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <Activity className="w-3 h-3 text-primary shrink-0" />
      <span key={index} className="font-medium text-foreground animate-in fade-in duration-500">
        {events[index]}
      </span>
    </div>
  );
}
