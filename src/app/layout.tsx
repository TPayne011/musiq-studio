// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Header from "./Header"; // client component is fine inside a server layout

export const metadata: Metadata = {
  title: "Musiq-Studio",
  description: "Web3 music creation & NFT minting for the Pi Network",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
