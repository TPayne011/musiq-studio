// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Nav from "./_components/Nav";

export const metadata: Metadata = {
  title: {
    default: "Musiq Studio 🎵",
    template: "%s | Musiq Studio 🎵",
  },
  description:
    "Create, mint, and own your sound — Only on Pi Network. A next-gen Web3 music creation platform for Pioneers.",
  openGraph: {
    title: "Musiq Studio 🎵",
    description: "Create, mint, and own your sound — Only on Pi Network.",
    url: "https://musiqstudio.netlify.app",
    siteName: "Musiq Studio",
    images: [
      { url: "/og-home.jpg", width: 1200, height: 630, alt: "Musiq Studio" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Musiq Studio 🎵",
    description: "Only on Pi Network.",
    images: ["/og-home.jpg"],
  },
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white antialiased selection:bg-piPurple/40 selection:text-white">
        <Nav />

        <main className="min-h-[80vh]">{children}</main>

        <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Musiq Studio — Only on Pi Network
        </footer>
      </body>
    </html>
  );
}
