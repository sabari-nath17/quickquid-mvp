"use client";

import { useActionState } from "react";
import { createSquad } from "@/app/actions/squads";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState = { error: undefined as string | undefined };

export function CreateSquadForm() {
  const [state, action, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createSquad(formData);
      return result ?? initialState;
    },
    initialState
  );

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {state.error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="name">Squad Name *</Label>
        <Input id="name" name="name" placeholder="e.g. Kochi Creatives" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What kind of work does your squad specialise in?"
          rows={3}
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating…" : "Create Squad"}
      </Button>
    </form>
  );
}
