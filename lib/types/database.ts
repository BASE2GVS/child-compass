export type NotificationPreferences = {
  daily_checkin: boolean;
  weekly_summary: boolean;
  new_insight: boolean;
  appointments: boolean;
  school_reminder: boolean;
};

export type EmergencyContact = {
  name?: string;
  phone?: string;
  relationship?: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  timezone: string | null;
  country: string | null;
  relationship_to_child: string | null;
  emergency_contact: EmergencyContact;
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
};

export type Family = {
  id: string;
  owner_id: string;
  name: string;
  country: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type FamilyMember = {
  id: string;
  family_id: string;
  user_id: string | null;
  role: "owner" | "parent" | "caregiver" | "admin";
  invited_email: string | null;
  created_at: string;
};

export type Child = {
  id: string;
  family_id: string;
  photo_url: string | null;
  first_name: string;
  nickname: string | null;
  date_of_birth: string | null;
  gender: string | null;
  school: string | null;
  grade: string | null;
  diagnosis: string[];
  support_needs: string[];
  interests: string[];
  favourite_activities: string[];
  created_at: string;
  updated_at: string;
};

export type SupportContact = {
  name: string;
  role?: string;
  email?: string;
  phone?: string;
};

export type ChildProfile = {
  id: string;
  child_id: string;
  family_id: string;
  strengths: string[];
  sensory_preferences: Record<string, unknown>;
  favourite_things: string[];
  known_triggers: string[];
  calming_strategies: string[];
  support_network: unknown[];
  notes: string | null;
  medical_history: string | null;
  medication: string[];
  challenges: string[];
  successful_strategies: string[];
  support_team: SupportContact[];
  school_contacts: SupportContact[];
  doctors: SupportContact[];
  therapists: SupportContact[];
  emergency_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DailyCheckin = {
  id: string;
  child_id: string;
  family_id: string;
  user_id: string;
  checkin_date: string;
  sleep_quality: number | null;
  mood: number | null;
  energy: number | null;
  school_rating: number | null;
  anxiety: number | null;
  sensory_overload: number | null;
  demand_tolerance: number | null;
  appetite: number | null;
  social_battery: number | null;
  wins: string[];
  challenges: string[];
  notes: string | null;
  created_at: string;
};

export type ParentDebrief = {
  id: string;
  child_id: string;
  family_id: string;
  user_id: string;
  parent_message: string;
  likely_trigger: string | null;
  behaviour_explanation: string | null;
  emotional_interpretation: string | null;
  suggested_response: string | null;
  things_not_to_say: string[];
  tomorrow_plan: string | null;
  long_term_recommendation: string | null;
  confidence_level: number | null;
  follow_up_questions: string[];
  created_at: string;
};

export type TimelineEventType =
  | "school"
  | "sleep"
  | "meltdown"
  | "victory"
  | "appointment"
  | "note"
  | "ai_insight"
  | "checkin"
  | "debrief"
  | "report"
  | "other";

export type TimelineEvent = {
  id: string;
  child_id: string;
  family_id: string;
  user_id: string;
  event_type: TimelineEventType;
  title: string;
  description: string | null;
  event_date: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type UnifiedTimelineItem = {
  id: string;
  source: "timeline" | "checkin" | "debrief" | "insight" | "report";
  event_type: string;
  title: string;
  description: string | null;
  event_date: string;
  metadata: Record<string, unknown>;
};

export type AIInsight = {
  id: string;
  child_id: string | null;
  family_id: string;
  insight_type: string;
  title: string;
  content: string;
  confidence: number | null;
  is_read: boolean;
  created_at: string;
};

export type PatternFinding = {
  id: string;
  child_id: string;
  family_id: string;
  category: string;
  title: string;
  description: string;
  confidence: number | null;
  evidence: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type GeneratedReport = {
  id: string;
  child_id: string;
  family_id: string;
  user_id: string;
  report_type: string;
  title: string;
  content: Record<string, unknown>;
  created_at: string;
};

export type DocumentRecord = {
  id: string;
  child_id: string | null;
  family_id: string;
  user_id: string;
  category: string;
  title: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
};

export type NotificationQueueItem = {
  id: string;
  user_id: string;
  family_id: string;
  child_id: string | null;
  notification_type: string;
  title: string;
  body: string;
  scheduled_for: string;
  sent_at: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type CoachSession = {
  id: string;
  child_id: string;
  family_id: string;
  user_id: string;
  title: string;
  created_at: string;
};

export type CoachMessage = {
  id: string;
  session_id: string;
  role: "parent" | "assistant";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type ChildGoal = {
  id: string;
  child_id: string;
  family_id: string;
  user_id: string;
  title: string;
  category: string;
  status: "active" | "completed" | "paused";
  target_value: number | null;
  current_value: number;
  celebration_note: string | null;
  created_at: string;
  updated_at: string;
};

export type GoalUpdate = {
  id: string;
  goal_id: string;
  child_id: string;
  user_id: string;
  progress_value: number;
  note: string | null;
  created_at: string;
};

export type Habit = {
  id: string;
  child_id: string;
  family_id: string;
  title: string;
  icon: string | null;
  active: boolean;
  created_at: string;
};

export type HabitEntry = {
  id: string;
  habit_id: string;
  child_id: string;
  entry_date: string;
  completed: boolean;
  created_at: string;
};

export type VisualSchedule = {
  id: string;
  child_id: string;
  family_id: string;
  title: string;
  schedule_type: string;
  user_id: string;
  created_at: string;
};

export type VisualScheduleItem = {
  id: string;
  schedule_id: string;
  label: string;
  icon: string | null;
  position: number;
  created_at: string;
};

export type SchoolHubEntry = {
  id: string;
  child_id: string;
  family_id: string;
  user_id: string;
  entry_type: string;
  title: string;
  content: string;
  created_at: string;
};

export type TherapySession = {
  id: string;
  child_id: string;
  family_id: string;
  user_id: string;
  therapist_name: string | null;
  session_date: string;
  notes: string | null;
  recommendations: string[];
  goals: string[];
  exercises: string[];
  progress: string | null;
  created_at: string;
};

export type FamilyAccessInvite = {
  id: string;
  family_id: string;
  invited_email: string;
  invited_role: string;
  permissions: Record<string, unknown>;
  status: "pending" | "accepted" | "revoked";
  user_id: string;
  created_at: string;
};

export type ResourceLibraryItem = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  resource_type: "article" | "video" | "download";
  url: string | null;
  created_at: string;
};

export type ChildIntelligenceSnapshot = {
  currentRegulation: number;
  emotionalState: number;
  sensoryLoad: number;
  demandTolerance: number;
  energy: number;
  sleepQuality: number;
  socialBattery: number;
  confidenceLevel: number;
  recoveryTrend: number;
  weeklyDelta: number;
};

export type DebriefResponse = {
  likely_trigger: string;
  behaviour_explanation: string;
  emotional_interpretation: string;
  suggested_response: string;
  things_not_to_say: string[];
  tomorrow_plan: string;
  long_term_recommendation: string;
  confidence_level: number;
  follow_up_questions: string[];
};

export type ChildContext = {
  child: Pick<Child, "id" | "first_name" | "nickname" | "diagnosis" | "support_needs" | "school" | "grade" | "interests">;
  profile: Pick<
    ChildProfile,
    "strengths" | "known_triggers" | "calming_strategies" | "challenges" | "successful_strategies"
  > | null;
  recentCheckins: DailyCheckin[];
  recentDebriefs: Pick<ParentDebrief, "parent_message" | "likely_trigger" | "created_at">[];
  recentTimeline: { date: string; title: string; description: string | null; event_type: string }[];
  patterns: Pick<PatternFinding, "title" | "description" | "category" | "confidence">[];
  memoryReferences: string[];
  knowledgeGuidance?: string[];
  graphInsights?: string[];
  /** Phase 4 — distilled family understanding (not raw memory dumps) */
  familyInsights?: string[];
  /** Days between earliest and latest check-in in context */
  dataSpanDays?: number;
};

export type ReportType =
  | "parent_debrief"
  | "teacher_guide"
  | "pda_passport"
  | "school_support"
  | "weekly_summary"
  | "monthly_progress"
  | "therapist_summary"
  | "review_30d"
  | "review_90d"
  | "review_6mo"
  | "review_annual";

export type HealthObservationType =
  | "medication"
  | "appointment"
  | "sleep"
  | "nutrition"
  | "exercise"
  | "growth"
  | "note";

export type HealthObservation = {
  id: string;
  child_id: string;
  family_id: string;
  user_id: string;
  observation_type: HealthObservationType;
  title: string;
  notes: string | null;
  value: string | null;
  observed_date: string;
  created_at: string;
};

export type CareTeamObservation = {
  id: string;
  child_id: string;
  family_id: string;
  user_id: string;
  observer_role: string;
  observer_name: string | null;
  observation: string;
  observed_date: string;
  shared_with_care_team: boolean;
  created_at: string;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  daily_checkin: true,
  weekly_summary: true,
  new_insight: true,
  appointments: true,
  school_reminder: true,
};
