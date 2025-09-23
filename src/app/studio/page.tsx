// src/app/studio/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Track = {
  id: string;
  name: string;
  volume: number; // 0–100
  muted: boolean;
};

const STORAGE_KEY = "musiq-studio:tracks:v1";

const initialTracks: Track[] = [
  { id: "t1", name: "Drums", volume: 80, muted: false },
  { id: "t2", name: "Bass", volume: 70, muted: false },
  { id: "t3", name: "Keys", volume: 65, muted: false },
];

// Simple ID generator (avoid crypto type hassles)
function makeId(): string {
  return Math.random().toString(36).slice(2);
}

export default function StudioPage() {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  // useRef for debounce timer (number from window.setTimeout in browsers)
  const saveTimer = useRef<number | null>(null);

  // --- Load from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed) && parsed.every(isTrack)) {
          setTracks(parsed);
        }
      }
    } catch {
      // ignore corrupted storage
    } finally {
      setLoaded(true);
    }
  }, []);

  // --- Debounced save to localStorage (clean types, no ts-ignore)
  useEffect(() => {
    if (!loaded) return;

    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
    }

    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
      } catch {
        // storage may be blocked/full
      }
    }, 250);

    saveTimer.current = t;

    return () => {
      window.clearTimeout(t);
    };
  }, [tracks, loaded]);

  // --- Actions
  const addTrack = (name: string) =>
    setTracks((prev) => [
      ...prev,
      { id: makeId(), name, volume: 75, muted: false },
    ]);

  const removeTrack = (id: string) =>
    setTracks((prev) => prev.filter((x) => x.id !== id));

  const setVolume = (id: string, volume: number) =>
    setTracks((prev) => prev.map((x) => (x.id === id ? { ...x, volume } : x)));

  const toggleMute = (id: string) =>
    setTracks((prev) =>
      prev.map((x) => (x.id === id ? { ...x, muted: !x.muted } : x))
    );

  const resetAll = () => {
    setTracks(initialTracks);
    setUploadName(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const totalTracks = tracks.length;
  const mutedCount = useMemo(
    () => tracks.filter((t) => t.muted).length,
    [tracks]
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Studio</h1>
          <p className="mt-2 text-gray-700">
            Your creative workspace. Add tracks, tweak levels, and upload stems
            (demo only).
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {loaded ? (
              <>
                {totalTracks} {totalTracks === 1 ? "track" : "tracks"}
                {mutedCount ? ` • ${mutedCount} muted` : ""} • saved locally
              </>
            ) : (
              <>Loading…</>
            )}
          </p>
        </div>
        <button
          onClick={resetAll}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          title="Clear local data and restore defaults"
        >
          Reset
        </button>
      </header>

      {/* Upload / Add Track */}
      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Add Track</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => addTrack("New Track")}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            + Quick Track
          </button>

          <div className="text-sm text-gray-600">or upload a file:</div>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-gray-50">
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const f = e.currentTarget.files?.[0];
                if (f) {
                  setUploadName(f.name);
                  const base = f.name.replace(/\.[^/.]+$/, "");
                  addTrack(base || "Uploaded Track");
                }
              }}
            />
            <span>Choose audio…</span>
          </label>

          {uploadName && (
            <span className="text-sm text-gray-600">
              Selected: {uploadName}
            </span>
          )}
        </div>
      </section>

      {/* Track List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tracks</h2>
          <span className="text-sm text-gray-600">{tracks.length} total</span>
        </div>

        <div className="divide-y rounded-lg border">
          {tracks.map((tr) => (
            <div
              key={tr.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="truncate text-base font-medium">
                  {tr.muted ? "🔇 " : ""}
                  {tr.name}
                </div>
                <div className="text-xs text-gray-500">
                  ID: {tr.id.slice(0, 8)}…
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 w-16">
                    Vol {tr.volume}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={tr.volume}
                    onChange={(e) => setVolume(tr.id, Number(e.target.value))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMute(tr.id)}
                    className="rounded-md border px-3 py-1.5 hover:bg-gray-50"
                  >
                    {tr.muted ? "Unmute" : "Mute"}
                  </button>
                  <button
                    onClick={() => removeTrack(tr.id)}
                    className="rounded-md border px-3 py-1.5 text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {tracks.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-600">
              No tracks yet. Use <strong>+ Quick Track</strong> or choose an
              audio file to add one.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function isTrack(x: unknown): x is Track {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.volume === "number" &&
    typeof o.muted === "boolean"
  );
}
