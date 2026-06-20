import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";

export default async function RedeemPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const profile = await prisma.workerProfile.findUnique({ where: { userId: session.id } });
  if (!profile?.isVerified) redirect("/worker/perks");

  const offer = await prisma.merchantOffer.findUnique({ where: { id: offerId } });
  if (!offer || !offer.isActive) notFound();

  // Record redemption (idempotent for demo)
  const existing = await prisma.merchantRedemption.findFirst({
    where: { offerId: offer.id, workerId: profile.id },
  });
  if (!existing) {
    await prisma.merchantRedemption.create({
      data: { offerId: offer.id, workerId: profile.id },
    });
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <Link
        href="/worker/perks"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Perks
      </Link>

      <div className="text-center mb-8">
        <Badge className="mb-3 bg-green-100 text-green-700 border-green-200">
          {offer.discountPercent === 100 ? "FREE" : `${offer.discountPercent}% OFF`}
        </Badge>
        <h1 className="text-2xl font-bold text-foreground font-heading">{offer.merchantName}</h1>
        <p className="text-muted-foreground text-sm mt-1">{offer.description}</p>
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
          <MapPin className="w-3 h-3" />
          {offer.address}
        </div>
      </div>

      {/* QR code placeholder */}
      <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center gap-4 bg-muted/20 mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          Show to merchant
        </p>
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm w-full max-w-[220px]">
          <p className="font-mono text-center text-xs break-all text-foreground leading-relaxed select-all">
            {offer.qrCode}
          </p>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Ask the merchant to scan or enter this code at checkout
        </p>
      </div>

      <Button asChild variant="outline" className="w-full">
        <Link href="/worker/perks">View all perks</Link>
      </Button>
    </div>
  );
}
