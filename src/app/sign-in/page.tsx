import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
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
