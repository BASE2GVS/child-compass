import { buildDiagnostics } from "@/lib/pilot/diagnostics";

export const dynamic = "force-dynamic";
export const metadata = { title: "System Status — Child Compass" };

export default async function StatusPage() {
  const diagnostics = await buildDiagnostics();
  const allOk = Object.values(diagnostics.checks).every(Boolean);

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0F172A]">System status</h1>
      <p className={`mt-4 inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${allOk ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
        {allOk ? "All systems operational" : "Some checks need attention"}
      </p>
      <ul className="mt-8 space-y-3 text-sm">
        {Object.entries(diagnostics.checks).map(([name, ok]) => (
          <li key={name} className="flex justify-between rounded-xl bg-[#FAF8F4] px-4 py-3">
            <span className="text-[#0F172A]">{name}</span>
            <span className={ok ? "text-emerald-600" : "text-amber-600"}>{ok ? "Operational" : "Degraded"}</span>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-xs text-[#94A3B8]">Last checked: {new Date().toISOString()}</p>
    </div>
  );
}
