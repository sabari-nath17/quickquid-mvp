"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/app/actions/auth";
import { AlertCircle } from "lucide-react";

type ActionState = { error?: string } | null;

function SignInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return signIn(formData) as Promise<ActionState>;
}

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(SignInAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {state.error}
        </div>
      )}
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
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="h-11"
        />
      </div>
      <Button type="submit" className="w-full h-11 text-base mt-2" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-primary font-medium hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
