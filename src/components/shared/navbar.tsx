import Link from "next/link";
import { getSession } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck } from "lucide-react";

export async function Navbar() {
  const session = await getSession();

  const roleLinks: Record<string, { href: string; label: string }[]> = {
    CLIENT: [
      { href: "/client/dashboard", label: "Dashboard" },
      { href: "/client/catalog", label: "Catalog" },
      { href: "/client/orders", label: "Orders" },
      { href: "/client/board", label: "Merit Board" },
      { href: "/client/talent", label: "Browse Talent" },
      { href: "/client/post-job", label: "Post a Job" },
    ],
    WORKER: [
      { href: "/worker/dashboard", label: "Dashboard" },
      { href: "/worker/jobs", label: "Find Jobs" },
      { href: "/worker/services", label: "My Services" },
      { href: "/worker/portfolio", label: "Portfolio" },
      { href: "/worker/applications", label: "Applications" },
      { href: "/worker/network", label: "Network" },
      { href: "/worker/referrals", label: "Refer" },
      { href: "/worker/onboarding", label: "Profile" },
      { href: "/worker/sandbox", label: "Sandbox" },
    ],
    ADMIN: [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/triage", label: "Triage Queue" },
      { href: "/admin/matchmaking", label: "Matchmaking" },
      { href: "/admin/applications", label: "Applications" },
      { href: "/admin/squads", label: "Squads" },
      { href: "/admin/standby", label: "Standby" },
      { href: "/admin/jobs", label: "Job Stream" },
    ],
  };

  const links = session ? roleLinks[session.role] ?? [] : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm font-heading">QQ</span>
              </div>
              <span className="text-xl font-bold text-foreground font-heading">
                QuickQuid
              </span>
            </Link>

            {session && (
              <nav className="hidden md:flex items-center gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                {session.role === "ADMIN" && (
                  <Badge variant="outline" className="gap-1 text-primary border-primary hidden sm:flex">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    nativeButton
                    render={
                      <button className="flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full" />
                    }
                  >
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {session.name
                          ? session.name.slice(0, 2).toUpperCase()
                          : session.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium truncate">
                        {session.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    {links.map((link) => (
                      <DropdownMenuItem
                        key={link.href}
                        render={<Link href={link.href} />}
                      >
                        {link.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <form action={signOut}>
                      <DropdownMenuItem
                        render={
                          <button
                            type="submit"
                            className="w-full text-left cursor-pointer text-destructive"
                          />
                        }
                      >
                        Sign out
                      </DropdownMenuItem>
                    </form>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild size="sm">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/sign-up">Get started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
