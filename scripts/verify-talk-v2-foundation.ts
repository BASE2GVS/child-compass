import assert from "node:assert/strict";
import { parseTalkV2FeatureFlag } from "@/lib/talk-v2/flags/feature-flag";
import { evaluateTalkV2Safety } from "@/lib/talk-v2/safety/safety-gate";
import { TALK_V2_CONTRACT_VERSION } from "@/lib/talk-v2/contracts";

function run() {
  assert.equal(parseTalkV2FeatureFlag(undefined), false);
  assert.equal(parseTalkV2FeatureFlag(""), false);
  assert.equal(parseTalkV2FeatureFlag("false"), false);
  assert.equal(parseTalkV2FeatureFlag("TRUE"), true);
  assert.equal(parseTalkV2FeatureFlag("1"), true);
  assert.equal(parseTalkV2FeatureFlag("on"), true);

  const safety = evaluateTalkV2Safety("Any message");
  assert.equal(safety.version, TALK_V2_CONTRACT_VERSION);
  assert.equal(safety.status, "allow");
  assert.equal(safety.reasonCode, "pass_through");

  console.log("Talk V2 foundation checks passed.");
}

run();
