import { LIFE_PLAYLIST, PLAYLIST, sceneById, type Beat } from "@/content/scenes";
import { PROGRAMMES, programmeById, type Programme } from "@/content/programmes";
import { joinElectives, mathLabel } from "@/content/subjects";
import { fairAligns, projectTrack } from "@/lib/track";
import type {
  Choice,
  ElectiveId,
  LocaleText,
  MathModule,
  Outlook,
  Pace,
  Phase,
  RunState,
  SceneCtx,
  StatKey,
  Stats,
  StepId,
  StepStatus,
} from "@/lib/types";
import { STAT_KEYS } from "@/lib/types";
import { line } from "@/lib/text";

export const START_STATS: Stats = {
  academic: 52,
  curiosity: 50,
  wellbeing: 58,
  social: 48,
};

export function defaultFlags(): RunState["flags"] {
  return {
    cca: "none",
    spark: "",
    tutor: false,
    home: "",
    miniProject: false,
    lean: "",
    voices: "",
    fair: "none",
    projectTrack: "",
    mock: "",
    heavyTutor: false,
    honestTired: false,
    summerPreview: "",
    s4focus: "",
    doubt: false,
    grindExam: false,
    spring: "",
    taster: "",
    mathPull: "",
    reference: "",
    slp: "",
    interview: "",
    listStyle: "",
    backup: "",
    folio: "",
    campus: "",
    hours: "",
    dwelling: "",
    payday: "",
    mentor: "",
    oldFriends: "",
    sideQuest: "",
    sunday: "",
  };
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function applyEffects(stats: Stats, effects: Partial<Stats>): Stats {
  const next = { ...stats };
  for (const key of STAT_KEYS) {
    if (typeof effects[key] === "number") next[key] = clamp(next[key] + (effects[key] as number));
  }
  return next;
}

export function rankTarget(pace: Pace): number {
  return pace === "fast" ? 3 : 5;
}

export function visiblePlaylist(pace: Pace): Beat[] {
  return PLAYLIST.filter((beat) => pace === "standard" || beat.pace === "all");
}

function toCtx(run: RunState): SceneCtx {
  return {
    stats: run.stats,
    electives: run.electives,
    mathModule: run.mathModule,
    flags: run.flags,
    pace: run.pace,
  };
}

function readText(value: LocaleText | ((ctx: SceneCtx) => LocaleText), ctx: SceneCtx): LocaleText {
  return typeof value === "function" ? value(ctx) : value;
}

export type SceneView = {
  kicker: LocaleText;
  title: LocaleText;
  focus: LocaleText;
  body: LocaleText;
  choices: Choice[];
};

export function sceneView(run: RunState): SceneView | null {
  const scene = sceneById(run.sceneId);
  if (!scene) return null;
  const ctx = toCtx(run);
  return {
    kicker: readText(scene.kicker, ctx),
    title: readText(scene.title, ctx),
    focus: readText(scene.focus, ctx),
    body: scene.body(ctx),
    choices: scene.choices(ctx),
  };
}

export function createRun(pace: Pace, lang: RunState["lang"]): RunState {
  const first = visiblePlaylist(pace).find((beat) => beat.kind === "scene");
  if (!first || first.kind !== "scene") throw new Error("Playlist has no scene");
  return {
    version: 1,
    pace,
    lang,
    phase: "scene",
    sceneId: first.id,
    stats: { ...START_STATS },
    electives: [],
    mathModule: "none",
    flags: defaultFlags(),
    log: [],
    ranking: [],
    offerId: null,
    offerKind: "none",
    passedOver: [],
    lastEcho: null,
    lastEffects: null,
  };
}

export function visibleLife(pace: Pace): Beat[] {
  return LIFE_PLAYLIST.filter((beat) => pace === "standard" || beat.pace === "all");
}

function goAfter(run: RunState, fromSceneId: string): RunState {
  const list = visiblePlaylist(run.pace);
  const index = list.findIndex((beat) => beat.kind === "scene" && beat.id === fromSceneId);
  if (index >= 0) {
    for (let i = index + 1; i < list.length; i += 1) {
      const beat = list[i];
      if (beat.kind === "electives") return { ...run, phase: "electives" };
      if (beat.kind === "scene") return { ...run, phase: "scene", sceneId: beat.id };
    }
    return { ...run, phase: "ranking" };
  }
  const life = visibleLife(run.pace);
  const lifeIndex = life.findIndex((beat) => beat.kind === "scene" && beat.id === fromSceneId);
  if (lifeIndex >= 0) {
    const next = life[lifeIndex + 1];
    if (next?.kind === "scene") return { ...run, phase: "scene", sceneId: next.id };
    return { ...run, phase: "epilogue", lastEcho: null, lastEffects: null };
  }
  throw new Error(`Scene ${fromSceneId} is missing from the playlist`);
}

export function applyChoice(run: RunState, choiceId: string): RunState {
  if (run.phase !== "scene") throw new Error("Not on a scene");
  const scene = sceneById(run.sceneId);
  if (!scene) throw new Error("Missing scene");
  const ctx = toCtx(run);
  const choice = scene.choices(ctx).find((item) => item.id === choiceId);
  if (!choice) throw new Error(`Unknown choice ${choiceId}`);
  const stats = applyEffects(run.stats, choice.effects);
  const drafted: RunState = { ...run, stats };
  const extra = choice.after?.(drafted, stats) ?? {};
  const flags = { ...run.flags, ...(choice.flags ?? {}), ...extra };
  const next: RunState = {
    ...run,
    stats,
    flags,
    lastEcho: choice.label,
    lastEffects: choice.effects,
    log: [
      ...run.log,
      {
        sceneId: scene.id,
        year: scene.year,
        choiceId: choice.id,
        title: readText(scene.title, ctx),
        choice: choice.label,
      },
    ],
  };
  return goAfter(next, scene.id);
}

export function setElectiveDraft(run: RunState, electives: ElectiveId[], mathModule: MathModule): RunState {
  return { ...run, electives, mathModule };
}

export function confirmElectives(run: RunState, electives: ElectiveId[], mathModule: MathModule): RunState {
  if (run.phase !== "electives") throw new Error("Not choosing electives");
  if (electives.length !== 3 || new Set(electives).size !== 3) throw new Error("Choose three electives");
  const withLog: RunState = {
    ...run,
    electives,
    mathModule,
    lastEcho: null,
    lastEffects: null,
    log: [
      ...run.log,
      {
        sceneId: "electives",
        year: "S3",
        choiceId: "electives",
        title: line("選科", "Electives"),
        choice: line(
          `${joinElectives(electives, "zh")}；${mathLabel(mathModule, "zh", "short")}`,
          `${joinElectives(electives, "en")}; ${mathLabel(mathModule, "en", "short")}`,
        ),
      },
    ],
  };
  const list = visiblePlaylist(run.pace);
  const index = list.findIndex((beat) => beat.kind === "electives");
  for (let i = index + 1; i < list.length; i += 1) {
    const beat = list[i];
    if (beat.kind === "scene") return { ...withLog, phase: "scene", sceneId: beat.id };
  }
  return { ...withLog, phase: "ranking" };
}

export function setRanking(run: RunState, ranking: string[]): RunState {
  return { ...run, ranking };
}

export function programmeScore(run: RunState, programme: Programme): number {
  const weights = programme.weights;
  let score =
    run.stats.academic * weights.academic +
    run.stats.curiosity * weights.curiosity +
    run.stats.wellbeing * weights.wellbeing +
    run.stats.social * weights.social;
  const matches = programme.electives.filter((id) => run.electives.includes(id)).length;
  score += matches * programme.matchEach;
  if (programme.math && run.mathModule !== "none" && programme.math.includes(run.mathModule)) score += 5;
  const track = run.flags.projectTrack || projectTrack(run.electives, run.flags.cca);
  if (fairAligns(track, programme.boost)) {
    if (run.flags.fair === "prize") score += 8;
    else if (run.flags.fair === "shown" || run.flags.fair === "school") score += 4;
    else if (run.flags.fair === "rushed") score += 1;
  }
  if (
    run.flags.cca === "science" &&
    (programme.boost === "science" || programme.boost === "engineering" || programme.boost === "medicine")
  ) {
    score += 2;
  }
  if (run.flags.cca === "service" && (programme.boost === "policy" || programme.boost === "teaching")) score += 2;
  if (run.flags.miniProject && (programme.boost === "science" || programme.boost === "humanities")) score += 1;
  if (run.flags.reference === "full") score += 2;
  else if (run.flags.reference === "careful") score += 1;
  if (run.flags.slp === "thick") score += 2;
  else if (run.flags.slp === "honest") score += 1;
  if (run.flags.folio === "start") score += 1;
  if (run.flags.interview === "drill") score += 2;
  else if (
    run.flags.interview === "story" &&
    (programme.boost === "policy" ||
      programme.boost === "teaching" ||
      programme.boost === "business" ||
      programme.boost === "design" ||
      programme.boost === "media" ||
      programme.boost === "humanities")
  ) {
    score += 2;
  } else if (run.flags.interview === "skip") score -= 1;
  if (run.flags.listStyle === "safe") score += 1;
  if (run.flags.listStyle === "reach" && programme.threshold >= 90) score += 2;
  if (run.flags.listStyle === "advice" && (programme.boost === "teaching" || programme.boost === "policy")) score += 1;
  if (programme.adjust) score += programme.adjust(run);
  return clamp(score);
}

export function outlookOf(run: RunState, programme: Programme): Outlook {
  if (!programme.eligible(run)) return "ineligible";
  const score = programmeScore(run, programme);
  if (score >= programme.threshold + 6) return "likely";
  if (score >= programme.threshold) return "edge";
  if (score >= programme.threshold - 10) return "stretch";
  return "long";
}

export function resolveOffer(run: RunState): Pick<RunState, "offerId" | "offerKind" | "passedOver"> {
  const passedOver: string[] = [];
  for (const id of run.ranking) {
    const programme = programmeById(id);
    if (!programme) {
      passedOver.push(id);
      continue;
    }
    if (programme.eligible(run) && programmeScore(run, programme) >= programme.threshold) {
      return { offerId: programme.id, offerKind: programme.tier, passedOver };
    }
    passedOver.push(id);
  }
  let best: Programme | null = null;
  let bestScore = -1;
  for (const programme of PROGRAMMES) {
    if (programme.tier !== "subdegree") continue;
    if (!programme.eligible(run)) continue;
    const score = programmeScore(run, programme);
    if (score >= programme.threshold && score > bestScore) {
      best = programme;
      bestScore = score;
    }
  }
  if (best) return { offerId: best.id, offerKind: "subdegree", passedOver };
  return { offerId: null, offerKind: "work", passedOver };
}

export function confirmRanking(run: RunState, ranking: string[]): RunState {
  if (run.phase !== "ranking") throw new Error("Not ranking");
  const need = rankTarget(run.pace);
  if (ranking.length !== need) throw new Error(`Rank ${need} courses`);
  if (new Set(ranking).size !== ranking.length) throw new Error("Duplicate ranking");
  for (const id of ranking) {
    if (!programmeById(id)) throw new Error(`Unknown programme ${id}`);
  }
  const result = resolveOffer({ ...run, ranking });
  return {
    ...run,
    ranking,
    ...result,
    phase: "offer",
    lastEcho: null,
    lastEffects: null,
  };
}

export function advancePhase(run: RunState): RunState {
  if (run.phase === "offer") {
    const firstLife = visibleLife(run.pace).find((beat) => beat.kind === "scene");
    if (firstLife && firstLife.kind === "scene") {
      return { ...run, phase: "scene", sceneId: firstLife.id, lastEcho: null, lastEffects: null };
    }
    return { ...run, phase: "epilogue" };
  }
  if (run.phase === "epilogue") return { ...run, phase: "summary" };
  throw new Error(`Cannot advance from ${run.phase}`);
}

const SCENE_STEP: Record<string, StepId> = {
  "s1-arrival": "S1",
  "s1-quiz": "S1",
  "s1-summer": "S1",
  "s2-clubs": "S2",
  "s2-home": "S2",
  "s2-spring": "S2",
  "s3-crossroad": "S3",
  "s3-voices": "S3",
  "s3-summer": "sum",
  "s4-open": "S4",
  "s4-mid": "S4",
  "s4-exam": "S4",
  "s5-heat": "S5",
  "s5-showcase": "S5",
  "s5-body": "S5",
  "s6-mock": "S6",
  "s6-spring": "S6",
};

export function stepOrder(pace: Pace): StepId[] {
  return pace === "standard"
    ? ["S1", "S2", "S3", "pick", "sum", "S4", "S5", "S6", "out"]
    : ["S1", "S2", "S3", "pick", "S4", "S5", "S6", "out"];
}

export function currentStep(run: RunState): StepId {
  if (run.phase === "electives") return "pick";
  if (run.phase === "ranking" || run.phase === "offer" || run.phase === "epilogue" || run.phase === "summary") {
    return "out";
  }
  if (SCENE_STEP[run.sceneId]) return SCENE_STEP[run.sceneId];
  const scene = sceneById(run.sceneId);
  if (!scene) return "S1";
  if (scene.year === "life" || scene.id.startsWith("life-")) return "out";
  if (scene.id.startsWith("s3b-")) return "sum";
  if (scene.year === "S1" || scene.year === "S2" || scene.year === "S3" || scene.year === "S4" || scene.year === "S5" || scene.year === "S6") {
    return scene.year;
  }
  return "S1";
}

export function progress(run: RunState): { id: StepId; status: StepStatus }[] {
  const order = stepOrder(run.pace);
  const current = currentStep(run);
  const index = order.indexOf(current);
  return order.map((id, position) => ({
    id,
    status: position < index ? "done" : position === index ? "now" : "todo",
  }));
}

export function choiceIds(run: RunState): string[] {
  return sceneView(run)?.choices.map((choice) => choice.id) ?? [];
}

export function isStatKey(value: string): value is StatKey {
  return (STAT_KEYS as string[]).includes(value);
}

export function phaseAfter(phase: Phase): Phase | null {
  if (phase === "offer") return "epilogue";
  if (phase === "epilogue") return "summary";
  return null;
}
