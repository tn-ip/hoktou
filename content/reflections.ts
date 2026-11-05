import { line } from "@/lib/text";
import type { Lang, LocaleText, Reflection, ReflectionId } from "@/lib/types";
import { REFLECTION_IDS } from "@/lib/types";

export const REFLECTION_MAX = 120;

export type ReflectionPrompt = {
  kicker: LocaleText;
  title: LocaleText;
  body: LocaleText;
  placeholder: LocaleText;
  label: LocaleText;
};

export const reflectionHeading = line("你留下的話", "Lines you kept");

export const reflectionActions = {
  note: line(
    "寫下的一句會留在這次旅程的總結。它不影響任何分數，也沒有對錯。不寫也可以。",
    "The line you write stays on this journey's summary. It does not change any score, and there is no right answer. Blank is fine.",
  ),
  write: line("寫下來，繼續前行", "Write it down and go on"),
  writeHint: line("這句會留在這次旅程的總結", "This line stays on the summary of this journey"),
  skip: line("放在心裡，繼續前行", "Keep it in your heart and go on"),
  skipHint: line("不留下文字，前面的路照樣走", "No text is kept. The path still goes on"),
};

export const REFLECTION_PROMPTS: Record<ReflectionId, ReflectionPrompt> = {
  s1: {
    kicker: line("中一 · 暫停片刻", "S1 · A short pause"),
    title: line("你以為中學是什麼？", "What did you think secondary school was?"),
    body: line("中一剛開始。用一句話，留下你當時以為的中學。", "Secondary 1 has just begun. Leave one line about the school you thought this was."),
    placeholder: line("例如：一間更大的小學，只是鐘聲密了（不寫也沒關係）", "For example: a bigger primary school, only the bells come faster (leaving it blank is fine)"),
    label: line("中一暫停時你留下的一句", "A line you kept in S1"),
  },
  s3: {
    kicker: line("中三 · 暫停片刻", "S3 · A short pause"),
    title: line("這三科，是在替誰選？", "These three subjects — who are you choosing them for?"),
    body: line("選科表格就在前面。先停一停。", "The electives form is next. Pause first."),
    placeholder: line("例如：想先聽自己的，再同屋企人講（不寫也沒關係）", "For example: I want to hear myself first, then talk with my family (leaving it blank is fine)"),
    label: line("選科前你留下的一句", "A line you kept before electives"),
  },
  s6: {
    kicker: line("中六 · 暫停片刻", "S6 · A short pause"),
    title: line("這張志願表是在替誰填？", "Who are you filling this list in for?"),
    body: line("學途聯招的名單就在前面。它是遊戲裡的次序，不是真實收生。", "The Hoktou list is next. It is an order inside the game, not a real offer."),
    placeholder: line("例如：這次想按自己的興趣排一次（不寫也沒關係）", "For example: this once I want to rank what interests me (leaving it blank is fine)"),
    label: line("填志願前你留下的一句", "A line you kept before the list"),
  },
  after: {
    kicker: line("離校以後 · 暫停片刻", "After school · A short pause"),
    title: line("下一步，是誰扶了你一把？", "The next step — who held you up?"),
    body: line("中學這一段告一段落。下一步開始之前，停一下。", "This stretch of secondary school has come to a stop. Pause before the next step."),
    placeholder: line("例如：一個沒有催我的晚上（不寫也沒關係）", "For example: an evening when nobody rushed me (leaving it blank is fine)"),
    label: line("離校後你留下的一句", "A line you kept after school"),
  },
};

export const reflectionCopy = {
  heading: reflectionHeading,
  actions: reflectionActions,
  prompts: REFLECTION_PROMPTS,
};

export function clipReflection(raw: string): string {
  const single = raw.replace(/[\r\n]+/g, "").trim();
  return Array.from(single).slice(0, REFLECTION_MAX).join("");
}

export function writtenReflections(reflections: readonly Reflection[]): Reflection[] {
  const kept = new Map<ReflectionId, Reflection>();
  for (const item of reflections) {
    if (!REFLECTION_IDS.includes(item.id) || item.skipped) continue;
    const text = clipReflection(item.text);
    if (!text) continue;
    kept.set(item.id, { id: item.id, text, skipped: false });
  }
  return REFLECTION_IDS.flatMap((id) => {
    const item = kept.get(id);
    return item ? [item] : [];
  });
}

export function quoteWrap(text: string, lang: Lang): string {
  return lang === "zh" ? `「${text}」` : `“${text}”`;
}
