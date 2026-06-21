import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/navbar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "QuickQuid – Verified Freelance Talent for Growing Businesses",
  description:
    "Connect with vetted freelancers. QuickQuid's human-reviewed talent pool ensures quality and trust for every project.",
  appleWebApp: {
    capable: true,
    title: "QuickQuid",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Toaster richColors position="top-right" />
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
