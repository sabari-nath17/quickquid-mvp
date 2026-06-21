"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { placeOrder } from "@/app/actions/services";
import { Zap, CheckCircle2 } from "lucide-react";

const FAST_TRACK_RATE = 0.25;

interface Tier {
  id: string;
  name: string;
  price: number;
  deliveryDays: number;
  revisions: number;
}

export function OrderPanel({ packageId, tiers }: { packageId: string; tiers: Tier[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(tiers[0]?.id ?? "");
  const [fastTrack, setFastTrack] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selected = tiers.find((t) => t.id === selectedId) ?? tiers[0];
  const fastTrackFee = selected ? Math.round(selected.price * FAST_TRACK_RATE) : 0;
  const total = selected ? selected.price + (fastTrack ? fastTrackFee : 0) : 0;
  const deliveryDays = selected
    ? fastTrack
      ? Math.max(1, Math.ceil(selected.deliveryDays / 2))
      : selected.deliveryDays
    : 0;

  function handleOrder() {
    setError(null);
    startTransition(async () => {
      const result = await placeOrder(packageId, { tierId: selectedId, fastTrack, requirements: requirements || undefined });
      if (result.error) setError(result.error);
      else setPlaced(true);
    });
  }

  if (placed) {
    return (
      <div className="bg-white rounded-xl border border-green-200 bg-green-50/40 p-5 text-center">
        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground">Order placed!</p>
        <p className="text-xs text-muted-foreground mt-1">
          The freelancer will review and accept. You can track it in your orders.
        </p>
        <Button asChild size="sm" className="mt-3 w-full">
          <a href="/client/orders">View My Orders</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground font-heading">Configure your order</h3>

      {/* Tier selector */}
      <div className="space-y-2">
        {tiers.map((tier) => (
          <button
            key={tier.id}
            type="button"
            onClick={() => setSelectedId(tier.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
              selectedId === tier.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {tier.name.charAt(0) + tier.name.slice(1).toLowerCase()}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {tier.deliveryDays}d · {tier.revisions} rev
              </p>
            </div>
            <span className="text-sm font-semibold text-foreground">₹{tier.price.toLocaleString("en-IN")}</span>
          </button>
        ))}
      </div>

      {/* Fast-track upsell */}
      <label
        className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
          fastTrack ? "border-amber-300 bg-amber-50" : "border-border hover:bg-muted/30"
        }`}
      >
        <input
          type="checkbox"
          checked={fastTrack}
          onChange={(e) => setFastTrack(e.target.checked)}
          className="mt-0.5"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            Fast-track delivery
          </p>
          <p className="text-xs text-muted-foreground">
            Halve the delivery time for +₹{fastTrackFee.toLocaleString("en-IN")}
          </p>
        </div>
      </label>

      {/* Requirements */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Project requirements (optional)</label>
        <textarea
          className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={3}
          placeholder="Share details, links, or anything the freelancer needs to start."
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          maxLength={2000}
        />
      </div>

      {/* Summary */}
      <div className="pt-3 border-t border-border space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Delivery</span>
          <span className="text-foreground font-medium">{deliveryDays} day{deliveryDays !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-medium text-foreground">Total</span>
          <span className="font-bold text-foreground font-heading">₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button onClick={handleOrder} disabled={isPending || !selectedId} className="w-full">
        {isPending ? "Placing order…" : `Order for ₹${total.toLocaleString("en-IN")}`}
      </Button>
      <p className="text-[10px] text-muted-foreground text-center">
        Payment is arranged directly (UPI/bank). QuickQuid logs the milestone and collects 8% on completion.
      </p>
    </div>
  );
}
