"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { introduceWorkerToClient } from "@/app/actions/admin";
import { Zap, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface IntroduceButtonProps {
  connectionId: string;
}

export function IntroduceButton({ connectionId }: IntroduceButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleIntroduce() {
    startTransition(async () => {
      const result = await introduceWorkerToClient(connectionId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(
          "Introduction made. The client now has full access to this worker's contact details."
        );
        setOpen(false);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        size="sm"
        className="gap-1.5 shrink-0 bg-primary hover:bg-primary/90"
        disabled={isPending}
        onClick={() => setOpen(true)}
      >
        <Zap className="w-3.5 h-3.5" />
        Introduce
      </Button>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <AlertDialogTitle className="font-heading text-lg">
              This action is irreversible
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm leading-relaxed space-y-3">
            <span className="block">
              You are about to make a{" "}
              <strong className="text-foreground">permanent introduction</strong>. Once confirmed:
            </span>
            <ul className="list-none space-y-2 text-sm mt-2">
              {[
                "The client will gain immediate access to this worker's LinkedIn profile, portfolio links, and contact information",
                "This data unlock cannot be undone or revoked",
                "An immutable record of this introduction will be logged with your admin ID and timestamp",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 font-medium text-foreground bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm">
              Only proceed if you have verified this is the right match for the client&apos;s needs.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={isPending}>
            Cancel — go back
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleIntroduce}
            disabled={isPending}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Zap className="w-4 h-4" />
            {isPending ? "Introducing..." : "Yes, make this introduction"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
