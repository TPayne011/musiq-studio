"use client";

import Link from "next/link";

export default function QuickStartPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">
        🎧 Musiq-Studio Quick Start Guide
      </h1>

      <p className="text-gray-600">
        Welcome to <strong>Musiq-Studio Pro</strong> — your browser-based
        two-track mixer built for the Pi Network. This quick guide shows you how
        to unlock audio, load tracks, mix stems, apply effects, and export your
        own mixdown.
      </p>

      {/* Step 1 */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Unlock Audio</h2>
        <p>
          If playback is blocked, click <strong>🔓 Unlock Audio</strong> to
          activate the browser’s AudioContext. Once unlocked, you’ll see{" "}
          <em>“Audio ready”</em> beside the button.
        </p>
      </section>

      {/* Step 2 */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">
          2. Load or Upload Tracks
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Click <strong>Load Sample</strong> to load the built-in{" "}
            <code>sample-beat.mp3</code>.
          </li>
          <li>
            Or choose <strong>Upload…</strong> to import your own{" "}
            <code>.mp3</code> or <code>.wav</code> file from your device.
          </li>
          <li>Each track can be a vocal, beat, or instrument stem.</li>
        </ul>
      </section>

      {/* Step 3 */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">
          3. Adjust Volume & Panning
        </h2>
        <p>
          Each track has <strong>Gain</strong> (volume) and <strong>Pan</strong>{" "}
          controls. Move the sliders left or right to position your sound in the
          stereo field — perfect for quick mixing.
        </p>
      </section>

      {/* Step 4 */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Add Effects</h2>
        <p>
          In the <strong>Effects Rack</strong>, tweak:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Reverb</strong> – adds room space
          </li>
          <li>
            <strong>Delay</strong> – echoes or repeats
          </li>
          <li>
            <strong>Bass EQ</strong> – boosts low frequencies
          </li>
          <li>
            <strong>Compressor</strong> – balances volume dynamics
          </li>
        </ul>
        <p className="mt-2">
          Toggle any effect off using the <strong>Bypass</strong> switches.
        </p>
      </section>

      {/* Step 5 */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">
          5. Export Your Mixdown
        </h2>
        <p>
          When you’re happy with your mix, click{" "}
          <strong>⬇️ Export Mixdown (WAV)</strong>. Your mixed tracks are
          rendered and downloaded as a stereo <code>.wav</code> file.
        </p>
      </section>

      {/* Step 6 */}
      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">
          6. Connect with Pi (Sandbox)
        </h2>
        <p>
          Tap <strong>⚡ Connect with Pi (Sandbox)</strong> to simulate a Pi
          Network payment integration. In production, this will trigger a real{" "}
          <code>pi.openPayment()</code> flow in Pi Browser.
        </p>
      </section>

      {/* Return Button */}
      <div className="mt-8">
        <Link
          href="/studio/pro"
          className="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 border text-sm transition"
        >
          ↩ Return to Studio
        </Link>
      </div>

      {/* Footer */}
      <footer className="text-sm text-gray-500 pt-8 border-t mt-8">
        <p>
          © {new Date().getFullYear()} Musiq-Studio • Built by Anthony Payne •
          Created for the Pi Network Hackathon 2025
        </p>
      </footer>
    </main>
  );
}
