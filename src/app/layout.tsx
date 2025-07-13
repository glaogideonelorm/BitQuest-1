import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#FF6B00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "BitQuest - AR Treasure Hunt with Bitrefill Rewards",
  description:
    "Embark on an exciting AR treasure hunt and earn exclusive Bitrefill rewards. Discover virtual treasures in the real world!",
  manifest: "/manifest.json",
  openGraph: {
    title: "BitQuest - AR Treasure Hunt",
    description:
      "Discover virtual treasures in the real world and earn Bitrefill rewards",
    images: [
      {
        url: "https://bitquest.xyz/og-image.png",
        width: 1200,
        height: 630,
        alt: "BitQuest Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BitQuest - AR Treasure Hunt",
    description:
      "Discover virtual treasures in the real world and earn Bitrefill rewards",
    images: ["https://bitquest.xyz/og-image.png"],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://bitquest.xyz/og-image.png",
    "fc:frame:button:1": "Start Quest",
    "fc:frame:post_url": "https://bitquest.xyz/api/frame",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta
          name="fc:miniapp"
          content={JSON.stringify({
            name: "BitQuest",
            description: "AR Treasure Hunt with Bitrefill Rewards",
            icon: "https://bitquest.xyz/icons/icon-512.png",
            launchUrl: "https://bitquest.xyz",
            splashScreen: "https://bitquest.xyz/splash.png",
            author: {
              name: "BitQuest Team",
              url: "https://bitquest.xyz",
            },
          })}
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
