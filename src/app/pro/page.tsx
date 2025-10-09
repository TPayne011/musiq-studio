// src/app/pro/page.tsx
"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

// NOTE: components folder is under /app now, so the relative path changes
import EffectsRack from "../components/EffectsRack";
import Visualizer from "../components/Visualizer";

import { useLocalStorage } from "@/lib/useLocalStorage";
import { encodeWavStereo } from "@/lib/wav";

// --- clamp helper ---
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

// --- decode any URL into an AudioBuffer using a provided (Offline)AudioContext ---
async function fetchAsAudioBuffer(url: string, ctx: BaseAudioContext) {
  const res = await fetch(url);
  const arr = await res.arrayBuffer();
  // @ts-ignore both contexts provide decodeAudioData
  return await ctx.decodeAudioData(arr);
}

export default function ProPage() {
  // ---------- persisted UI state ----------
  const [masterVol, setMasterVol] = useLocalStorage<number>(
    "musiqProMasterV1",
    100
  );

  const [track1Url, setTrack1Url] = useLocalStorage<string | null>(
    "musiqProT1Url",
    "/audio/sample-beat.mp3"
  );
  const [track2Url, setTrack2Url] = useLocalStorage<string | null>(
    "musiqProT2Url",
    null
  );
  const [track1Name, setTrack1Name] = useLocalStorage<string>(
    "musiqProT1Name",
    "sample-beat.mp3"
  );
  const [track2Name, setTrack2Name] = useLocalStorage<string>(
    "musiqProT2Name",
    ""
  );

  const [t1Pan, setT1Pan] = useLocalStorage<number>("musiqProT1Pan", 0);
  const [t2Pan, setT2Pan] = useLocalStorage<number>("musiqProT2Pan", 0);
  const [t1Gain, setT1Gain] = useLocalStorage<number>("musiqProT1Gain", 1);
  const [t2Gain, setT2Gain] = useLocalStorage<number>("musiqProT2Gain", 1);

  const [fxState, setFxState] = useLocalStorage("musiqProFxV1", {
    reverbWet: 0,
    delayTime: 0.25,
    delayFb: 0.2,
    bassDb: 0,
    compRatio: 3,
  });
  const [bypass, setBypass] = useLocalStorage("musiqProBypassV1", {
    reverb: false,
    delay: false,
    bass: false,
    comp: false,
  });

  // ---------- audio core ----------
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // html <audio> + media source nodes
  const audio1Ref = useRef<HTMLAudioElement | null>(null);
  const audio2Ref = useRef<HTMLAudioElement | null>(null);
  const mediaSrc1Ref = useRef<MediaElementAudioSourceNode | null>(null);
  const mediaSrc2Ref = useRef<MediaElementAudioSourceNode | null>(null);

  // per-track nodes
  const track1GainRef = useRef<GainNode | null>(null);
  const track2GainRef = useRef<GainNode | null>(null);
  const track1PanRef = useRef<StereoPannerNode | null>(null);
  const track2PanRef = useRef<StereoPannerNode | null>(null);

  // FX nodes
  const convolverRef = useRef<ConvolverNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const feedbackRef = useRef<GainNode | null>(null);
  const lowShelfRef = useRef<BiquadFilterNode | null>(null);
  const compRef = useRef<DynamicsCompressorNode | null>(null);
  const limiterRef = useRef<DynamicsCompressorNode | null>(null);

  // UI flags + timers
  const [isReady, setIsReady] = useState(false);
  const [ctxUnlocked, setCtxUnlocked] = useState(false);
  const [t1Time, setT1Time] = useState(0);
  const [t2Time, setT2Time] = useState(0);
  const [t1Dur, setT1Dur] = useState<number | null>(null);
  const [t2Dur, setT2Dur] = useState<number | null>(null);
  const [t1Playing, setT1Playing] = useState(false);
  const [t2Playing, setT2Playing] = useState(false);

  // revoke blob URLs when replaced
  const prevBlobUrls = useRef<{ t1?: string; t2?: string }>({});

  // ---------- helpers ----------
  function loadTrack(n: 1 | 2, url: string | null) {
    if (!url) return;
    const el = n === 1 ? audio1Ref.current : audio2Ref.current;
    if (!el) return;
    el.src = url;
    el.load();
  }

  function playTrack(n: 1 | 2) {
    const el = n === 1 ? audio1Ref.current : audio2Ref.current;
    el?.play()
      .then(() => (n === 1 ? setT1Playing(true) : setT2Playing(true)))
      .catch(() => {});
  }

  function pauseTrack(n: 1 | 2) {
    const el = n === 1 ? audio1Ref.current : audio2Ref.current;
    el?.pause();
    n === 1 ? setT1Playing(false) : setT2Playing(false);
  }

  function stopTrack(n: 1 | 2) {
    const el = n === 1 ? audio1Ref.current : audio2Ref.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    if (n === 1) {
      setT1Playing(false);
      setT1Time(0);
    } else {
      setT2Playing(false);
      setT2Time(0);
    }
  }

  function setFileForTrack(n: 1 | 2, file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);

    if (n === 1 && prevBlobUrls.current.t1)
      URL.revokeObjectURL(prevBlobUrls.current.t1);
    if (n === 2 && prevBlobUrls.current.t2)
      URL.revokeObjectURL(prevBlobUrls.current.t2);

    if (n === 1) {
      prevBlobUrls.current.t1 = url;
      setTrack1Url(url);
      setTrack1Name(file.name || "uploaded-1");
      loadTrack(1, url);
    } else {
      prevBlobUrls.current.t2 = url;
      setTrack2Url(url);
      setTrack2Name(file.name || "uploaded-2");
      loadTrack(2, url);
    }
  }

  // ---------- export mixdown (offline render) ----------
  async function exportMixdown() {
    if (!track1Url && !track2Url) return;

    const master = (masterVol ?? 100) / 100;
    const sampleRate = 44100;

    const tmp = new OfflineAudioContext(2, 1, sampleRate);
    let buf1: AudioBuffer | null = null;
    let buf2: AudioBuffer | null = null;

    try {
      if (track1Url) buf1 = await fetchAsAudioBuffer(track1Url, tmp);
    } catch {}
    try {
      if (track2Url) buf2 = await fetchAsAudioBuffer(track2Url, tmp);
    } catch {}

    if (!buf1 && !buf2) return;

    const length = Math.max(buf1?.length ?? 0, buf2?.length ?? 0) || sampleRate;
    const off = new OfflineAudioContext(2, length, sampleRate);

    const g1 = off.createGain();
    const g2 = off.createGain();
    g1.gain.value = t1Gain;
    g2.gain.value = t2Gain;

    if (buf1) {
      const s1 = off.createBufferSource();
      s1.buffer = buf1;
      s1.connect(g1).connect(off.destination);
      s1.start(0);
    }
    if (buf2) {
      const s2 = off.createBufferSource();
      s2.buffer = buf2;
      s2.connect(g2).connect(off.destination);
      s2.start(0);
    }

    const rendered = await off.startRendering();

    const L = rendered.getChannelData(0).slice();
    const R = rendered.getChannelData(1).slice();
    for (let i = 0; i < L.length; i++) {
      L[i] *= master;
      R[i] *= master;
    }

    const wav = encodeWavStereo(L, R, sampleRate);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(wav);
    a.download = "musiq-mixdown.wav";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 2000);
  }

  // ---------- init audio graph (once) ----------
  useEffect(() => {
    if (audioCtxRef.current) return;

    const ctx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    // core
    masterGainRef.current = ctx.createGain();
    masterGainRef.current.gain.value = (masterVol ?? 100) / 100;

    analyserRef.current = ctx.createAnalyser();
    analyserRef.current.fftSize = 2048;

    // track nodes
    track1GainRef.current = ctx.createGain();
    track2GainRef.current = ctx.createGain();
    track1PanRef.current = ctx.createStereoPanner();
    track2PanRef.current = ctx.createStereoPanner();

    // html audio
    audio1Ref.current = new Audio();
    audio2Ref.current = new Audio();
    audio1Ref.current.preload = "auto";
    audio2Ref.current.preload = "auto";

    if (track1Url) audio1Ref.current.src = track1Url;
    if (track2Url) audio2Ref.current.src = track2Url;

    // media sources
    mediaSrc1Ref.current = new MediaElementAudioSourceNode(ctx, {
      mediaElement: audio1Ref.current!,
    });
    mediaSrc2Ref.current = new MediaElementAudioSourceNode(ctx, {
      mediaElement: audio2Ref.current!,
    });

    // routing
    mediaSrc1Ref.current.connect(track1GainRef.current!);
    mediaSrc2Ref.current.connect(track2GainRef.current!);
    track1GainRef
      .current!.connect(track1PanRef.current!)
      .connect(masterGainRef.current!);
    track2GainRef
      .current!.connect(track2PanRef.current!)
      .connect(masterGainRef.current!);

    // FX
    convolverRef.current = ctx.createConvolver();
    const len = 2048;
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < len; i++)
        data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    convolverRef.current.buffer = impulse;

    wetGainRef.current = ctx.createGain();
    dryGainRef.current = ctx.createGain();
    wetGainRef.current.gain.value = fxState.reverbWet ?? 0;
    dryGainRef.current.gain.value = 1 - (fxState.reverbWet ?? 0);

    delayRef.current = ctx.createDelay(1.0);
    feedbackRef.current = ctx.createGain();
    feedbackRef.current.gain.value = fxState.delayFb ?? 0.2;
    delayRef.current.delayTime.value = fxState.delayTime ?? 0.25;
    delayRef.current.connect(feedbackRef.current);
    feedbackRef.current.connect(delayRef.current);

    lowShelfRef.current = ctx.createBiquadFilter();
    lowShelfRef.current.type = "lowshelf";
    lowShelfRef.current.frequency.value = 200;
    lowShelfRef.current.gain.value = fxState.bassDb ?? 0;

    compRef.current = ctx.createDynamicsCompressor();
    compRef.current.threshold.value = -24;
    compRef.current.knee.value = 30;
    compRef.current.ratio.value = fxState.compRatio ?? 3;
    compRef.current.attack.value = 0.003;
    compRef.current.release.value = 0.25;

    limiterRef.current = ctx.createDynamicsCompressor();
    limiterRef.current.threshold.value = -2;
    limiterRef.current.knee.value = 0;
    limiterRef.current.ratio.value = 20;
    limiterRef.current.attack.value = 0.003;
    limiterRef.current.release.value = 0.05;

    // FX routing
    masterGainRef.current.connect(lowShelfRef.current!);
    lowShelfRef.current!.connect(dryGainRef.current!);
    lowShelfRef.current!.connect(wetGainRef.current!);
    wetGainRef.current!.connect(convolverRef.current!);
    convolverRef.current!.connect(compRef.current!);
    lowShelfRef.current!.connect(delayRef.current!);
    delayRef.current!.connect(compRef.current!);
    dryGainRef.current!.connect(compRef.current!);
    compRef.current!.connect(limiterRef.current!);
    limiterRef.current!.connect(analyserRef.current!);
    analyserRef.current!.connect(ctx.destination);

    // persisted params
    track1GainRef.current!.gain.value = t1Gain;
    track2GainRef.current!.gain.value = t2Gain;
    track1PanRef.current!.pan.value = t1Pan;
    track2PanRef.current!.pan.value = t2Pan;

    // bypass on boot
    if (bypass.reverb) {
      wetGainRef.current!.gain.value = 0;
      dryGainRef.current!.gain.value = 1;
    }
    if (bypass.delay) {
      delayRef.current!.delayTime.value = 0;
      feedbackRef.current!.gain.value = 0;
    }
    if (bypass.bass) {
      lowShelfRef.current!.gain.value = 0;
    }
    if (bypass.comp) {
      compRef.current!.ratio.value = 1;
    }

    // durations
    audio1Ref.current.addEventListener("loadedmetadata", () =>
      setT1Dur(
        isFinite(audio1Ref.current!.duration) ? audio1Ref.current!.duration : 0
      )
    );
    audio2Ref.current.addEventListener("loadedmetadata", () =>
      setT2Dur(
        isFinite(audio2Ref.current!.duration) ? audio2Ref.current!.duration : 0
      )
    );

    // times
    const id = setInterval(() => {
      if (audio1Ref.current) setT1Time(audio1Ref.current.currentTime || 0);
      if (audio2Ref.current) setT2Time(audio2Ref.current.currentTime || 0);
    }, 250);

    setIsReady(true);

    return () => {
      clearInterval(id);
      if (process.env.NODE_ENV === "production") ctx.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync master gain when slider changes
  useEffect(() => {
    if (masterGainRef.current)
      masterGainRef.current.gain.value = (masterVol ?? 100) / 100;
  }, [masterVol]);

  // auto-load on url change
  useEffect(() => {
    if (audio1Ref.current) loadTrack(1, track1Url);
  }, [track1Url]);
  useEffect(() => {
    if (audio2Ref.current) loadTrack(2, track2Url);
  }, [track2Url]);

  // update live pan/gain nodes
  useEffect(() => {
    if (track1GainRef.current)
      track1GainRef.current.gain.value = clamp(t1Gain, 0, 1);
  }, [t1Gain]);
  useEffect(() => {
    if (track2GainRef.current)
      track2GainRef.current.gain.value = clamp(t2Gain, 0, 1);
  }, [t2Gain]);
  useEffect(() => {
    if (track1PanRef.current)
      track1PanRef.current.pan.value = clamp(t1Pan, -1, 1);
  }, [t1Pan]);
  useEffect(() => {
    if (track2PanRef.current)
      track2PanRef.current.pan.value = clamp(t2Pan, -1, 1);
  }, [t2Pan]);

  const fmt = (sec: number | null) => {
    if (sec == null || !isFinite(sec)) return "--:--";
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  function connectPiSandbox() {
    const w = typeof window !== "undefined" ? (window as any) : undefined;
    if (w?.Pi?.openPayment) {
      w.Pi.openPayment({
        amount: 1,
        memo: "Musiq-Studio test",
        metadata: { demo: true },
      });
    } else {
      alert("Pi SDK not detected — sandbox log in console.");
      console.log("[Pi Sandbox] openPayment()", {
        amount: 1,
        memo: "Musiq-Studio test",
      });
    }
  }

  // ---------- UI ----------
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header + Quick Start */}
      <h1 className="text-2xl font-bold flex items-center justify-between">
        <span>Musiq Pro</span>
        <button
          className="px-3 py-1 rounded bg-blue-100 text-sm hover:bg-blue-200 transition"
          onClick={() => window.open("/docs/quickstart", "_blank")}
        >
          ❓ Quick Start Guide
        </button>
      </h1>

      {/* Unlock + status */}
      <div className="flex items-center gap-3">
        <button
          className="px-3 py-1 rounded bg-amber-200"
          onClick={async () => {
            const ctx = audioCtxRef.current;
            if (!ctx) return;
            if (ctx.state === "suspended") await ctx.resume();
            setCtxUnlocked(true);
          }}
        >
          🔓 Unlock Audio
        </button>
        <span className="text-sm text-gray-400">
          {ctxUnlocked ? "Audio ready" : "Click to enable audio"}
        </span>
      </div>

      {/* Pi SDK + actions */}
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="afterInteractive"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="px-3 py-1 rounded bg-purple-600 text-white"
          onClick={connectPiSandbox}
        >
          ⚡ Connect with Pi (Sandbox)
        </button>
        <button
          className="px-3 py-1 rounded bg-emerald-600 text-white"
          onClick={exportMixdown}
          disabled={!track1Url && !track2Url}
        >
          ⬇️ Export Mixdown (WAV)
        </button>
      </div>

      {/* Now Playing */}
      <section className="border rounded-md p-4">
        <h2 className="font-semibold mb-2">🎵 Now Playing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="border rounded p-3">
            <div className="font-medium">Track 1</div>
            <div className="text-gray-400 break-all">
              {track1Name || track1Url || "—"}
            </div>
            <div className="mt-1">
              {fmt(t1Time)} / {fmt(t1Dur)} {t1Playing ? "▶" : "⏸"}
            </div>
          </div>
          <div className="border rounded p-3">
            <div className="font-medium">Track 2</div>
            <div className="text-gray-400 break-all">
              {track2Name || track2Url || "—"}
            </div>
            <div className="mt-1">
              {fmt(t2Time)} / {fmt(t2Dur)} {t2Playing ? "▶" : "⏸"}
            </div>
          </div>
        </div>
      </section>

      {/* Master */}
      <div className="border rounded-md p-4 space-y-3">
        <label className="block font-medium">Master Volume</label>
        <input
          type="range"
          min={0}
          max={100}
          value={masterVol}
          onChange={(e) => setMasterVol(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-400">{masterVol}%</div>
        <Visualizer analyser={analyserRef} />
      </div>

      {/* Track 1 */}
      <div className="border rounded-md p-4 space-y-3">
        <h3 className="font-semibold">Track 1</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="border px-2 py-1 rounded w-full"
            value={track1Url ?? ""}
            placeholder="/audio/sample-beat.mp3 or https://..."
            onChange={(e) => {
              const v = e.target.value || null;
              setTrack1Url(v);
              setTrack1Name(v ? v.split("/").pop() || "track1" : "");
              loadTrack(1, v);
            }}
          />
          <label className="px-3 py-1 rounded bg-gray-100 border cursor-pointer">
            Upload…
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFileForTrack(1, e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
          <button
            className="px-3 py-1 rounded bg-gray-900 text-white"
            onClick={() => playTrack(1)}
            disabled={!isReady || !track1Url}
          >
            Play
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-500 text-white"
            onClick={() => pauseTrack(1)}
            disabled={!isReady}
          >
            Pause
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() => stopTrack(1)}
            disabled={!isReady}
          >
            Stop
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() => {
              const url = "/audio/sample-beat.mp3";
              setTrack1Url(url);
              setTrack1Name("sample-beat.mp3");
              loadTrack(1, url);
            }}
          >
            Load Sample
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Gain (0–100%)</label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(t1Gain * 100)}
              onChange={(e) =>
                setT1Gain(clamp(Number(e.target.value) / 100, 0, 1))
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Pan (L -100 … +100 R)
            </label>
            <input
              type="range"
              min={-100}
              max={100}
              value={Math.round(t1Pan * 100)}
              onChange={(e) =>
                setT1Pan(clamp(Number(e.target.value) / 100, -1, 1))
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Track 2 */}
      <div className="border rounded-md p-4 space-y-3">
        <h3 className="font-semibold">Track 2</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="border px-2 py-1 rounded w-full"
            value={track2Url ?? ""}
            placeholder="Paste a URL or /audio/... path"
            onChange={(e) => {
              const v = e.target.value || null;
              setTrack2Url(v);
              setTrack2Name(v ? v.split("/").pop() || "track2" : "");
              loadTrack(2, v);
            }}
          />
          <label className="px-3 py-1 rounded bg-gray-100 border cursor-pointer">
            Upload…
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFileForTrack(2, e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
          <button
            className="px-3 py-1 rounded bg-gray-900 text-white"
            onClick={() => playTrack(2)}
            disabled={!isReady || !track2Url}
          >
            Play
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-500 text-white"
            onClick={() => pauseTrack(2)}
            disabled={!isReady}
          >
            Pause
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() => stopTrack(2)}
            disabled={!isReady}
          >
            Stop
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() => {
              const url = "/audio/sample-beat.mp3";
              setTrack2Url(url);
              setTrack2Name("sample-beat.mp3");
              loadTrack(2, url);
            }}
          >
            Load Sample
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Gain (0–100%)</label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(t2Gain * 100)}
              onChange={(e) =>
                setT2Gain(clamp(Number(e.target.value) / 100, 0, 1))
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Pan (L -100 … +100 R)
            </label>
            <input
              type="range"
              min={-100}
              max={100}
              value={Math.round(t2Pan * 100)}
              onChange={(e) =>
                setT2Pan(clamp(Number(e.target.value) / 100, -1, 1))
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Effects */}
      <EffectsRack
        onReverb={(wet) => {
          if (!wetGainRef.current || !dryGainRef.current) return;
          wetGainRef.current.gain.value = wet;
          dryGainRef.current.gain.value = 1 - wet;
          setFxState((s: any) => ({ ...s, reverbWet: wet }));
        }}
        onDelay={(timeSec, fb) => {
          if (!delayRef.current || !feedbackRef.current) return;
          delayRef.current.delayTime.value = Math.min(
            0.6,
            Math.max(0, timeSec)
          );
          feedbackRef.current.gain.value = Math.min(0.9, Math.max(0, fb));
          setFxState((s: any) => ({ ...s, delayTime: timeSec, delayFb: fb }));
        }}
        onBass={(gainDb) => {
          if (!lowShelfRef.current) return;
          lowShelfRef.current.gain.value = gainDb;
          setFxState((s: any) => ({ ...s, bassDb: gainDb }));
        }}
        onCompress={(ratio) => {
          if (!compRef.current) return;
          compRef.current.ratio.value = ratio;
          setFxState((s: any) => ({ ...s, compRatio: ratio }));
        }}
        bypass={bypass}
        onBypassChange={(key, v) => {
          setBypass((b: any) => ({ ...b, [key]: v }));
          if (
            key === "reverb" &&
            wetGainRef.current &&
            dryGainRef.current &&
            v
          ) {
            wetGainRef.current.gain.value = 0;
            dryGainRef.current.gain.value = 1;
          }
          if (key === "delay" && delayRef.current && feedbackRef.current && v) {
            delayRef.current.delayTime.value = 0;
            feedbackRef.current.gain.value = 0;
          }
          if (key === "bass" && lowShelfRef.current && v) {
            lowShelfRef.current.gain.value = 0;
          }
          if (key === "comp" && compRef.current && v) {
            compRef.current.ratio.value = 1;
          }
        }}
      />
    </main>
  );
}
