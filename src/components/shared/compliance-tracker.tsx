"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, FileText, ToggleLeft, ToggleRight } from "lucide-react";

interface ComplianceTrackerProps {
  contractStartDate: Date | null | undefined;
  demoMode?: boolean;
}

export function ComplianceTracker({ contractStartDate, demoMode = false }: ComplianceTrackerProps) {
  const [tdsEnabled, setTdsEnabled] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState("50000");
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [retainerOpen, setRetainerOpen] = useState(false);

  if (!contractStartDate) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Contract not yet started. Compliance tracking begins once the contract is active.
      </div>
    );
  }

  const daysSinceStart = Math.floor(
    (Date.now() - new Date(contractStartDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isCompliance = demoMode || daysSinceStart >= 90;
  const progressValue = Math.min(daysSinceStart, 90);

  if (isCompliance) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-100 text-amber-700 border-amber-300 gap-1">
            <AlertTriangle className="w-3 h-3" />
            Compliance Mode — Day {Math.max(daysSinceStart, 90)}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">GST Invoice Required</p>
              <p className="text-xs text-muted-foreground">Contracts over 90 days require GST-compliant invoicing.</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">TDS Deduction Tracker</p>
              <p className="text-xs text-muted-foreground">Auto-calculate TDS at 10% for applicable contracts</p>
            </div>
            <button
              onClick={() => setTdsEnabled((v) => !v)}
              className="text-primary"
              aria-label="Toggle TDS"
            >
              {tdsEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
            </button>
          </div>
          {tdsEnabled && (
            <p className="text-xs text-muted-foreground pl-3">
              TDS at 10% will be logged on each approved milestone payment.
            </p>
          )}

          <div className="p-3 bg-white rounded-lg border border-border space-y-2">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> GST Invoice Generator
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Invoice Amount (₹)</label>
                <input
                  type="number"
                  value={invoiceAmount}
                  onChange={(e) => { setInvoiceAmount(e.target.value); setInvoiceGenerated(false); }}
                  className="w-full border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex items-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInvoiceGenerated(true)}
                >
                  Generate PDF
                </Button>
              </div>
            </div>
            {invoiceGenerated && (
              <p className="text-xs text-green-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Invoice for ₹{Number(invoiceAmount).toLocaleString("en-IN")} generated — demo mode
              </p>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={() => setRetainerOpen(true)}>
            Convert to Monthly Retainer?
          </Button>
          {retainerOpen && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-foreground">
              Monthly retainer conversion — coming soon. This will convert your engagement to a recurring subscription model.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Day {daysSinceStart} of 90 — Transactional Mode
        </span>
        <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 text-xs">
          Active
        </Badge>
      </div>
      <Progress value={progressValue} max={90} className="h-2" />
      <p className="text-xs text-muted-foreground">
        Milestones and payments tracked manually.{" "}
        <span className="font-medium text-foreground">Day 91: Compliance Mode unlocks</span> — GST invoicing, TDS tracking, and retainer options.
      </p>
    </div>
  );
}
