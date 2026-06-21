"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function LocalTime({ timezone }: { timezone: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function update() {
      try {
        setTime(
          new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: timezone,
          }).format(new Date())
        );
      } catch {
        setTime(null);
      }
    }
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [timezone]);

  if (!time) return null;

  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
      <Clock className="w-3.5 h-3.5" />
      {time} local time
    </span>
  );
}
