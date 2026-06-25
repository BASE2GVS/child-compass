import type { ReportContent } from "@/lib/services/report-generator";
import { Icon } from "@/components/design-system/icons";
import { ds } from "@/components/design-system/tokens";

const sectionIcons: Record<string, string> = {
  Summary: "sparkles",
  Highlights: "chart",
  Recommendations: "heart",
  Strategies: "document",
  Overview: "users",
  Triggers: "message",
  Support: "heart",
};

function sectionIcon(title: string) {
  const key = Object.keys(sectionIcons).find((k) => title.toLowerCase().includes(k.toLowerCase()));
  const name = (key ? sectionIcons[key] : "document") as "sparkles" | "chart" | "heart" | "document" | "users" | "message";
  return <Icon name={name} size="sm" className="text-[#14B8A6]" />;
}

export default function ReportLayout({
  content,
  reportType,
}: {
  content: ReportContent;
  reportType: string;
}) {
  const preparedDate = new Date(content.generatedAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className={`report-print mx-auto max-w-3xl overflow-hidden ${ds.card} print:border-0 print:shadow-none`}>
      {/* Cover */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#14B8A6]/40 px-10 py-14 text-white print:bg-white print:text-[#0F172A]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#14B8A6] print:text-[#14B8A6]">
          Child Compass™
        </p>
        <p className="mt-2 text-xs uppercase tracking-widest text-white/60 print:text-[#94A3B8]">
          {reportType.replace(/_/g, " ")}
        </p>
        <h1 className="mt-6 text-3xl font-bold tracking-tight lg:text-4xl print:text-[#0F172A]">{content.headline}</h1>
        <p className="mt-4 text-sm text-white/70 print:text-[#64748B]">Prepared {preparedDate}</p>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/80 print:text-[#64748B]">
          A confidential family document — designed to share calm, clear context with schools, therapists, and caregivers.
        </p>
      </div>

      <div className="space-y-10 p-10 print:p-0">
        {content.sections.map((section) => (
          <section key={section.title} className="break-inside-avoid">
            <div className="mb-4 flex items-center gap-2">
              {sectionIcon(section.title)}
              <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#14B8A6]">{section.title}</h2>
            </div>
            {Array.isArray(section.body) ? (
              <ul className="space-y-3">
                {section.body.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-[#64748B]">
                    <span className="mt-1 shrink-0 text-[#14B8A6]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-[#64748B]">{section.body}</p>
            )}
          </section>
        ))}

        <footer className="border-t border-[#F1EDE6] pt-8 text-center print:mt-8">
          <p className="text-xs text-[#94A3B8]">Prepared by Child Compass™</p>
          <p className="mt-1 text-xs text-[#94A3B8]">Confidential · For family and professional use only</p>
        </footer>
      </div>
    </article>
  );
}
