import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { electiveDilemmas, startAbilities } from "@/content/subjects";
import { clipReflection, quoteWrap, REFLECTION_MAX, writtenReflections } from "@/content/reflections";
import { ReflectionQuotes } from "@/components/widgets";
import { programmeById } from "@/content/programmes";
import {
  advancePhase,
  applyChoice,
  choiceIds,
  confirmElectives,
  confirmRanking,
  createRun,
  currentStep,
  programmeScore,
  rankTarget,
  resolveReflection,
} from "@/lib/engine";
import { parseRun } from "@/lib/storage";
import type { Phase, ReflectionId, RunState } from "@/lib/types";

const RANKS = ["monghoi-med", "monghoi-phy", "harbour-eng", "monghoi-chem", "green-teach"];

function comparable(run: RunState): Omit<RunState, "reflections" | "pause"> {
  const { reflections: _reflections, pause: _pause, ...rest } = run;
  return rest;
}

function drive(
  pace: RunState["pace"],
  answers: Partial<Record<ReflectionId, string | null>>,
): { run: RunState; hits: { id: ReflectionId; phase: Phase; sceneId: string }[] } {
  let run = createRun(pace, "zh", { nickname: "家琪", interests: ["science", "language"] });
  const hits: { id: ReflectionId; phase: Phase; sceneId: string }[] = [];
  let guard = 0;
  while (run.phase !== "summary") {
    if (++guard > 200) throw new Error(`loop ${run.phase} ${run.sceneId} ${run.pause ?? ""}`);
    if (run.pause) {
      hits.push({ id: run.pause, phase: run.phase, sceneId: run.sceneId });
      const answer = answers[run.pause];
      run = resolveReflection(run, answer === undefined ? null : answer);
      continue;
    }
    if (run.phase === "scene") run = applyChoice(run, choiceIds(run)[0]);
    else if (run.phase === "electives") run = confirmElectives(run, ["phy", "chem", "bio"], "m2");
    else if (run.phase === "ranking") run = confirmRanking(run, RANKS.slice(0, rankTarget(pace)));
    else if (run.phase === "offer" || run.phase === "epilogue") run = advancePhase(run);
    else throw new Error(run.phase);
  }
  return { run, hits };
}

describe("milestone pauses", () => {
  it("clips a line and drops blanks", () => {
    assert.equal(clipReflection("  一\n句  "), "一句");
    assert.equal(clipReflection("   "), "");
    assert.equal(Array.from(clipReflection("學".repeat(REFLECTION_MAX + 5))).length, REFLECTION_MAX);
    assert.equal(quoteWrap("一句", "zh"), "「一句」");
    assert.equal(quoteWrap("a line", "en"), "“a line”");
  });

  it("gates all four pauses, and a skip stores no line", () => {
    let run = createRun("fast", "zh");
    assert.equal(run.pause, null);
    assert.equal(run.version, 4);
    assert.throws(() => resolveReflection(run, null), /No pause is open/);
    run = applyChoice(run, choiceIds(run)[0]);
    assert.equal(run.pause, "s1");
    assert.equal(run.sceneId, "s2-clubs");
    assert.equal(currentStep(run), "S1");
    assert.throws(() => applyChoice(run, choiceIds(run)[0]), /Pause s1 is open/);
    const untouched = { ...createRun("standard", "zh"), sceneId: "s1-quiz", phase: "scene" as const };
    assert.equal(applyChoice(untouched, choiceIds(untouched)[0]).pause, null);
    run = resolveReflection(run, "  以為中學是更大的小學  ");
    assert.equal(run.pause, null);
    assert.deepEqual(run.reflections, [{ id: "s1", text: "以為中學是更大的小學", skipped: false }]);

    while (run.phase === "scene") run = applyChoice(run, choiceIds(run)[0]);
    assert.equal(run.phase, "electives");
    assert.equal(run.pause, "s3");
    assert.equal(run.sceneId, "s3-crossroad");
    assert.throws(() => confirmElectives(run, ["phy", "chem", "bio"], "m2"), /Pause s3 is open/);
    const warnings = electiveDilemmas({ ...startAbilities(), chem: 40 }, ["chem", "hist", "geog"]);
    assert.equal(warnings[0]?.id, "gap-chem");
    run = resolveReflection(run, "   ");
    assert.equal(run.reflections.find((item) => item.id === "s3")?.skipped, true);
    run = confirmElectives(run, ["phy", "chem", "bio"], "m2");
    assert.equal(run.pause, null);
    assert.equal(run.sceneId, "s4-open");

    while (run.phase === "scene") run = applyChoice(run, choiceIds(run)[0]);
    assert.equal(run.phase, "ranking");
    assert.equal(run.pause, "s6");
    assert.equal(run.sceneId, "s6-mock");
    assert.throws(() => confirmRanking(run, RANKS.slice(0, 3)), /Pause s6 is open/);
    run = resolveReflection(run, null);
    run = confirmRanking(run, RANKS.slice(0, 3));
    assert.equal(run.phase, "offer");
    assert.equal(run.pause, null);

    run = advancePhase(run);
    assert.equal(run.phase, "epilogue");
    assert.equal(run.pause, "after");
    assert.throws(() => advancePhase(run), /Pause after is open/);
    run = resolveReflection(run, "同學借了一張桌子");
    run = advancePhase(run);
    assert.equal(run.phase, "summary");
    assert.equal(run.pause, null);
    assert.deepEqual(
      writtenReflections(run.reflections).map((item) => item.id),
      ["s1", "after"],
    );
  });

  it("opens the after-school pause on the first life scene, then not again", () => {
    const offered = { ...createRun("standard", "en"), phase: "offer" as const, offerKind: "work" as const };
    const life = advancePhase(offered);
    assert.equal(life.pause, "after");
    assert.equal(life.phase, "scene");
    assert.equal(life.sceneId, "life-orientation");
    const walking = resolveReflection(life, null);
    assert.equal(walking.pause, null);
    const finished = { ...walking, phase: "epilogue" as const };
    const summary = advancePhase(finished);
    assert.equal(summary.phase, "summary");
    assert.equal(summary.pause, null);
  });

  it("keeps the same offer when the lines change", () => {
    const quiet = drive("fast", {});
    const noted = drive("fast", {
      s1: "以為中學是更大的小學",
      s3: "這三科是給自己的",
      s6: "這張表是我自己填的",
      after: "阿媽沒有催我",
    });
    assert.deepEqual(
      quiet.hits.map((hit) => `${hit.id}:${hit.phase}:${hit.sceneId}`),
      ["s1:scene:s2-clubs", "s3:electives:s3-crossroad", "s6:ranking:s6-mock", "after:epilogue:s6-mock"],
    );
    assert.deepEqual(
      noted.hits.map((hit) => hit.id),
      ["s1", "s3", "s6", "after"],
    );
    assert.deepEqual(comparable(quiet.run), comparable(noted.run));
    assert.equal(quiet.run.offerId, noted.run.offerId);
    assert.deepEqual(writtenReflections(quiet.run.reflections), []);
    assert.equal(writtenReflections(noted.run.reflections).length, 4);
    const programme = programmeById("monghoi-phy");
    assert.ok(programme);
    assert.equal(programmeScore(quiet.run, programme), programmeScore(noted.run, programme));
  });

  it("quotes only written lines, in milestone order", () => {
    const { run } = drive("standard", {
      s1: "以為中學是更大的小學",
      s3: null,
      s6: "   ",
      after: "一個沒有催我的晚上",
    });
    assert.deepEqual(
      run.reflections.map((item) => [item.id, item.skipped]),
      [
        ["s1", false],
        ["s3", true],
        ["s6", true],
        ["after", false],
      ],
    );
    const quotes = writtenReflections(run.reflections);
    assert.deepEqual(
      quotes.map((item) => item.text),
      ["以為中學是更大的小學", "一個沒有催我的晚上"],
    );
    const html = renderToStaticMarkup(createElement(ReflectionQuotes, { run, lang: "zh" }));
    assert.match(html, /data-testid="reflection-quotes"/);
    assert.match(html, /data-testid="quote-s1"/);
    assert.match(html, /「以為中學是更大的小學」/);
    assert.match(html, /中一暫停時你留下的一句/);
    assert.match(html, /data-testid="quote-after"/);
    assert.match(html, /「一個沒有催我的晚上」/);
    assert.match(html, /離校後你留下的一句/);
    assert.equal(html.includes("quote-s3"), false);
    assert.equal(html.includes("quote-s6"), false);
    const english = renderToStaticMarkup(createElement(ReflectionQuotes, { run, lang: "en" }));
    assert.match(english, /“以為中學是更大的小學”/);
    assert.match(english, /A line you kept in S1/);
    const empty = renderToStaticMarkup(
      createElement(ReflectionQuotes, { run: { ...run, reflections: [] }, lang: "zh" }),
    );
    assert.equal(empty, "");
  });

  it("loads a version 1 save and keeps an open pause", () => {
    const legacy = JSON.parse(JSON.stringify(createRun("standard", "zh", { nickname: "  家琪  ", interests: ["art"] }))) as Record<
      string,
      unknown
    >;
    legacy.version = 1;
    delete legacy.reflections;
    delete legacy.pause;
    delete legacy.nickname;
    const parsed = parseRun(legacy);
    assert.equal(parsed?.version, 4);
    assert.equal(parsed?.nickname, "");
    assert.deepEqual(parsed?.reflections, []);
    assert.equal(parsed?.pause, null);
    assert.equal(parsed?.sceneId, "s1-arrival");

    let paused = createRun("fast", "en");
    paused = applyChoice(paused, choiceIds(paused)[0]);
    const roundTrip = parseRun(JSON.parse(JSON.stringify(paused)));
    assert.equal(roundTrip?.pause, "s1");
    assert.equal(roundTrip?.sceneId, "s2-clubs");
    assert.equal(roundTrip?.version, 4);

    const corrupt = {
      ...paused,
      reflections: [
        { id: "s1", text: `  ${"長".repeat(REFLECTION_MAX + 8)}  `, skipped: false },
        { id: "nope", text: "skip me", skipped: false },
        { id: "s6", text: "已經寫過", skipped: false },
        { id: "s3", text: "有字但當跳過", skipped: true },
      ],
      pause: "s6",
    };
    const cleaned = parseRun(JSON.parse(JSON.stringify(corrupt)));
    assert.equal(cleaned?.pause, null);
    assert.equal(cleaned?.reflections.find((item) => item.id === "s1")?.text.length, REFLECTION_MAX);
    assert.equal(cleaned?.reflections.find((item) => item.id === "s3")?.skipped, true);
    assert.equal(cleaned?.reflections.find((item) => item.id === "s3")?.text, "");
    assert.equal(cleaned?.reflections.some((item) => item.id === "s6"), true);
    assert.equal(parseRun({ version: 4, pace: "fast", lang: "en", phase: "scene", sceneId: "s1-arrival" }), null);
    assert.equal(parseRun({ version: 2 }), null);

    const ui = readFileSync("components/GameApp.tsx", "utf8");
    assert.match(ui, /data-testid="pause"/);
    assert.match(ui, /data-testid="pause-write"/);
    assert.match(ui, /data-testid="pause-skip"/);
    assert.match(ui, /resolveReflection/);
  });
});
