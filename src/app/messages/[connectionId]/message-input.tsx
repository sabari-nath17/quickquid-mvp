"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/app/actions/messages";
import { Send } from "lucide-react";

export function MessageInput({ connectionId }: { connectionId: string }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = document.getElementById("messages-container");
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  function handleSend() {
    if (!content.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await sendMessage(connectionId, content.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setContent("");
        router.refresh();
        setTimeout(() => {
          const el = document.getElementById("messages-container");
          if (el) el.scrollTop = el.scrollHeight;
        }, 100);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-border pt-3 space-y-1">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px] max-h-[200px]"
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={5000}
        />
        <button
          onClick={handleSend}
          disabled={isPending || !content.trim()}
          className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Messages are monitored by QuickQuid for platform safety.
      </p>
    </div>
  );
}
