import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://logiclens.vercel.app"
  ),
  title: "LogicLens — Sketch to App, Instantly",
  description:
    "Transform hand-drawn sketches and whiteboard scribbles into fully functional, interactive React applications in real time. Powered by Gemini AI.",
  keywords: [
    "sketch to code",
    "AI app generator",
    "whiteboard to app",
    "intent to code",
    "Gemini AI",
    "React code generator",
    "LogicLens",
  ],
  authors: [{ name: "LogicLens" }],
  creator: "LogicLens",
  openGraph: {
    title: "LogicLens — Sketch to App, Instantly",
    description:
      "Draw your intent. Watch it become a working app.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LogicLens — Sketch to App, Instantly",
    description: "Draw your intent. Watch it become a working app.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFDF8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased bg-white text-black">{children}</body>
    </html>
  );
}
