"use client";

import { useRef, useState, useEffect } from "react";

export default function StudioPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [src, setSrc] = useState<string>("/audio/Rev.mp3"); // default preset
  const [volume, setVolume] = useState<number>(80);
  const [error, setError] = useState<string | null>(null);

  // Keep element volume synced
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // File picker
  function onPickLocal(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setSrc(url);
    setError(null);
    queueMicrotask(() => audioRef.current?.play().catch(() => {}));
  }

  function onPlay() {
    setError(null);
    audioRef.current?.play().catch(() => {
      setError("Autoplay blocked—press Play again.");
    });
  }

  function onPause() {
    audioRef.current?.pause();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">Studio</h1>

      <div className="rounded-lg border p-4 space-y-4">
        {/* Transport */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPlay}
            className="rounded border px-3 py-1 hover:bg-gray-50"
          >
            ▶ Play
          </button>
          <button
            onClick={onPause}
            className="rounded border px-3 py-1 hover:bg-gray-50"
          >
            ⏸ Pause
          </button>

          <label className="ml-4 rounded border px-2 py-1 cursor-pointer hover:bg-gray-50">
            Choose file…
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={onPickLocal}
            />
          </label>
        </div>

        {/* Preset selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Preset:</span>
          <select
            className="rounded border px-2 py-1"
            value={src}
            onChange={(e) => setSrc(e.target.value)}
          >
            <option value="/audio/Rev.mp3">Rev Beat (public)</option>
          </select>
        </div>

        {/* Volume */}
        <div>
          <label className="block text-sm font-medium">
            Volume: {Math.round(volume)}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Player */}
        <audio
          ref={audioRef}
          src={src}
          controls
          preload="auto"
          onError={() => setError("Couldn’t load this audio source.")}
          className="w-full"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <p className="text-xs text-gray-500">
          Local files selected here don’t persist after refresh. For presets,
          drop files into <code>/public/audio</code>.
        </p>
      </div>
    </main>
  );
}
