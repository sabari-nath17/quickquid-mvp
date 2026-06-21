"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { respondToOrder } from "@/app/actions/services";
import { CheckCircle2, XCircle } from "lucide-react";

export function OrderActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [declined, setDeclined] = useState(false);

  function respond(accept: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await respondToOrder(orderId, accept);
      if (result.error) setError(result.error);
      else if (accept && result.connectionId) router.push(`/worker/contract/${result.connectionId}`);
      else setDeclined(true);
    });
  }

  if (declined) {
    return <span className="text-xs text-muted-foreground">Order declined</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => respond(false)}
          disabled={isPending}
          className="h-8 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
        >
          <XCircle className="w-3 h-3" />
          Decline
        </Button>
        <Button size="sm" onClick={() => respond(true)} disabled={isPending} className="h-8 text-xs gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Accept &amp; Start
        </Button>
      </div>
    </div>
  );
}
