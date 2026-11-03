import { ABILITY_WEAK, subjectName } from "@/content/subjects";
import { line } from "@/lib/text";
import type { Choice, LocaleText, SceneCtx, StatKey, SubjectId } from "@/lib/types";

export const LIFE_GATE = 4;

export function lifePoint(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value / 10)));
}

type GateSpec = {
  stat?: StatKey;
  subject?: SubjectId;
  subjectAllWeak?: SubjectId[];
};

// Locked map: a life stat at or below 4 closes the event.
// A subject at or below 4 closes that subject's workshop.
const GATES: Record<string, GateSpec> = {
  "s1-pe-run": { stat: "wellbeing" },
  "s1-ab-pe-try": { stat: "wellbeing", subject: "pe" },
  "s2-ab-stem-rocket": { stat: "wellbeing", subject: "phy" },
  "s2-ab-stem-show": { stat: "wellbeing", subject: "chem" },
  "s3b-camp-full": { stat: "wellbeing" },
  "s1-ab-debate-en": { stat: "social", subject: "eng" },
  "s2-ab-stall-sell": { stat: "social", subject: "econ" },
  "s2-group-ask": { stat: "social" },
  "s2-science": { stat: "social" },
  "s2-sport": { stat: "social" },
  "s2-service": { stat: "social" },
  "s5-team-lead": { stat: "social" },
  "s1-ab-museum-hist": { stat: "curiosity", subject: "hist" },
  "s1-ab-museum-sci": { stat: "curiosity", subjectAllWeak: ["phy", "chem", "bio"] },
  "s1-ab-labday-help": { stat: "curiosity", subjectAllWeak: ["phy", "chem"] },
  "s1-ab-geog-field": { stat: "curiosity", subject: "geog" },
  "s1-museum": { stat: "curiosity" },
  "s2-ab-bio-look": { stat: "curiosity", subject: "bio" },
  "s3-taster-lab": { stat: "curiosity" },
  "s3-taster-case": { stat: "curiosity" },
  "s3-taster-studio": { stat: "curiosity" },
  "s4-inv-go": { stat: "curiosity" },
  "s1-ab-olympiad-go": { stat: "academic", subject: "math" },
  "s1-ab-tutor-math": { stat: "academic", subject: "math" },
  "s1-ab-tutor-econ": { stat: "academic", subject: "econ" },
  "s1-ab-societies-ict": { stat: "social", subject: "ict" },
  "s1-ab-societies-va": { stat: "social", subject: "va" },
};

const STAT_REASON: Record<string, (point: number) => LocaleText> = {
  "s1-pe-run": (n) =>
    line(
      `你身心只有 ${n}／10，未夠力跑完呢場。今次跑唔到。`,
      `Wellbeing is ${n}/10, so you cannot finish this run.`,
    ),
  "s1-ab-pe-try": (n) =>
    line(
      `你身心只有 ${n}／10，體育日認真做唔到。今次去不成，體育能力加分冇咗。`,
      `Wellbeing is ${n}/10, so you cannot take sports day seriously. The PE gain is lost.`,
    ),
  "s2-ab-stem-rocket": (n) =>
    line(
      `你身心只有 ${n}／10，頂唔順成個 STEM 午後。今次去不成，物理能力加分冇咗。`,
      `Wellbeing is ${n}/10, so the STEM afternoon is too long. The physics gain is lost.`,
    ),
  "s2-ab-stem-show": (n) =>
    line(
      `你身心只有 ${n}／10，頂唔順成個 STEM 午後。今次去不成，化學能力加分冇咗。`,
      `Wellbeing is ${n}/10, so the STEM afternoon is too long. The chemistry gain is lost.`,
    ),
  "s3b-camp-full": (n) =>
    line(
      `你身心只有 ${n}／10，兩日學科營去不成。營裡嗰份加分冇咗。`,
      `Wellbeing is ${n}/10, so the two-day camp is closed. That gain is lost.`,
    ),
  "s1-ab-debate-en": (n) =>
    line(
      `你人際只有 ${n}／10，未夠膽上台辯論。今次辯唔到，英文能力加分冇咗。`,
      `Bonds are ${n}/10, so you cannot take the debate. The English gain is lost.`,
    ),
  "s2-ab-stall-sell": (n) =>
    line(
      `你人際只有 ${n}／10，未夠膽出去叫賣。今次推銷唔到，經濟能力加分冇咗。`,
      `Bonds are ${n}/10, so you cannot pitch the charity sale. The economics gain is lost.`,
    ),
  "s2-group-ask": (n) =>
    line(
      `你人際只有 ${n}／10，開唔到口入組。今次小組做不成。`,
      `Bonds are ${n}/10, so you cannot join the group project.`,
    ),
  "s2-science": (n) =>
    line(
      `你人際只有 ${n}／10，學會檔擠不進去。今次報名不成。`,
      `Bonds are ${n}/10, so you cannot get into the club sign-up.`,
    ),
  "s2-sport": (n) =>
    line(
      `你人際只有 ${n}／10，學會檔擠不進去。今次報名不成。`,
      `Bonds are ${n}/10, so you cannot get into the club sign-up.`,
    ),
  "s2-service": (n) =>
    line(
      `你人際只有 ${n}／10，學會檔擠不進去。今次報名不成。`,
      `Bonds are ${n}/10, so you cannot get into the club sign-up.`,
    ),
  "s5-team-lead": (n) =>
    line(
      `你人際只有 ${n}／10，未夠膽做小組協調。今次領導做不成。`,
      `Bonds are ${n}/10, so you cannot lead the group.`,
    ),
  "s1-ab-societies-ict": (n) =>
    line(
      `你人際只有 ${n}／10，學會檔擠不進去。今次入不成電腦學會，ICT 能力加分冇咗。`,
      `Bonds are ${n}/10, so you cannot join the computer club. The ICT gain is lost.`,
    ),
  "s1-ab-societies-va": (n) =>
    line(
      `你人際只有 ${n}／10，學會檔擠不進去。今次入不成視藝學會，視藝能力加分冇咗。`,
      `Bonds are ${n}/10, so you cannot join the art club. The visual-arts gain is lost.`,
    ),
  "s1-ab-museum-hist": (n) =>
    line(
      `你好奇只有 ${n}／10，提不起勁入博物館。今次參觀去不成，歷史能力加分冇咗。`,
      `Curiosity is ${n}/10, so the museum trip is closed. The history gain is lost.`,
    ),
  "s1-ab-museum-sci": (n) =>
    line(
      `你好奇只有 ${n}／10，提不起勁入博物館。今次參觀去不成，科學能力加分冇咗。`,
      `Curiosity is ${n}/10, so the museum trip is closed. The science gain is lost.`,
    ),
  "s1-ab-labday-help": (n) =>
    line(
      `你好奇只有 ${n}／10，未夠興致入開放實驗室。今次動手做不成，能力加分冇咗。`,
      `Curiosity is ${n}/10, so the open lab is closed. The ability gain is lost.`,
    ),
  "s1-ab-geog-field": (n) =>
    line(
      `你好奇只有 ${n}／10，提不起勁去考察。今次去不成，地理能力加分冇咗。`,
      `Curiosity is ${n}/10, so the field trip is closed. The geography gain is lost.`,
    ),
  "s1-museum": (n) =>
    line(
      `你好奇只有 ${n}／10，提不起勁去科學館。今次參觀去不成。`,
      `Curiosity is ${n}/10, so the science museum visit is closed.`,
    ),
  "s2-ab-bio-look": (n) =>
    line(
      `你好奇只有 ${n}／10，未夠興致留低觀察。今次去不成，生物能力加分冇咗。`,
      `Curiosity is ${n}/10, so you cannot stay for the observation. The biology gain is lost.`,
    ),
  "s3-taster-lab": (n) =>
    line(
      `你好奇只有 ${n}／10，提不起勁去試堂。今次聽不成。`,
      `Curiosity is ${n}/10, so the taster talk is closed.`,
    ),
  "s3-taster-case": (n) =>
    line(
      `你好奇只有 ${n}／10，提不起勁去試堂。今次聽不成。`,
      `Curiosity is ${n}/10, so the taster talk is closed.`,
    ),
  "s3-taster-studio": (n) =>
    line(
      `你好奇只有 ${n}／10，提不起勁去試堂。今次聽不成。`,
      `Curiosity is ${n}/10, so the taster talk is closed.`,
    ),
  "s4-inv-go": (n) =>
    line(
      `你好奇只有 ${n}／10，提不起勁去校外活動。今次去不成。`,
      `Curiosity is ${n}/10, so the off-campus talk is closed.`,
    ),
  "s1-ab-olympiad-go": (n) =>
    line(
      `你學業只有 ${n}／10，未夠資格入奧數班。今次去不成，數學能力加分冇咗。`,
      `Study is ${n}/10, so the olympiad class is closed. The mathematics gain is lost.`,
    ),
  "s1-ab-tutor-math": (n) =>
    line(
      `你學業只有 ${n}／10，補習班冇位留俾你。今次上不成，數學能力加分冇咗。`,
      `Study is ${n}/10, so the tutorial place is closed. The mathematics gain is lost.`,
    ),
  "s1-ab-tutor-econ": (n) =>
    line(
      `你學業只有 ${n}／10，補習班冇位留俾你。今次上不成，經濟能力加分冇咗。`,
      `Study is ${n}/10, so the tutorial place is closed. The economics gain is lost.`,
    ),
};

function subjectReason(subject: SubjectId, score: number): LocaleText {
  const zh = subjectName(subject, "zh");
  const en = subjectName(subject, "en", "name");
  return line(
    `你${zh}只有 ${score}／10，未夠底入呢科工作坊。今次去不成，能力加分冇咗。`,
    `${en} is ${score}/10, so this subject workshop is closed. The ability gain is lost.`,
  );
}

function subjectsWeakReason(ids: SubjectId[], abilities: SceneCtx["abilities"]): LocaleText {
  const zh = ids.map((id) => `${subjectName(id, "zh")} ${abilities[id]}／10`).join("、");
  const en = ids.map((id) => `${subjectName(id, "en", "name")} ${abilities[id]}/10`).join(", ");
  return line(
    `你${zh}，未夠底入呢個工作坊。今次去不成，能力加分冇咗。`,
    `${en} are too low for this workshop. The ability gain is lost.`,
  );
}

export function gatedChoiceIds(): string[] {
  return Object.keys(GATES);
}

function genericStat(stat: StatKey, point: number): LocaleText {
  if (stat === "wellbeing") {
    return line(`你身心只有 ${point}／10，今次去不成，能力加分冇咗。`, `Wellbeing is ${point}/10, so you cannot go. The ability gain is lost.`);
  }
  if (stat === "social") {
    return line(`你人際只有 ${point}／10，今次去不成，能力加分冇咗。`, `Bonds are ${point}/10, so you cannot go. The ability gain is lost.`);
  }
  if (stat === "curiosity") {
    return line(`你好奇只有 ${point}／10，今次去不成，能力加分冇咗。`, `Curiosity is ${point}/10, so you cannot go. The ability gain is lost.`);
  }
  return line(`你學業只有 ${point}／10，今次去不成，能力加分冇咗。`, `Study is ${point}/10, so you cannot go. The ability gain is lost.`);
}

export function blockReason(ctx: SceneCtx, choiceId: string): LocaleText | null {
  const gate = GATES[choiceId];
  if (!gate) return null;
  if (gate.stat && lifePoint(ctx.stats[gate.stat]) <= LIFE_GATE) {
    const point = lifePoint(ctx.stats[gate.stat]);
    const custom = STAT_REASON[choiceId];
    return custom ? custom(point) : genericStat(gate.stat, point);
  }
  if (gate.subject && ctx.abilities[gate.subject] <= ABILITY_WEAK) {
    return subjectReason(gate.subject, ctx.abilities[gate.subject]);
  }
  if (
    gate.subjectAllWeak &&
    gate.subjectAllWeak.length > 0 &&
    gate.subjectAllWeak.every((id) => ctx.abilities[id] <= ABILITY_WEAK)
  ) {
    return subjectsWeakReason(gate.subjectAllWeak, ctx.abilities);
  }
  return null;
}

export function annotateChoices(sceneId: string, choices: Choice[], ctx: SceneCtx): Choice[] {
  const marked = choices.map((choice) => {
    const blocked = blockReason(ctx, choice.id);
    return blocked ? { ...choice, blocked } : { ...choice, blocked: undefined };
  });
  if (marked.some((choice) => !choice.blocked)) return marked;
  const reason = marked.find((choice) => choice.blocked)?.blocked;
  return [
    ...marked,
    {
      id: `${sceneId}-blocked-miss`,
      label: line("知道了，今次去不成", "Understood. You cannot go this time."),
      detail: reason ?? line("今次去不成，能力加分冇咗。", "You cannot go. The ability gain is lost."),
      effects: {},
    },
  ];
}
