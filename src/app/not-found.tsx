export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-gray-600">
        Try the Studio, Market, Privacy, or Terms pages.
      </p>
      <a
        href="/"
        className="inline-block mt-6 rounded-md border px-4 py-2 hover:bg-gray-50"
      >
        Go Home
      </a>
    </main>
  );
}
