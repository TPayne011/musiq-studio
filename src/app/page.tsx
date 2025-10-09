// src/app/page.tsx
import HomeHero from "./_components/HomeHero";

export const metadata = {
  title: "Musiq Studio — Only on Pi Network",
  description:
    "A Web3 music creation studio for Pioneers. Create, mint, and own your sound — Only on Pi Network.",
  openGraph: {
    title: "Musiq Studio — Only on Pi Network",
    description:
      "A next-gen Web3 music studio for Pioneers. Create, mint, own your sound.",
    url: "https://musiqstudio.netlify.app",
    siteName: "Musiq Studio",
    images: [
      { url: "/og-home.jpg", width: 1200, height: 630, alt: "Musiq Studio" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Musiq Studio — Create. Mint. Own.",
    images: ["/og-home.jpg"],
  },
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <HomeHero />
    </main>
  );
}
