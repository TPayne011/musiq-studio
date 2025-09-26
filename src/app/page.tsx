// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center">Musiq-Studio</h1>
      <p className="mt-4 text-lg text-center text-gray-700">
        Welcome! Use the navigation above to explore the Studio, Market,
        Privacy, and Terms pages.
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold">What’s Next</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Build out the <strong>Studio</strong> workspace for creating music.
          </li>
          <li>
            Expand the <strong>Market</strong> for sharing and minting tracks as
            NFTs.
          </li>
          <li>Add custom branding (logo, favicon, metadata).</li>
        </ul>
      </section>
    </main>
  );
}
