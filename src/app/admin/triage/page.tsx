import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TriageActions } from "./triage-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Globe, ExternalLink, Clock, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { ApplicationStatus } from "@prisma/client";

export default async function TriagePage() {
  await requireAdmin().catch(() => redirect("/sign-in"));

  const [pending, verified, rejected] = await Promise.all([
    prisma.workerProfile.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.workerProfile.findMany({
      where: { status: "VERIFIED" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.workerProfile.findMany({
      where: { status: "REJECTED" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  function WorkerRow({
    worker,
    showActions,
  }: {
    worker: (typeof pending)[number];
    showActions: boolean;
  }) {
    const name = worker.user.name ?? worker.user.email;
    const initials = name.slice(0, 2).toUpperCase();
    const statusColor: Record<ApplicationStatus, string> = {
      PENDING: "text-amber-600 border-amber-300 bg-amber-50",
      UNDER_REVIEW: "text-blue-600 border-blue-300 bg-blue-50",
      VERIFIED: "bg-green-100 text-green-700 border-green-200",
      REJECTED: "bg-red-50 text-red-700 border-red-200",
    };

    return (
      <Card className="border-border">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3 min-w-0">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground text-sm">{name}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${statusColor[worker.status]}`}
                  >
                    {worker.status === "PENDING" && <Clock className="w-3 h-3 mr-1" />}
                    {worker.status === "VERIFIED" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {worker.status === "REJECTED" && <XCircle className="w-3 h-3 mr-1" />}
                    {worker.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{worker.user.email}</p>

                {/* Skills */}
                {worker.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {worker.skills.slice(0, 5).map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                    {worker.skills.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{worker.skills.length - 5}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-3 mt-2">
                  <a
                    href={worker.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Globe className="w-3 h-3" />
                    LinkedIn
                  </a>
                  {worker.portfolioUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Portfolio {worker.portfolioUrls.length > 1 ? i + 1 : ""}
                    </a>
                  ))}
                </div>

                {/* Bio */}
                {worker.bio && (
                  <p className="text-xs text-muted-foreground mt-2 italic max-w-lg">
                    &quot;{worker.bio}&quot;
                  </p>
                )}

                {/* Experience */}
                {worker.experienceText && (
                  <details className="mt-2">
                    <summary className="text-xs text-primary cursor-pointer hover:underline">
                      View experience
                    </summary>
                    <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap max-w-lg leading-relaxed">
                      {worker.experienceText}
                    </p>
                  </details>
                )}

                {/* Verification notes */}
                {worker.verificationNotes && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground">
                    <span className="font-medium">Notes: </span>
                    {worker.verificationNotes}
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-2">
                  Applied{" "}
                  {new Date(worker.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {showActions && <TriageActions workerId={worker.id} />}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading">
              Triage Queue
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and verify worker applications
            </p>
          </div>
          {pending.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-sm px-3 py-1">
              {pending.length} pending
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-3.5 h-3.5" />
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="verified" className="gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified ({verified.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="w-3.5 h-3.5" />
            Rejected ({rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pending.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
                <CardTitle className="text-base font-heading mb-1">All caught up!</CardTitle>
                <p className="text-sm text-muted-foreground">No pending applications to review.</p>
              </CardContent>
            </Card>
          ) : (
            pending.map((w) => (
              <WorkerRow key={w.id} worker={w} showActions={true} />
            ))
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {verified.map((w) => (
            <WorkerRow key={w.id} worker={w} showActions={false} />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejected.map((w) => (
            <WorkerRow key={w.id} worker={w} showActions={false} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
