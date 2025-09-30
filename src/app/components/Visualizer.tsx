"use client";
import { useEffect, useRef } from "react";

interface Props {
  analyser: AnalyserNode | null;
}

export default function Visualizer({ analyser }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    let rafId = 0;

    const render = () => {
      analyser.getByteFrequencyData(data);
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const barW = Math.max(1, (width / data.length) * 2.0);
      let x = 0;
      for (let i = 0; i < data.length; i++) {
        const v = data[i];
        const barH = (v / 255) * height;
        ctx.fillStyle = "#2563eb";
        ctx.fillRect(x, height - barH, barW, barH);
        x += barW + 1;
      }
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={128}
      className="w-full h-32 rounded bg-gray-100"
    />
  );
}
