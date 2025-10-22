export default function Loading() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Library</h1>
      <div className="animate-pulse space-y-3">
        <div className="h-16 rounded bg-white/5" />
        <div className="h-16 rounded bg-white/5" />
        <div className="h-16 rounded bg-white/5" />
      </div>
    </main>
  );
}
