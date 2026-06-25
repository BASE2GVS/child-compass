import type { NotificationPreferences } from "@/lib/types/database";

export type NotificationType =
  | "daily_checkin"
  | "appointment"
  | "weekly_summary"
  | "new_insight"
  | "school_reminder";

export type ScheduledNotification = {
  userId: string;
  familyId: string;
  childId?: string;
  notificationType: NotificationType;
  title: string;
  body: string;
  scheduledFor: Date;
  metadata?: Record<string, unknown>;
};

/**
 * Notification architecture — queues notifications in Supabase.
 * No third-party provider integration yet; ready for email/push later.
 */
export class NotificationService {
  async schedule(
    notification: ScheduledNotification,
    insertFn: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>,
  ) {
    const { error } = await insertFn({
      user_id: notification.userId,
      family_id: notification.familyId,
      child_id: notification.childId ?? null,
      notification_type: notification.notificationType,
      title: notification.title,
      body: notification.body,
      scheduled_for: notification.scheduledFor.toISOString(),
      status: "pending",
      metadata: notification.metadata ?? {},
    });
    if (error) throw new Error(error.message);
  }

  buildDailyCheckinReminder(
    userId: string,
    familyId: string,
    childId: string,
    childName: string,
  ): ScheduledNotification {
    const scheduled = nextMorningAt(8);
    return {
      userId,
      familyId,
      childId,
      notificationType: "daily_checkin",
      title: "Daily check-in reminder",
      body: `How is ${childName} doing today? A quick check-in helps Child Compass learn their patterns.`,
      scheduledFor: scheduled,
    };
  }

  buildWeeklySummaryReminder(
    userId: string,
    familyId: string,
    childId: string,
    childName: string,
  ): ScheduledNotification {
    const scheduled = nextSundayAt(18);
    return {
      userId,
      familyId,
      childId,
      notificationType: "weekly_summary",
      title: "Weekly summary ready",
      body: `${childName}'s weekly summary is ready to review in Child Compass.`,
      scheduledFor: scheduled,
    };
  }

  buildNewInsightNotification(
    userId: string,
    familyId: string,
    childId: string,
    insightTitle: string,
  ): ScheduledNotification {
    return {
      userId,
      familyId,
      childId,
      notificationType: "new_insight",
      title: "New AI insight",
      body: insightTitle,
      scheduledFor: new Date(),
    };
  }

  shouldNotify(prefs: NotificationPreferences, type: NotificationType): boolean {
    const map: Record<NotificationType, keyof NotificationPreferences> = {
      daily_checkin: "daily_checkin",
      weekly_summary: "weekly_summary",
      new_insight: "new_insight",
      appointment: "appointments",
      school_reminder: "school_reminder",
    };
    return prefs[map[type]] ?? true;
  }
}

function nextMorningAt(hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + (d.getHours() >= hour ? 1 : 0));
  d.setHours(hour, 0, 0, 0);
  return d;
}

function nextSundayAt(hour: number): Date {
  const d = new Date();
  const daysUntilSunday = (7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSunday);
  d.setHours(hour, 0, 0, 0);
  return d;
}

export const notificationService = new NotificationService();
