// src/app/studio/create/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import Visualizer from "@/components/Visualizer";

function formatTime(sec: number | null | undefined) {
  if (!sec || !isFinite(sec)) return "0:00";
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

async function jsonOrThrow(res: Response, label: string) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = await res.json();
    if (!res.ok)
      throw new Error(data?.error || `${label} failed (${res.status})`);
    return data;
  } else {
    const text = await res.text();
    throw new Error(`${label} non-JSON (${res.status}): ${text.slice(0, 200)}`);
  }
}

export default function StudioCreatePage() {
  // Persist last selected track (for preview)
  const [trackUrl, setTrackUrl] = useLocalStorage<string | null>(
    "studioLastUrlV1",
    "/audio/sample-beat.mp3"
  );

  // Keep the original File so we can upload with name/type
  const fileRef = useRef<File | null>(null);

  // Core refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaSrcRef = useRef<MediaElementAudioSourceNode | null>(null);

  // UI state
  const [ctxUnlocked, setCtxUnlocked] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState<"stopped" | "playing" | "paused">(
    "stopped"
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState<string>("sample-beat.mp3");

  // Save-to-Library UI
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saveErr, setSaveErr] = useState<string>("");

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
    if (ctx.state === "suspended") await ctx.resume();
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
    // Use src prop (no <source> child) for reliable reload
    el.src = trackUrl;
    el.load();

    if (trackUrl.startsWith("blob:")) {
      setDisplayName(fileRef.current?.name || "Local upload");
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
    // keep original file so we can upload with name/type
    fileRef.current = file;
    const url = URL.createObjectURL(file);
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

  async function saveToLibrary() {
    try {
      setSaving(true);
      setSaveErr("");
      setProgress(0);

      const file = fileRef.current;
      if (!file) {
        setSaveErr("Please choose a local audio file first (Upload…).");
        return;
      }

      // 1) Ask our signer for a signed URL + destination path
      const signRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          bucket: "media",
          contentType: file.type || "audio/mpeg",
        }),
      });
      const sign = await jsonOrThrow(signRes, "Upload signer"); // { url, method, headers, path, publicUrl }

      // 2) PUT the file to Supabase Storage (signed URL)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(sign.method || "PUT", sign.url, true);

        if (sign.headers) {
          for (const [k, v] of Object.entries(
            sign.headers as Record<string, string>
          )) {
            xhr.setRequestHeader(k, v);
          }
        }

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`Storage upload failed (${xhr.status})`));
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      // 3) Create Track row (server maps publicUrl -> audioUrl)
      const title = (displayName || file.name).replace(/\.[^.]+$/, "");
      const saveRes = await fetch("/api/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: "",
          publicUrl: sign.publicUrl,
          storagePath: sign.path,
          durationSec: Math.round(duration || 0),
        }),
      });
      const saved = await jsonOrThrow(saveRes, "Create track"); // { track }

      // 4) go to the new track page
      window.location.href = `/tracks/${saved.track.id}`;
    } catch (e: any) {
      setSaveErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
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
        <span className="mr-2">🎵</span>Studio — Create
      </h1>
      <p className="text-sm text-gray-400">
        Preview your track, then save it to your Library.
      </p>

      {/* Now Playing */}
      <div className="rounded border border-white/10 p-3 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="font-medium">Now Playing: {displayName}</div>
          <div className="text-sm text-gray-400">
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
          className="w-full"
          src={trackUrl ?? undefined}
          crossOrigin="anonymous"
        />
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

          <label className="px-3 py-1 rounded bg-gray-100/10 border border-white/10 cursor-pointer">
            Upload…
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>

          <button
            className="px-3 py-1 rounded bg-gray-200/10 border border-white/10"
            onClick={() => {
              fileRef.current = null;
              setTrackUrl("/audio/sample-beat.mp3");
            }}
          >
            Load Sample
          </button>

          <button
            className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition disabled:opacity-50"
            onClick={saveToLibrary}
            disabled={saving || !fileRef.current}
            title={!fileRef.current ? "Choose a local file first" : ""}
          >
            {saving ? "Saving…" : "Save to Library"}
          </button>
        </div>

        {saving && (
          <div className="w-full h-2 bg-white/10 rounded overflow-hidden">
            <div
              className="h-2 bg-indigo-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {saveErr && <div className="text-sm text-red-400">❌ {saveErr}</div>}
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
