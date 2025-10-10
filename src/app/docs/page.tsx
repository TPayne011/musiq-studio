export default function DocsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold text-piPurple">Musiq Studio Docs</h1>
      <p className="mt-3 text-gray-300">
        Learn how to create, mix, and export your music. Built for Pi Network.
      </p>

      <div className="mt-8 space-y-4">
        <section>
          <h2 className="text-2xl font-semibold">Start Here</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-300">
            <li>
              <a className="underline hover:opacity-90" href="/docs/quickstart">
                Quickstart
              </a>
            </li>
            <li>
              <a className="underline hover:opacity-90" href="/docs/tracks">
                Tracks & Uploads
              </a>
            </li>
            <li>
              <a className="underline hover:opacity-90" href="/docs/effects">
                Effects Rack
              </a>
            </li>
            <li>
              <a className="underline hover:opacity-90" href="/docs/export">
                Exporting Mixdowns
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Pi Integration</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-300">
            <li>
              <a className="underline hover:opacity-90" href="/docs/pi-sandbox">
                Pi Sandbox (Testing)
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
