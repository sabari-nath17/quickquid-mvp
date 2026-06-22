import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignInForm } from "./sign-in-form";
import { getSession } from "@/lib/auth";

export default async function SignInPage() {
  const session = await getSession();
  if (session) {
    if (session.role === "WORKER") redirect("/worker/dashboard");
    if (session.role === "CLIENT") redirect("/client/dashboard");
    if (session.role === "ADMIN") redirect("/admin/dashboard");
    redirect("/");
  }

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
            <CardTitle className="text-2xl font-heading">Welcome back</CardTitle>
            <CardDescription>Sign in to your QuickQuid account</CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
