import "./globals.css";
import type { Metadata } from "next";
import Header from "./Header";
import Footer from "./Footer";

export const metadata: Metadata = {
  title: "Musiq-Studio",
  description: "Web3 music creation & NFT minting for the Pi Network",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    manifest: "/manifest.webmanifest",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
