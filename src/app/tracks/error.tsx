"use client";

export default function TracksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Your Library</h1>
      <div className="rounded border border-red-500/40 bg-red-500/10 p-4">
        <div className="font-medium text-red-300">Something went wrong.</div>
        <p className="text-sm text-red-200/90 mt-1">
          {error.message || "Server error"}{" "}
          {error.digest ? `(digest ${error.digest})` : ""}
        </p>
        <button
          onClick={reset}
          className="mt-3 rounded bg-white/10 px-3 py-1 hover:bg-white/20"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
