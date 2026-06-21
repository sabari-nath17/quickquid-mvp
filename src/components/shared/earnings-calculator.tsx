"use client";

import { useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";

export function EarningsCalculator({ defaultRate = 500 }: { defaultRate?: number }) {
  const [hours, setHours] = useState(12);
  const [rate, setRate] = useState(defaultRate);

  const weeklyGross = hours * rate;
  const monthlyGross = weeklyGross * 4;
  const monthlyTakeHome = Math.round(monthlyGross * 0.92); // 8% platform fee

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Calculator className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground font-heading">Earnings Estimator</h3>
          <p className="text-xs text-muted-foreground">See what you could make on QuickQuid</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-foreground">Hours per week</label>
            <span className="text-xs font-semibold text-primary">{hours} hrs</span>
          </div>
          <input
            type="range"
            min={2}
            max={40}
            step={1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-foreground">Your hourly rate</label>
            <span className="text-xs font-semibold text-primary">₹{rate.toLocaleString("en-IN")}/hr</span>
          </div>
          <input
            type="range"
            min={100}
            max={3000}
            step={50}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-border">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-600" />
              Est. monthly take-home
            </p>
            <p className="text-3xl font-bold text-foreground font-heading mt-1">
              ₹{monthlyTakeHome.toLocaleString("en-IN")}
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground text-right">
            ₹{monthlyGross.toLocaleString("en-IN")} gross
            <br />
            after 8% platform fee
          </p>
        </div>
      </div>
    </div>
  );
}
