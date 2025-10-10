export default function QuickstartPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-piPurple">Quickstart</h1>
      <ol className="mt-6 space-y-6 text-gray-200">
        <li>
          <h2 className="text-xl font-semibold">1) Unlock Audio</h2>
          <p className="mt-1">
            On the Pro page, click{" "}
            <span className="font-medium">“Unlock Audio”</span> so the browser
            can start the AudioContext.
          </p>
        </li>
        <li>
          <h2 className="text-xl font-semibold">2) Load a Track</h2>
          <p className="mt-1">
            Paste a URL or click <span className="font-medium">Upload…</span>{" "}
            for Track 1 and Track 2. You can also use the sample at{" "}
            <code>/audio/sample-beat.mp3</code>.
          </p>
        </li>
        <li>
          <h2 className="text-xl font-semibold">3) Mix</h2>
          <p className="mt-1">
            Adjust <span className="font-medium">Gain</span> and{" "}
            <span className="font-medium">Pan</span>, then experiment with the
            <span className="font-medium"> Effects Rack</span> (Reverb, Delay,
            Bass, Compressor). Use the visualizer to watch levels.
          </p>
        </li>
        <li>
          <h2 className="text-xl font-semibold">4) Export</h2>
          <p className="mt-1">
            Click <span className="font-medium">Export Mixdown (WAV)</span> to
            render an offline stereo mix.
          </p>
        </li>
        <li>
          <h2 className="text-xl font-semibold">5) Pi Sandbox (Optional)</h2>
          <p className="mt-1">
            Use <span className="font-medium">Connect with Pi (Sandbox)</span>{" "}
            to simulate a Pi payment flow during development.
          </p>
        </li>
      </ol>

      <div className="mt-10">
        <a href="/pro" className="underline hover:opacity-90">
          ← Back to Musiq Pro
        </a>
      </div>
    </main>
  );
}
