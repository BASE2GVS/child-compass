import type { EditorialVariant } from "@/components/editorial/environment-variants";

export type AtmosphereContext = {
  parentName?: string | null;
  childName?: string | null;
  returning?: boolean;
};

export type PageAtmosphere = {
  welcome: string;
  introduction: string;
  /** One emotional question — why am I here? */
  purpose: string;
  smile: string;
};

function firstName(name?: string | null): string {
  if (!name?.trim()) return "there";
  return name.trim().split(/\s+/)[0]!;
}

export function getPageAtmosphere(
  variant: EditorialVariant,
  ctx: AtmosphereContext = {},
): PageAtmosphere {
  const parent = firstName(ctx.parentName);
  const child = ctx.childName?.trim() || "your child";

  const atmospheres: Record<EditorialVariant, PageAtmosphere> = {
    today: {
      welcome: `You're home, ${parent}.`,
      introduction: "",
      purpose: "How are we doing?",
      smile: "",
    },
    coach: {
      welcome: `I'm here, ${parent}.`,
      introduction: "",
      purpose: "Can someone help me think?",
      smile: "",
    },
    child: {
      welcome: `Welcome back.`,
      introduction: "",
      purpose: `Who is ${child} becoming?`,
      smile: "",
    },
    track: {
      welcome: `${parent}, this is your family's story.`,
      introduction: "",
      purpose: "Scroll back through the months — every check-in, note, and win in one place.",
      smile: "",
    },
    documents: {
      welcome: `Welcome, ${parent}.`,
      introduction: "",
      purpose: "What have we learned?",
      smile: "",
    },
    checkin: {
      welcome: `Hello, ${parent}.`,
      introduction: "",
      purpose: "How was today?",
      smile: "",
    },
    school: {
      welcome: `${parent}, school and home — together.`,
      introduction: "",
      purpose: "How can we work together?",
      smile: "",
    },
    therapy: {
      welcome: `Take a breath, ${parent}.`,
      introduction: "",
      purpose: "What is helping?",
      smile: "",
    },
    health: {
      welcome: `Hello, ${parent}.`,
      introduction: "",
      purpose: "How is my child feeling?",
      smile: "",
    },
    settings: {
      welcome: `This is your space, ${parent}.`,
      introduction: "",
      purpose: "How do I make Child Compass mine?",
      smile: "",
    },
    help: {
      welcome: `We're here, ${parent}.`,
      introduction: "",
      purpose: "Will someone help me?",
      smile: "",
    },
    search: {
      welcome: `What are you looking for, ${parent}?`,
      introduction: "",
      purpose: "I'll help you find it.",
      smile: "",
    },
  };

  return atmospheres[variant];
}

export function getPageSmile(variant: EditorialVariant, ctx: AtmosphereContext = {}): string {
  return getPageAtmosphere(variant, ctx).smile;
}

/** @deprecated Use getPageSmile */
export function pickMicroMoment(variant: EditorialVariant): string {
  return getPageSmile(variant);
}
