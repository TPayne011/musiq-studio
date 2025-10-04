export default function StudioPage() {
  return (
    <main className="studio-container">
      <header>
        <h1>Pi Musiq Studio</h1>
        <p>Quick demo layout with styling hooks.</p>
      </header>

      <section>
        <h2>Mixers</h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <label>
            Volume
            <input type="range" min={0} max={100} defaultValue={70} />
          </label>
          <label>
            Balance
            <input type="range" min={-50} max={50} defaultValue={0} />
          </label>
        </div>
      </section>

      <section>
        <h2>Player</h2>
        <audio controls preload="none" style={{ width: "100%" }}>
          <source src="" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </section>

      <div>
        <button className="studio-button">Export</button>
      </div>
    </main>
  );
}
