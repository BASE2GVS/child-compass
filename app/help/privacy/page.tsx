export const metadata = { title: "Privacy Centre — Child Compass" };

export default function PrivacyPage() {
  return (
    <div className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-bold text-[#0F172A]">Privacy Centre</h1>
      <p className="mt-4 text-[#64748B] leading-relaxed">
        Child Compass is built for families who need trust above everything. Your data belongs to you.
      </p>
      <h2 className="mt-8 text-xl font-bold text-[#0F172A]">What we collect</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#64748B]">
        <li>Account information (email, name, timezone)</li>
        <li>Child profiles and daily check-ins you enter</li>
        <li>Debrief notes, goals, documents, and reports you generate</li>
        <li>Anonymous product usage events (no child names in analytics)</li>
      </ul>
      <h2 className="mt-8 text-xl font-bold text-[#0F172A]">How we protect it</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#64748B]">
        <li>Row-level security isolates each family&apos;s data in the database</li>
        <li>Encryption in transit (HTTPS) and at rest (Supabase)</li>
        <li>AI guidance uses your family context only — we do not sell data</li>
      </ul>
      <h2 className="mt-8 text-xl font-bold text-[#0F172A]">Your rights</h2>
      <p className="mt-3 text-sm text-[#64748B]">
        Export your data from Settings at any time. Request account deletion via Settings or Contact Support. POPIA and
        GDPR principles guide our handling of personal information.
      </p>
      <p className="mt-6 text-sm text-[#64748B]">
        Questions: <a href="/help/contact" className="text-[#14B8A6] hover:underline">Contact support</a>
      </p>
    </div>
  );
}
