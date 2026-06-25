"use client";

import { useState, useTransition } from "react";
import {
  exportDiagnosticsJson,
  runDemoReset,
  runDemoSeed,
  updatePilotConfig,
} from "@/lib/actions/pilot-settings";
import { Banner, Button, GlassCard, SectionHeader } from "@/components/design-system";
import type { PilotConfig } from "@/lib/pilot/config";

type PilotSettingsPanelProps = {
  config: PilotConfig;
  diagnostics: Awaited<ReturnType<typeof import("@/lib/pilot/diagnostics").buildDiagnostics>>;
  analyticsSummary: Record<string, number>;
  aiLogs: Awaited<ReturnType<typeof import("@/lib/pilot/ai-logger").readAILogs>>;
  envFeedback: boolean;
  envAdmin: boolean;
};

export default function PilotSettingsPanel({
  config,
  diagnostics,
  analyticsSummary,
  aiLogs,
  envFeedback,
  envAdmin,
}: PilotSettingsPanelProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ success?: boolean; error?: string; created?: string[]; removed?: number }>) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.created?.length) {
        setMessage(`Demo children seeded: ${result.created.join(", ")}`);
      } else if (result.removed != null) {
        setMessage(`Removed ${result.removed} demo child profile(s).`);
      } else {
        setMessage("Settings updated.");
      }
    });
  }

  return (
    <div className="space-y-8">
      {message && <Banner variant="success">{message}</Banner>}
      {error && <Banner variant="warning">{error}</Banner>}

      <GlassCard padding="lg">
        <SectionHeader
          eyebrow="Pilot"
          title="Runtime configuration"
          description="File-based toggles (data/pilot-config.json). Environment variables take precedence for admin access."
        />
        <form
          action={(fd) => {
            startTransition(async () => {
              await updatePilotConfig(fd);
              setMessage("Pilot configuration saved.");
            });
          }}
          className="mt-6 space-y-4"
        >
          <label className="flex items-center justify-between rounded-xl bg-[#FAF8F4] px-4 py-3 text-sm">
            <span>Enable pilot feedback page</span>
            <input type="checkbox" name="pilotFeedbackEnabled" defaultChecked={config.pilotFeedbackEnabled || envFeedback} />
          </label>
          <label className="flex items-center justify-between rounded-xl bg-[#FAF8F4] px-4 py-3 text-sm">
            <span>Mark demo data as enabled</span>
            <input type="checkbox" name="demoDataEnabled" defaultChecked={config.demoDataEnabled} />
          </label>
          <label className="flex items-center justify-between rounded-xl bg-[#FAF8F4] px-4 py-3 text-sm">
            <span>Product analytics (no PII)</span>
            <input type="checkbox" name="analyticsEnabled" defaultChecked={config.analyticsEnabled} />
          </label>
          <Button type="submit" disabled={pending}>
            Save configuration
          </Button>
        </form>
        <p className="mt-4 text-xs text-[#94A3B8]">
          Admin access: {envAdmin ? "enabled via PILOT_ADMIN_ENABLED" : "disabled — set PILOT_ADMIN_ENABLED=true"}
        </p>
      </GlassCard>

      <GlassCard padding="lg">
        <SectionHeader title="Demo data" description="Seed Erkie (PDA), Maya (Autism+Anxiety), and Leo (ADHD) with 21 days of realistic check-ins." />
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" disabled={pending} onClick={() => run(runDemoSeed)}>
            Seed demo children
          </Button>
          <Button type="button" variant="secondary" disabled={pending} onClick={() => run(runDemoReset)}>
            Reset demo children
          </Button>
        </div>
      </GlassCard>

      <GlassCard padding="lg">
        <SectionHeader title="Diagnostics" description="Environment and pilot health — safe to share with developers." />
        <pre className="mt-4 max-h-64 overflow-auto rounded-2xl bg-[#0F172A] p-4 text-xs text-emerald-100">
          {JSON.stringify(diagnostics, null, 2)}
        </pre>
        <Button
          type="button"
          className="mt-4"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const json = await exportDiagnosticsJson();
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `child-compass-diagnostics-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            });
          }}
        >
          Export diagnostics JSON
        </Button>
      </GlassCard>

      <GlassCard padding="lg">
        <SectionHeader title="Product analytics" description="Aggregated feature usage — family IDs are hashed." />
        <ul className="mt-4 space-y-2 text-sm text-[#64748B]">
          {Object.entries(analyticsSummary).map(([event, count]) => (
            <li key={event}>
              {event}: <strong className="text-[#0F172A]">{count}</strong>
            </li>
          ))}
          {Object.keys(analyticsSummary).length === 0 && <li>No events recorded yet.</li>}
        </ul>
      </GlassCard>

      <GlassCard padding="lg">
        <SectionHeader title="AI logs" description="Recent AI interactions (child IDs hashed, summaries only)." />
        <ul className="mt-4 max-h-72 space-y-3 overflow-auto text-sm">
          {aiLogs.length === 0 && <li className="text-[#64748B]">No AI logs yet.</li>}
          {aiLogs
            .slice()
            .reverse()
            .map((log, i) => (
              <li key={i} className="rounded-xl bg-[#FAF8F4] px-4 py-3 text-[#475569]">
                <span className="text-xs text-[#94A3B8]">{log.ts}</span>
                <p className="font-medium text-[#0F172A]">
                  {log.source}
                  {log.confidence != null ? ` · ${Math.round(log.confidence * 100)}% confidence` : ""}
                </p>
                <p className="mt-1">{log.summary}</p>
              </li>
            ))}
        </ul>
      </GlassCard>
    </div>
  );
}
