const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export function parseTalkV2FeatureFlag(value: string | undefined): boolean {
  if (!value) return false;
  return TRUE_VALUES.has(value.trim().toLowerCase());
}

export function isTalkV2Enabled(): boolean {
  return parseTalkV2FeatureFlag(process.env.TALK_V2_ENABLED);
}
