"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { submitSandboxAnswers } from "@/app/actions/sandbox";
import { Clock, CheckCircle2, Cpu } from "lucide-react";

export interface Question {
  id: string;
  text: string;
  type: "mcq" | "text";
  options?: string[];
  correct?: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  skillCategory: string;
  timeLimit: number;
  questions: Question[];
}

export function SandboxForm({
  challenge,
  workerId,
}: {
  challenge: Challenge;
  workerId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(challenge.timeLimit * 60);
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          if (!submittedRef.current) handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerColor = secondsLeft < 60 ? "text-red-500" : "text-foreground";

  function handleSubmit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    startTransition(async () => {
      const result = await submitSandboxAnswers(workerId, challenge.id, answers);
      setFinalScore(result.score);
      setSubmitted(true);
      setTimeout(() => router.push("/worker/sandbox"), 3000);
    });
  }

  if (submitted && finalScore !== null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground font-heading mb-2">
          {finalScore}/100
        </h2>
        <p className="text-muted-foreground mb-2">
          {finalScore >= 70
            ? "You earned the Skill Verified badge!"
            : "Keep practising — 70+ earns a badge."}
        </p>
        <p className="text-sm text-muted-foreground">Redirecting to sandbox…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            <Badge variant="secondary" className="text-xs">
              {challenge.skillCategory}
            </Badge>
          </div>
          <div className={`flex items-center gap-1.5 font-mono text-sm font-semibold ${timerColor}`}>
            <Clock className="w-4 h-4" />
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground font-heading mb-1">
          {challenge.title}
        </h1>
        <p className="text-sm text-muted-foreground">{challenge.description}</p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {challenge.questions.map((q, i) => (
          <Card key={q.id} className="border-border">
            <CardContent className="pt-5">
              <p className="text-sm font-medium text-foreground mb-4 leading-relaxed">
                <span className="text-muted-foreground mr-2">{i + 1}.</span>
                {q.text}
              </p>
              {q.type === "mcq" && q.options ? (
                <div className="space-y-2">
                  {q.options.map((opt, idx) => {
                    const isSelected = answers[q.id] === String(idx);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40 hover:bg-muted/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={String(idx)}
                          checked={isSelected}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: String(idx) }))
                          }
                          className="mt-0.5 shrink-0 accent-primary"
                        />
                        <span className="text-sm text-foreground">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <Textarea
                  placeholder="Write your answer here..."
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  rows={4}
                  className="resize-none"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {Object.keys(answers).length}/{challenge.questions.length} answered
        </p>
        <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
          {isPending ? "Submitting…" : "Submit Answers"}
        </Button>
      </div>
    </div>
  );
}
