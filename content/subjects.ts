import type {
  Abilities,
  ElectiveId,
  Flags,
  Lang,
  LocaleText,
  MathModule,
  SubjectId,
} from "@/lib/types";
import { joinList, line, tx } from "@/lib/text";

export type ElectiveInfo = {
  id: ElectiveId;
  name: LocaleText;
  short: LocaleText;
  spoken: LocaleText;
  hint: LocaleText;
};

export const ELECTIVES: ElectiveInfo[] = [
  {
    id: "phy",
    name: line("物理", "Physics"),
    short: line("物理", "Physics"),
    spoken: line("物理", "Physics"),
    hint: line("實驗、模型同概念", "Experiments, models, concepts"),
  },
  {
    id: "chem",
    name: line("化學", "Chemistry"),
    short: line("化學", "Chemistry"),
    spoken: line("化學", "Chemistry"),
    hint: line("反應、數據同安全", "Reactions, data, lab safety"),
  },
  {
    id: "bio",
    name: line("生物", "Biology"),
    short: line("生物", "Biology"),
    spoken: line("生物", "Biology"),
    hint: line("生命系統同觀察", "Living systems and observation"),
  },
  {
    id: "econ",
    name: line("經濟", "Economics"),
    short: line("經濟", "Economics"),
    spoken: line("經濟", "Economics"),
    hint: line("選擇、市場同政策", "Choices, markets, policy"),
  },
  {
    id: "bafs",
    name: line("企業、會計與財務概論", "Business, Accounting and Financial Studies"),
    short: line("BAFS", "BAFS"),
    spoken: line("BAFS", "BAFS"),
    hint: line("帳目、組織同決策", "Accounts, organisations, decisions"),
  },
  {
    id: "hist",
    name: line("歷史", "History"),
    short: line("歷史", "History"),
    spoken: line("歷史", "History"),
    hint: line("證據、因果同敘事", "Evidence, cause, narrative"),
  },
  {
    id: "chist",
    name: line("中國歷史", "Chinese History"),
    short: line("中史", "Chinese history"),
    spoken: line("中史", "Chinese history"),
    hint: line("時代、文本同角度", "Eras, texts, perspectives"),
  },
  {
    id: "geog",
    name: line("地理", "Geography"),
    short: line("地理", "Geography"),
    spoken: line("地理", "Geography"),
    hint: line("地方、人同環境", "Places, people, environment"),
  },
  {
    id: "va",
    name: line("視覺藝術", "Visual Arts"),
    short: line("視藝", "Visual arts"),
    spoken: line("視藝", "Visual arts"),
    hint: line("觀察、材料同作品", "Looking, materials, making"),
  },
  {
    id: "ict",
    name: line("資訊及通訊科技", "Information and Communication Technology"),
    short: line("ICT", "ICT"),
    spoken: line("ICT", "ICT"),
    hint: line("系統、數據同製作", "Systems, data, making"),
  },
  {
    id: "pe",
    name: line("體育", "Physical Education"),
    short: line("體育", "PE"),
    spoken: line("體育", "PE"),
    hint: line("體能、訓練同身體怎樣反應", "Training, effort, and how the body responds"),
  },
];

export const ELECTIVE_IDS: ElectiveId[] = ELECTIVES.map((item) => item.id);

export function electiveById(id: ElectiveId): ElectiveInfo {
  const found = ELECTIVES.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown elective ${id}`);
  return found;
}

export function electiveName(id: ElectiveId, lang: Lang): string {
  return tx(lang, electiveById(id).name);
}

export function joinElectives(ids: ElectiveId[], lang: Lang): string {
  return joinList(ids.map((id) => electiveName(id, lang)), lang);
}

export type MathInfo = { id: MathModule; name: LocaleText; short: LocaleText };

export const MATHS: MathInfo[] = [
  { id: "none", name: line("不修延伸數學", "No extended maths"), short: line("不修延伸", "No extended maths") },
  {
    id: "m1",
    name: line("數學延伸單元一（微積分與統計）", "Extended maths module 1 (calculus and statistics)"),
    short: line("單元一", "Module 1"),
  },
  {
    id: "m2",
    name: line("數學延伸單元二（代數與微積分）", "Extended maths module 2 (algebra and calculus)"),
    short: line("單元二", "Module 2"),
  },
];

export function mathById(id: MathModule): MathInfo {
  const found = MATHS.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown maths ${id}`);
  return found;
}

export function mathLabel(id: MathModule, lang: Lang, kind: "name" | "short" = "name"): string {
  const info = mathById(id);
  return tx(lang, kind === "name" ? info.name : info.short);
}

export type Preset = {
  id: string;
  label: LocaleText;
  electives: [ElectiveId, ElectiveId, ElectiveId];
  math: MathModule;
};

export const PRESETS: Preset[] = [
  { id: "pure", label: line("純理", "Pure science"), electives: ["phy", "chem", "bio"], math: "m2" },
  { id: "eng", label: line("物理與創科", "Physics and tech"), electives: ["phy", "chem", "ict"], math: "m2" },
  { id: "life", label: line("生化", "Bio and chem"), electives: ["bio", "chem", "geog"], math: "m1" },
  { id: "biz", label: line("商科", "Business"), electives: ["econ", "bafs", "geog"], math: "m1" },
  { id: "hum", label: line("文史", "Humanities"), electives: ["chist", "hist", "geog"], math: "none" },
  { id: "make", label: line("設計與科技", "Design and tech"), electives: ["va", "ict", "econ"], math: "none" },
];

export function electiveIntro(flags: Flags, lang: Lang): string {
  const base =
    lang === "zh"
      ? "必修仍在時間表上：中文、英文、數學、通識／公民與社會發展。能力表列出全部科目，1 到 10。下面選三個選修，表會留在畫面上。提醒只在你按交表時出現，你可以堅持，也可以返回再改。延伸數學可另選，不算進這三科。"
      : "Core subjects stay on the timetable: Chinese, English, mathematics, and Citizenship and Social Development. The board lists every subject from 1 to 10. Choose three electives below; the board stays on screen. Reminders appear only when you hand the form in. You can keep the mix or go back and change it. Extended maths is optional and does not count as one of the three.";
  const extra: string[] = [];
  if (lang === "zh") {
    if (flags.lean === "science") extra.push("簡介會那天，你在理科攤位停得最久。");
    if (flags.lean === "broad") extra.push("你在簡介會把幾個攤位都走了一遍。");
    if (flags.lean === "realistic") extra.push("師兄提過：先問功課量，再問心動。");
    if (flags.voices === "steady") extra.push("家人提過想你穩陣一點。表格仍由你填。");
    if (flags.voices === "interest") extra.push("家人提過：有興趣，才走得完這三年。");
    if (flags.voices === "open") extra.push("陳老師說過：科目是工具，不是你的全部身份。");
    if (flags.taster === "science") extra.push("你試過一堂實驗，手還記得手套的氣味。");
    if (flags.taster === "biz") extra.push("你試過一堂個案討論，發現自己會追問數字從哪來。");
    if (flags.taster === "art") extra.push("你在工作室留過一小時，安靜比你預想的更費神。");
    if (flags.mathPull === "m1") extra.push("延伸數學講座之後，你對單元一的統計比較有感覺。");
    if (flags.mathPull === "m2") extra.push("延伸數學講座之後，你對單元二的代數比較有感覺。");
    if (flags.mathPull === "core") extra.push("你決定延伸數學先不加，把力氣留在三個選修。");
  } else {
    if (flags.lean === "science") extra.push("At the briefing you stayed longest at the science booths.");
    if (flags.lean === "broad") extra.push("At the briefing you walked the other booths as well.");
    if (flags.lean === "realistic") extra.push("A senior said to ask about the workload, then about what moves you.");
    if (flags.voices === "steady") extra.push("Someone at home mentioned wanting a steadier mix. The form is still yours.");
    if (flags.voices === "interest") extra.push("Someone at home said interest is what carries a person through three years.");
    if (flags.voices === "open") extra.push("Ms Chan said subjects are tools, not the whole of who you are.");
    if (flags.taster === "science") extra.push("You sat one lab taster. Your hands still remember the gloves.");
    if (flags.taster === "biz") extra.push("You sat one case discussion and kept asking where the numbers came from.");
    if (flags.taster === "art") extra.push("You stayed an hour in the studio. The quiet cost more energy than you expected.");
    if (flags.mathPull === "m1") extra.push("After the talk, module 1 statistics made more sense to you.");
    if (flags.mathPull === "m2") extra.push("After the talk, module 2 algebra made more sense to you.");
    if (flags.mathPull === "core") extra.push("You are leaving extended maths off, and keeping your effort for three electives.");
  }
  return [base, ...extra].join(lang === "zh" ? "" : " ");
}

export function comboNote(electives: ElectiveId[], math: MathModule, lang: Lang): string | null {
  if (electives.length !== 3) return null;
  const has = (id: ElectiveId) => electives.includes(id);
  const science = (["phy", "chem", "bio"] as ElectiveId[]).filter(has).length;
  if (science === 3) {
    return lang === "zh"
      ? "這是常見的理科組合，功課多在實驗同概念之間。"
      : "This is a common science mix. The work sits between experiments and concepts.";
  }
  if (has("econ") && has("bafs")) {
    return lang === "zh"
      ? "經濟同企業會計常被放在一起。數字會跟著報告走。"
      : "Economics and business are often taken together. Numbers will follow the essays.";
  }
  if (math === "m2" && !has("phy") && !has("chem") && !has("ict")) {
    return lang === "zh"
      ? "單元二通常配合理科或創科。遊戲仍允許這選擇，它主要影響物理同工程一類路徑。"
      : "Module 2 is usually paired with science or technology. The game still allows it. Here it mainly affects physics and engineering paths.";
  }
  if (science >= 1 && (has("hist") || has("chist")) && has("va")) {
    return lang === "zh"
      ? "這組合跨度大，功課類型會差很遠。遊戲允許；現實學校或有分組限制。"
      : "This mix stretches across very different kinds of work. The game allows it. A real school may have blocking rules.";
  }
  return null;
}

export type SubjectInfo = {
  id: SubjectId;
  group: "core" | "elective";
  name: LocaleText;
  short: LocaleText;
  spoken: LocaleText;
  hint: LocaleText;
};

export const CORE_SUBJECTS: SubjectInfo[] = [
  {
    id: "chi",
    group: "core",
    name: line("中文", "Chinese"),
    short: line("中文", "Chinese"),
    spoken: line("中文", "Chinese"),
    hint: line("閱讀、寫作同說話", "Reading, writing, speaking"),
  },
  {
    id: "eng",
    group: "core",
    name: line("英文", "English"),
    short: line("英文", "English"),
    spoken: line("英文", "English"),
    hint: line("聆聽、說話、閱讀同寫作", "Listening, speaking, reading, writing"),
  },
  {
    id: "math",
    group: "core",
    name: line("數學", "Mathematics"),
    short: line("數學", "Mathematics"),
    spoken: line("數學", "Mathematics"),
    hint: line("計算、圖像同理由", "Calculation, graphs, reasons"),
  },
  {
    id: "cs",
    group: "core",
    name: line("通識／公民與社會發展", "Citizenship and Social Development"),
    short: line("通識／公民", "Citizenship"),
    spoken: line("公民與社會發展", "Citizenship"),
    hint: line("社會、國家同當代議題", "Society, the country, contemporary issues"),
  },
];

export const SUBJECTS: SubjectInfo[] = [
  ...CORE_SUBJECTS,
  ...ELECTIVES.map((item) => ({ ...item, group: "elective" as const })),
];

export const SUBJECT_IDS: SubjectId[] = SUBJECTS.map((item) => item.id);

export const ABILITY_MIN = 1;
export const ABILITY_MAX = 10;
export const ABILITY_START = 5;
export const ABILITY_WEAK = 4;
export const ABILITY_FAIR = 6;
export const ABILITY_STEADY = 7;

const SCIENCE_ELECTIVES: ElectiveId[] = ["phy", "chem", "bio"];

export function subjectById(id: SubjectId): SubjectInfo {
  const found = SUBJECTS.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown subject ${id}`);
  return found;
}

export function subjectName(id: SubjectId, lang: Lang, kind: "name" | "short" | "spoken" = "spoken"): string {
  const info = subjectById(id);
  return tx(lang, kind === "name" ? info.name : kind === "short" ? info.short : info.spoken);
}

export function startAbilities(): Abilities {
  const abilities = {} as Abilities;
  for (const id of SUBJECT_IDS) abilities[id] = ABILITY_START;
  return abilities;
}

export function clampAbility(value: number): number {
  return Math.max(ABILITY_MIN, Math.min(ABILITY_MAX, Math.round(value)));
}

export function applyAbilityDelta(current: Abilities, delta: Partial<Abilities> | undefined): Abilities {
  if (!delta) return current;
  const next = { ...current };
  for (const id of SUBJECT_IDS) {
    if (typeof delta[id] === "number") next[id] = clampAbility(next[id] + (delta[id] as number));
  }
  return next;
}

export function readAbilities(value: unknown): Abilities {
  const abilities = startAbilities();
  if (!value || typeof value !== "object") return abilities;
  const record = value as Partial<Record<SubjectId, unknown>>;
  for (const id of SUBJECT_IDS) {
    const score = record[id];
    if (typeof score === "number" && !Number.isNaN(score)) abilities[id] = clampAbility(score);
  }
  return abilities;
}

export function abilityBand(score: number): "weak" | "fair" | "mid" | "steady" {
  if (score <= ABILITY_WEAK) return "weak";
  if (score >= ABILITY_STEADY) return "steady";
  if (score >= ABILITY_FAIR) return "fair";
  return "mid";
}

export function abilityBandLabel(score: number, lang: Lang): string {
  const band = abilityBand(score);
  if (lang === "zh") {
    if (band === "weak") return "一般";
    if (band === "steady") return "較穩";
    if (band === "fair") return "唔錯";
    return "中間";
  }
  if (band === "weak") return "Lower";
  if (band === "steady") return "Steady";
  if (band === "fair") return "Fair";
  return "Middle";
}

export function abilityDeltaLine(delta: Partial<Abilities> | null | undefined, lang: Lang): string | null {
  if (!delta) return null;
  const parts = SUBJECT_IDS.filter((id) => typeof delta[id] === "number" && delta[id] !== 0);
  if (parts.length === 0) return lang === "zh" ? "能力沒有加減" : "No ability change";
  return parts
    .map((id) => {
      const value = delta[id] as number;
      const signed = value > 0 ? `+${value}` : `${value}`;
      return lang === "zh" ? `${subjectName(id, "zh")}能力 ${signed}` : `${subjectName(id, "en", "name")} ability ${signed}`;
    })
    .join(lang === "zh" ? "、" : ", ");
}

export type Dilemma = {
  id: string;
  text: LocaleText;
};

function gapLine(id: ElectiveId): LocaleText {
  const zh = subjectName(id, "zh");
  const en = subjectName(id, "en", "name");
  return line(
    `${zh}呢科你而家一般啲 — 之後跟堂可能會吃力少少。你仲想堅持，定係想再諗吓？`,
    `${en} is sitting a bit lower for you right now — keeping up in lessons may take more effort. Do you still want to keep it, or think again?`,
  );
}

export function electiveDilemmas(abilities: Abilities, electives: ElectiveId[]): Dilemma[] {
  const found: Dilemma[] = [];
  const has = (id: ElectiveId) => electives.includes(id);
  for (const id of ELECTIVE_IDS) {
    if (!has(id) || abilities[id] > ABILITY_WEAK) continue;
    found.push({ id: `gap-${id}`, text: gapLine(id) });
  }
  const science = SCIENCE_ELECTIVES.filter(has);
  if (science.length >= 2) {
    const count = science.length === 2 ? "兩" : "三";
    const countEn = science.length === 2 ? "two" : "three";
    found.push({
      id: "two-science",
      text: line(
        `你揀咗${count}科科學。實驗同溫習會忙啲，時間要分配得好。`,
        `You picked ${countEn} science subjects. Labs and revision will be busier, so the time has to be shared.`,
      ),
    });
  }
  if (abilities.math <= ABILITY_WEAK && (has("econ") || has("bafs"))) {
    const pair = has("econ") && has("bafs");
    const zhName = pair ? "經濟／BAFS " : has("econ") ? "經濟" : "BAFS";
    const enName = pair ? "Economics / BAFS" : has("econ") ? "Economics" : "BAFS";
    found.push({
      id: "biz-math",
      text: line(
        `${zhName}好多時要用到數學。你數學暫時弱啲，計數題要預多啲時間。`,
        `${enName} often leans on mathematics. Your maths is on the low side for now, so leave extra time for the calculation questions.`,
      ),
    });
  }
  if (abilities.va >= ABILITY_FAIR && !has("va")) {
    found.push({
      id: "art-path",
      text: line(
        "你視藝唔錯，不過而家組合偏第二邊。家長可能會問出路，你準備點同佢哋傾？",
        "Your visual arts is in good shape, but this mix leans the other way. Family may ask about prospects. How will you talk with them?",
      ),
    });
  }
  const scienceCount = science.length;
  const phyMissed = abilities.phy >= ABILITY_STEADY && !has("phy");
  const mathMissed = abilities.math >= ABILITY_STEADY && scienceCount === 0;
  if (phyMissed && mathMissed) {
    found.push({
      id: "unused-strength",
      text: line(
        "你數學／物理其實幾穩，但未入到組合。想唔想再考慮吓理科？",
        "Your mathematics / physics is actually quite steady, but it is not in this mix. Do you want to look at science again?",
      ),
    });
  } else if (phyMissed) {
    found.push({
      id: "unused-strength",
      text: line(
        "你物理其實幾穩，但未入到組合。想唔想再考慮吓理科？",
        "Your physics is actually quite steady, but it is not in this mix. Do you want to look at science again?",
      ),
    });
  } else if (mathMissed) {
    found.push({
      id: "unused-strength",
      text: line(
        "你數學其實幾穩，但未入到組合。想唔想再考慮吓理科？",
        "Your mathematics is actually quite steady, but it is not in this mix. Do you want to look at science again?",
      ),
    });
  }
  return found;
}

export function seniorAbilityNote(abilities: Abilities, electives: ElectiveId[]): LocaleText {
  const steady = electives.filter((id) => abilities[id] >= ABILITY_STEADY);
  const weak = electives.filter((id) => abilities[id] <= ABILITY_WEAK);
  const zh: string[] = [];
  const en: string[] = [];
  if (steady.length > 0) {
    const names = steady.map((id) => subjectName(id, "zh")).join("、");
    const namesEn = steady.map((id) => subjectName(id, "en", "name")).join(", ");
    zh.push(`${names}而家較穩，高中可以從這裡起步。`);
    en.push(`${namesEn} ${steady.length > 1 ? "are" : "is"} steadier now, so senior school can start there.`);
  }
  if (weak.length > 0) {
    const names = weak.map((id) => subjectName(id, "zh")).join("、");
    const namesEn = weak.map((id) => subjectName(id, "en", "name")).join(", ");
    zh.push(`${names}而家一般啲，跟堂要預多啲時間。`);
    en.push(`${namesEn} ${weak.length > 1 ? "are" : "is"} lower for now, so lessons will need more time.`);
  }
  if (
    abilities.math <= ABILITY_WEAK &&
    electives.some((id) => id === "econ" || id === "bafs" || id === "phy" || id === "chem")
  ) {
    zh.push("數學暫時弱啲，計數題要預時間。");
    en.push("Mathematics is on the low side for now, so leave time for calculation questions.");
  }
  return line(zh.join(""), en.join(" "));
}
