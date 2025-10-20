// src/app/studio/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/lib/useLocalStorage"; // if missing, swap with useState
import Visualizer from "@/components/Visualizer"; // if missing, comment the <Visualizer/>

function formatTime(sec: number | null | undefined) {
  if (!sec || !isFinite(sec)) return "0:00";
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function StudioPage() {
  const router = useRouter();

  // Persist last selected track
  const [trackUrl, setTrackUrl] = useLocalStorage<string | null>(
    "studioLastUrlV1",
    "/audio/sample-beat.mp3"
  );

  // UI/metadata
  const [title, setTitle] = useState("Untitled Track");
  const [statusMsg, setStatusMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [displayName, setDisplayName] = useState("sample-beat.mp3");

  // Audio graph refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaSrcRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Local blob lifecycle
  const blobUrlRef = useRef<string | null>(null);

  // Player state
  const [ctxUnlocked, setCtxUnlocked] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState<"stopped" | "playing" | "paused">(
    "stopped"
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);

  // AudioContext helpers
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

  // Build Web Audio graph once
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

  // Keep <audio> in sync with URL and infer title/display
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !trackUrl) return;
    el.src = trackUrl;
    el.load();

    if (trackUrl.startsWith("blob:")) {
      setDisplayName("Local upload");
      setTitle((t) => (t === "Untitled Track" ? "My Recording" : t));
    } else {
      try {
        const u = new URL(trackUrl, window.location.href);
        const last = u.pathname.split("/").filter(Boolean).pop() ?? trackUrl;
        setDisplayName(last);
        setTitle((last ?? "Untitled").replace(/\.[a-z0-9]+$/i, ""));
      } catch {
        const last = trackUrl.split("/").filter(Boolean).pop() ?? trackUrl;
        setDisplayName(last);
        setTitle((last ?? "Untitled").replace(/\.[a-z0-9]+$/i, ""));
      }
    }
  }, [trackUrl]);

  // Media events
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

  // Upload from computer
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

  // Transport
  function play() {
    ensureContext();
    audioCtxRef.current?.resume().catch(() => {});
    const el = audioRef.current;
    if (!el) return;
    el.muted = false;
    el.volume = 1;
    el.play().catch(() => {});
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

  // Helpers
  function getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = document.createElement("audio");
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        resolve(Math.round(audio.duration));
        URL.revokeObjectURL(audio.src);
      };
      audio.onerror = reject;
      audio.src = URL.createObjectURL(file);
    });
  }
  async function fetchBlobFromUrl(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.blob();
  }
  function putWithProgress(
    url: string,
    file: File,
    token: string,
    onProg: (n: number) => void
  ) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProg(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`Upload ${xhr.status}`));
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.open("PUT", url);
      xhr.setRequestHeader("authorization", `Bearer ${token}`);
      xhr.setRequestHeader("x-upsert", "false");
      xhr.send(file);
    });
  }

  // Save to Library (Supabase Storage + Prisma Track)
  async function saveToLibrary() {
    try {
      if (!trackUrl) return setStatusMsg("Pick or load a track first.");
      setIsSaving(true);
      setStatusMsg("");
      setUploadPct(0);

      // 1) Build a File from current source
      let file: File;
      if (trackUrl.startsWith("blob:")) {
        const blob = await (await fetch(trackUrl)).blob();
        file = new File([blob], `${title || "track"}.mp3`, {
          type: blob.type || "audio/mpeg",
        });
      } else {
        const blob = await fetchBlobFromUrl(trackUrl);
        const guessed = (displayName || "track").replace(/[^\w.\-]+/g, "_");
        file = new File([blob], guessed, { type: blob.type || "audio/mpeg" });
      }

      // 2) Sign upload
      const signRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, bucket: "media" }),
      });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || "Sign failed");

      // 3) Upload with progress
      await putWithProgress(sign.signedUrl, file, sign.token, setUploadPct);

      // 4) Duration
      const durationSec = await getAudioDuration(file).catch(() => null);

      // TODO: Replace with real user id once auth is wired
      const userId = "demo-user-id";

      // 5) Persist Track
      const saveRes = await fetch("/api/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled Track",
          description: "",
          publicUrl: sign.publicUrl,
          storagePath: sign.path,
          userId,
          durationSec,
        }),
      });
      const saved = await saveRes.json();
      if (!saveRes.ok) throw new Error(saved.error || "Save failed");

      setStatusMsg("✅ Saved to Library!");
      router.push(`/tracks/${saved.track.id}`);
    } catch (e: any) {
      setStatusMsg(`❌ ${e.message || "Save error"}`);
    } finally {
      setIsSaving(false);
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
        <span className="mr-2">🎵</span>Studio
      </h1>
      <p className="text-sm text-gray-400">
        Work on a track, visualize it, then save to your Library.
      </p>

      {/* Title + Save */}
      <div className="flex items-center gap-2">
        <input
          className="border rounded px-3 py-1 text-sm bg-black/40 border-white/20"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Track title"
        />
        <button
          onClick={saveToLibrary}
          disabled={!trackUrl || isSaving}
          className="px-3 py-1 rounded bg-white text-black disabled:opacity-50"
        >
          {isSaving ? `Saving… ${uploadPct}%` : "Save to Library"}
        </button>
      </div>
      {statusMsg && <div className="text-sm">{statusMsg}</div>}

      {/* Now Playing */}
      <div className="rounded border p-3 bg-white/5 border-white/10">
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
          style={{ width: "100%" }}
          crossOrigin="anonymous"
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
            className="px-3 py-1 rounded bg-gray-600 text-white"
            onClick={pause}
            disabled={!isReady}
          >
            Pause
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-300 text-black"
            onClick={stop}
            disabled={!isReady}
          >
            Stop
          </button>

          <label className="px-3 py-1 rounded bg-gray-100 border cursor-pointer text-black">
            Upload…
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>

          <button
            className="px-3 py-1 rounded bg-gray-200 text-black"
            onClick={() => setTrackUrl("/audio/sample-beat.mp3")}
          >
            Load Sample
          </button>
        </div>

        {/* Visualizer (optional) */}
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
