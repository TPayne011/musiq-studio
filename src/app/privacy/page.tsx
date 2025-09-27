export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-gray-700">
        This Privacy Policy explains how Musiq-Studio (“we”, “our”, “us”)
        collects, uses, and shares information when you use our website and
        features (the “Service”).
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Information We Collect</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>
            <strong>Account & contact info</strong> (if you choose to provide
            it).
          </li>
          <li>
            <strong>Usage data</strong> (pages visited, basic analytics).
          </li>
          <li>
            <strong>Local files</strong> you load into the Studio stay on your
            device; we do not upload them.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How We Use Information</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>To operate and improve the Service.</li>
          <li>To communicate with you about updates or support.</li>
          <li>To protect the Service from misuse or abuse.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Sharing</h2>
        <p className="text-gray-700">
          We do not sell your personal information. We may share limited data
          with service providers who help us run the Service (subject to
          confidentiality).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Data Retention</h2>
        <p className="text-gray-700">
          We retain information only as long as necessary for the purposes
          above. Local audio you load in the Studio is not uploaded and does not
          leave your device.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Your Choices</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>You can request access or deletion of your account data.</li>
          <li>You can control cookies/analytics via your browser settings.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-gray-700">
          Questions? Contact us at{" "}
          <a className="underline" href="mailto:support@musiq.studio">
            support@musiq.studio
          </a>
          .
        </p>
      </section>

      <p className="text-xs text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </main>
  );
}
