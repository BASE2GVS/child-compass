import {
  TALK_V2_CONTRACT_VERSION,
  type TalkV2MessageRequest,
  type TalkV2MessageResult,
} from "@/lib/talk-v2/contracts";
import { isTalkV2Enabled } from "@/lib/talk-v2/flags/feature-flag";
import { orchestrateTalkV2Message } from "@/lib/talk-v2/api/orchestrate-talk-v2-message";

export async function handleTalkV2Message(
  payload: TalkV2MessageRequest,
): Promise<TalkV2MessageResult> {
  if (!isTalkV2Enabled()) {
    return {
      version: TALK_V2_CONTRACT_VERSION,
      status: "disabled",
      error: "Talk V2 is not enabled.",
    };
  }

  const orchestration = await orchestrateTalkV2Message(payload);
  return orchestration.result;
}
