import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { copy } from "@/content/copy";
import { endingView, offerView } from "@/content/endings";
import { PROGRAMMES } from "@/content/programmes";
import { PLAYLIST, SCENES, sceneById } from "@/content/scenes";
import { ELECTIVES, PRESETS } from "@/content/subjects";
import {
  applyChoice,
  applyEffects,
  choiceIds,
  confirmElectives,
  confirmRanking,
  createRun,
  rankTarget,
  sceneView,
  defaultFlags,
  START_STATS,
} from "@/lib/engine";
import { parseRun } from "@/lib/storage";
import type { ElectiveId, Lang, MathModule, Pace, RunState, SceneCtx } from "@/lib/types";

const BAD_ZH = /[国学门东车这对后发经时个为来还么样头电点问书长万与无现课业选历实习级语开关动见贝页风飞马鸟鱼麦黄广产义云优会仅从众]/u;

function walkLocale(value: unknown, visit: (text: string, lang: Lang, path: string) => void, path = "root") {
  if (!value || typeof value !== "object") return;
  if (typeof value === "function") return;
  const record = value as Record<string, unknown>;
  if (typeof record.zh === "string" && typeof record.en === "string" && Object.keys(record).every((key) => key === "zh" || key === "en")) {
    visit(record.zh, "zh", path);
    visit(record.en, "en", path);
    return;
  }
  for (const [key, child] of Object.entries(record)) {
    if (typeof child === "function") continue;
    walkLocale(child, visit, `${path}.${key}`);
  }
}

function sampleContexts(): SceneCtx[] {
  const base: SceneCtx = {
    stats: { ...START_STATS },
    electives: [],
    mathModule: "none",
    flags: defaultFlags(),
    pace: "standard",
  };
  const mixes: ElectiveId[][] = [
    ["phy", "chem", "bio"],
    ["econ", "bafs", "geog"],
    ["chist", "hist", "geog"],
    ["va", "ict", "econ"],
    ["ict", "geog", "hist"],
    ["va", "hist", "geog"],
  ];
  return [
    base,
    ...mixes.map((electives) => ({
      ...base,
      electives,
      mathModule: "m2" as MathModule,
      flags: { ...defaultFlags(), cca: "science" as const, grindExam: true, heavyTutor: true },
      stats: { academic: 30, curiosity: 30, wellbeing: 30, social: 30 },
    })),
    {
      ...base,
      electives: ["phy", "chem", "bio"],
      stats: { academic: 80, curiosity: 80, wellbeing: 80, social: 80 },
    },
  ];
}

function play(
  pace: Pace,
  pick: (sceneId: string, ids: string[]) => string,
  electives: [ElectiveId, ElectiveId, ElectiveId],
  math: MathModule,
  ranking: string[],
): RunState {
  let run = createRun(pace, "zh");
  let guard = 0;
  while (run.phase === "scene" || run.phase === "electives" || run.phase === "ranking") {
    if (run.phase === "electives") run = confirmElectives(run, electives, math);
    else if (run.phase === "ranking") run = confirmRanking(run, ranking.slice(0, rankTarget(pace)));
    else run = applyChoice(run, pick(run.sceneId, choiceIds(run)));
    if (++guard > 40) throw new Error(`loop at ${run.phase} ${run.sceneId}`);
  }
  return run;
}

describe("hoktou loop", () => {
  it("keeps the playlist and scenes aligned", () => {
    const ids = PLAYLIST.filter((beat) => beat.kind === "scene").map((beat) => (beat.kind === "scene" ? beat.id : ""));
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) assert.ok(sceneById(id), id);
    assert.equal(PLAYLIST.filter((beat) => beat.kind === "electives").length, 1);
    const fast = ["s1-arrival", "s2-clubs", "s3-crossroad", "s4-open", "s5-heat", "s5-showcase", "s6-mock"];
    const fastIds = PLAYLIST.filter((beat) => beat.kind === "scene" && beat.pace === "all").map((beat) =>
      beat.kind === "scene" ? beat.id : "",
    );
    assert.deepEqual(fastIds, fast);
  });

  it("clamps stats", () => {
    const stats = applyEffects(
      { academic: 98, curiosity: 3, wellbeing: 1, social: 100 },
      { academic: 10, curiosity: -8, social: 5 },
    );
    assert.deepEqual(stats, { academic: 100, curiosity: 0, wellbeing: 1, social: 100 });
  });

  it("rejects a bad save and keeps a good one", () => {
    assert.equal(parseRun({ version: 2 }), null);
    assert.equal(parseRun("nope"), null);
    const run = createRun("fast", "en");
    const parsed = parseRun(JSON.parse(JSON.stringify(run)));
    assert.equal(parsed?.sceneId, "s1-arrival");
    assert.equal(parsed?.lang, "en");
  });

  it("writes traditional Chinese and English for the static catalogue", () => {
    const bags = [copy, ELECTIVES, PRESETS, PROGRAMMES, SCENES];
    for (const bag of bags) {
      walkLocale(bag, (text, lang, path) => {
        assert.ok(text.trim().length > 0, path);
        if (lang === "zh") assert.equal(BAD_ZH.test(text), false, `${path}: ${text}`);
      });
    }
  });

  it("writes traditional Chinese on every dynamic card", () => {
    for (const scene of SCENES) {
      for (const ctx of sampleContexts()) {
        const body = scene.body(ctx);
        const title = typeof scene.title === "function" ? scene.title(ctx) : scene.title;
        for (const text of [body, title]) {
          assert.equal(BAD_ZH.test(text.zh), false, `${scene.id} ${text.zh}`);
          assert.ok(text.en.trim().length > 1);
        }
        for (const choice of scene.choices(ctx)) {
          assert.equal(BAD_ZH.test(choice.label.zh), false, choice.label.zh);
          assert.equal(BAD_ZH.test(choice.detail.zh), false, choice.detail.zh);
          assert.ok(choice.label.en.trim().length > 1);
        }
      }
    }
  });

  it("plays both lengths through to an offer", () => {
    for (const pace of ["fast", "standard"] as const) {
      const run = play(
        pace,
        (_scene, ids) => ids[0],
        ["phy", "chem", "bio"],
        "m2",
        ["monghoi-med", "monghoi-phy", "harbour-eng", "monghoi-chem", "green-teach"],
      );
      assert.equal(run.phase, "offer");
      assert.equal(run.log.some((entry) => entry.sceneId === "s1-quiz"), pace === "standard");
      assert.equal(run.log.some((entry) => entry.sceneId === "s3-voices"), pace === "standard");
      assert.ok(run.log.some((entry) => entry.choiceId === "electives"));
      assert.ok(run.log.findIndex((entry) => entry.sceneId === "s4-open") > run.log.findIndex((entry) => entry.choiceId === "electives"));
      const offer = offerView(run, "zh");
      const ending = endingView(run, "en");
      assert.ok(offer.headline.length > 0);
      assert.ok(ending.work.length > 20);
      assert.equal(BAD_ZH.test(offer.paragraphs.join("")), false);
      assert.equal(BAD_ZH.test(endingView(run, "zh").life), false);
    }
  });

  it("lets subject choice change the S5 card and the offer", () => {
    const science = play(
      "fast",
      (scene, ids) => {
        const preferred: Record<string, string> = {
          "s1-arrival": "s1-notes",
          "s2-clubs": "s2-science",
          "s3-crossroad": "s3-science-booth",
          "s4-open": "s4-balance",
          "s5-heat": "s5-activity",
          "s5-showcase": "s5-commit",
          "s6-mock": "s6-rest",
        };
        return preferred[scene] ?? ids[0];
      },
      ["phy", "chem", "bio"],
      "m2",
      ["harbour-design", "monghoi-phy", "harbour-eng"],
    );
    const scienceCard = sceneViewAt(science, "s5-showcase");
    assert.match(scienceCard, /港灣青少年科學展/);
    assert.equal(science.offerId, "monghoi-phy");
    assert.equal(science.flags.fair, "prize");

    const business = play(
      "fast",
      (scene, ids) => {
        const preferred: Record<string, string> = {
          "s1-arrival": "s1-timetable",
          "s2-clubs": "s2-service",
          "s3-crossroad": "s3-other-booths",
          "s4-open": "s4-balance",
          "s5-heat": "s5-activity",
          "s5-showcase": "s5-commit",
          "s6-mock": "s6-understand",
        };
        return preferred[scene] ?? ids[0];
      },
      ["econ", "bafs", "geog"],
      "m1",
      ["monghoi-med", "lion-bba", "east-acc"],
    );
    assert.match(sceneViewAt(business, "s5-showcase"), /店/);
    assert.equal(business.offerId, "lion-bba");

    const quiet = play(
      "fast",
      (scene, ids) => {
        const preferred: Record<string, string> = {
          "s1-arrival": "s1-rooftop",
          "s2-clubs": "s2-sport",
          "s3-crossroad": "s3-ask-seniors",
          "s4-open": "s4-people",
          "s5-heat": "s5-honest",
          "s5-showcase": "s5-skip",
          "s6-mock": "s6-rest",
        };
        return preferred[scene] ?? ids[0];
      },
      ["va", "hist", "geog"],
      "none",
      ["monghoi-phy", "harbour-eng", "east-acc"],
    );
    assert.equal(quiet.offerId, "waterfront-sub-arts");
    assert.equal(PROGRAMMES.find((item) => item.id === "monghoi-med")?.eligible(quiet), false);

    const restedScience = play(
      "fast",
      (scene, ids) =>
        ({
          "s1-arrival": "s1-notes",
          "s2-clubs": "s2-science",
          "s3-crossroad": "s3-science-booth",
          "s4-open": "s4-balance",
          "s5-heat": "s5-activity",
          "s5-showcase": "s5-commit",
          "s6-mock": "s6-rest",
        })[scene] ?? ids[0],
      ["phy", "chem", "bio"],
      "m2",
      ["monghoi-med", "monghoi-phy", "harbour-eng"],
    );
    assert.equal(restedScience.offerId, "monghoi-med");

    const cram = play(
      "fast",
      (scene, ids) =>
        ({
          "s1-arrival": "s1-notes",
          "s2-clubs": "s2-science",
          "s3-crossroad": "s3-science-booth",
          "s4-open": "s4-study",
          "s5-heat": "s5-tutor",
          "s5-showcase": "s5-commit",
          "s6-mock": "s6-plan",
        })[scene] ?? ids[0],
      ["phy", "chem", "bio"],
      "m2",
      ["monghoi-med", "monghoi-phy", "monghoi-chem"],
    );
    assert.equal(cram.offerId, "monghoi-phy");
    assert.notEqual(cram.flags.fair, "prize");

    const design = play(
      "fast",
      (scene, ids) =>
        ({
          "s1-arrival": "s1-rooftop",
          "s2-clubs": "s2-science",
          "s3-crossroad": "s3-other-booths",
          "s4-open": "s4-people",
          "s5-heat": "s5-activity",
          "s5-showcase": "s5-commit",
          "s6-mock": "s6-rest",
        })[scene] ?? ids[0],
      ["va", "ict", "econ"],
      "none",
      ["harbour-design", "east-media", "lion-bba"],
    );
    assert.match(sceneViewAt(design, "s5-showcase"), /校服/);
    assert.equal(design.offerId, "harbour-design");

    const scatter = play(
      "fast",
      (scene, ids) =>
        ({
          "s1-arrival": "s1-rooftop",
          "s2-clubs": "s2-sport",
          "s3-crossroad": "s3-ask-seniors",
          "s4-open": "s4-people",
          "s5-heat": "s5-honest",
          "s5-showcase": "s5-skip",
          "s6-mock": "s6-rest",
        })[scene] ?? ids[0],
      ["phy", "econ", "va"],
      "none",
      ["monghoi-med", "lion-hist", "east-acc"],
    );
    assert.equal(scatter.offerKind, "work");
    assert.equal(scatter.offerId, null);
    const arts = play(
      "fast",
      (scene, ids) =>
        ({
          "s1-arrival": "s1-timetable",
          "s2-clubs": "s2-service",
          "s3-crossroad": "s3-other-booths",
          "s4-open": "s4-balance",
          "s5-heat": "s5-activity",
          "s5-showcase": "s5-commit",
          "s6-mock": "s6-understand",
        })[scene] ?? ids[0],
      ["chist", "hist", "geog"],
      "none",
      ["lion-hist", "lion-policy", "waterfront-sub-arts"],
    );
    assert.match(sceneViewAt(arts, "s5-showcase"), /口述/);
    assert.equal(arts.offerId, "lion-hist");
  });
});

function sceneViewAt(run: RunState, sceneId: string): string {
  const replay = { ...run, phase: "scene" as const, sceneId };
  return sceneView(replay)?.body.zh ?? "";
}
