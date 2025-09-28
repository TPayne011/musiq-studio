"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Visualizer from "../components/Visualizer";

type Track = {
  id: string;
  name: string;
  src: string | null; // object URL or preset path
  fileName?: string;
  gain: number; // 0..1
  mute: boolean;
  solo: boolean;
  startOffset: number; // seconds (trim at start)
  loop: boolean;
  loopStart: number; // seconds
  loopEnd: number; // seconds
  eq: { low: number; mid: number; high: number }; // dB
  reverb: number; // 0..1 send
};

const DEFAULT_TRACKS: Track[] = [
  {
    id: "t1",
    name: "Track 1",
    src: null,
    gain: 0.8,
    mute: false,
    solo: false,
    startOffset: 0,
    loop: false,
    loopStart: 0,
    loopEnd: 5,
    eq: { low: 0, mid: 0, high: 0 },
    reverb: 0.2,
  },
  {
    id: "t2",
    name: "Track 2",
    src: null,
    gain: 0.8,
    mute: false,
    solo: false,
    startOffset: 0,
    loop: false,
    loopStart: 0,
    loopEnd: 5,
    eq: { low: 0, mid: 0, high: 0 },
    reverb: 0.2,
  },
  {
    id: "t3",
    name: "Track 3",
    src: null,
    gain: 0.8,
    mute: false,
    solo: false,
    startOffset: 0,
    loop: false,
    loopStart: 0,
    loopEnd: 5,
    eq: { low: 0, mid: 0, high: 0 },
    reverb: 0.2,
  },
  {
    id: "t4",
    name: "Track 4",
    src: null,
    gain: 0.8,
    mute: false,
    solo: false,
    startOffset: 0,
    loop: false,
    loopStart: 0,
    loopEnd: 5,
    eq: { low: 0, mid: 0, high: 0 },
    reverb: 0.2,
  },
];

export default function StudioProPage() {
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVol, setMasterVol] = useState(0.9);

  // Web Audio graph
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Reverb bus (convolver + wet gain)
  const reverbConvolverRef = useRef<ConvolverNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);

  // Per-track nodes & buffers
  const buffersRef = useRef<Record<string, AudioBuffer | null>>({});
  const sourcesRef = useRef<Record<string, AudioBufferSourceNode | null>>({});
  const trackGainsRef = useRef<Record<string, GainNode | null>>({});
  const trackEQRef = useRef<
    Record<
      string,
      { low: BiquadFilterNode; mid: BiquadFilterNode; high: BiquadFilterNode }
    >
  >({});
  const trackReverbSendRef = useRef<Record<string, GainNode | null>>({});

  // Init audio context/graph
  useEffect(() => {
    const ctx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = masterVol;
    masterGainRef.current = masterGain;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyserRef.current = analyser;

    // Reverb bus
    const convolver = ctx.createConvolver();
    reverbConvolverRef.current = convolver;

    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.8; // global wet level
    reverbGainRef.current = reverbGain;

    // Master chain: dry+reverb → analyser → destination
    masterGain.connect(analyser);
    reverbGain.connect(analyser);
    analyser.connect(ctx.destination);

    // Try loading impulse
    fetch("/impulse/small-room.wav")
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
      .then((buf) => ctx.decodeAudioData(buf))
      .then((ir) => {
        convolver.buffer = ir;
      })
      .catch(() => {
        /* no IR available, reverb will be effectively off */
      });

    return () => {
      ctx.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep master volume in sync
  useEffect(() => {
    if (masterGainRef.current) masterGainRef.current.gain.value = masterVol;
  }, [masterVol]);

  // Helper: (re)build a track processing chain
  const ensureTrackNodes = (trackId: string) => {
    const ctx = audioCtxRef.current!;
    if (!trackGainsRef.current[trackId]) {
      trackGainsRef.current[trackId] = ctx.createGain();
      trackGainsRef.current[trackId]!.connect(masterGainRef.current!);
    }
    if (!trackEQRef.current[trackId]) {
      const low = ctx.createBiquadFilter();
      low.type = "lowshelf";
      const mid = ctx.createBiquadFilter();
      mid.type = "peaking";
      mid.frequency.value = 1000;
      const high = ctx.createBiquadFilter();
      high.type = "highshelf";
      // chain: low -> mid -> high -> gain
      low.connect(mid);
      mid.connect(high);
      high.connect(trackGainsRef.current[trackId]!);
      trackEQRef.current[trackId] = { low, mid, high };
    }
    if (!trackReverbSendRef.current[trackId]) {
      const send = ctx.createGain();
      send.gain.value = 0;
      // send → convolver → reverbGain
      send.connect(reverbConvolverRef.current!);
      reverbConvolverRef.current!.connect(reverbGainRef.current!);
      trackReverbSendRef.current[trackId] = send;
    }
  };

  // Apply track params to nodes
  const applyTrackParams = (t: Track) => {
    ensureTrackNodes(t.id);
    const chain = trackEQRef.current[t.id];
    chain.low.gain.value = t.eq.low;
    chain.mid.gain.value = t.eq.mid;
    chain.high.gain.value = t.eq.high;

    const gain = trackGainsRef.current[t.id]!;
    const soloed = tracks.some((x) => x.solo);
    const muted = t.mute || (soloed && !t.solo);
    gain.gain.value = muted ? 0 : t.gain;

    const send = trackReverbSendRef.current[t.id]!;
    send.gain.value = t.reverb;
  };

  // Load an audio file into buffer
  const loadTrackBuffer = async (
    id: string,
    file: File | null,
    presetUrl?: string
  ) => {
    const ctx = audioCtxRef.current!;
    let arrayBuf: ArrayBuffer;
    if (file) {
      arrayBuf = await file.arrayBuffer();
    } else if (presetUrl) {
      const res = await fetch(presetUrl);
      arrayBuf = await res.arrayBuffer();
    } else {
      buffersRef.current[id] = null;
      return;
    }
    const buf = await ctx.decodeAudioData(arrayBuf);
    buffersRef.current[id] = buf;
  };

  // Start playback
  const startPlayback = async () => {
    const ctx = audioCtxRef.current!;
    if (!ctx) return;

    // Build sources from buffers
    tracks.forEach((t) => {
      applyTrackParams(t);
      const buf = buffersRef.current[t.id];
      if (!buf) return;

      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = t.loop;
      if (t.loop) {
        src.loopStart = Math.min(Math.max(0, t.loopStart), buf.duration);
        src.loopEnd = Math.min(
          Math.max(src.loopStart + 0.01, t.loopEnd),
          buf.duration
        );
      }

      // Routing: src → EQ.low → ... → gain (dry)
      src.connect(trackEQRef.current[t.id]!.low);
      // Split to reverb send
      const send = trackReverbSendRef.current[t.id]!;
      src.connect(send);

      sourcesRef.current[t.id] = src;
    });

    setIsPlaying(true);
    const now = ctx.currentTime;
    tracks.forEach((t) => {
      const src = sourcesRef.current[t.id];
      const buf = buffersRef.current[t.id];
      if (!src || !buf) return;
      const startAt = now;
      const offset = Math.min(Math.max(0, t.startOffset), buf.duration - 0.01);
      src.start(startAt, offset);
    });
  };

  const stopPlayback = () => {
    Object.values(sourcesRef.current).forEach((s) => {
      try {
        s?.stop();
      } catch {}
    });
    sourcesRef.current = {};
    setIsPlaying(false);
  };

  // UI handlers
  const pickLocal = (trackId: string, file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, src: url, fileName: file.name } : t
      )
    );
    loadTrackBuffer(trackId, file);
  };

  const loadPreset = async (trackId: string, url: string | null) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, src: url, fileName: url ?? undefined } : t
      )
    );
    await loadTrackBuffer(trackId, null, url ?? undefined);
  };

  // Build: preload buffers for preset paths that exist
  useEffect(() => {
    tracks.forEach((t) => {
      if (t.src && !t.src.startsWith("blob:")) {
        loadTrackBuffer(t.id, null, t.src).catch(() => {});
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep node params updated when tracks change
  useEffect(() => {
    tracks.forEach(applyTrackParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks]);

  // Simple presets list (add your files under /public/audio)
  const presets = useMemo(
    () => [
      { label: "— none —", value: "" },
      { label: "Rev Beat", value: "/audio/Rev.mp3" },
    ],
    []
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Studio Pro (Multi-Track)</h1>

      {/* Transport */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => (isPlaying ? stopPlayback() : startPlayback())}
          className="rounded border px-3 py-1 hover:bg-gray-50"
        >
          {isPlaying ? "⏹ Stop" : "▶ Play"}
        </button>

        <label className="ml-4 text-sm">Master</label>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(masterVol * 100)}
          onChange={(e) => setMasterVol(Number(e.target.value) / 100)}
        />
        <span className="text-sm w-10 text-right">
          {Math.round(masterVol * 100)}%
        </span>
      </div>

      {/* Tracks */}
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
        {tracks.map((t, idx) => (
          <div key={t.id} className="rounded border p-3 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="font-medium">{t.name}</div>
              <div className="flex items-center gap-2">
                <button
                  className={`rounded border px-2 py-0.5 ${
                    t.mute ? "bg-gray-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    setTracks((prev) =>
                      prev.map((x) =>
                        x.id === t.id ? { ...x, mute: !x.mute } : x
                      )
                    )
                  }
                >
                  Mute
                </button>
                <button
                  className={`rounded border px-2 py-0.5 ${
                    t.solo ? "bg-gray-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    setTracks((prev) =>
                      prev.map((x) =>
                        x.id === t.id ? { ...x, solo: !x.solo } : x
                      )
                    )
                  }
                >
                  Solo
                </button>
              </div>
            </div>

            {/* Source */}
            <div className="flex items-center gap-2">
              <select
                className="rounded border px-2 py-1"
                value={t.src && !t.src.startsWith("blob:") ? t.src : ""}
                onChange={(e) => loadPreset(t.id, e.target.value || null)}
              >
                {presets.map((p) => (
                  <option key={p.value || "none"} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <label className="rounded border px-2 py-1 cursor-pointer hover:bg-gray-50">
                Local…
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => pickLocal(t.id, e.target.files?.[0])}
                />
              </label>
              <span
                className="text-xs text-gray-500 truncate max-w-[160px]"
                title={t.fileName || t.src || ""}
              >
                {t.fileName || (t.src ? t.src.split("/").pop() : "no file")}
              </span>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <label className="text-sm">Vol</label>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(t.gain * 100)}
                onChange={(e) =>
                  setTracks((prev) =>
                    prev.map((x) =>
                      x.id === t.id
                        ? { ...x, gain: Number(e.target.value) / 100 }
                        : x
                    )
                  )
                }
              />
              <span className="text-sm w-10 text-right">
                {Math.round(t.gain * 100)}%
              </span>
            </div>

            {/* Basic editing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm block">Start offset (s)</label>
                <input
                  type="number"
                  className="w-full rounded border px-2 py-1"
                  value={t.startOffset}
                  min={0}
                  step={0.1}
                  onChange={(e) =>
                    setTracks((prev) =>
                      prev.map((x) =>
                        x.id === t.id
                          ? { ...x, startOffset: Number(e.target.value) }
                          : x
                      )
                    )
                  }
                />
              </div>
              <div className="flex items-end gap-2">
                <label className="text-sm">Loop</label>
                <input
                  type="checkbox"
                  checked={t.loop}
                  onChange={(e) =>
                    setTracks((prev) =>
                      prev.map((x) =>
                        x.id === t.id ? { ...x, loop: e.target.checked } : x
                      )
                    )
                  }
                />
              </div>
              <div>
                <label className="text-sm block">Loop start (s)</label>
                <input
                  type="number"
                  className="w-full rounded border px-2 py-1"
                  value={t.loopStart}
                  min={0}
                  step={0.1}
                  onChange={(e) =>
                    setTracks((prev) =>
                      prev.map((x) =>
                        x.id === t.id
                          ? { ...x, loopStart: Number(e.target.value) }
                          : x
                      )
                    )
                  }
                />
              </div>
              <div>
                <label className="text-sm block">Loop end (s)</label>
                <input
                  type="number"
                  className="w-full rounded border px-2 py-1"
                  value={t.loopEnd}
                  min={0}
                  step={0.1}
                  onChange={(e) =>
                    setTracks((prev) =>
                      prev.map((x) =>
                        x.id === t.id
                          ? { ...x, loopEnd: Number(e.target.value) }
                          : x
                      )
                    )
                  }
                />
              </div>
            </div>

            {/* Effects: EQ & Reverb send */}
            <div className="grid grid-cols-3 gap-3">
              {(["low", "mid", "high"] as const).map((band) => (
                <div key={band}>
                  <label className="text-sm block">
                    {band.toUpperCase()} (dB)
                  </label>
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    value={t.eq[band]}
                    onChange={(e) =>
                      setTracks((prev) =>
                        prev.map((x) =>
                          x.id === t.id
                            ? {
                                ...x,
                                eq: { ...x.eq, [band]: Number(e.target.value) },
                              }
                            : x
                        )
                      )
                    }
                  />
                </div>
              ))}
              <div>
                <label className="text-sm block">Reverb send</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(t.reverb * 100)}
                  onChange={(e) =>
                    setTracks((prev) =>
                      prev.map((x) =>
                        x.id === t.id
                          ? { ...x, reverb: Number(e.target.value) / 100 }
                          : x
                      )
                    )
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visualizer */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Visualizer</h2>
        <Visualizer analyser={analyserRef.current} />
      </div>

      <p className="text-xs text-gray-500">
        Tip: add more presets to <code>/public/audio</code> and list them in the
        dropdown.
      </p>
    </main>
  );
}
