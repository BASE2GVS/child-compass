export const metadata = { title: "FAQ — Child Compass" };

const FAQ = [
  {
    q: "What is Child Compass?",
    a: "Child Compass is a calm, premium platform for parents of neurodivergent children. It helps you track patterns, reflect with Parent Debrief™, and get context-aware guidance — built on your family's real data.",
  },
  {
    q: "Is Child Compass a medical or diagnostic tool?",
    a: "No. Child Compass does not diagnose conditions or replace professional care. It supports everyday parenting and helps you prepare for conversations with teachers, therapists, and clinicians.",
  },
  {
    q: "How does the free trial work?",
    a: "New families receive 14 days of full Family Plus access. After the trial, choose Family (R149/month) or Family Plus (R249/month) to continue with your history intact.",
  },
  {
    q: "Can I export my data?",
    a: "Yes. Go to Settings → Data controls → Export family data. You can also request account deletion at any time.",
  },
  {
    q: "Who can see my child's information?",
    a: "Only members of your family account. Row-level security isolates each family's data. You control sharing permissions for grandparents, teachers, and therapists.",
  },
  {
    q: "How do I contact support?",
    a: "Use Contact Support or Report a Problem in the Help Centre. We aim to respond within one business day.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0F172A]">Frequently asked questions</h1>
      <dl className="mt-8 space-y-6">
        {FAQ.map((item) => (
          <div key={item.q}>
            <dt className="font-semibold text-[#0F172A]">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-[#64748B]">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
