import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { AuthSessionProvider } from "@/components/providers/session-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "CodeBazaar — Digital Marketplace for Code & Creatives",
    template: "%s | CodeBazaar",
  },
  description:
    "Buy and sell high-quality scripts, plugins, themes, and digital assets from independent creators.",
  openGraph: {
    type: "website",
    siteName: "CodeBazaar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-slate-50 font-sans text-slate-900 antialiased">
        <AuthSessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieConsent />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
