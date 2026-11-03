import { clampAbility, startAbilities, SUBJECT_IDS } from "@/content/subjects";
import { line } from "@/lib/text";
import type { Abilities, InterestId, LocaleText, Stats } from "@/lib/types";
import { INTEREST_IDS, STAT_KEYS } from "@/lib/types";

export type InterestInfo = {
  id: InterestId;
  name: LocaleText;
  hint: LocaleText;
};

export const INTERESTS: InterestInfo[] = [
  {
    id: "science",
    name: line("科學", "Science"),
    hint: line("物理、化學、生物會高一點，好奇亦會高少少", "Physics, chemistry and biology start higher, and so does curiosity"),
  },
  {
    id: "humanities",
    name: line("人文", "Humanities"),
    hint: line("歷史、中史、地理會高一點", "History, Chinese history and geography start higher"),
  },
  {
    id: "business",
    name: line("商科", "Business"),
    hint: line("經濟、BAFS、數學會高一點", "Economics, BAFS and mathematics start higher"),
  },
  {
    id: "art",
    name: line("藝術", "Art"),
    hint: line("視藝會高一點", "Visual arts starts higher"),
  },
  {
    id: "sport",
    name: line("運動", "Sport"),
    hint: line("體育會高一點，身心亦會高少少", "PE starts higher, and so does wellbeing"),
  },
  {
    id: "computer",
    name: line("電腦", "Computing"),
    hint: line("ICT、數學會高一點", "ICT and mathematics start higher"),
  },
  {
    id: "language",
    name: line("語文", "Languages"),
    hint: line("中文、英文會高一點", "Chinese and English start higher"),
  },
  {
    id: "service",
    name: line("服務／義工", "Service"),
    hint: line("人際會高一點，通識亦會高少少", "Bonds start higher, and citizenship rises a little"),
  },
];

export const BASE_STATS: Stats = {
  academic: 52,
  curiosity: 50,
  wellbeing: 58,
  social: 48,
};

const STAT_BOOST: Record<InterestId, Partial<Stats>> = {
  science: { curiosity: 8, academic: 4 },
  humanities: { curiosity: 8 },
  business: { academic: 8 },
  art: { curiosity: 6, wellbeing: 4 },
  sport: { wellbeing: 10 },
  computer: { curiosity: 8 },
  language: { academic: 6 },
  service: { social: 10 },
};

const ABILITY_BOOST: Record<InterestId, Partial<Abilities>> = {
  science: { phy: 1, chem: 1, bio: 1 },
  humanities: { hist: 1, chist: 1, geog: 1 },
  art: { va: 1 },
  sport: { pe: 1 },
  computer: { ict: 1, math: 1 },
  business: { econ: 1, bafs: 1, math: 1 },
  language: { chi: 1, eng: 1 },
  service: { cs: 1 },
};

function clampStat(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeInterests(value: readonly InterestId[] | undefined): InterestId[] {
  const interests: InterestId[] = [];
  for (const id of value ?? []) {
    if (!INTEREST_IDS.includes(id) || interests.includes(id)) continue;
    interests.push(id);
    if (interests.length === 3) break;
  }
  return interests;
}

export function seedProfile(interests: readonly InterestId[]): { stats: Stats; abilities: Abilities } {
  const stats: Stats = { ...BASE_STATS };
  const abilities = startAbilities();
  for (const interest of normalizeInterests([...interests])) {
    const statBoost = STAT_BOOST[interest];
    for (const key of STAT_KEYS) {
      if (typeof statBoost[key] === "number") stats[key] = clampStat(stats[key] + (statBoost[key] as number));
    }
    const abilityBoost = ABILITY_BOOST[interest];
    for (const id of SUBJECT_IDS) {
      if (typeof abilityBoost[id] === "number") abilities[id] = clampAbility(abilities[id] + (abilityBoost[id] as number));
    }
  }
  return { stats, abilities };
}
