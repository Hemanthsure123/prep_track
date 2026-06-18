export type Platform = {
  name: string;
  icon: string;
  /** Tailwind class for the chip background tint. */
  tint: string;
};

const PLATFORM_PATTERNS: Array<{ pattern: RegExp } & Platform> = [
  {
    name: "LeetCode",
    icon: "leetcode",
    tint: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/40",
    pattern: /leetcode\.com/i,
  },
  {
    name: "GeeksforGeeks",
    icon: "gfg",
    tint: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/40",
    pattern: /geeksforgeeks\.org/i,
  },
  {
    name: "HackerRank",
    icon: "hackerrank",
    tint: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/40",
    pattern: /hackerrank\.com/i,
  },
  {
    name: "Codeforces",
    icon: "codeforces",
    tint: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800/40",
    pattern: /codeforces\.com/i,
  },
  {
    name: "InterviewBit",
    icon: "interviewbit",
    tint: "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800/40",
    pattern: /interviewbit\.com/i,
  },
  {
    name: "Coding Ninjas",
    icon: "codingninjas",
    tint: "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/40",
    pattern: /codingninjas\.com/i,
  },
];

export function detectPlatform(url: string): Platform | null {
  for (const p of PLATFORM_PATTERNS) {
    if (p.pattern.test(url)) {
      return { name: p.name, icon: p.icon, tint: p.tint };
    }
  }
  return null;
}
