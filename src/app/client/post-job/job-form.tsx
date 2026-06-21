"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { submitJobRequirement } from "@/app/actions/client";
import { AlertCircle } from "lucide-react";

type ActionState = { error?: string } | null;

function JobAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return submitJobRequirement(formData) as Promise<ActionState>;
}

export function JobForm() {
  const [state, formAction, isPending] = useActionState(JobAction, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {state.error}
        </div>
      )}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Job Details</CardTitle>
          <CardDescription>
            Be specific — this helps us find the best match for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g., React Developer for E-commerce Project"
              required
              minLength={5}
              maxLength={100}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the project, what you need done, expected deliverables, and any requirements..."
              required
              minLength={50}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">Minimum 50 characters.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills * (comma-separated)</Label>
            <Input
              id="skills"
              name="skills"
              type="text"
              placeholder="React, TypeScript, Tailwind CSS..."
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="collarType">Work Type *</Label>
            <select
              id="collarType"
              name="collarType"
              defaultValue="WHITE"
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="WHITE">White-collar — digital / knowledge work (dev, design, writing)</option>
              <option value="GREY">Grey-collar — hybrid / field-tech (on-site setup, support)</option>
              <option value="BLUE">Blue-collar — manual / shift work (events, logistics)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Routes your post to the right talent feed and tailors how it&apos;s shown.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type *</Label>
              <select
                id="paymentType"
                name="paymentType"
                defaultValue="FIXED"
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="FIXED">Fixed price (per project)</option>
                <option value="HOURLY">Hourly</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level *</Label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                defaultValue="INTERMEDIATE"
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ENTRY">Entry — new talent welcome</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetMin">{"Min Budget ₹ *"}</Label>
              <Input
                id="budgetMin"
                name="budgetMin"
                type="number"
                min={500}
                placeholder="5000"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetMax">Max Budget ₹ *</Label>
              <Input
                id="budgetMax"
                name="budgetMax"
                type="number"
                min={500}
                placeholder="10000"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline (optional)</Label>
              <Input
                id="timeline"
                name="timeline"
                type="text"
                placeholder="e.g., 2 weeks"
                className="h-11"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            QuickQuid enforces a ₹500 wage floor. Below-floor postings are blocked to protect fair pay.
          </p>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full h-11 text-base" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Job Requirement"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Our team reviews all job requirements and will reach out with matched
        talent within 48 hours.
      </p>
    </form>
  );
}
