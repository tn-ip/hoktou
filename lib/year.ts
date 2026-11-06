import { seedProfile } from "@/content/interests";
import { line } from "@/lib/text";
import type { Flags, LocaleText, RunState, YearId } from "@/lib/types";
import { STAT_KEYS } from "@/lib/types";

export type YearWellbeing = {
  year: YearId;
  value: number;
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function yearlyWellbeing(run: RunState): YearWellbeing[] {
  const seeded = seedProfile(run.interests);
  let current = seeded.stats.wellbeing;
  const result: YearWellbeing[] = [];
  let lastYear: YearId | null = null;

  for (const entry of run.log) {
    if (lastYear && entry.year !== lastYear) {
      result.push({ year: lastYear, value: current });
    }
    const delta = entry.effects?.wellbeing ?? 0;
    current = clamp(current + delta);
    lastYear = entry.year;
  }
  if (lastYear) {
    result.push({ year: lastYear, value: current });
  }
  return result;
}

export function happiestYear(run: RunState): YearWellbeing | null {
  const years = yearlyWellbeing(run);
  if (years.length === 0) return null;
  return years.reduce((best, current) => (current.value > best.value ? current : best));
}

export function yearCaption(year: YearId, flags: Flags): LocaleText {
  switch (year) {
    case "S1":
      return flags.cca === "none"
        ? line("中一，慢慢認出自己節奏的那年", "S1, the year you slowly found your own pace")
        : line("中一，社團裡第一次覺得屬於這裡的那年", "S1, the year a club first felt like a place to belong");
    case "S2":
      return flags.home === "honest" || flags.home === "autonomy"
        ? line("中二，家裡開始聽你說話的那年", "S2, the year home started to hear you")
        : line("中二，和朋友發明了一種暗號的那年", "S2, the year you and a friend invented a code");
    case "S3":
      return line("中三，站在選科十字路口的那年", "S3, the year you stood at the electives crossroad");
    case "S4":
      return flags.s4focus === "people"
        ? line("中四，班裡黏在一起的那年", "S4, the year the class stuck together")
        : flags.s4focus === "study"
          ? line("中四，發現某科開始聽得懂的那年", "S4, the year a subject finally started to make sense")
          : line("中四，學會在課室裡喘口氣的那年", "S4, the year you learned to breathe in the classroom");
    case "S5":
      return flags.fair === "prize" || flags.fair === "shown" || flags.fair === "school"
        ? line("中五，作品終於講給人聽的那年", "S5, the year the work was finally told")
        : flags.fair === "skip"
          ? line("中五，把時間還給自己的那年", "S5, the year you gave the time back to yourself")
          : line("中五，項目告一段落的那年", "S5, the year the project came to a close");
    case "S6":
      return flags.spring === "care" || flags.honestTired
        ? line("中六，撐過最後一季也沒有碎掉的那年", "S6, the year you lasted the final season without breaking")
        : flags.spring === "cram"
          ? line("中六，把所有力氣押在同一張桌上的那年", "S6, the year you put everything on one desk")
          : line("中六，考完最後一科的那天有風的那年", "S6, the year the wind blew after the last paper");
    case "life":
      return flags.sunday === "sea"
        ? line("出路，星期日仍能去看海的那年", "After school, the year Sundays still went to the sea")
        : flags.dwelling === "dorm" || flags.dwelling === "share"
          ? line("出路，第一次自己買燈泡的那年", "After school, the year you bought your own light bulb")
          : line("出路，第一筆工資買了點平靜的那年", "After school, the year your first pay bought a little quiet");
    default:
      return line("那一年", "That year");
  }
}

export function validateLogEffects(run: RunState): boolean {
  for (const entry of run.log) {
    if (!entry.effects || typeof entry.effects !== "object") return false;
    for (const key of STAT_KEYS) {
      const value = entry.effects[key];
      if (value !== undefined && typeof value !== "number") return false;
    }
  }
  return true;
}
