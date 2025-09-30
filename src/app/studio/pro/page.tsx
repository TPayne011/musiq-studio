"use client";

import { useEffect, useRef, useState } from "react";
// Use relative path (pro is 2 levels deeper than components)
import Visualizer from "../../components/Visualizer";

type TrackState = {
  id: number;
  name: string;
  src: string | null; // preset URL or blob URL
  volume: number; // 0..100
  el: HTMLAudioElement | null; // created once, reused
};

export default function StudioProPage() {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Keep node refs per track id
  const sourceNodes = useRef<Map<number, MediaElementAudioSourceNode>>(
    new Map()
  );
  const trackGains = useRef<Map<number, GainNode>>(new Map());

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Two tracks to start. Track 1 uses your Rev.mp3 preset, Track 2 starts empty.
  const [tracks, setTracks] = useState<TrackState[]>([
    { id: 1, name: "Track 1", src: "/audio/Rev.mp3", volume: 80, el: null },
    { id: 2, name: "Track 2", src: null, volume: 80, el: null },
  ]);

  // Initialize AudioContext graph once
  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    // Master analyser + gain
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyserRef.current = analyser;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGainRef.current = masterGain;

    // route: individual track gains -> masterGain -> analyser -> destination
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    // Build audio elements + nodes for each track
    const updated = tracks.map((t) => {
      const el = new Audio();
      el.loop = true;
      if (t.src) el.src = t.src;
      el.volume = t.volume / 100;

      const srcNode = ctx.createMediaElementSource(el);
      sourceNodes.current.set(t.id, srcNode);

      const gain = ctx.createGain();
      gain.gain.value = t.volume / 100;
      trackGains.current.set(t.id, gain);

      // connect: src -> trackGain -> masterGain
      srcNode.connect(gain);
      gain.connect(masterGain);

      return { ...t, el };
    });
    setTracks(updated);
    setReady(true);

    return () => {
      // cleanup
      try {
        updated.forEach((t) => {
          try {
            t.el?.pause();
          } catch {}
        });
        ctx.close();
      } catch {}
      sourceNodes.current.clear();
      trackGains.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // Helpers
  const playAll = async () => {
    setError(null);
    try {
      await Promise.all(
        tracks.map(async (t) => {
          if (t.el) {
            // ensure a src exists
            if (!t.el.src) return;
            await t.el.play();
          }
        })
      );
    } catch (e) {
      setError("Autoplay blocked — click Play again after interacting.");
    }
  };

  const pauseAll = () => {
    tracks.forEach((t) => t.el?.pause());
  };

  const stopAll = () => {
    tracks.forEach((t) => {
      if (t.el) {
        t.el.pause();
        t.el.currentTime = 0;
      }
    });
  };

  const onPickLocal = (trackId: number, fileList: FileList | null) => {
    const f = fileList?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);

    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== trackId) return t;
        if (t.el) {
          t.el.src = url;
          // try to start playing when chosen
          t.el.play().catch(() => {});
        }
        return { ...t, src: url };
      })
    );
  };

  const onVolumeChange = (trackId: number, v: number) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== trackId) return t;
        // update element volume
        if (t.el) t.el.volume = v / 100;
        // update gain node volume (so analyser visualizes correct loudness)
        trackGains.current
          .get(trackId)
          ?.gain.setValueAtTime(v / 100, ctxRef.current!.currentTime);
        return { ...t, volume: v };
      })
    );
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Studio Pro</h1>
      <p className="text-gray-600">
        Two-track mini-mixer with per-track volume and a live visualizer.
      </p>

      <div className="rounded border bg-white p-4 space-y-4">
        {/* Transport */}
        <div className="flex flex-wrap items-center gap-3">
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
          {error && <span className="text-sm text-red-600 ml-2">{error}</span>}
        </div>

        {/* Tracks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((t) => (
            <div key={t.id} className="rounded border p-3 space-y-3">
              <div className="font-medium">{t.name}</div>

              <div className="flex items-center gap-2">
                <label className="text-sm w-16">Volume</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={t.volume}
                  onChange={(e) => onVolumeChange(t.id, Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm w-10 text-right">{t.volume}%</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm w-16">Source</label>
                <select
                  className="rounded border px-2 py-1"
                  value={t.src ?? ""}
                  onChange={(e) => {
                    const val = e.target.value || null;
                    setTracks((prev) =>
                      prev.map((x) => {
                        if (x.id !== t.id) return x;
                        if (x.el) {
                          x.el.src = val ?? "";
                          if (val) x.el.play().catch(() => {});
                        }
                        return { ...x, src: val };
                      })
                    );
                  }}
                >
                  <option value="">(none)</option>
                  <option value="/audio/Rev.mp3">Rev Beat</option>
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
            </div>
          ))}
        </div>
      </div>

      {/* Visualizer */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Visualizer (master mix)</h2>
        {ready ? (
          <Visualizer analyser={analyserRef.current} />
        ) : (
          <p>Initializing…</p>
        )}
      </div>
    </main>
  );
}
