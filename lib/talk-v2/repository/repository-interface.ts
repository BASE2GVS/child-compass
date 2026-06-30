import type {
  ConversationRepositoryRequest,
  ConversationRepositoryResult,
} from "@/lib/talk-v2/contracts";

export interface TalkV2ConversationRepository {
  saveConversation(request: ConversationRepositoryRequest): Promise<ConversationRepositoryResult>;
}
