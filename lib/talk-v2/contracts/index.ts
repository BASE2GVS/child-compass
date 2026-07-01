export const TALK_V2_CONTRACT_VERSION = "1.0.0" as const;

export type TalkV2ContractVersion = typeof TALK_V2_CONTRACT_VERSION;

export type TalkV2MessageRequest = {
  version: TalkV2ContractVersion;
  childId: string;
  sessionId: string;
  message: string;
};

export type FamilyContextRequest = {
  version: TalkV2ContractVersion;
  childId: string;
  sessionId: string;
  parentMessage: string;
};

export type FamilyContextIntent =
  | "sleep"
  | "anxiety"
  | "meltdown"
  | "school"
  | "eating"
  | "communication"
  | "sensory"
  | "behaviour"
  | "social"
  | "emotional_regulation"
  | "medication"
  | "routine"
  | "parent_wellbeing"
  | "general_support";

export type ConversationState =
  | "NEW_TOPIC"
  | "FOLLOW_UP"
  | "CLARIFICATION"
  | "PROGRESS"
  | "SETBACK"
  | "DECISION"
  | "REFLECTION"
  | "GENERAL";

export type ConversationStateInfo = {
  detectedState: ConversationState;
  confidence: number;
  reasoningCode:
    | "STATE_NEW_TOPIC_EMPTY_HISTORY"
    | "STATE_NEW_TOPIC_INTENT_SHIFT"
    | "STATE_FOLLOW_UP_REFERENCE"
    | "STATE_CLARIFICATION_DIRECT"
    | "STATE_PROGRESS_SIGNAL"
    | "STATE_SETBACK_SIGNAL"
    | "STATE_DECISION_SIGNAL"
    | "STATE_REFLECTION_SIGNAL"
    | "STATE_GENERAL_DEFAULT";
  previousConversationReference: {
    role: "parent" | "assistant";
    createdAt: string;
    excerpt: string;
  } | null;
};

export type FamilyContextChildProfile = {
  childId: string;
  firstName: string;
  nickname: string | null;
  diagnosis: string[];
  supportNeeds: string[];
  school: string | null;
  grade: string | null;
  strengths: string[];
  knownTriggers: string[];
  calmingStrategies: string[];
  successfulStrategies: string[];
  challenges: string[];
};

export type FamilyContextConversationTurn = {
  role: "parent" | "assistant";
  content: string;
  createdAt: string;
};

export type FamilyContextCheckin = {
  date: string;
  sleepQuality: number | null;
  mood: number | null;
  anxiety: number | null;
  schoolRating: number | null;
  wins: string[];
  challenges: string[];
  notes: string | null;
};

export type FamilyContextTimelineHighlight = {
  date: string;
  type: string;
  title: string;
  description: string | null;
};

export type FamilyContextPattern = {
  category: string;
  title: string;
  description: string;
  confidence: number | null;
};

export type FamilyContextMemory = {
  source: "profile" | "pattern" | "checkin" | "timeline" | "debrief";
  text: string;
  score: number;
};

export type FamilyContextStorySignal = {
  kind: "progress" | "challenge" | "support" | "relationship";
  text: string;
  source: "checkin" | "pattern" | "timeline" | "debrief" | "profile";
};

export type FamilyContextFamilyStory = {
  stage: "forming" | "stabilizing" | "adapting";
  signals: FamilyContextStorySignal[];
};

export type FamilyContextSafetyRule = {
  id: string;
  description: string;
  triggerExamples: string[];
};

export type FamilyContextCompleteness = {
  childProfile: "complete" | "empty";
  recentConversation: "complete" | "empty";
  dailyCheckins: "complete" | "empty";
  timelineHighlights: "complete" | "empty";
  behaviourPatterns: "complete" | "empty";
  relevantMemories: "complete" | "empty";
  familyStory: "complete" | "empty";
  safetyRules: "complete" | "empty";
  missingSections: string[];
  coveragePercent: number;
};

export type FamilyContextSelectionMetadata = {
  detectedIntents: FamilyContextIntent[];
  conversationState: ConversationState;
  retrievalRationale: string[];
  selectedContextSources: string[];
  omittedContextSources: string[];
  retrievalLimitsApplied: Record<string, number>;
};

export type ClinicalContextSectionName =
  | "childProfile"
  | "currentSituation"
  | "parentGoal"
  | "relevantJourney"
  | "previousAttempts"
  | "knownSuccesses"
  | "knownFailures"
  | "recentChanges"
  | "openQuestions";

export type ClinicalContextFactSource = {
  kind:
    | "child_profile"
    | "parent_message"
    | "coach_message"
    | "checkin"
    | "timeline"
    | "debrief"
    | "pattern";
  sourceId?: string;
  occurredAt?: string;
};

export type ClinicalContextFact = {
  id: string;
  section: ClinicalContextSectionName;
  label: string;
  text: string;
  source: ClinicalContextFactSource;
};

export type ClinicalContext = {
  version: TalkV2ContractVersion;
  childId: string;
  sessionId: string;
  childProfile: FamilyContextChildProfile | null;
  currentSituation: ClinicalContextFact[];
  parentGoal: string | null;
  relevantJourney: ClinicalContextFact[];
  previousAttempts: ClinicalContextFact[];
  knownSuccesses: ClinicalContextFact[];
  knownFailures: ClinicalContextFact[];
  recentChanges: ClinicalContextFact[];
  openQuestions: ClinicalContextFact[];
  sourceSummary: string[];
};

export type ClinicalContextBudget = {
  maxFacts: number;
  sectionLimits: Record<ClinicalContextSectionName, number>;
};

export type ClinicalContextBudgetResult = {
  context: ClinicalContext;
  selectedFactCount: number;
  omittedFactCount: number;
  selectedSections: ClinicalContextSectionName[];
  omittedSections: ClinicalContextSectionName[];
};

export type FamilyContext = {
  version: TalkV2ContractVersion;
  childId: string;
  sessionId: string;
  childProfile: FamilyContextChildProfile | null;
  recentConversation: FamilyContextConversationTurn[];
  dailyCheckins: FamilyContextCheckin[];
  timelineHighlights: FamilyContextTimelineHighlight[];
  behaviourPatterns: FamilyContextPattern[];
  relevantMemories: FamilyContextMemory[];
  familyStory: FamilyContextFamilyStory | null;
  conversationState: ConversationStateInfo;
  safetyRules: FamilyContextSafetyRule[];
  completeness: FamilyContextCompleteness;
  selectionMetadata: FamilyContextSelectionMetadata;
  clinicalContext?: ClinicalContext;
  clinicalContextBudget?: ClinicalContextBudgetResult;
};

export type PromptModelConfiguration = {
  model: string;
  temperature: number;
  maxTokens: number;
};

export type PromptRequestMetadata = {
  contractVersion: TalkV2ContractVersion;
  contextVersion: TalkV2ContractVersion;
  trace: {
    conversationTurns: number;
    contextSourcesSelected: number;
    memoryItems: number;
    intents: number;
    conversationState: ConversationState;
  };
};

export type PromptRequest = {
  promptVersion: string;
  systemInstruction: string;
  familyContext: string;
  conversationHistory: FamilyContextConversationTurn[];
  parentMessage: string;
  modelConfiguration: PromptModelConfiguration;
  metadata: PromptRequestMetadata;
};

export type LLMProviderName = "openai";

export type ProviderErrorCode =
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "AUTH_FAILED"
  | "PROVIDER_UNAVAILABLE"
  | "INVALID_RESPONSE"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export type ProviderError = {
  code: ProviderErrorCode;
  message: string;
  retryable: boolean;
  statusCode?: number;
};

export type ProviderMetadata = {
  provider: LLMProviderName;
  model: string;
  requestId?: string;
  statusCode?: number;
  latencyMs: number;
  attempts: number;
};

export type LLMRequest = {
  version: TalkV2ContractVersion;
  requestId: string;
  provider: LLMProviderName;
  prompt: PromptRequest;
  timeoutMs: number;
  maxRetries: number;
};

export type LLMResponse = {
  version: TalkV2ContractVersion;
  rawOutput: string;
  metadata: ProviderMetadata;
};

export type LLMProviderResult =
  | {
      ok: true;
      response: LLMResponse;
    }
  | {
      ok: false;
      error: ProviderError;
      metadata: ProviderMetadata;
    };

export type ValidationErrorCode =
  | "MISSING_CONTENT"
  | "EMPTY_RESPONSE"
  | "INVALID_SCHEMA"
  | "INVALID_ENCODING"
  | "OVERSIZED_RESPONSE"
  | "UNSUPPORTED_PAYLOAD";

export type ValidationError = {
  code: ValidationErrorCode;
  message: string;
  details?: string;
};

export type ValidationMetadata = {
  validatorVersion: string;
  contractVersion: TalkV2ContractVersion;
  originalLength: number;
  validatedLength: number;
  normalizationApplied: {
    newlineNormalized: boolean;
    invalidCharsRemoved: number;
    bomRemoved: boolean;
    edgeWhitespaceTrimmed: boolean;
  };
  maxLength: number;
};

export type ValidatedResponse = {
  version: TalkV2ContractVersion;
  text: string;
  metadata: ValidationMetadata;
  providerMetadata: ProviderMetadata;
};

export type ValidationResult =
  | {
      ok: true;
      validated: ValidatedResponse;
    }
  | {
      ok: false;
      error: ValidationError;
      metadata?: ValidationMetadata;
      providerMetadata?: ProviderMetadata;
    };

export type ConversationRepositoryRequest = {
  version: TalkV2ContractVersion;
  requestId: string;
  sessionId: string;
  parentMessage: string;
  validatedAssistantResponse: ValidatedResponse;
  pipelineVersion: string;
  timestampIso?: string;
};

export type ConversationRepositorySaved = {
  status: "saved";
  parentMessageId: string;
  assistantMessageId: string;
  createdAt: string;
};

export type ConversationRepositoryDuplicate = {
  status: "duplicate";
  assistantMessageId: string;
  createdAt: string;
};

export type ConversationRepositoryErrorCode =
  | "TRANSACTION_FAILED"
  | "ROLLBACK_FAILED"
  | "PERSISTENCE_FAILURE"
  | "INVALID_INPUT";

export type ConversationRepositoryError = {
  code: ConversationRepositoryErrorCode;
  message: string;
  retryable: boolean;
};

export type ConversationRepositoryResult =
  | {
      ok: true;
      record: ConversationRepositorySaved | ConversationRepositoryDuplicate;
    }
  | {
      ok: false;
      error: ConversationRepositoryError;
    };

export type TalkV2SafetyStatus = "allow" | "block" | "redirect";

export type TalkV2SafetyResult = {
  version: TalkV2ContractVersion;
  status: TalkV2SafetyStatus;
  reasonCode: string;
  userMessage?: string;
};

export type TalkV2AcceptedResult = {
  version: TalkV2ContractVersion;
  status: "accepted";
  message: string;
  safety: TalkV2SafetyResult;
};

export type TalkV2DisabledResult = {
  version: TalkV2ContractVersion;
  status: "disabled";
  error: string;
};

export type TalkV2BlockedResult = {
  version: TalkV2ContractVersion;
  status: "blocked";
  error: string;
  safety: TalkV2SafetyResult;
};

export type TalkV2ErrorResult = {
  version: TalkV2ContractVersion;
  status: "error";
  error: string;
};

export type TalkV2MessageResult =
  | TalkV2AcceptedResult
  | TalkV2DisabledResult
  | TalkV2BlockedResult
  | TalkV2ErrorResult;
