import type { ChildContext } from "@/lib/types/database";

import type { CoachMode } from "@/lib/ai/coach-mode";



const PHRASES = {

  wondering: [

    "I wonder whether",

    "I'm curious if",

    "It makes me wonder if",

  ],

  catches: [

    "What stands out to me is",

    "Something I'm sitting with is",

    "What I'm hearing is",

  ],

  reminds: [

    "This feels similar to",

    "There's an echo here of",

    "This connects to",

  ],

  pattern: [

    "One thread could be",

    "Something that might be at play is",

    "I wonder if a factor is",

  ],

};



function pick<T>(items: T[], seed: string): T {

  let h = 0;

  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  return items[h % items.length];

}



export function buildThinkingAloud(

  message: string,

  context: ChildContext,

  mode: CoachMode,

): string | null {

  const name = context.child.nickname || context.child.first_name;

  const seed = message + mode;



  if (context.patterns.length && (mode === "school" || mode === "behaviour_reflection")) {

    const p = context.patterns[0];

    return `${pick(PHRASES.pattern, seed)} ${p.description.toLowerCase().replace(/\.$/, "")} for ${name}.`;

  }



  if (context.recentCheckins[0] && (context.recentCheckins[0].anxiety ?? 3) >= 4) {

    return `${pick(PHRASES.wondering, seed)} ${name}'s nervous system was already under strain before today's events.`;

  }



  if (context.memoryReferences.length) {

    return `${pick(PHRASES.reminds, seed)} something from ${name}'s recent days.`;

  }



  if (mode === "planning") {

    return `${pick(PHRASES.wondering, seed)} preparation might matter as much as the event itself for ${name}.`;

  }



  if (message.length > 40) {

    return `${pick(PHRASES.catches, seed)} how thoughtfully you've shared this.`;

  }



  return null;

}

