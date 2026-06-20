import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignUpForm } from "./sign-up-form";

interface SignUpPageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { role } = await searchParams;
  const defaultRole = role === "CLIENT" ? "CLIENT" : "WORKER";

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm font-heading">QQ</span>
            </div>
            <span className="text-xl font-bold text-foreground font-heading">QuickQuid</span>
          </Link>
        </div>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-heading">Create your account</CardTitle>
            <CardDescription>Join QuickQuid to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm defaultRole={defaultRole} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
