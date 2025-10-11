// src/app/pro/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Visualizer from "@/components/Visualizer";
import EffectsRack from "@/components/EffectsRack"; // remove if not needed
import { useLocalStorage } from "@/lib/useLocalStorage";

function fmt(sec?: number | null) {
  if (sec == null || !isFinite(sec)) return "0:00";
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function ProPage() {
  // ----- Audio graph (master + analyser) -----
  const audioRef1 = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mGainRef = useRef<GainNode | null>(null);

  const [ctxUnlocked, setCtxUnlocked] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // track URLs (persist 1, live 2)
  const [track1Url, setTrack1Url] = useLocalStorage<string | null>(
    "proTrack1Url",
    "/audio/sample-beat.mp3"
  );
  const [track2Url, setTrack2Url] = useState<string | null>(null);

  // times
  const [t1Time, setT1Time] = useState(0);
  const [t2Time, setT2Time] = useState(0);
  const [t1Dur, setT1Dur] = useState<number | null>(null);
  const [t2Dur, setT2Dur] = useState<number | null>(null);

  // master UI
  const [masterVol, setMasterVol] = useState(80);

  function ensureCtx() {
    const AC =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AC();
    }
  }

  async function unlockCtx() {
    ensureCtx();
    if (!ctxRef.current) return;
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }
    setCtxUnlocked(true);
  }

  // Build simple master graph: audio1+audio2 -> master gain -> analyser -> destination
  useEffect(() => {
    ensureCtx();
    const ctx = ctxRef.current;
    const el1 = audioRef1.current;
    const el2 = audioRef2.current;
    if (!ctx || !el1 || !el2) return;

    const mGain = ctx.createGain();
    mGain.gain.value = masterVol / 100;
    mGainRef.current = mGain;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    const src1 = new MediaElementAudioSourceNode(ctx, { mediaElement: el1 });
    const src2 = new MediaElementAudioSourceNode(ctx, { mediaElement: el2 });

    src1.connect(mGain);
    src2.connect(mGain);
    mGain.connect(analyser);
    analyser.connect(ctx.destination);

    setIsReady(true);

    return () => {
      try {
        src1.disconnect();
      } catch {}
      try {
        src2.disconnect();
      } catch {}
      try {
        analyser.disconnect();
      } catch {}
      try {
        mGain.disconnect();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reflect master volume
  useEffect(() => {
    if (mGainRef.current) {
      mGainRef.current.gain.value = masterVol / 100;
    }
  }, [masterVol]);

  // attach media events for both players
  useEffect(() => {
    const el1 = audioRef1.current,
      el2 = audioRef2.current;
    if (!el1 || !el2) return;

    const h1Loaded = () =>
      setT1Dur(isFinite(el1.duration) ? el1.duration : null);
    const h2Loaded = () =>
      setT2Dur(isFinite(el2.duration) ? el2.duration : null);
    const h1Time = () => setT1Time(el1.currentTime || 0);
    const h2Time = () => setT2Time(el2.currentTime || 0);

    el1.addEventListener("loadedmetadata", h1Loaded);
    el2.addEventListener("loadedmetadata", h2Loaded);
    el1.addEventListener("timeupdate", h1Time);
    el2.addEventListener("timeupdate", h2Time);

    return () => {
      el1.removeEventListener("loadedmetadata", h1Loaded);
      el2.removeEventListener("loadedmetadata", h2Loaded);
      el1.removeEventListener("timeupdate", h1Time);
      el2.removeEventListener("timeupdate", h2Time);
    };
  }, []);

  function play1() {
    ensureCtx();
    ctxRef.current?.resume().catch(() => {});
    audioRef1.current?.play().catch(() => {});
  }
  function pause1() {
    audioRef1.current?.pause();
  }
  function stop1() {
    const el = audioRef1.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }
  function play2() {
    ensureCtx();
    ctxRef.current?.resume().catch(() => {});
    audioRef2.current?.play().catch(() => {});
  }
  function pause2() {
    audioRef2.current?.pause();
  }
  function stop2() {
    const el = audioRef2.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold flex items-center justify-between">
        <span>Musiq Pro</span>
        <button
          className="btn-secondary"
          onClick={() => window.open("/docs/quickstart", "_blank")}
        >
          ❓ Quick Start Guide
        </button>
      </h1>

      {/* Unlock + status */}
      <div className="flex items-center gap-3">
        <button className="btn-secondary" onClick={unlockCtx}>
          🔓 Unlock Audio {ctxUnlocked ? "✓" : ""}
        </button>
        <span className="text-sm text-neutral-400">
          {ctxUnlocked ? "Audio ready" : "Click to enable audio"}
        </span>
      </div>

      {/* Master */}
      <div className="card space-y-3">
        <label className="block font-medium">Master Volume</label>
        <input
          type="range"
          min={0}
          max={100}
          value={masterVol}
          onChange={(e) => setMasterVol(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-neutral-400">{masterVol}%</div>
        <Visualizer analyser={analyserRef} />
      </div>

      {/* Track 1 */}
      <div className="card space-y-3">
        <h2 className="font-semibold">Track 1</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="input"
            value={track1Url ?? ""}
            placeholder="/audio/sample-beat.mp3 or https://..."
            onChange={(e) => setTrack1Url(e.target.value || null)}
          />
          <label className="btn-secondary cursor-pointer">
            Upload…
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (!f) return;
                const url = URL.createObjectURL(f);
                setTrack1Url(url);
              }}
              className="hidden"
            />
          </label>
          <button
            className="btn-primary"
            onClick={play1}
            disabled={!isReady || !track1Url}
          >
            Play
          </button>
          <button
            className="btn-secondary"
            onClick={pause1}
            disabled={!isReady}
          >
            Pause
          </button>
          <button className="btn-secondary" onClick={stop1} disabled={!isReady}>
            Stop
          </button>
          <button
            className="btn-secondary"
            onClick={() => setTrack1Url("/audio/sample-beat.mp3")}
          >
            Load Sample
          </button>
        </div>

        <audio
          ref={audioRef1}
          controls
          preload="metadata"
          className="w-full mt-2"
        >
          <source src={track1Url ?? ""} type="audio/mpeg" />
        </audio>
        <div className="text-sm text-neutral-400">
          {fmt(t1Time)} / {fmt(t1Dur)}
        </div>
      </div>

      {/* Track 2 */}
      <div className="card space-y-3">
        <h2 className="font-semibold">Track 2</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="input"
            value={track2Url ?? ""}
            placeholder="Paste a URL or /audio/... path"
            onChange={(e) => setTrack2Url(e.target.value || null)}
          />
          <label className="btn-secondary cursor-pointer">
            Upload…
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (!f) return;
                const url = URL.createObjectURL(f);
                setTrack2Url(url);
              }}
              className="hidden"
            />
          </label>
          <button
            className="btn-primary"
            onClick={play2}
            disabled={!isReady || !track2Url}
          >
            Play
          </button>
          <button
            className="btn-secondary"
            onClick={pause2}
            disabled={!isReady}
          >
            Pause
          </button>
          <button className="btn-secondary" onClick={stop2} disabled={!isReady}>
            Stop
          </button>
          <button
            className="btn-secondary"
            onClick={() => setTrack2Url("/audio/sample-beat.mp3")}
          >
            Load Sample
          </button>
        </div>

        <audio
          ref={audioRef2}
          controls
          preload="metadata"
          className="w-full mt-2"
        >
          <source src={track2Url ?? ""} type="audio/mpeg" />
        </audio>
        <div className="text-sm text-neutral-400">
          {fmt(t2Time)} / {fmt(t2Dur)}
        </div>
      </div>

      {/* Effects (optional placeholder component) */}
      <EffectsRack />
    </main>
  );
}
