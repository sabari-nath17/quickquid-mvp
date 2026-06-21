"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServicePackage } from "@/app/actions/services";
import { AlertCircle, Zap, Package as PackageIcon } from "lucide-react";
import { ImageUpload } from "@/components/shared/image-upload";

type TierName = "BASIC" | "STANDARD" | "PREMIUM";

interface TierState {
  enabled: boolean;
  price: string;
  deliveryDays: string;
  revisions: string;
  description: string;
  features: string;
}

const TIER_META: Record<TierName, { label: string; hint: string }> = {
  BASIC: { label: "Basic", hint: "Entry offer" },
  STANDARD: { label: "Standard", hint: "Most popular" },
  PREMIUM: { label: "Premium", hint: "Full service" },
};

function emptyTier(enabled: boolean): TierState {
  return { enabled, price: "", deliveryDays: "", revisions: "1", description: "", features: "" };
}

export function PackageForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tiers, setTiers] = useState<Record<TierName, TierState>>({
    BASIC: emptyTier(true),
    STANDARD: emptyTier(false),
    PREMIUM: emptyTier(false),
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateTier(name: TierName, patch: Partial<TierState>) {
    setTiers((prev) => ({ ...prev, [name]: { ...prev[name], ...patch } }));
  }

  function handleSubmit() {
    setError(null);
    const enabledTiers = (Object.keys(tiers) as TierName[])
      .filter((n) => tiers[n].enabled)
      .map((n) => ({
        name: n,
        price: Number(tiers[n].price),
        deliveryDays: Number(tiers[n].deliveryDays),
        revisions: Number(tiers[n].revisions || "0"),
        description: tiers[n].description || undefined,
        features: tiers[n].features.split("\n").map((f) => f.trim()).filter(Boolean),
      }));

    if (enabledTiers.length === 0) {
      setError("Enable at least one pricing tier");
      return;
    }

    startTransition(async () => {
      const result = await createServicePackage({
        title,
        description,
        category,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        coverImageUrl: coverImageUrl || undefined,
        tiers: enabledTiers,
      });
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/worker/services");
      }
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 font-heading">
            <PackageIcon className="w-4 h-4 text-primary" />
            Service Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Service Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="I will build a responsive React dashboard for your business"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe exactly what's included, your process, and what the client receives."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Web Development"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills * (comma-separated)</Label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript"
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cover Image (optional)</Label>
            <ImageUpload
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              bucket="packages"
              shape="square"
              label="Upload cover"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tier matrix */}
      <div>
        <h2 className="text-base font-semibold text-foreground font-heading mb-3">Pricing Tiers</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {(Object.keys(TIER_META) as TierName[]).map((name) => {
            const t = tiers[name];
            const isLightning = t.deliveryDays !== "" && Number(t.deliveryDays) <= 1;
            return (
              <Card key={name} className={t.enabled ? "border-primary/30" : "opacity-70"}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-heading flex items-center gap-1.5">
                      {TIER_META[name].label}
                      {isLightning && t.enabled && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                          <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
                          Lightning
                        </span>
                      )}
                    </CardTitle>
                    <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={t.enabled}
                        onChange={(e) => updateTier(name, { enabled: e.target.checked })}
                      />
                      On
                    </label>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{TIER_META[name].hint}</p>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs">Price (₹) *</Label>
                    <Input
                      type="number"
                      min={100}
                      value={t.price}
                      disabled={!t.enabled}
                      onChange={(e) => updateTier(name, { price: e.target.value })}
                      placeholder="5000"
                      className="h-9"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Days *</Label>
                      <Input
                        type="number"
                        min={1}
                        value={t.deliveryDays}
                        disabled={!t.enabled}
                        onChange={(e) => updateTier(name, { deliveryDays: e.target.value })}
                        placeholder="7"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Revisions</Label>
                      <Input
                        type="number"
                        min={0}
                        value={t.revisions}
                        disabled={!t.enabled}
                        onChange={(e) => updateTier(name, { revisions: e.target.value })}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">What&apos;s included (one per line)</Label>
                    <textarea
                      className="w-full rounded-lg border border-border px-2.5 py-1.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      rows={3}
                      value={t.features}
                      disabled={!t.enabled}
                      onChange={(e) => updateTier(name, { features: e.target.value })}
                      placeholder={"Source code\n1 page\nResponsive"}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={isPending} className="w-full h-11 text-base">
        {isPending ? "Publishing…" : "Publish Service Package"}
      </Button>
    </div>
  );
}
