import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignUpForm } from "./sign-up-form";
import { getSession } from "@/lib/auth";

interface SignUpPageProps {
  searchParams: Promise<{ role?: string; ref?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const session = await getSession();
  if (session) {
    if (session.role === "WORKER") redirect("/worker/dashboard");
    if (session.role === "CLIENT") redirect("/client/dashboard");
    if (session.role === "ADMIN") redirect("/admin/dashboard");
    redirect("/");
  }

  const { role, ref } = await searchParams;
  const defaultRole = role === "CLIENT" ? "CLIENT" : "WORKER";

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/Blue.png" alt="QuickQuid" width={42} height={36} className="h-10 w-auto" priority />
            <span className="text-xl font-bold text-foreground font-heading">QuickQuid</span>
          </Link>
        </div>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-heading">Create your account</CardTitle>
            <CardDescription>Join QuickQuid to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm defaultRole={defaultRole} refCode={ref} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
