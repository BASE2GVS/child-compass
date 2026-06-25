"use client";

import { useState, useTransition } from "react";
import {
  adminCancelSubscription,
  adminCreateAnnouncement,
  adminPublishKnowledgePack,
  adminSetFeatureFlag,
  adminUpdateSubscription,
} from "@/lib/actions/admin";
import { Banner, Button, GlassCard, Input, SectionHeader, Textarea } from "@/components/design-system";
import type { getAdminDashboardData } from "@/lib/actions/admin";

type AdminPanelProps = Awaited<ReturnType<typeof getAdminDashboardData>>;

export default function AdminPanel(props: AdminPanelProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      setMessage("Updated.");
    });
  }

  return (
    <div className="space-y-8">
      {message && <Banner variant="success">{message}</Banner>}

      <GlassCard padding="lg">
        <SectionHeader eyebrow="Health" title="Platform health" description="Environment and dependency status." />
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
          {Object.entries(props.diagnostics.checks).map(([key, ok]) => (
            <div key={key} className="flex justify-between rounded-xl bg-[#FAF8F4] px-4 py-3">
              <dt className="text-[#64748B]">{key}</dt>
              <dd className={ok ? "text-emerald-600" : "text-rose-600"}>{ok ? "OK" : "Issue"}</dd>
            </div>
          ))}
        </dl>
      </GlassCard>

      <GlassCard padding="lg">
        <SectionHeader title="Engagement" description="Anonymous product events — no personal family data." />
        <div className="mt-4 grid gap-4 sm:grid-cols-4 text-center">
          {[
            { label: "Check-ins", value: props.engagement.checkins },
            { label: "Debriefs", value: props.engagement.debriefs },
            { label: "Reports", value: props.engagement.reports },
            { label: "Total events", value: props.engagement.totalEvents },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-[#FAF8F4] p-4">
              <p className="text-2xl font-bold text-[#0F172A]">{item.value}</p>
              <p className="text-xs text-[#94A3B8]">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(props.analyticsSummary).map(([event, count]) => (
            <span key={event} className="rounded-full bg-white px-3 py-1 text-xs text-[#64748B] border border-[#E8E4DC]">
              {event}: {count}
            </span>
          ))}
        </div>
      </GlassCard>

      <GlassCard padding="lg">
        <SectionHeader title="Families & subscriptions" />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[#94A3B8]">
                <th className="pb-2 pr-4">Family</th>
                <th className="pb-2 pr-4">Plan</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {props.subscriptions.map((sub) => {
                const family = props.families.find((f) => f.id === sub.family_id);
                return (
                  <tr key={sub.id} className="border-t border-[#F1EDE6]">
                    <td className="py-3 pr-4">{family?.name ?? sub.family_id.slice(0, 8)}</td>
                    <td className="py-3 pr-4">{sub.plan_tier}</td>
                    <td className="py-3 pr-4">{sub.status}</td>
                    <td className="py-3">
                      <form
                        action={(fd) => run(() => adminUpdateSubscription(fd))}
                        className="flex flex-wrap gap-2"
                      >
                        <input type="hidden" name="familyId" value={sub.family_id} />
                        <select name="planTier" className="rounded-lg border px-2 py-1 text-xs">
                          <option value="family">family</option>
                          <option value="family_plus">family_plus</option>
                          <option value="pilot">pilot</option>
                        </select>
                        <Button type="submit" variant="secondary" disabled={pending} className="text-xs py-1">
                          Change
                        </Button>
                      </form>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={pending}
                        className="mt-1 text-xs py-1"
                        onClick={() => run(() => adminCancelSubscription(sub.family_id))}
                      >
                        Grace cancel
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard padding="lg">
        <SectionHeader title="Knowledge pack" description={`Current: v${props.packMeta.version} · ${props.packMeta.status}`} />
        <p className="mt-2 text-sm text-[#64748B]">{props.packMeta.changelog}</p>
        <form action={(fd) => run(() => adminPublishKnowledgePack(fd))} className="mt-4 space-y-3">
          <Textarea name="changelog" rows={2} placeholder="Changelog for this publish" />
          <Textarea name="evidenceNotes" rows={2} placeholder="Evidence references" />
          <Button type="submit" disabled={pending}>
            Mark pack published
          </Button>
        </form>
      </GlassCard>

      <GlassCard padding="lg">
        <SectionHeader title="Feature flags" />
        <ul className="mt-4 space-y-2">
          {props.featureFlags.map((flag) => (
            <li key={flag.key} className="flex items-center justify-between rounded-xl bg-[#FAF8F4] px-4 py-3 text-sm">
              <span>
                <strong>{flag.key}</strong>
                {flag.description && <span className="ml-2 text-[#94A3B8]">{flag.description}</span>}
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() => run(() => adminSetFeatureFlag(flag.key, !flag.enabled))}
              >
                {flag.enabled ? "Disable" : "Enable"}
              </Button>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard padding="lg">
        <SectionHeader title="System announcement" />
        <form action={(fd) => run(() => adminCreateAnnouncement(fd))} className="mt-4 space-y-3">
          <Input name="title" placeholder="Title" required />
          <Textarea name="message" rows={3} placeholder="Message for all families" required />
          <select name="severity" className="w-full rounded-2xl border border-[#E8E4DC] px-4 py-3 text-sm">
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <Button type="submit" disabled={pending}>
            Publish announcement
          </Button>
        </form>
      </GlassCard>

      <GlassCard padding="lg">
        <SectionHeader title="Support tickets" description={`${props.tickets.length} recent tickets`} />
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto text-sm">
          {props.tickets.map((t) => (
            <li key={t.id} className="rounded-xl bg-[#FAF8F4] px-4 py-3">
              <p className="font-semibold text-[#0F172A]">
                [{t.ticket_type}] {t.subject}
              </p>
              <p className="text-[#64748B]">{t.message.slice(0, 120)}…</p>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard padding="lg">
        <SectionHeader title="AI logs" description="Recent AI interactions (anonymised child ids)." />
        <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto font-mono text-xs text-[#64748B]">
          {props.aiLogs.map((log, i) => (
            <li key={i}>
              {log.ts} · {log.source} · {log.summary?.slice(0, 60)}
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard padding="lg">
        <SectionHeader title="Errors" />
        <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto font-mono text-xs text-rose-700">
          {props.errors.map((err, i) => (
            <li key={i}>
              {err.ts} · {err.source}: {err.message}
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
