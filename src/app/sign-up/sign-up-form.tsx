"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/app/actions/auth";
import { GraduationCap, Briefcase, AlertCircle } from "lucide-react";

type ActionState = { error?: string } | null;

function SignUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return signUp(formData) as Promise<ActionState>;
}

export function SignUpForm({ defaultRole, refCode }: { defaultRole: string; refCode?: string }) {
  const [state, formAction, isPending] = useActionState(SignUpAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {refCode && <input type="hidden" name="ref" value={refCode} />}
      {refCode && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-primary text-sm">
          <GraduationCap className="w-4 h-4 shrink-0" />
          You were invited by a QuickQuid ambassador.
        </div>
      )}
      {state?.error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {state.error}
        </div>
      )}

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <label className="relative cursor-pointer group">
          <input
            type="radio"
            name="role"
            value="WORKER"
            defaultChecked={defaultRole === "WORKER"}
            className="peer sr-only"
          />
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border peer-checked:border-primary peer-checked:bg-primary/5 transition-all hover:border-primary/50 cursor-pointer">
            <GraduationCap className="w-6 h-6 text-muted-foreground peer-checked:text-primary" />
            <span className="text-sm font-medium text-foreground">Freelancer</span>
            <span className="text-xs text-muted-foreground text-center">Apply as a freelancer</span>
          </div>
        </label>
        <label className="relative cursor-pointer group">
          <input
            type="radio"
            name="role"
            value="CLIENT"
            defaultChecked={defaultRole === "CLIENT"}
            className="peer sr-only"
          />
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border peer-checked:border-primary peer-checked:bg-primary/5 transition-all hover:border-primary/50 cursor-pointer">
            <Briefcase className="w-6 h-6 text-muted-foreground peer-checked:text-primary" />
            <span className="text-sm font-medium text-foreground">Business</span>
            <span className="text-xs text-muted-foreground text-center">Hire talent</span>
          </div>
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Jane Smith"
          required
          autoComplete="name"
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          required
          autoComplete="new-password"
          minLength={8}
          className="h-11"
        />
      </div>
      <Button type="submit" className="w-full h-11 text-base mt-2" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
