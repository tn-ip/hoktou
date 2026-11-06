import { programmeById } from "@/content/programmes";
import { clamp, outlookOf } from "@/lib/engine";
import { line, tx } from "@/lib/text";
import type { Lang, LocaleText, RunState } from "@/lib/types";

export type ShapeAxis = "bonds" | "stay" | "present" | "safe";

export type ShapeAxes = Record<ShapeAxis, number>;

export type ShapeId =
  | "balanced"
  | "bonds"
  | "grades"
  | "stay"
  | "leave"
  | "present"
  | "future"
  | "safe"
  | "reach";

type AxisSpec = {
  id: ShapeAxis;
  left: LocaleText;
  right: LocaleText;
};

export const SHAPE_AXIS: AxisSpec[] = [
  { id: "bonds", left: line("陪伴", "Bonds"), right: line("成績", "Grades") },
  { id: "stay", left: line("留港", "Stay"), right: line("離開", "Leave") },
  { id: "present", left: line("今天", "Today"), right: line("未來", "Future") },
  { id: "safe", left: line("安穩", "Safe"), right: line("搏", "Reach") },
];

const SHAPE_LABEL: Record<ShapeId, LocaleText> = {
  balanced: line("潮間的平衡", "Tidal balance"),
  bonds: line("向人的岸", "A shore turned toward people"),
  grades: line("書頁的紋", "A weave of pages"),
  stay: line("穩妥的港", "A safe harbour"),
  leave: line("遠行的帆", "A sail set far"),
  present: line("此刻的錨", "An anchor in today"),
  future: line("未來的燈", "A light ahead"),
  safe: line("靜水深流", "Still water"),
  reach: line("一搏的浪", "A wave taken"),
};

export function axisValues(run: RunState): ShapeAxes {
  const { stats, flags, offerKind, ranking, passedOver } = run;

  // 陪伴 ↔ 成績. Positive = bonds; negative = grades.
  let bonds = (stats.social - 50) * 0.5 - (stats.academic - 50) * 0.4;
  if (flags.s4focus === "people") bonds += 16;
  if (flags.s4focus === "study") bonds -= 16;
  if (flags.s4focus === "balance") bonds += 8;
  if (flags.oldFriends === "keep") bonds += 10;
  if (flags.oldFriends === "quiet") bonds -= 10;
  if (flags.sunday === "people") bonds += 12;
  if (flags.cca === "service") bonds += 8;
  if (flags.cca === "sport") bonds += 4;
  if (flags.grindExam) bonds -= 10;
  if (flags.heavyTutor) bonds -= 8;
  if (flags.home === "honest") bonds += 5;

  // 留港 ↔ 離開. Positive = stay; negative = leave.
  let stay = 0;
  if (flags.listStyle === "safe") stay += 18;
  if (flags.listStyle === "reach") stay -= 18;
  if (flags.dwelling === "home") stay += 18;
  if (flags.dwelling === "dorm" || flags.dwelling === "share") stay -= 14;
  if (flags.campus === "home") stay += 12;
  if (flags.campus === "people" || flags.campus === "map") stay -= 8;
  if (flags.backup === "sub" || flags.backup === "work") stay += 12;
  if (flags.backup === "retry") stay -= 10;
  if (offerKind === "degree") stay -= 12;
  if (offerKind === "subdegree" || offerKind === "work") stay += 10;
  for (const id of passedOver) {
    const programme = programmeById(id);
    if (programme && outlookOf(run, programme) === "stretch") {
      stay -= 8;
      break;
    }
  }

  // 今天 ↔ 未來. Positive = today; negative = future.
  let present = (stats.wellbeing - 50) * 0.6 - (stats.academic - 50) * 0.4;
  if (flags.spring === "care") present += 18;
  if (flags.spring === "cram") present -= 15;
  if (flags.hours === "bounded") present += 14;
  if (flags.hours === "overtime") present -= 14;
  if (flags.honestTired) present += 10;
  if (flags.grindExam) present -= 12;
  if (flags.home === "honest") present += 10;
  if (flags.home === "grind") present -= 12;
  if (flags.home === "autonomy") present += 8;
  if (flags.heavyTutor) present -= 10;
  if (flags.tutor) present -= 4;
  if (flags.sideQuest === "drop") present += 8;
  if (flags.sunday === "sea") present += 10;
  if (flags.sunday === "work") present -= 10;

  // 安穩 ↔ 搏. Positive = safe; negative = reach.
  let safe = 0;
  if (flags.listStyle === "safe") safe += 20;
  if (flags.listStyle === "reach") safe -= 20;
  if (flags.listStyle === "advice") safe += 5;
  if (flags.backup === "sub" || flags.backup === "work") safe += 14;
  if (flags.backup === "retry") safe -= 10;
  if (offerKind === "work") safe += 22;
  if (offerKind === "subdegree") safe += 12;
  if (offerKind === "degree") safe -= 14;
  if (passedOver.length > 0) safe -= 10;
  let stretchCount = 0;
  for (const id of ranking) {
    const programme = programmeById(id);
    if (programme && outlookOf(run, programme) === "stretch") {
      stretchCount += 1;
    }
  }
  safe -= stretchCount * 8;

  return {
    bonds: clamp(bonds, -100, 100),
    stay: clamp(stay, -100, 100),
    present: clamp(present, -100, 100),
    safe: clamp(safe, -100, 100),
  };
}

export function normalizedAxes(axes: ShapeAxes): Record<ShapeAxis, number> {
  return {
    bonds: axes.bonds / 100,
    stay: axes.stay / 100,
    present: axes.present / 100,
    safe: axes.safe / 100,
  };
}

export function endingShape(axes: ShapeAxes): { id: ShapeId; label: LocaleText } {
  const values = normalizedAxes(axes);
  const scored: { id: ShapeAxis; value: number }[] = [
    { id: "bonds", value: values.bonds },
    { id: "stay", value: values.stay },
    { id: "present", value: values.present },
    { id: "safe", value: values.safe },
  ];
  const top = scored.reduce((best, current) =>
    Math.abs(current.value) > Math.abs(best.value) ? current : best,
  );
  const allSmall = scored.every((item) => Math.abs(item.value) < 0.25);
  if (allSmall) return { id: "balanced", label: SHAPE_LABEL.balanced };

  const map: Record<ShapeAxis, { positive: ShapeId; negative: ShapeId }> = {
    bonds: { positive: "bonds", negative: "grades" },
    stay: { positive: "stay", negative: "leave" },
    present: { positive: "present", negative: "future" },
    safe: { positive: "safe", negative: "reach" },
  };
  const id = top.value >= 0 ? map[top.id].positive : map[top.id].negative;
  return { id, label: SHAPE_LABEL[id] };
}

export function shapeLabel(id: ShapeId, lang: Lang): string {
  return tx(lang, SHAPE_LABEL[id]);
}

export const SHAPE_SENTENCE = line(
  "沒有哪一邊是比較好的人生。",
  "No side is the better life.",
);
