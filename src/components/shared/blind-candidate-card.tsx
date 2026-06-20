import { Badge } from "@/components/ui/badge";
import { EyeOff, Clock } from "lucide-react";
import { VerificationBadges } from "./verification-badge";

interface BlindCandidateCardProps {
  connection: {
    id: string;
    worker: {
      candidateCode: string;
      sandboxScore: number | null;
      skills: string[];
      fillRate: number;
      hoursTrained: number;
      verificationBadges: string[];
    };
    job: { title: string };
  };
}

export function BlindCandidateCard({ connection }: BlindCandidateCardProps) {
  const { worker, job } = connection;
  const shortCode = worker.candidateCode.slice(0, 6).toUpperCase();
  const score = worker.sandboxScore;
  const scoreColor =
    score === null ? "bg-muted text-muted-foreground border-border" :
    score >= 80 ? "bg-green-100 text-green-700 border-green-200" :
    "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-base shrink-0 border border-border">
          {shortCode.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-foreground font-heading text-sm">
              Candidate #{shortCode}
            </h3>
            {score !== null && (
              <Badge variant="outline" className={`text-[11px] font-medium ${scoreColor}`}>
                {score}/100
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">For: {job.title}</p>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{worker.fillRate.toFixed(1)}% fill rate</span>
        <span>{worker.hoursTrained.toLocaleString()} hrs</span>
      </div>

      {worker.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {worker.skills.slice(0, 5).map((s) => (
            <span key={s} className="text-[11px] bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full border border-border">
              {s}
            </span>
          ))}
          {worker.skills.length > 5 && (
            <span className="text-[11px] text-muted-foreground px-1">+{worker.skills.length - 5}</span>
          )}
        </div>
      )}

      {worker.verificationBadges.length > 0 && (
        <VerificationBadges badges={worker.verificationBadges} />
      )}

      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border">
        <EyeOff className="w-3 h-3" />
        Identity hidden — awaiting admin introduction
      </div>
    </div>
  );
}
