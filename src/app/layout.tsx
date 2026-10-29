import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FairShift — Work should work for everyone",
    template: "%s · FairShift",
  },
  description:
    "FairShift helps workers and workplace teams make shifts clearer, safer, and fairer. Built for decent work and economic growth (UN SDG 8).",
  applicationName: "FairShift",
  category: "technology",
  openGraph: {
    title: "FairShift — Work should work for everyone",
    description:
      "Clear shifts, transparent pay, and a safe way to report workplace hazards. A Prompt Wars 2026 project for UN SDG 8.",
    type: "website",
    siteName: "FairShift",
    locale: "en_IN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#193a35",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
