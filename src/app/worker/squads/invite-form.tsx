"use client";

import { useState, useTransition } from "react";
import { inviteToSquad } from "@/app/actions/squads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";

export function InviteForm({ squadId }: { squadId: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ error?: string; success?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await inviteToSquad(squadId, email.trim());
      if (result.success) {
        setMessage({ success: "Invitation sent!" });
        setEmail("");
      } else {
        setMessage({ error: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
      <Input
        type="email"
        placeholder="Worker's email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="text-sm h-8"
        required
      />
      <Button type="submit" size="sm" disabled={isPending} className="gap-1.5 shrink-0 h-8">
        <UserPlus className="w-3.5 h-3.5" />
        Invite
      </Button>
      {message?.error && (
        <span className="text-xs text-destructive self-center">{message.error}</span>
      )}
      {message?.success && (
        <span className="text-xs text-green-600 self-center">{message.success}</span>
      )}
    </form>
  );
}
