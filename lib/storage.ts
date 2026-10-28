import { sceneById } from "@/content/scenes";
import { programmeById } from "@/content/programmes";
import { ELECTIVE_IDS } from "@/content/subjects";
import { defaultFlags } from "@/lib/engine";
import type {
  ElectiveId,
  Flags,
  Lang,
  LogEntry,
  MathModule,
  OfferKind,
  Phase,
  RunState,
  Stats,
} from "@/lib/types";
import { STAT_KEYS } from "@/lib/types";

const RUN_KEY = "hoktou.v1";
const LANG_KEY = "hoktou.lang";

const PHASES: Phase[] = ["scene", "electives", "ranking", "offer", "epilogue", "summary"];
const CCAS: Flags["cca"][] = ["science", "sport", "service", "none"];
const FAIRS: Flags["fair"][] = ["none", "prize", "shown", "school", "rushed", "skip"];
const TRACKS: Flags["projectTrack"][] = ["", "science", "business", "humanities", "creative", "tech", "general"];

function isLocale(value: unknown): value is { zh: string; en: string } {
  if (!value || typeof value !== "object") return false;
  const record = value as { zh?: unknown; en?: unknown };
  return typeof record.zh === "string" && typeof record.en === "string";
}

function readStats(value: unknown): Stats | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<Stats>;
  const stats = { academic: 0, curiosity: 0, wellbeing: 0, social: 0 };
  for (const key of STAT_KEYS) {
    if (typeof record[key] !== "number" || Number.isNaN(record[key])) return null;
    stats[key] = Math.max(0, Math.min(100, Math.round(record[key] as number)));
  }
  return stats;
}

function readFlags(value: unknown): Flags {
  const flags = { ...defaultFlags(), ...(value && typeof value === "object" ? (value as Partial<Flags>) : {}) };
  if (!CCAS.includes(flags.cca)) flags.cca = "none";
  if (!FAIRS.includes(flags.fair)) flags.fair = "none";
  if (!TRACKS.includes(flags.projectTrack)) flags.projectTrack = "";
  flags.tutor = Boolean(flags.tutor);
  flags.miniProject = Boolean(flags.miniProject);
  flags.heavyTutor = Boolean(flags.heavyTutor);
  flags.honestTired = Boolean(flags.honestTired);
  flags.doubt = Boolean(flags.doubt);
  flags.grindExam = Boolean(flags.grindExam);
  return flags;
}

function readLog(value: unknown): LogEntry[] {
  if (!Array.isArray(value)) return [];
  const log: LogEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const entry = item as Partial<LogEntry>;
    if (typeof entry.sceneId !== "string" || typeof entry.choiceId !== "string") continue;
    if (typeof entry.year !== "string") continue;
    if (!isLocale(entry.title) || !isLocale(entry.choice)) continue;
    if (!["S1", "S2", "S3", "S4", "S5", "S6", "life"].includes(entry.year)) continue;
    log.push({
      sceneId: entry.sceneId,
      year: entry.year as LogEntry["year"],
      choiceId: entry.choiceId,
      title: entry.title,
      choice: entry.choice,
    });
  }
  return log;
}

export function parseRun(raw: unknown): RunState | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<RunState>;
  if (value.version !== 1) return null;
  if (value.pace !== "fast" && value.pace !== "standard") return null;
  if (value.lang !== "zh" && value.lang !== "en") return null;
  if (!value.phase || !PHASES.includes(value.phase)) return null;
  const stats = readStats(value.stats);
  if (!stats) return null;
  const electives = Array.isArray(value.electives)
    ? value.electives.filter((id): id is ElectiveId => ELECTIVE_IDS.includes(id as ElectiveId)).slice(0, 3)
    : [];
  const mathModule: MathModule = value.mathModule === "m1" || value.mathModule === "m2" ? value.mathModule : "none";
  const ranking: string[] = [];
  if (Array.isArray(value.ranking)) {
    for (const id of value.ranking) {
      if (typeof id === "string" && programmeById(id) && !ranking.includes(id)) ranking.push(id);
    }
  }
  const passedOver = Array.isArray(value.passedOver)
    ? value.passedOver.filter((id): id is string => typeof id === "string")
    : [];
  let offerId = typeof value.offerId === "string" && programmeById(value.offerId) ? value.offerId : null;
  let offerKind: OfferKind =
    value.offerKind === "degree" || value.offerKind === "subdegree" || value.offerKind === "work"
      ? value.offerKind
      : "none";
  if (!offerId && (offerKind === "degree" || offerKind === "subdegree")) offerKind = "work";
  const sceneId = typeof value.sceneId === "string" ? value.sceneId : "";
  if (value.phase === "scene" && !sceneById(sceneId)) return null;
  const run: RunState = {
    version: 1,
    pace: value.pace,
    lang: value.lang,
    phase: value.phase,
    sceneId,
    stats,
    electives,
    mathModule,
    flags: readFlags(value.flags),
    log: readLog(value.log),
    ranking,
    offerId,
    offerKind,
    passedOver,
    lastEcho: isLocale(value.lastEcho) ? value.lastEcho : null,
    lastEffects:
      value.lastEffects && typeof value.lastEffects === "object" ? (value.lastEffects as Partial<Stats>) : null,
  };
  return run;
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadRun(): RunState | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(RUN_KEY);
    if (!raw) return null;
    return parseRun(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function saveRun(run: RunState): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(RUN_KEY, JSON.stringify(run));
  } catch {
    // Private mode and full storage still leave the current tab playable.
  }
}

export function clearRun(): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(RUN_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function loadLang(): Lang | null {
  const store = storage();
  if (!store) return null;
  const value = store.getItem(LANG_KEY);
  return value === "zh" || value === "en" ? value : null;
}

export function saveLang(lang: Lang): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(LANG_KEY, lang);
  } catch {
    // Ignore storage failures.
  }
}
