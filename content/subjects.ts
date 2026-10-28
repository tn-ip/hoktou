import type {
  ElectiveId,
  Flags,
  Lang,
  LocaleText,
  MathModule,
} from "@/lib/types";
import { joinList, line, tx } from "@/lib/text";

export type ElectiveInfo = {
  id: ElectiveId;
  name: LocaleText;
  hint: LocaleText;
};

export const ELECTIVES: ElectiveInfo[] = [
  { id: "phy", name: line("物理", "Physics"), hint: line("實驗、模型同概念", "Experiments, models, concepts") },
  { id: "chem", name: line("化學", "Chemistry"), hint: line("反應、數據同安全", "Reactions, data, lab safety") },
  { id: "bio", name: line("生物", "Biology"), hint: line("生命系統同觀察", "Living systems and observation") },
  { id: "econ", name: line("經濟", "Economics"), hint: line("選擇、市場同政策", "Choices, markets, policy") },
  { id: "geog", name: line("地理", "Geography"), hint: line("地方、人同環境", "Places, people, environment") },
  { id: "hist", name: line("歷史", "History"), hint: line("證據、因果同敘事", "Evidence, cause, narrative") },
  { id: "chist", name: line("中國歷史", "Chinese History"), hint: line("時代、文本同角度", "Eras, texts, perspectives") },
  { id: "va", name: line("視覺藝術", "Visual Arts"), hint: line("觀察、材料同作品", "Looking, materials, making") },
  {
    id: "ict",
    name: line("資訊及通訊科技", "Information and Communication Technology"),
    hint: line("系統、數據同製作", "Systems, data, making"),
  },
  {
    id: "bafs",
    name: line("企業、會計與財務概論", "Business, Accounting and Financial Studies"),
    hint: line("帳目、組織同決策", "Accounts, organisations, decisions"),
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
      ? "必修仍在時間表上：中國語文、英國語文、數學、公民與社會發展。下面選三個選修。延伸數學可另選，不算進這三科。"
      : "Core subjects stay on the timetable: Chinese, English, mathematics, and Citizenship and Social Development. Choose three electives below. Extended maths is optional and does not count as one of the three.";
  const extra: string[] = [];
  if (lang === "zh") {
    if (flags.lean === "science") extra.push("簡介會那天，你在理科攤位停得最久。");
    if (flags.lean === "broad") extra.push("你在簡介會把幾個攤位都走了一遍。");
    if (flags.lean === "realistic") extra.push("師兄提過：先問功課量，再問心動。");
    if (flags.voices === "steady") extra.push("家人提過想你穩陣一點。表格仍由你填。");
    if (flags.voices === "interest") extra.push("家人提過：有興趣，才走得完這三年。");
    if (flags.voices === "open") extra.push("陳老師說過：科目是工具，不是你的全部身份。");
  } else {
    if (flags.lean === "science") extra.push("At the briefing you stayed longest at the science booths.");
    if (flags.lean === "broad") extra.push("At the briefing you walked the other booths as well.");
    if (flags.lean === "realistic") extra.push("A senior said to ask about the workload, then about what moves you.");
    if (flags.voices === "steady") extra.push("Someone at home mentioned wanting a steadier mix. The form is still yours.");
    if (flags.voices === "interest") extra.push("Someone at home said interest is what carries a person through three years.");
    if (flags.voices === "open") extra.push("Ms Chan said subjects are tools, not the whole of who you are.");
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
