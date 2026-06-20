import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { MessageInput } from "./message-input";

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ connectionId: string }>;
}) {
  const session = await requireAuth().catch(() => redirect("/sign-in"));

  const { connectionId } = await params;

  const connection = await prisma.matchmakingConnection.findUnique({
    where: { id: connectionId },
    include: {
      worker: { include: { user: { select: { id: true, name: true, email: true } } } },
      job: { include: { user: { select: { id: true, name: true, email: true } } } },
      messages: {
        include: { sender: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!connection) redirect("/");

  const isWorker = connection.worker.userId === session.id;
  const isClient = connection.job.userId === session.id;
  const isAdmin = session.role === "ADMIN";

  if (!isWorker && !isClient && !isAdmin) redirect("/");

  const workerName = connection.worker.user.name ?? connection.worker.user.email;
  const clientName = connection.job.user.name ?? connection.job.user.email;
  const otherPartyName = isWorker ? clientName : workerName;

  const backHref = isAdmin
    ? "/admin/dashboard"
    : isWorker
    ? `/worker/contract/${connectionId}`
    : `/client/contract/${connectionId}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <Link
          href={backHref}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-foreground font-heading truncate">
            {isAdmin ? `${workerName} ↔ ${clientName}` : otherPartyName}
          </h1>
          <p className="text-xs text-muted-foreground truncate">{connection.job.title}</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1 text-xs text-primary font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin view
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4" id="messages-container">
        {connection.messages.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation below.</p>
          </div>
        ) : (
          connection.messages.map((msg) => {
            const isMine = msg.senderId === session.id;
            const senderLabel = msg.sender.role === "ADMIN"
              ? "Admin"
              : msg.sender.name ?? msg.sender.email;

            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[75%] space-y-0.5`}>
                  {!isMine && (
                    <p className="text-[10px] text-muted-foreground px-1">{senderLabel}</p>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMine
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[10px] text-muted-foreground px-1 ${isMine ? "text-right" : ""}`}>
                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {" · "}
                    {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      {!isAdmin && <MessageInput connectionId={connectionId} />}
      {isAdmin && (
        <div className="text-xs text-muted-foreground text-center py-2 border-t border-border">
          Admin read-only view — messages are monitored for compliance.
        </div>
      )}
    </div>
  );
}
