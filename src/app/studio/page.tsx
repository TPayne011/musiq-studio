"use client";

import { useEffect, useRef } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";

// Mixer state type
type MixerState = {
  src: string; // audio source url
  volume: number; // 0..1
  pan: number; // -1..1
  muted: boolean;
  loop: boolean;
};

const DEFAULT_STATE: MixerState = {
  src: "/audio/Rev.mp3", // your daughter's beat as default
  volume: 0.8,
  pan: 0,
  muted: false,
  loop: true,
};

export default function StudioPage() {
  const [state, setState] = useLocalStorage<MixerState>(
    "musiq.mixer.v1",
    DEFAULT_STATE
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update audio element when state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = state.src;
    audio.loop = state.loop;
    audio.muted = state.muted;
    audio.volume = state.muted ? 0 : state.volume;
  }, [state]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Studio</h1>

      <section className="rounded-lg border p-4 space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            className="rounded border px-3 py-1 hover:bg-gray-50"
            onClick={() => audioRef.current?.play()}
          >
            ▶ Play
          </button>
          <button
            className="rounded border px-3 py-1 hover:bg-gray-50"
            onClick={() => audioRef.current?.pause()}
          >
            ⏸ Pause
          </button>

          <label className="ml-4 inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.loop}
              onChange={(e) => setState({ ...state, loop: e.target.checked })}
            />
            Loop
          </label>

          <label className="ml-4 inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.muted}
              onChange={(e) => setState({ ...state, muted: e.target.checked })}
            />
            Mute
          </label>
        </div>

        {/* Volume + Pan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium">
              Volume: {Math.round(state.volume * 100)}%
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.volume}
              onChange={(e) =>
                setState({ ...state, volume: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Pan: {state.pan}
            </label>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={state.pan}
              onChange={(e) =>
                setState({ ...state, pan: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>
        </div>

        {/* Track picker */}
        <div className="flex items-center gap-3">
          <select
            className="rounded border px-2 py-1"
            value={state.src}
            onChange={(e) => setState({ ...state, src: e.target.value })}
          >
            <option value="/audio/Rev.mp3">Rev Beat (public)</option>
            {/* Drop more into /public/audio and add here */}
          </select>
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} preload="auto" />
      </section>

      <p className="text-sm text-gray-500">
        Settings (volume/pan/mute/loop and last track) are saved automatically
        in your browser and restored on reload.
      </p>
    </main>
  );
}
