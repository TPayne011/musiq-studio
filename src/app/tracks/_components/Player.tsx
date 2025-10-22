// src/app/tracks/_components/Player.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type PlayerProps = {
  audioUrl: string;
  height?: number;
};

export default function Player({ audioUrl, height = 80 }: PlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<any | null>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Create once
  useEffect(() => {
    let disposed = false;

    async function setup() {
      try {
        if (!containerRef.current) return;

        // Dynamic import so Next never tries to SSR/bundle it on the server
        const mod = await import("wavesurfer.js");
        const WaveSurfer = mod.default;

        const ws = WaveSurfer.create({
          container: containerRef.current,
          height,
          url: audioUrl,
          // feel free to tweak:
          waveColor: "#999",
          progressColor: "#6d28d9", // pi purple-ish
          cursorColor: "#fff",
          barWidth: 2,
          barGap: 1,
          normalize: true,
        });

        wsRef.current = ws;

        ws.on("ready", () => !disposed && setReady(true));
        ws.on("error", (e: any) => {
          console.error("[WaveSurfer error]", e);
          if (!disposed) setErr("Failed to load audio.");
        });

        // Keep it responsive
        const ro =
          typeof ResizeObserver !== "undefined"
            ? new ResizeObserver(() => {
                try {
                  // v7 redraw
                  (ws as any)?.drawer?.updateSize?.();
                  (ws as any)?.drawBuffer?.();
                } catch {}
              })
            : null;

        if (ro && containerRef.current) ro.observe(containerRef.current);

        return () => {
          disposed = true;
          try {
            ro?.disconnect();
          } catch {}
          try {
            ws.destroy();
          } catch {}
          wsRef.current = null;
        };
      } catch (e: any) {
        console.error("Player setup failed:", e);
        setErr(e?.message || "Player setup failed");
      }
    }

    setup();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // create once

  // Reload on URL change
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || !audioUrl) return;
    try {
      setReady(false);
      setErr(null);
      ws.load(audioUrl);
    } catch (e: any) {
      console.error("WaveSurfer load error:", e);
      setErr(e?.message || "Failed to load audio.");
    }
  }, [audioUrl]);

  return (
    <div>
      <div
        ref={containerRef}
        className="rounded border border-white/10 overflow-hidden bg-black/30"
        style={{ minHeight: height }}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => wsRef.current?.playPause()}
          className="px-3 py-1 border rounded border-white/20 hover:bg-white/10 transition"
          disabled={!ready || !!err}
        >
          {ready ? "Play / Pause" : "Loading…"}
        </button>
        <button
          onClick={() => wsRef.current?.stop()}
          className="px-3 py-1 border rounded border-white/20 hover:bg-white/10 transition"
          disabled={!ready || !!err}
        >
          Stop
        </button>
        {err && <span className="text-sm text-red-400 ml-2">❌ {err}</span>}
      </div>
    </div>
  );
}
