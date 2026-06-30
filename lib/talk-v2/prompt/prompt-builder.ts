import type {
  FamilyContext,
  FamilyContextConversationTurn,
  PromptModelConfiguration,
  PromptRequest,
} from "@/lib/talk-v2/contracts";
import { TALK_V2_CONTRACT_VERSION } from "@/lib/talk-v2/contracts";
import {
  TALK_V2_DEFAULT_SYSTEM_INSTRUCTION,
  TALK_V2_PROMPT_VERSION,
} from "@/lib/talk-v2/prompt/constants";
import { serializeFamilyContext } from "@/lib/talk-v2/prompt/serialize-family-context";

export type BuildPromptRequestInput = {
  parentMessage: string;
  conversationHistory: FamilyContextConversationTurn[];
  familyContext: FamilyContext;
  systemInstruction?: string;
  modelConfiguration: PromptModelConfiguration;
};

function normalizeSystemInstruction(input?: string): string {
  const source = input?.trim() || TALK_V2_DEFAULT_SYSTEM_INSTRUCTION;
  return source.replace(/\r\n/g, "\n").trim();
}

function cloneConversationHistory(
  history: FamilyContextConversationTurn[],
): FamilyContextConversationTurn[] {
  return history.map((turn) => ({
    role: turn.role,
    content: turn.content,
    createdAt: turn.createdAt,
  }));
}

function normalizeModelConfiguration(
  config: PromptModelConfiguration,
): PromptModelConfiguration {
  return {
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  };
}

export function buildPromptRequest(input: BuildPromptRequestInput): PromptRequest {
  return {
    promptVersion: TALK_V2_PROMPT_VERSION,
    systemInstruction: normalizeSystemInstruction(input.systemInstruction),
    familyContext: serializeFamilyContext(input.familyContext),
    conversationHistory: cloneConversationHistory(input.conversationHistory),
    parentMessage: input.parentMessage,
    modelConfiguration: normalizeModelConfiguration(input.modelConfiguration),
    metadata: {
      contractVersion: TALK_V2_CONTRACT_VERSION,
      contextVersion: input.familyContext.version,
      trace: {
        conversationTurns: input.conversationHistory.length,
        contextSourcesSelected: input.familyContext.selectionMetadata.selectedContextSources.length,
        memoryItems: input.familyContext.relevantMemories.length,
        intents: input.familyContext.selectionMetadata.detectedIntents.length,
        conversationState: input.familyContext.conversationState.detectedState,
      },
    },
  };
}
