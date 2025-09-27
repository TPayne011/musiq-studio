export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
        <a href="/" className="font-semibold">
          Musiq-Studio
        </a>
        <nav className="flex gap-4 text-sm">
          <a href="/studio">Studio</a>
          <a href="/market">Market</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </div>
    </header>
  );
}
