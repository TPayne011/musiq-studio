"use client";
import React, { useState } from "react";

type Tab = "studio" | "docs";

export default function PiWireframes({
  initialTab = "studio",
}: {
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTab("studio")}
          className={`rounded border px-3 py-1 text-sm ${
            tab === "studio" ? "bg-neutral-800 text-white" : ""
          }`}
        >
          Studio
        </button>
        <button
          onClick={() => setTab("docs")}
          className={`rounded border px-3 py-1 text-sm ${
            tab === "docs" ? "bg-neutral-800 text-white" : ""
          }`}
        >
          Docs
        </button>
      </div>

      {tab === "studio" ? (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2 h-64 rounded-2xl border-2 border-dashed grid place-items-center">
            DAW Canvas (wireframe)
          </div>
          <div className="h-64 rounded-2xl border-2 border-dashed grid place-items-center">
            Tracks (wireframe)
          </div>
          <div className="md:col-span-3 h-40 rounded-2xl border-2 border-dashed grid place-items-center">
            Transport / Mixer (wireframe)
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="h-24 rounded-2xl border-2 border-dashed grid place-items-center">
            Docs Header
          </div>
          <div className="h-52 rounded-2xl border-2 border-dashed grid place-items-center">
            Docs TOC + Content
          </div>
        </div>
      )}
    </div>
  );
}
