import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteConfig } from "@/modules/settings/service";
import { RADIUS_CSS } from "@/modules/settings/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: {
      default: config.branding.siteName,
      template: `%s | ${config.branding.siteName}`,
    },
    description: config.banner.subheadline || config.branding.footerText,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [config, user] = await Promise.all([getSiteConfig(), getCurrentUser()]);
  const { theme } = config;

  const themeVars = {
    "--color-primary": theme.primary,
    "--color-accent": theme.accent,
    "--color-surface": theme.surface,
    "--color-text": theme.text,
    "--radius": RADIUS_CSS[theme.radius],
  } as React.CSSProperties;

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={themeVars}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader branding={config.branding} user={user} />
        <main className="flex-1">{children}</main>
        <SiteFooter branding={config.branding} />
      </body>
    </html>
  );
}
