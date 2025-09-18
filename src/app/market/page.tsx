// src/app/market/page.tsx
export default function MarketPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Market</h1>
      <p className="text-lg mb-6">
        Welcome to the Musiq-Studio Market. Here you’ll be able to browse,
        discover, and share music projects.
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>🎶 Featured tracks and loops</li>
        <li>🛒 Buy & sell audio assets (future)</li>
        <li>🌐 Community projects</li>
      </ul>
    </main>
  );
}
