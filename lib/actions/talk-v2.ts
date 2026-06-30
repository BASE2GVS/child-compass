"use server";

import {
  TALK_V2_CONTRACT_VERSION,
  type TalkV2MessageResult,
} from "@/lib/talk-v2/contracts";
import { handleTalkV2Message } from "@/lib/talk-v2/api/handle-talk-v2-message";

export async function sendTalkV2Message(payload: {
  childId: string;
  sessionId: string;
  message: string;
}): Promise<TalkV2MessageResult> {
  try {
    return await handleTalkV2Message({
      version: TALK_V2_CONTRACT_VERSION,
      childId: payload.childId,
      sessionId: payload.sessionId,
      message: payload.message,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Talk V2 request failed";
    return {
      version: TALK_V2_CONTRACT_VERSION,
      status: "error",
      error: message,
    };
  }
}
