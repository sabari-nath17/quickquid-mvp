"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp } from "lucide-react";

export function FeeTransparencyWidget({ amount: initialAmount = 50000 }: { amount?: number }) {
  const [amount, setAmount] = useState(initialAmount);

  const platforms = [
    { name: "Upwork", rate: 0.20, highlight: false },
    { name: "Fiverr", rate: 0.20, highlight: false },
    { name: "QuickQuid", rate: 0.08, highlight: true },
  ];

  const maxFee = amount * 0.20;
  const qqFee = Math.round(amount * 0.08);
  const saving = maxFee - qqFee;

  return (
    <div className="rounded-xl border border-border p-5 bg-white space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">Fee Transparency</h3>
        <p className="text-xs text-muted-foreground">See how much more you keep with QuickQuid</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium">Contract Value (₹)</label>
        <div className="flex gap-2 items-center">
          <input
            type="range"
            min={5000}
            max={500000}
            step={5000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="w-28 border border-border rounded-md px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        {platforms.map((p) => {
          const fee = Math.round(amount * p.rate);
          const takeHome = amount - fee;
          return (
            <div
              key={p.name}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                p.highlight
                  ? "bg-green-50 border border-green-200"
                  : "bg-muted/40 border border-border"
              }`}
            >
              <div className="flex items-center gap-2">
                {p.highlight ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                )}
                <span className={`font-medium ${p.highlight ? "text-green-800" : "text-foreground"}`}>
                  {p.name} ({Math.round(p.rate * 100)}%)
                </span>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${p.highlight ? "text-green-700" : "text-muted-foreground"}`}>
                  ₹{takeHome.toLocaleString("en-IN")}
                </div>
                <div className={`text-[11px] ${p.highlight ? "text-green-600" : "text-red-400"}`}>
                  {p.highlight ? "you keep" : `−₹${fee.toLocaleString("en-IN")} fee`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {saving > 0 && (
        <div className="flex items-center gap-2 pt-1">
          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
            You save ₹{saving.toLocaleString("en-IN")} vs Upwork/Fiverr
          </Badge>
        </div>
      )}
    </div>
  );
}
