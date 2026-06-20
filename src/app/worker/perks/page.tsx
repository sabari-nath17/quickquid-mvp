import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, QrCode, CheckCircle2, ShieldCheck } from "lucide-react";

export default async function PerksPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.id },
  });

  const [offers, redemptions] = await Promise.all([
    prisma.merchantOffer.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } }),
    profile
      ? prisma.merchantRedemption.findMany({ where: { workerId: profile.id } })
      : Promise.resolve([]),
  ]);

  const redeemedOfferIds = new Set(redemptions.map((r) => r.offerId));

  const isVerified = profile?.isVerified ?? false;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Member Perks</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-heading">Exclusive Discounts</h1>
        <p className="text-muted-foreground mt-1">
          Perks for verified QuickQuid freelancers — from local partners near you.
        </p>
      </div>

      {!isVerified && (
        <div className="mb-8 p-5 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Verification required to redeem</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Complete your profile and get verified to unlock these perks.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {offers.map((offer) => {
          const redeemed = redeemedOfferIds.has(offer.id);
          return (
            <Card key={offer.id} className="border-border flex flex-col">
              <CardContent className="pt-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-foreground text-sm font-heading leading-snug">
                    {offer.merchantName}
                  </p>
                  <Badge className="shrink-0 bg-green-100 text-green-700 border-green-200 text-xs">
                    {offer.discountPercent === 100 ? "FREE" : `${offer.discountPercent}% OFF`}
                  </Badge>
                </div>
                <Badge variant="secondary" className="text-xs w-fit mb-2">{offer.category}</Badge>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">
                  {offer.description}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {offer.address}
                </div>
                {redeemed ? (
                  <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Redeemed
                  </div>
                ) : (
                  <Button
                    asChild
                    size="sm"
                    className="gap-1.5 w-full"
                    disabled={!isVerified}
                    variant={isVerified ? "default" : "outline"}
                  >
                    <Link href={isVerified ? `/worker/perks/${offer.id}/redeem` : "#"}>
                      <QrCode className="w-3.5 h-3.5" />
                      Redeem with QR
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-lg font-bold text-foreground font-heading mb-4">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "01", title: "Open your perk", desc: "Tap 'Redeem with QR' on any offer." },
            { step: "02", title: "Show QR to merchant", desc: "The merchant scans your unique code to verify." },
            { step: "03", title: "Discount applied", desc: "Your discount is applied instantly at checkout." },
          ].map(({ step, title, desc }) => (
            <Card key={step} className="border-border">
              <CardContent className="pt-5">
                <div className="text-3xl font-bold text-primary/15 font-heading mb-2">{step}</div>
                <p className="font-semibold text-foreground text-sm font-heading mb-1">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
