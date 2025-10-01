"use client";

import { useEffect, useMemo, useRef, useState } from "react";
// If you don't have the @ alias in tsconfig, change to: ../../../lib/useLocalStorage
import { useLocalStorage } from "@/lib/useLocalStorage";

type Track = {
  id: number;
  name: string;
  src: string | null; // preset "/audio/Rev.mp3" or blob: URL
  volume: number; // 0..100
  pan: number; // -100..100
  el: HTMLAudioElement | null;
};

type SavedTrack = {
  id: number;
  name: string;
  srcPreset: string | null; // only save preset paths
  volume: number;
  pan: number;
};

const TRACKS_KEY = "musiqProTracksV2";
const MASTER_KEY = "musiqProMasterV1";

const initialTracks: Omit<Track, "el">[] = [
  { id: 1, name: "Track 1", src: "/audio/Rev.mp3", volume: 80, pan: 0 },
  { id: 2, name: "Track 2", src: null, volume: 80, pan: 0 },
];

function loadSavedTracks(): Omit<Track, "el">[] | null {
  try {
    const raw = localStorage.getItem(TRACKS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedTrack[];
    return parsed.map((t) => ({
      id: t.id,
      name: t.name,
      src: t.srcPreset, // restore only preset paths (not local blobs)
      volume: t.volume,
      pan: t.pan,
    }));
  } catch {
    return null;
  }
}

export default function StudioProPage() {
  // ---- Audio graph refs
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const sourceNodes = useRef<Map<number, MediaElementAudioSourceNode>>(
    new Map()
  );
  const trackGains = useRef<Map<number, GainNode>>(new Map());
  const trackPans = useRef<Map<number, StereoPannerNode>>(new Map());
  const blobUrls = useRef<Map<number, string>>(new Map());

  // ---- State
  const saved = typeof window !== "undefined" ? loadSavedTracks() : null;
  const [tracks, setTracks] = useState<Track[]>(
    (saved ?? initialTracks).map((t) => ({ ...t, el: null }))
  );

  // Persisted master volume (0..100)
  const [masterVol, setMasterVolume] = useLocalStorage<number>(
    "musiqProMasterV1",
    100
  );
  const [ready, setReady] = useState(false);
  const [stereoSupported, setStereoSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Build audio graph once
  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const canStereo = typeof (ctx as any).createStereoPanner === "function";
    setStereoSupported(canStereo);

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyserRef.current = analyser;

    const master = ctx.createGain();
    master.gain.value = masterVol / 100;
    masterGainRef.current = master;
    // when you create the master gain the first time
    masterGainRef.current = ctx.createGain();
    masterGainRef.current.gain.value = masterVol / 100;

    // master -> analyser -> destination
    master.connect(analyser);
    analyser.connect(ctx.destination);

    // Create audio elements + per-track nodes
    const updated = tracks.map((t) => {
      const el = new Audio();
      el.loop = true;
      if (t.src) el.src = t.src;
      el.volume = t.volume / 100;

      const src = ctx.createMediaElementSource(el);
      sourceNodes.current.set(t.id, src);

      const g = ctx.createGain();
      g.gain.value = t.volume / 100;
      trackGains.current.set(t.id, g);

      let panner: StereoPannerNode | null = null;
      if (canStereo) {
        panner = (ctx as any).createStereoPanner() as StereoPannerNode;
        panner.pan.value = t.pan / 100;
        trackPans.current.set(t.id, panner);
      }

      // Chain: src -> gain -> pan? -> master
      if (panner) {
        src.connect(g);
        g.connect(panner);
        panner.connect(master);
      } else {
        src.connect(g);
        g.connect(master);
      }

      return { ...t, el };
    });

    setTracks(updated);
    setReady(true);

    return () => {
      try {
        updated.forEach((t) => t.el?.pause());
      } catch {}
      try {
        ctx.close();
      } catch {}
      sourceNodes.current.clear();
      trackGains.current.clear();
      trackPans.current.clear();
      // revoke blob URLs
      blobUrls.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
      blobUrls.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Apply master volume changes
  // ---- Apply master volume changes
  useEffect(() => {
    if (masterGainRef.current)
      masterGainRef.current.gain.value = masterVol / 100;
  }, [masterVol]);

  // ---- Persist track settings (preset src/volume/pan) when they change
  useEffect(() => {
    if (!ready) return;
    const data: SavedTrack[] = tracks.map((t) => ({
      id: t.id,
      name: t.name,
      volume: t.volume,
      pan: t.pan,
      srcPreset: t.src && t.src.startsWith("/") ? t.src : null,
    }));
    try {
      localStorage.setItem(TRACKS_KEY, JSON.stringify(data));
    } catch {}
  }, [tracks, ready]);

  const resumeCtx = async () => {
    const ctx = ctxRef.current;
    if (ctx && ctx.state !== "running") {
      try {
        await ctx.resume();
      } catch {}
    }
  };

  const playAll = async () => {
    setError(null);
    await resumeCtx();
    await Promise.all(
      tracks.map(async (t) => {
        if (t.el && t.el.src) {
          try {
            await t.el.play();
          } catch {}
        }
      })
    );
  };
  const pauseAll = () => tracks.forEach((t) => t.el?.pause());
  const stopAll = () =>
    tracks.forEach((t) => {
      if (t.el) {
        t.el.pause();
        t.el.currentTime = 0;
      }
    });

  // ---- UI handlers
  const setPreset = (id: number, value: string) => {
    const val = value || null;
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.el) {
          t.el.onloadedmetadata = async () => {
            await resumeCtx();
            if (val) t.el!.play().catch(() => {});
          };
          t.el.onerror = () =>
            setError("Preset failed to load (check /public/audio path)");
          t.el.src = val ?? "";
          t.el.load();
        }
        return { ...t, src: val };
      })
    );
  };

  const onPickLocal = (id: number, list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);

    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        const prevUrl = blobUrls.current.get(id);
        if (prevUrl?.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(prevUrl);
          } catch {}
        }
        blobUrls.current.set(id, url);

        if (t.el) {
          t.el.onloadedmetadata = async () => {
            await resumeCtx();
            t.el!.play().catch(() => {});
          };
          t.el.onerror = () =>
            setError("Couldn’t load that file (try mp3/wav).");
          t.el.src = url;
          t.el.load();
        }
        return { ...t, src: url };
      })
    );
  };

  const onVolume = (id: number, v: number) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.el) t.el.volume = v / 100;
        const node = trackGains.current.get(id);
        if (node && ctxRef.current)
          node.gain.setValueAtTime(v / 100, ctxRef.current.currentTime);
        return { ...t, volume: v };
      })
    );
  };

  const onPan = (id: number, v: number) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const node = trackPans.current.get(id);
        if (node && ctxRef.current)
          node.pan.setValueAtTime(v / 100, ctxRef.current.currentTime);
        return { ...t, pan: v };
      })
    );
  };

  // ---- Simple waveform visualizer (time-domain) on master analyser
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!analyserRef.current || !canvasRef.current) return;
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const buffer = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(buffer);

      // clear
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);

      // axis
      ctx2d.lineWidth = 1;
      ctx2d.strokeStyle = "#ddd";
      ctx2d.beginPath();
      ctx2d.moveTo(0, canvas.height / 2);
      ctx2d.lineTo(canvas.width, canvas.height / 2);
      ctx2d.stroke();

      // waveform
      ctx2d.lineWidth = 2;
      ctx2d.strokeStyle = "#333";
      ctx2d.beginPath();
      const slice = canvas.width / buffer.length;
      for (let i = 0; i < buffer.length; i++) {
        const v = buffer[i] / 128.0; // 0..255 -> ~0..2
        const y = (v * canvas.height) / 2;
        const x = i * slice;
        i === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
      }
      ctx2d.stroke();
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyserRef.current]);

  const isLocal = (src: string | null) => !!src && !src.startsWith("/");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Studio Pro — 2 Tracks</h1>

      {/* Transport + Master */}
      <div className="rounded border bg-white p-3 flex flex-wrap items-center gap-3">
        <button
          onClick={playAll}
          className="rounded border px-3 py-1 hover:bg-gray-50"
        >
          ▶ Play
        </button>
        <button
          onClick={pauseAll}
          className="rounded border px-3 py-1 hover:bg-gray-50"
        >
          ⏸ Pause
        </button>
        <button
          onClick={stopAll}
          className="rounded border px-3 py-1 hover:bg-gray-50"
        >
          ⏹ Stop
        </button>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm w-16">Master</label>
          <input
            type="range"
            min={0}
            max={100}
            value={masterVol}
            onChange={(e) => setMasterVol(Number(e.target.value))}
            className="w-40"
          />
          <span className="text-sm w-10 text-right">{masterVol}%</span>
        </div>
      </div>

      {/* Two tracks side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tracks.map((t) => (
          <div key={t.id} className="rounded border bg-white p-3 space-y-3">
            <div className="font-medium">{t.name}</div>

            {/* Source: Preset or Local */}
            <div className="flex items-center gap-2">
              <label className="text-sm w-16">Source</label>
              <select
                className="rounded border px-2 py-1"
                value={t.src?.startsWith("/") ? t.src : ""}
                onChange={(e) => setPreset(t.id, e.target.value)}
              >
                <option value="">(none)</option>
                <option value="/audio/Rev.mp3">Rev Beat</option>
                {/* add more presets as you place files in /public/audio */}
              </select>

              <label className="rounded border px-2 py-1 cursor-pointer hover:bg-gray-50">
                Local file…
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => onPickLocal(t.id, e.target.files)}
                />
              </label>
            </div>
            {isLocal(t.src) && (
              <div className="text-xs text-gray-500">
                Local file selected — won’t persist after refresh.
              </div>
            )}

            {/* Volume */}
            <div className="flex items-center gap-2">
              <label className="text-sm w-16">Volume</label>
              <input
                type="range"
                min={0}
                max={100}
                value={t.volume}
                onChange={(e) => onVolume(t.id, Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm w-10 text-right">{t.volume}%</span>
            </div>

            {/* Pan */}
            <div className="flex items-center gap-2">
              <label className="text-sm w-16">Pan</label>
              <input
                type="range"
                min={-100}
                max={100}
                step={1}
                disabled={!stereoSupported}
                value={t.pan}
                onChange={(e) => onPan(t.id, Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm w-16 text-right">
                {t.pan < 0
                  ? `L ${Math.abs(t.pan)}`
                  : t.pan > 0
                  ? `R ${t.pan}`
                  : "C"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Waveform visualizer */}
      <div className="rounded border bg-white p-3">
        <div className="text-sm mb-2 text-gray-600">Waveform</div>
        <canvas
          ref={canvasRef}
          width={800}
          height={120}
          className="w-full h-32"
        />
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </main>
  );
}
