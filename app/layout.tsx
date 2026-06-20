import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClarityProvider } from "@/components/analytics/clarity-provider";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Intentionally",
  description: "Video-first dating, designed for higher-signal matches.",
  other: {
    "color-scheme": "only light",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f1e8da",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full bg-[#f1e8da] text-[#241c17] antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#f1e8da] font-sans text-[#241c17]">
        <ClarityProvider />
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
