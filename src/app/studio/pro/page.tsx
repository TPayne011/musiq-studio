// src/app/studio/pro/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import EffectsRack from "../../components/EffectsRack";
import Visualizer from "../../components/Visualizer";
import { useLocalStorage } from "@/lib/useLocalStorage";

export default function ProStudioPage() {
  // -------- Persisted UI state --------
  const [masterVol, setMasterVol] = useLocalStorage<number>(
    "musiqProMasterV1",
    100
  ); // 0..100
  const [fxState, setFxState] = useLocalStorage("musiqProFxV1", {
    reverbWet: 0, // 0..1
    delayTime: 0.25, // seconds
    delayFb: 0.2, // 0..1
    bassDb: 0, // -10..+10
    compRatio: 3, // 1..10
  });
  const [bypass, setBypass] = useLocalStorage("musiqProBypassV1", {
    reverb: false,
    delay: false,
    bass: false,
    comp: false,
  });

  // -------- Audio core --------
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // <audio> elements + media sources (for pause/resume)
  const audio1Ref = useRef<HTMLAudioElement | null>(null);
  const audio2Ref = useRef<HTMLAudioElement | null>(null);
  const mediaSrc1Ref = useRef<MediaElementAudioSourceNode | null>(null);
  const mediaSrc2Ref = useRef<MediaElementAudioSourceNode | null>(null);

  // Per-track gain & pan
  const track1GainRef = useRef<GainNode | null>(null);
  const track2GainRef = useRef<GainNode | null>(null);
  const track1PanRef = useRef<StereoPannerNode | null>(null);
  const track2PanRef = useRef<StereoPannerNode | null>(null);

  // FX nodes
  const convolverRef = useRef<ConvolverNode | null>(null); // reverb
  const wetGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const feedbackRef = useRef<GainNode | null>(null);
  const lowShelfRef = useRef<BiquadFilterNode | null>(null); // bass EQ
  const compRef = useRef<DynamicsCompressorNode | null>(null); // compressor
  const limiterRef = useRef<DynamicsCompressorNode | null>(null); // soft limiter

  const [isReady, setIsReady] = useState(false);

  // Track URLs
  const [track1Url, setTrack1Url] = useState<string | null>(
    "/audio/sample-beat.mp3"
  ); // or "/audio/Rev.mp3"
  const [track2Url, setTrack2Url] = useState<string | null>(null);

  // -------- Helpers: MediaElement-based load/play/pause/stop --------
  function loadTrack(n: 1 | 2, url: string | null) {
    if (!url) return;
    const el = n === 1 ? audio1Ref.current : audio2Ref.current;
    if (!el) return;
    el.src = url;
    el.load();
  }
  function playTrack(n: 1 | 2) {
    (n === 1 ? audio1Ref.current : audio2Ref.current)?.play().catch(() => {});
  }
  function pauseTrack(n: 1 | 2) {
    (n === 1 ? audio1Ref.current : audio2Ref.current)?.pause();
  }
  function stopTrack(n: 1 | 2) {
    const el = n === 1 ? audio1Ref.current : audio2Ref.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }

  // Upload helper with blob cleanup
  const prevBlobUrls = useRef<{ t1?: string; t2?: string }>({});
  function setFileForTrack(n: 1 | 2, file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (n === 1) {
      if (prevBlobUrls.current.t1) URL.revokeObjectURL(prevBlobUrls.current.t1);
      prevBlobUrls.current.t1 = url;
      setTrack1Url(url);
    } else {
      if (prevBlobUrls.current.t2) URL.revokeObjectURL(prevBlobUrls.current.t2);
      prevBlobUrls.current.t2 = url;
      setTrack2Url(url);
    }
  }

  // -------- Build audio graph (once) --------
  useEffect(() => {
    if (audioCtxRef.current) return;

    const ctx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    masterGainRef.current = ctx.createGain();
    masterGainRef.current.gain.value = (masterVol ?? 100) / 100;

    analyserRef.current = ctx.createAnalyser();
    analyserRef.current.fftSize = 2048;

    track1GainRef.current = ctx.createGain();
    track2GainRef.current = ctx.createGain();
    track1PanRef.current = ctx.createStereoPanner();
    track2PanRef.current = ctx.createStereoPanner();

    // Create <audio> elements
    audio1Ref.current = new Audio();
    audio2Ref.current = new Audio();
    audio1Ref.current.preload = "auto";
    audio2Ref.current.preload = "auto";
    if (track1Url) audio1Ref.current.src = track1Url;
    if (track2Url) audio2Ref.current.src = track2Url;

    // MediaElement sources
    mediaSrc1Ref.current = new MediaElementAudioSourceNode(ctx, {
      mediaElement: audio1Ref.current!,
    });
    mediaSrc2Ref.current = new MediaElementAudioSourceNode(ctx, {
      mediaElement: audio2Ref.current!,
    });

    // <audio> -> gain -> pan -> master
    mediaSrc1Ref.current.connect(track1GainRef.current!);
    mediaSrc2Ref.current.connect(track2GainRef.current!);
    track1GainRef
      .current!.connect(track1PanRef.current!)
      .connect(masterGainRef.current!);
    track2GainRef
      .current!.connect(track2PanRef.current!)
      .connect(masterGainRef.current!);

    // FX graph
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

    // master -> lowshelf
    masterGainRef.current.connect(lowShelfRef.current!);
    // lowshelf -> dry & reverb sends
    lowShelfRef.current!.connect(dryGainRef.current!);
    lowShelfRef.current!.connect(wetGainRef.current!);
    // reverb path
    wetGainRef.current!.connect(convolverRef.current!);
    convolverRef.current!.connect(compRef.current!);
    // delay (parallel)
    lowShelfRef.current!.connect(delayRef.current!);
    delayRef.current!.connect(compRef.current!);
    // dry path
    dryGainRef.current!.connect(compRef.current!);
    // comp -> limiter -> analyser -> out
    compRef.current!.connect(limiterRef.current!);
    limiterRef.current!.connect(analyserRef.current!);
    analyserRef.current!.connect(ctx.destination);

    // honor bypass
    if (bypass.reverb) {
      wetGainRef.current.gain.value = 0;
      dryGainRef.current.gain.value = 1;
    }
    if (bypass.delay) {
      delayRef.current.delayTime.value = 0;
      feedbackRef.current.gain.value = 0;
    }
    if (bypass.bass) {
      lowShelfRef.current.gain.value = 0;
    }
    if (bypass.comp) {
      compRef.current.ratio.value = 1;
    }

    setIsReady(true);

    return () => {
      if (prevBlobUrls.current.t1) URL.revokeObjectURL(prevBlobUrls.current.t1);
      if (prevBlobUrls.current.t2) URL.revokeObjectURL(prevBlobUrls.current.t2);
      ctx.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep master gain synced
  useEffect(() => {
    if (masterGainRef.current)
      masterGainRef.current.gain.value = (masterVol ?? 100) / 100;
  }, [masterVol]);

  // Auto-load when URLs change
  useEffect(() => {
    loadTrack(1, track1Url);
  }, [track1Url]);
  useEffect(() => {
    loadTrack(2, track2Url);
  }, [track2Url]);

  // -------- UI --------
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <button
        className="px-3 py-1 rounded bg-amber-200"
        onClick={() => audioCtxRef.current?.resume()}
      >
        🔓 Unlock Audio (if blocked)
      </button>

      <h1 className="text-2xl font-bold">Studio Pro</h1>
      <p className="text-sm text-gray-600">
        Two-track player with reverb, delay, bass EQ, compression, limiter,
        visualizer, persistence, and uploads.
      </p>

      {/* Master volume + Visualizer */}
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
        <div className="text-xs text-gray-600">{masterVol}%</div>
        <Visualizer analyser={analyserRef} />
      </div>

      {/* Track 1 */}
      <div className="border rounded-md p-4">
        <h3 className="font-semibold">Track 1</h3>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            className="border px-2 py-1 rounded w-full"
            value={track1Url ?? ""}
            placeholder="/audio/sample-beat.mp3 or https://..."
            onChange={(e) => setTrack1Url(e.target.value || null)}
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
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() => {
              const url = "/audio/sample-beat.mp3";
              setTrack1Url(url);
            }}
          >
            Load Sample
          </button>
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
        </div>
      </div>

      {/* Track 2 */}
      <div className="border rounded-md p-4">
        <h3 className="font-semibold">Track 2</h3>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            className="border px-2 py-1 rounded w-full"
            value={track2Url ?? ""}
            placeholder="Paste a URL or /audio/... path"
            onChange={(e) => setTrack2Url(e.target.value || null)}
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
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() => {
              const url = "/audio/sample-beat.mp3";
              setTrack2Url(url);
            }}
          >
            Load Sample
          </button>
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
        </div>
      </div>

      {/* Effects Rack */}
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
            compRef.current.ratio.value = 1; // 1:1 ≈ off
          }
        }}
      />
    </main>
  );
}
