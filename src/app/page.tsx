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
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    if (session.role === "WORKER") redirect("/worker/dashboard");
    if (session.role === "CLIENT") redirect("/client/dashboard");
    if (session.role === "ADMIN") redirect("/admin/dashboard");
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 gap-1.5 text-primary bg-primary/10 border-primary/20">
              <Star className="w-3 h-3 fill-current" />
              Human-Verified Freelance Talent
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground font-heading leading-tight tracking-tight mb-6">
              Trust-First Talent,{" "}
              <span className="text-primary">Built for Business</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
              QuickQuid connects growing businesses with rigorously vetted
              freelancers. Every profile is manually reviewed by
              our team before you ever see it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="gap-2 text-base">
                <Link href="/sign-up?role=CLIENT">
                  Hire Talent
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 text-base">
                <Link href="/sign-up?role=WORKER">
                  Apply as a Freelancer
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
