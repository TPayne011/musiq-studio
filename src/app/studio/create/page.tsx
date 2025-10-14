// src/app/studio/create/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage"; // keep your existing hook
import Visualizer from "@/components/Visualizer"; // adjust if your path differs

function formatTime(sec: number | null | undefined) {
  if (!sec || !isFinite(sec)) return "0:00";
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function StudioCreatePage() {
  // Persist last selected track
  const [trackUrl, setTrackUrl] = useLocalStorage<string | null>(
    "studioLastUrlV1",
    "/audio/sample-beat.mp3"
  );

  // Core refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaSrcRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Local upload blob lifecycle
  const blobUrlRef = useRef<string | null>(null);

  // UI state
  const [ctxUnlocked, setCtxUnlocked] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState<"stopped" | "playing" | "paused">(
    "stopped"
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState<string>("sample-beat.mp3");

  function ensureContext() {
    const AC =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AC();
    }
  }

  async function unlockAudio() {
    ensureContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    setCtxUnlocked(true);
  }

  useEffect(() => {
    ensureContext();
    const ctx = audioCtxRef.current!;
    const el = audioRef.current;
    if (!ctx || !el) return;

    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
    }

    if (!mediaSrcRef.current) {
      mediaSrcRef.current = new MediaElementAudioSourceNode(ctx, {
        mediaElement: el,
      });
    }

    try {
      mediaSrcRef.current.disconnect();
    } catch {}
    try {
      analyserRef.current.disconnect();
    } catch {}

    mediaSrcRef.current.connect(analyserRef.current!);
    analyserRef.current!.connect(ctx.destination);

    setIsReady(true);

    return () => {
      try {
        mediaSrcRef.current?.disconnect();
      } catch {}
      try {
        analyserRef.current?.disconnect();
      } catch {}
    };
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !trackUrl) return;
    el.src = trackUrl;
    el.load();
    if (trackUrl.startsWith("blob:")) {
      setDisplayName("Local upload");
    } else {
      try {
        const u = new URL(trackUrl, window.location.href);
        const last = u.pathname.split("/").filter(Boolean).pop();
        setDisplayName(last ?? trackUrl);
      } catch {
        const last = trackUrl.split("/").filter(Boolean).pop();
        setDisplayName(last ?? trackUrl);
      }
    }
  }, [trackUrl]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onLoaded = () =>
      setDuration(isFinite(el.duration) ? el.duration : null);
    const onTime = () => setCurrentTime(el.currentTime || 0);
    const onPlay = () => setStatus("playing");
    const onPause = () => setStatus("paused");
    const onEnded = () => {
      setStatus("stopped");
      setCurrentTime(0);
    };

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  function handleUpload(file: File | null) {
    if (!file) return;
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    setTrackUrl(url);
  }

  function play() {
    ensureContext();
    audioCtxRef.current?.resume().catch(() => {});
    audioRef.current?.play().catch(() => {});
  }
  function pause() {
    audioRef.current?.pause();
  }
  function stop() {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setStatus("stopped");
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          className="px-3 py-1 rounded bg-amber-200"
          onClick={unlockAudio}
        >
          🔓 Unlock Audio {ctxUnlocked ? "✓" : ""}
        </button>
      </div>

      <h1 className="text-2xl font-bold">
        <span className="mr-2">🎵</span>Studio
      </h1>
      <p className="text-sm text-gray-600">
        Single-track player with Upload, Load Sample, visualizer, and
        persistence.
      </p>

      {/* Now Playing */}
      <div className="rounded border p-3 bg-white/60">
        <div className="flex items-center justify-between">
          <div className="font-medium">Now Playing: {displayName}</div>
          <div className="text-sm text-gray-600">
            {formatTime(currentTime)} / {formatTime(duration ?? 0)}
          </div>
        </div>
        <div className="text-xs mt-1 text-gray-500">Status: {status}</div>
      </div>

      {/* Player */}
      <section className="space-y-3">
        <audio
          ref={audioRef}
          controls
          preload="metadata"
          style={{ width: "100%" }}
        >
          <source src={trackUrl ?? ""} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-900 text-white"
            onClick={play}
            disabled={!isReady}
          >
            Play
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-500 text-white"
            onClick={pause}
            disabled={!isReady}
          >
            Pause
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={stop}
            disabled={!isReady}
          >
            Stop
          </button>

          <label className="px-3 py-1 rounded bg-gray-100 border cursor-pointer">
            Upload…
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>

          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() => setTrackUrl("/audio/sample-beat.mp3")}
          >
            Load Sample
          </button>
        </div>

        {/* Visualizer */}
        <Visualizer analyser={analyserRef} />
      </section>

      <div className="text-xs text-gray-500">
        Source:{" "}
        {trackUrl
          ? trackUrl.startsWith("blob:")
            ? "Local upload"
            : trackUrl
          : "—"}
      </div>
    </main>
  );
}
