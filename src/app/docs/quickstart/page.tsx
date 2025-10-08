// src/app/docs/quickstart/page.tsx
"use client";
import Link from "next/link";

export default function QuickStartGuide() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-3xl font-bold">🎧 Musiq-Studio Quick Start Guide</h1>

      <p className="text-gray-700">
        Welcome to <strong>Musiq-Studio Pro</strong> — your two-track Pi-powered
        music lab. Follow these steps to load beats, vocals, and mix like a pro.
      </p>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Unlock Audio</h2>
        <p className="text-gray-600">
          Click <strong>🔓 Unlock Audio</strong> when the page loads. This lets
          your browser start playback and visualization.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">2. Load Your Tracks</h2>
        <p className="text-gray-600">
          You can <strong>upload from your computer</strong> or use the
          <strong> Load Sample</strong> button to test a beat. Track 1 and Track
          2 can be used for <em>beats</em> and <em>vocals</em>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">3. Mix & Adjust</h2>
        <ul className="list-disc pl-6 text-gray-600">
          <li>Use the Gain slider to balance volume between tracks.</li>
          <li>Pan left/right for stereo placement.</li>
          <li>
            Apply FX (reverb, delay, bass EQ, compression) for tone control.
          </li>
          <li>Bypass any effect with the check box toggle.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Export Mixdown</h2>
        <p className="text-gray-600">
          When ready, click <strong>Export Mixdown (WAV)</strong> to render your
          mix and download a high-quality stereo file.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">
          5. Connect with Pi Network
        </h2>
        <p className="text-gray-600">
          Tap <strong>Connect with Pi (sandbox)</strong> to preview how Pi
          payments will integrate in future versions.
        </p>
      </section>

      <footer className="text-sm text-gray-500 pt-8 border-t">
        <p>
          © {new Date().getFullYear()} Musiq-Studio • Created by Anthony Payne •
          Built for the Pi Network Hackathon 2025
        </p>
      </footer>
    </main>
  );
}
