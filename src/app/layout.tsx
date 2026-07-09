import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Fraunces } from "next/font/google";
import "./globals.css";
import { RegisterSW } from "@/components/RegisterSW";
import { ProgressProvider } from "@/components/ProgressProvider";
import { DisclaimerModal } from "@/components/DisclaimerModal";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Steady — 30-Day Knee Strength & Recovery",
  description:
    "A gentle, progressive 30-day program to strengthen the muscles that support your knees. Guided sessions with timers, rep pacing, and animated demos.",
  applicationName: "Steady",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Steady",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#245446",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${atkinson.variable} ${fraunces.variable}`}>
        <ProgressProvider>
          <div className="steady">
            <div className="frame">{children}</div>
          </div>
          <DisclaimerModal />
        </ProgressProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
