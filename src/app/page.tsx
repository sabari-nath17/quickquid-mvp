import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  Star,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TrustTicker } from "@/components/shared/trust-ticker";
import { EarningsCalculator } from "@/components/shared/earnings-calculator";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    if (session.role === "WORKER") redirect("/worker/dashboard");
    if (session.role === "CLIENT") redirect("/client/dashboard");
    if (session.role === "ADMIN") redirect("/admin/dashboard");
  }

  return (
    <div className="flex flex-col">
      {/* Hero — Split-path Audience Router */}
      <section className="relative overflow-hidden">
        {/* Top bar: trust ticker */}
        <div className="bg-gradient-to-b from-primary/5 to-transparent pt-8 pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-4">
            <TrustTicker />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground font-heading leading-tight tracking-tight max-w-3xl">
              One platform. <span className="text-primary">Two ways</span> to win.
            </h1>
          </div>
        </div>

        {/* Split viewport */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid md:grid-cols-2 gap-px rounded-2xl overflow-hidden border border-border bg-border">
            {/* Earn side */}
            <div className="bg-white p-8 lg:p-10 flex flex-col group hover:bg-primary/[0.02] transition-colors">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">For Students &amp; Freelancers</span>
              <h2 className="text-2xl font-bold text-foreground font-heading mb-2">Earn on your terms</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Get verified once, then receive real client work — projects, packages, and field gigs near you.
                Keep more of what you earn.
              </p>
              <div className="mb-6">
                <EarningsCalculator />
              </div>
              <Button size="lg" asChild className="gap-2 mt-auto w-full sm:w-fit">
                <Link href="/sign-up?role=WORKER">
                  Start Earning
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Hire side */}
            <div className="bg-white p-8 lg:p-10 flex flex-col group hover:bg-primary/[0.02] transition-colors">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">For Businesses</span>
              <h2 className="text-2xl font-bold text-foreground font-heading mb-2">Hire vetted talent</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Every freelancer is manually reviewed before you see them. Order a fixed-scope package
                or post a job — we make the introduction.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  "100% human-verified profiles",
                  "Order from a fixed-price catalog",
                  "Deliberate, admin-mediated introductions",
                  "Pre-verified standby bench for continuity",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" asChild className="gap-2 mt-auto w-full sm:w-fit">
                <Link href="/sign-up?role=CLIENT">
                  Hire Talent
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "100%", label: "Manually Verified" },
              { value: "48h", label: "Avg. Review Time" },
              { value: "0", label: "Automated Approvals" },
              { value: "Direct", label: "Client Payment" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-primary font-heading">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground font-heading mb-4">
              How QuickQuid Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A deliberate, human-mediated process that ensures every
              introduction is intentional and trustworthy.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                step: "01",
                title: "Freelancers Apply",
                desc: "Freelancers submit their LinkedIn, portfolio links, and experience — creating a rich professional profile for review.",
              },
              {
                icon: ShieldCheck,
                step: "02",
                title: "Admins Verify",
                desc: "Our team manually reviews every application. Only verified, high-quality talent makes it through our triage queue.",
              },
              {
                icon: Zap,
                step: "03",
                title: "We Introduce",
                desc: "Once matched to your job post, we make a deliberate introduction — unlocking the worker's full contact details for you.",
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <Card key={step} className="relative overflow-hidden border-border">
                <CardContent className="pt-8 pb-6">
                  <div className="absolute top-4 right-4 text-5xl font-bold text-primary/10 font-heading">
                    {step}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground font-heading mb-2">
                    {title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 text-primary bg-primary/10 border-primary/20">
                Worker-Forward Model
              </Badge>
              <h2 className="text-3xl font-bold text-foreground font-heading mb-6 leading-tight">
                Quality over quantity. Always.
              </h2>
              <div className="space-y-4">
                {[
                  "Every freelancer profile is personally reviewed by our admin team",
                  "LinkedIn and portfolio verification for every approved worker",
                  "Admin makes deliberate introductions — no automated spam",
                  "Direct payment between client and worker — transparent pricing",
                  "Immutable audit trail of every introduction made",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                  JD
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">Jane Doe</span>
                    <span className="verified-badge">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">UI/UX Design · React</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                &quot;QuickQuid helped me land my first real freelance project as a sophomore. The admin team made sure my profile stood out.&quot;
              </p>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-heading mb-6">
            Ready to find verified talent?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Post your job requirements and let our team make the perfect
            introduction.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link href="/sign-up?role=CLIENT">
                Post a Job
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs">QQ</span>
              </div>
              <span className="text-sm font-semibold text-foreground font-heading">
                QuickQuid
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 QuickQuid. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
