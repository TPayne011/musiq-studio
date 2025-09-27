// src/app/studio/page.tsx
"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";

export default function StudioPage() {
  // Persist volume slider with localStorage
  const [volume, setVolume] = useLocalStorage("studio-volume", 50);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => setIsPlaying((prev) => !prev);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Studio</h1>
      <h2 className="text-2xl text-blue-600 mt-4">Tailwind is working</h2>

      <section className="space-y-6">
        {/* Audio Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-64"
          />
          <span>{volume}%</span>
        </div>

        {/* Sample Beat */}
        <audio src="/audio/Rev.mp3" controls style={{ width: "100%" }} />
      </section>
    </main>
  );
}
