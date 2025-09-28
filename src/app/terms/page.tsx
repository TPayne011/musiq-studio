// src/app/terms/page.tsx
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="text-gray-700">
        These Terms govern your use of Musiq-Studio (the “Service”). By using
        the Service you agree to these Terms.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Use of the Service</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>You must be at least 13 and able to form a binding contract.</li>
          <li>
            Don’t misuse the Service, attempt to disrupt it, or infringe others’
            rights.
          </li>
          <li>You’re responsible for content you upload or create.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Content & Ownership</h2>
        <p className="text-gray-700">
          You retain rights to your audio and other content. You must have the
          necessary rights to any content you use.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">No Warranties</h2>
        <p className="text-gray-700">
          The Service is provided “as is” without warranties of any kind.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Limitation of Liability</h2>
        <p className="text-gray-700">
          To the extent permitted by law, we won’t be liable for indirect or
          consequential damages.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Changes</h2>
        <p className="text-gray-700">
          We may update these Terms. Continued use means you accept them.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-gray-700">
          Contact:{" "}
          <a className="underline" href="mailto:legal@musiq.studio">
            legal@musiq.studio
          </a>
        </p>
      </section>

      <p className="text-xs text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </main>
  );
}
