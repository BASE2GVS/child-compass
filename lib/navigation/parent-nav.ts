/**

 * Child Compass — parent-friendly navigation.

 */



export const HOME_ROUTE = "/today";



export type ParentNavItem = {

  href: string;

  label: string;

  shortLabel: string;

  icon: string;

  description: string;

};



/** Primary navigation — five guided experiences */

export const PRIMARY_NAV: ParentNavItem[] = [

  {

    href: "/today",

    label: "Today",

    shortLabel: "Today",

    icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",

    description: "How are we doing?",

  },

  {

    href: "/compass",

    label: "My Child",

    shortLabel: "Child",

    icon: "M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z",

    description: "Who is my child becoming?",

  },

  {

    href: "/coach",

    label: "Talk",

    shortLabel: "Talk",

    icon: "M8 10h.01M12 10h.01M16 10h.01M21 10c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 18l1.395-3.72C3.512 13.042 3 11.574 3 10c0-4.418 4.03-8 9-8s9 3.582 9 8z",

    description: "Can someone help me think?",

  },

  {

    href: "/track",

    label: "Track",

    shortLabel: "Track",

    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",

    description: "What have we been through together?",

  },

  {

    href: "/documents-hub",

    label: "Documents",

    shortLabel: "Docs",

    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",

    description: "What have we learned?",

  },

];



/** Secondary destinations — calm list, not a software map */

export const MORE_NAV: ParentNavItem[] = [

  {

    href: "/school",

    label: "School",

    shortLabel: "School",

    icon: "M12 14l9-5-9-5-9 5 9 5z",

    description: "How can we work together?",

  },

  {

    href: "/therapy",

    label: "Therapy",

    shortLabel: "Therapy",

    icon: "M4 7h16M4 12h16M4 17h10",

    description: "What is helping?",

  },

  {

    href: "/health",

    label: "Health",

    shortLabel: "Health",

    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",

    description: "How is my child feeling?",

  },

  {

    href: "/help",

    label: "Help",

    shortLabel: "Help",

    icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",

    description: "Will someone help me?",

  },

  {

    href: "/settings",

    label: "Settings",

    shortLabel: "Settings",

    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",

    description: "How do I make Child Compass mine?",

  },

];



export function isNavActive(pathname: string, href: string): boolean {

  if (href === HOME_ROUTE) {

    return pathname === HOME_ROUTE || pathname === "/dashboard";

  }

  if (href === "/track") {

    return (

      pathname === "/track" ||

      pathname.startsWith("/check-in") ||

      pathname.startsWith("/timeline") ||

      pathname.startsWith("/goals") ||

      pathname.startsWith("/habits") ||

      pathname.startsWith("/schedules")

    );

  }

  if (href === "/documents-hub") {

    return (

      pathname === "/documents-hub" ||

      pathname.startsWith("/reports") ||

      pathname.startsWith("/documents") ||

      pathname.startsWith("/teacher-guide") ||

      pathname.startsWith("/pda-passport") ||

      pathname.startsWith("/calm-plan") ||

      pathname.startsWith("/resource-library")

    );

  }

  if (href === "/coach") {

    return pathname === "/coach" || pathname.startsWith("/debrief");

  }

  if (href === "/help") {

    return pathname === "/help" || pathname.startsWith("/help/");

  }

  return pathname === href || pathname.startsWith(`${href}/`);

}

