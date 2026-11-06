import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRun, defaultFlags } from "@/lib/engine";
import { parseRun } from "@/lib/storage";
import { axisValues, endingShape, SHAPE_SENTENCE } from "@/lib/shape";
import { HappiestYear, ShapeReading } from "@/components/widgets";
import { happiestYear, validateLogEffects, yearCaption } from "@/lib/year";
import type { RunState } from "@/lib/types";

function runWith(stats: Partial<RunState["stats"]>, flags: Partial<RunState["flags"]> = {}): RunState {
  const run = createRun("standard", "zh", { nickname: "阿澄", interests: ["science", "art"] });
  return {
    ...run,
    stats: { ...run.stats, ...stats },
    flags: { ...run.flags, ...flags },
  };
}

function finishedRun(picks: Partial<RunState["flags"]> = {}): RunState {
  const run = createRun("standard", "zh", { nickname: "家琪", interests: ["humanities", "service"] });
  return {
    ...run,
    phase: "summary",
    stats: { academic: 55, curiosity: 55, wellbeing: 55, social: 55 },
    flags: { ...run.flags, ...picks },
    ranking: ["lion-hist", "lion-policy"],
    offerId: "lion-hist",
    offerKind: "degree",
  };
}

describe("four-axis ending shape", () => {
  it("is deterministic for the same run", () => {
    const run = finishedRun({ listStyle: "reach", s4focus: "people", spring: "care" });
    const first = axisValues(run);
    const second = axisValues(run);
    assert.deepEqual(first, second);
    assert.equal(endingShape(first).id, endingShape(second).id);
  });

  it("leans toward bonds when social is high and study flags are absent", () => {
    const run = runWith({ social: 80, academic: 40 }, { s4focus: "people", oldFriends: "keep" });
    const axes = axisValues(run);
    assert.ok(axes.bonds > 0, `expected bonds > 0, got ${axes.bonds}`);
    const shape = endingShape(axes);
    assert.equal(shape.id, "bonds");
  });

  it("leans toward grades when academic is high and grind flags are set", () => {
    const run = runWith({ academic: 85, social: 30 }, { s4focus: "study", grindExam: true, heavyTutor: true });
    const axes = axisValues(run);
    assert.ok(axes.bonds < 0, `expected bonds < 0, got ${axes.bonds}`);
    const shape = endingShape(axes);
    assert.equal(shape.id, "grades");
  });

  it("leans toward stay with safe list and home dwelling", () => {
    const run = finishedRun({ listStyle: "safe", dwelling: "home", backup: "sub" });
    const axes = axisValues(run);
    assert.ok(axes.stay > 0, `expected stay > 0, got ${axes.stay}`);
    assert.equal(endingShape(axes).id, "stay");
  });

  it("leans toward leave with reach list and dorm dwelling", () => {
    const run = finishedRun({ listStyle: "reach", dwelling: "dorm", backup: "retry" });
    const axes = axisValues(run);
    assert.ok(axes.stay < 0, `expected stay < 0, got ${axes.stay}`);
    assert.equal(endingShape(axes).id, "leave");
  });

  it("leans toward present with high wellbeing and bounded hours", () => {
    const run = runWith({ wellbeing: 80, academic: 40 }, { spring: "care", hours: "bounded" });
    const axes = axisValues(run);
    assert.ok(axes.present > 0, `expected present > 0, got ${axes.present}`);
    assert.equal(endingShape(axes).id, "present");
  });

  it("leans toward future with high academic and cram spring", () => {
    const run = runWith({ academic: 80, wellbeing: 30 }, { spring: "cram", hours: "overtime" });
    const axes = axisValues(run);
    assert.ok(axes.present < 0, `expected present < 0, got ${axes.present}`);
    assert.equal(endingShape(axes).id, "future");
  });

  it("leans toward safe with work offer and safe list", () => {
    const run = finishedRun({ listStyle: "safe", backup: "work" });
    run.offerKind = "work";
    run.offerId = null;
    const axes = axisValues(run);
    assert.ok(axes.safe > 0, `expected safe > 0, got ${axes.safe}`);
    assert.equal(endingShape(axes).id, "safe");
  });

  it("leans toward reach with degree offer and passed-over choices", () => {
    const run = finishedRun({ listStyle: "reach", backup: "retry" });
    run.offerKind = "degree";
    run.passedOver = ["monghoi-med"];
    const axes = axisValues(run);
    assert.ok(axes.safe < 0, `expected safe < 0, got ${axes.safe}`);
    assert.equal(endingShape(axes).id, "reach");
  });

  it("returns balanced when all axes are near center", () => {
    const run = runWith({ academic: 52, curiosity: 52, wellbeing: 52, social: 52 }, {});
    const axes = axisValues(run);
    const shape = endingShape(axes);
    assert.equal(shape.id, "balanced");
  });

  it("renders a shape reading in both languages", () => {
    const run = finishedRun({ listStyle: "safe", dwelling: "home" });
    const zh = renderToStaticMarkup(createElement(ShapeReading, { run, lang: "zh" }));
    const en = renderToStaticMarkup(createElement(ShapeReading, { run, lang: "en" }));
    assert.match(zh, /data-testid="shape-reading"/);
    assert.match(zh, /data-testid="shape-name"/);
    assert.match(zh, /data-testid="shape-sentence"/);
    assert.match(zh, /陪伴/);
    assert.match(zh, /成績/);
    assert.match(en, /Bonds/);
    assert.match(en, /Grades/);
    assert.equal(zh.includes("好學生"), false);
    assert.equal(en.includes("good student"), false);
  });

  it("includes the no-ranking sentence", () => {
    const run = finishedRun();
    const zh = renderToStaticMarkup(createElement(ShapeReading, { run, lang: "zh" }));
    const en = renderToStaticMarkup(createElement(ShapeReading, { run, lang: "en" }));
    assert.match(zh, /沒有哪一邊是比較好的人生/);
    assert.equal(en.includes(SHAPE_SENTENCE.en), true);
  });
});

describe("happiest-year caption", () => {
  it("replays the log to find the year with highest wellbeing", () => {
    const run = createRun("standard", "zh", { nickname: "家琪", interests: ["art", "service"] });
    run.log = [
      { sceneId: "s1-arrival", year: "S1", choiceId: "a", title: { zh: "中一", en: "S1" }, choice: { zh: "選項", en: "Choice" }, effects: { wellbeing: -2 } },
      { sceneId: "s2-clubs", year: "S2", choiceId: "b", title: { zh: "中二", en: "S2" }, choice: { zh: "選項", en: "Choice" }, effects: { wellbeing: 8 } },
      { sceneId: "s3-crossroad", year: "S3", choiceId: "c", title: { zh: "中三", en: "S3" }, choice: { zh: "選項", en: "Choice" }, effects: { wellbeing: -4 } },
    ];
    const happy = happiestYear(run);
    assert.ok(happy);
    assert.equal(happy.year, "S2");
  });

  it("returns null for an empty log", () => {
    const run = createRun("standard", "zh");
    run.log = [];
    assert.equal(happiestYear(run), null);
  });

  it("renders the happiest year caption", () => {
    const run = createRun("standard", "zh", { nickname: "家琪", interests: ["art", "service"] });
    run.log = [
      { sceneId: "s4-open", year: "S4", choiceId: "a", title: { zh: "中四", en: "S4" }, choice: { zh: "選項", en: "Choice" }, effects: { wellbeing: 6 } },
    ];
    run.flags.s4focus = "people";
    const html = renderToStaticMarkup(createElement(HappiestYear, { run, lang: "zh" }));
    assert.match(html, /中四/);
    assert.match(html, /黏在一起/);
    assert.match(html, /\/10/);
  });

  it("loads old saves that lack effects and still computes a happiest year", () => {
    const run = createRun("standard", "zh", { nickname: "家琪", interests: ["science", "language"] });
    const legacy = JSON.parse(JSON.stringify(run)) as Record<string, unknown>;
    legacy.log = [
      { sceneId: "s1-arrival", year: "S1", choiceId: "a", title: { zh: "中一", en: "S1" }, choice: { zh: "選項", en: "Choice" } },
      { sceneId: "s2-clubs", year: "S2", choiceId: "b", title: { zh: "中二", en: "S2" }, choice: { zh: "選項", en: "Choice" } },
    ];
    const parsed = parseRun(legacy);
    assert.ok(parsed);
    assert.equal(validateLogEffects(parsed), true);
    assert.ok(happiestYear(parsed));
  });

  it("gives a caption for every game year", () => {
    const flags = defaultFlags();
    for (const year of ["S1", "S2", "S3", "S4", "S5", "S6", "life"] as const) {
      const caption = yearCaption(year, flags);
      assert.ok(caption.zh.length > 0, year);
      assert.ok(caption.en.length > 0, year);
      assert.equal(caption.zh.includes("排名"), false, year);
      assert.equal(caption.en.includes("rank"), false, year);
    }
  });
});
