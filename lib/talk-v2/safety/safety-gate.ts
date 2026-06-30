import {
  TALK_V2_CONTRACT_VERSION,
  type TalkV2SafetyResult,
} from "@/lib/talk-v2/contracts";

export function evaluateTalkV2Safety(_message: string): TalkV2SafetyResult {
  return {
    version: TALK_V2_CONTRACT_VERSION,
    status: "allow",
    reasonCode: "pass_through",
  };
}
