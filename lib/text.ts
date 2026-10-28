import type { Lang, LocaleText, StatKey } from "@/lib/types";

export function tx(lang: Lang, text: LocaleText): string {
  return text[lang];
}

export function line(zh: string, en: string): LocaleText {
  return { zh, en };
}

const STAT_LABEL: Record<StatKey, LocaleText> = {
  academic: { zh: "學業", en: "Study" },
  curiosity: { zh: "好奇", en: "Curiosity" },
  wellbeing: { zh: "身心", en: "Wellbeing" },
  social: { zh: "人際", en: "Bonds" },
};

export function statLabel(key: StatKey, lang: Lang): string {
  return STAT_LABEL[key][lang];
}

export function joinList(items: string[], lang: Lang): string {
  if (items.length <= 1) return items[0] ?? "";
  if (lang === "en") {
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
  }
  return `${items.slice(0, -1).join("、")}及${items[items.length - 1]}`;
}
