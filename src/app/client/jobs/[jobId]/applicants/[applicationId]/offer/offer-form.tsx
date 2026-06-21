"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOffer } from "@/app/actions/applications";
import { AlertCircle, Clock, IndianRupee } from "lucide-react";

const PLATFORM_FEE = 0.08;

export function OfferForm({
  applicationId,
  defaultTitle,
  defaultRate,
  proposed,
}: {
  applicationId: string;
  defaultTitle: string;
  defaultRate: "FIXED" | "HOURLY";
  proposed: { rate: number | null; rateType: string };
}) {
  const router = useRouter();
  const [contractTitle, setContractTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [rateType, setRateType] = useState<"FIXED" | "HOURLY">(defaultRate);
  const [fixedAmount, setFixedAmount] = useState(proposed.rateType === "FIXED" && proposed.rate ? String(proposed.rate) : "");
  const [hourlyRate, setHourlyRate] = useState(proposed.rateType === "HOURLY" && proposed.rate ? String(proposed.rate) : "");
  const [weeklyLimit, setWeeklyLimit] = useState("40");
  const [startDate, setStartDate] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const maxWeekly = rateType === "HOURLY" && hourlyRate && weeklyLimit ? Number(hourlyRate) * Number(weeklyLimit) : 0;
  const total = rateType === "FIXED" ? Number(fixedAmount || 0) : maxWeekly;
  const fee = Math.round(total * PLATFORM_FEE);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await sendOffer(applicationId, {
        contractTitle,
        description: description || undefined,
        rateType,
        fixedAmount: rateType === "FIXED" ? Number(fixedAmount) : undefined,
        hourlyRate: rateType === "HOURLY" ? Number(hourlyRate) : undefined,
        weeklyLimit: rateType === "HOURLY" ? Number(weeklyLimit) : undefined,
        startDate: startDate || undefined,
        agreed,
      });
      if (result.error) setError(result.error);
      else if (result.connectionId) router.push(`/client/contract/${result.connectionId}`);
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground font-heading">Job Details</h2>
        <div className="space-y-2">
          <Label htmlFor="contractTitle">Contract title *</Label>
          <Input id="contractTitle" value={contractTitle} onChange={(e) => setContractTitle(e.target.value)} className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Work description</Label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Describe the scope and deliverables for this contract." />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground font-heading">Contract Terms</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["FIXED", "HOURLY"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setRateType(t)}
              className={`p-3 rounded-lg border text-left transition-colors ${rateType === t ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                {t === "FIXED" ? <IndianRupee className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {t === "FIXED" ? "Pay a fixed price" : "Pay by the hour"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t === "FIXED" ? "One agreed amount" : "Weekly hours × rate"}</p>
            </button>
          ))}
        </div>

        {rateType === "FIXED" ? (
          <div className="space-y-2">
            <Label htmlFor="fixedAmount">Contract amount (₹) *</Label>
            <Input id="fixedAmount" type="number" min={1} value={fixedAmount} onChange={(e) => setFixedAmount(e.target.value)} placeholder="e.g. 25000" className="h-11" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly rate (₹) *</Label>
              <Input id="hourlyRate" type="number" min={1} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="600" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeklyLimit">Weekly limit (hrs) *</Label>
              <Input id="weeklyLimit" type="number" min={1} max={168} value={weeklyLimit} onChange={(e) => setWeeklyLimit(e.target.value)} className="h-11" />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11" />
        </div>

        {/* Summary */}
        <div className="pt-3 border-t border-border space-y-1.5 text-xs">
          {rateType === "HOURLY" && (
            <div className="flex justify-between"><span className="text-muted-foreground">Max weekly payment</span><span className="text-foreground font-medium">₹{maxWeekly.toLocaleString("en-IN")}</span></div>
          )}
          <div className="flex justify-between"><span className="text-muted-foreground">{rateType === "FIXED" ? "Contract value" : "First-week value"}</span><span className="text-foreground font-semibold">₹{total.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Platform fee (8%)</span><span className="text-primary">₹{fee.toLocaleString("en-IN")}</span></div>
        </div>
      </div>

      {/* Policy agreement */}
      <label className="flex items-start gap-2.5 p-4 rounded-xl border border-border bg-muted/20 cursor-pointer">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
        <span className="text-sm text-foreground">
          I understand QuickQuid&apos;s policies — payments are arranged directly (UPI/bank), milestones are logged here, and an 8% platform fee applies on completion.
        </span>
      </label>

      <div className="flex gap-3">
        <Button onClick={submit} disabled={isPending || !agreed} className="flex-1 h-11">
          {isPending ? "Sending offer…" : "Send Offer"}
        </Button>
        <Button variant="outline" onClick={() => router.back()} className="h-11">Cancel</Button>
      </div>
    </div>
  );
}
