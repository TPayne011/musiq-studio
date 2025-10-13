// src/app/terms/page.tsx
export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="card space-y-6">
        <h1>Musiq Studio on Pi — Terms of Service</h1>
        <p>
          Welcome to Musiq Studio on Pi — the Web3 music creation and minting
          experience built for the Pi Network community. By using our app, you
          (“Creator”, “User”) agree to the terms below.
        </p>

        <section className="space-y-3">
          <h2>1. Use of Service</h2>
          <ul>
            <li>
              You must log in using your verified Pi Network account via the
              official Pi SDK.
            </li>
            <li>
              You may upload and mint only original audio that you have the
              rights to distribute.
            </li>
            <li>
              Musiq Studio on Pi provides tools for composition, storage, and
              NFT minting; we do not claim ownership of your works.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2>2. Minting & Fees</h2>
          <ul>
            <li>
              Each mint transaction includes a base minting fee of 2 Pi plus a
              creator-set price (typically 5 – 10 Pi).
            </li>
            <li>
              All transactions are processed via the Pi Network SDK and secured
              by the Pi Blockchain.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2>3. Intellectual Property</h2>
          <p>
            You retain full rights to your original music and metadata. By
            minting a track, you grant Musiq Studio on Pi a non-exclusive
            license to display and distribute the NFT within the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2>4. Responsibility & Conduct</h2>
          <ul>
            <li>No uploading infringing or offensive content.</li>
            <li>Respect other creators and the Pi community.</li>
            <li>
              Violations may lead to temporary suspension or removal from the
              platform.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2>5. Disclaimers</h2>
          <p>
            Musiq Studio on Pi is a beta-stage project built for the Pi Network
            Hackathon. We make no guarantees of availability or financial
            return. All Pi transactions are final and subject to Pi Network’s
            terms and policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2>6. Contact</h2>
          <p>
            For questions or support, email
            <a
              href="mailto:support@musiq.studio"
              className="text-purple-700 underline"
            >
              support@musiq.studio
            </a>
            .
          </p>
        </section>

        <p className="text-xs text-neutral-500">
          Last updated {new Date().toLocaleDateString()} · Musiq Studio on Pi
        </p>
      </div>
    </main>
  );
}
