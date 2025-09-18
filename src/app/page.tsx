// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Musiq-Studio</h1>
      <p className="mt-3 text-lg">
        Welcome! Use the nav above to visit the Studio, Market, Privacy, and
        Terms pages.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">What’s next</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Build the <strong>Studio</strong> workspace.
          </li>
          <li>
            Set up the <strong>Market</strong> page.
          </li>
          <li>Add a custom favicon & metadata.</li>
        </ul>
      </section>
    </main>
  );
}
