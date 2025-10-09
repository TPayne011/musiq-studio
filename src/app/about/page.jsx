// Remove any next/head usage in App Router files.
// This file must default-export a React component,
// and can optionally export `metadata`.

export const metadata = {
  title: "About | Musiq Studio 🎵",
  description:
    "Musiq Studio is a next-gen Web3 music creation platform for the Pi Network community.",
  openGraph: {
    title: "Musiq Studio | About",
    description: "Create, mint, and share your music on the Pi Network.",
    url: "https://musiqstudio.netlify.app/about",
    siteName: "Musiq Studio",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "Musiq Studio" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Musiq Studio | Web3 Music",
    description: "Built for Pi Network.",
    images: ["/og-image.jpg"],
  },
};

export default function AboutPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">
        🎵 About Musiq Studio
      </h1>

      <p className="max-w-2xl mb-6 text-lg text-gray-300">
        <strong>Musiq Studio</strong> is a next-generation Web3 music creation
        platform built for the
        <strong> Pi Network</strong> community. We believe every creator
        deserves the power to make, own, and share their sound — without
        barriers, middlemen, or fees.
      </p>

      <p className="max-w-2xl mb-6 text-gray-400">
        Our mission is simple: empower everyday artists to{" "}
        <strong>compose, mint, and monetize</strong>
        their music directly on the blockchain.
      </p>

      <ul className="text-left list-disc list-inside max-w-lg mb-6 text-gray-400">
        <li>🎧 Create original tracks using intuitive tools</li>
        <li>💿 Mint your music as NFTs in the Pi ecosystem</li>
        <li>🌍 Share your sound across a decentralized community</li>
        <li>💰 Earn Pi while expressing your creativity</li>
      </ul>

      <section className="mt-12 max-w-2xl text-gray-400">
        <h2 className="text-2xl font-semibold mb-3">💡 Our Vision</h2>
        <p>
          To make music creation and ownership accessible to everyone through
          the simplicity and reach of Pi Network.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">
          🚀 Built for the Pi Community
        </h2>
        <p>
          Musiq Studio is proudly developed within the Pi ecosystem, leveraging
          Pi’s developer tools and SDK to ensure smooth integration, fair
          distribution, and a creator-first economy.
        </p>
      </section>
    </main>
  );
}
