import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { copy } from "@/content/copy";
import { endingView, offerView } from "@/content/endings";
import { PROGRAMMES, programmeById } from "@/content/programmes";
import { EXTRA_SCENE_IDS } from "@/content/decisions";
import { LIFE_PLAYLIST, PLAYLIST, SCENES, sceneById } from "@/content/scenes";
import { ABILITY_SCENE_IDS } from "@/content/ability-scenes";
import {
  abilityDeltaLine,
  applyAbilityDelta,
  CORE_SUBJECTS,
  ELECTIVES,
  electiveDilemmas,
  PRESETS,
  startAbilities,
  SUBJECT_IDS,
} from "@/content/subjects";
import {
  abilityLift,
  advancePhase,
  applyChoice,
  applyEffects,
  choiceIds,
  confirmElectives,
  confirmRanking,
  createRun,
  programmeScore,
  rankTarget,
  sceneView,
  defaultFlags,
  START_STATS,
} from "@/lib/engine";
import { parseRun } from "@/lib/storage";
import type { Abilities, ElectiveId, Lang, MathModule, Pace, RunState, SceneCtx } from "@/lib/types";

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
    abilities: startAbilities(),
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
    {
      ...base,
      electives: ["chem", "econ", "geog"],
      abilities: { ...startAbilities(), chem: 3, math: 3, va: 6, phy: 8, eng: 9 },
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
    if (++guard > 120) throw new Error(`loop at ${run.phase} ${run.sceneId}`);
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
    assert.equal(EXTRA_SCENE_IDS.length, 50);
    assert.equal(new Set(EXTRA_SCENE_IDS).size, 50);
    for (const id of EXTRA_SCENE_IDS) assert.ok(sceneById(id), id);
    const listed = [...PLAYLIST, ...LIFE_PLAYLIST].flatMap((beat) => (beat.kind === "scene" ? [beat.id] : []));
    for (const id of EXTRA_SCENE_IDS) assert.ok(listed.includes(id), id);
    assert.equal(LIFE_PLAYLIST.length, 8);
    assert.ok(EXTRA_SCENE_IDS.filter((id) => id.startsWith("s1-") || id.startsWith("s2-")).length >= 12);
    assert.ok(EXTRA_SCENE_IDS.filter((id) => id.startsWith("s3")).length >= 10);
    assert.ok(EXTRA_SCENE_IDS.filter((id) => id.startsWith("s4-") || id.startsWith("s5-")).length >= 12);
    assert.ok(EXTRA_SCENE_IDS.filter((id) => id.startsWith("s6-")).length >= 8);
    assert.ok(EXTRA_SCENE_IDS.filter((id) => id.startsWith("life-")).length >= 8);
    for (const id of EXTRA_SCENE_IDS) {
      const count = sceneById(id)?.choices(sampleContexts()[0]).length ?? 0;
      assert.ok(count >= 2 && count <= 4, `${id} has ${count} choices`);
    }
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
    const bags = [copy, CORE_SUBJECTS, ELECTIVES, PRESETS, PROGRAMMES, SCENES];
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
      if (pace === "standard") {
        let life = advancePhase(run);
        assert.equal(life.sceneId, "life-orientation");
        let steps = 0;
        while (life.phase === "scene") {
          life = applyChoice(life, choiceIds(life)[0]);
          if (++steps > 20) throw new Error("life loop");
        }
        assert.equal(steps, 8);
        assert.equal(life.phase, "epilogue");
        assert.equal(BAD_ZH.test(endingView(life, "zh").life), false);
      } else {
        assert.equal(advancePhase(run).phase, "epilogue");
      }
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

  it("tracks subject abilities from 1 to 10 and shows the feedback line", () => {
    const start = startAbilities();
    assert.equal(SUBJECT_IDS.length, 15);
    assert.deepEqual(Object.values(start), Array(15).fill(5));
    const topped = applyAbilityDelta({ ...start, math: 10 }, { math: 2 });
    const floored = applyAbilityDelta({ ...start, pe: 1 }, { pe: -2 });
    assert.equal(topped.math, 10);
    assert.equal(floored.pe, 1);
    let run = createRun("standard", "zh");
    run = { ...run, sceneId: "s1-ab-olympiad", phase: "scene" };
    run = applyChoice(run, "s1-ab-olympiad-go");
    assert.equal(run.abilities.math, 6);
    assert.equal(abilityDeltaLine(run.lastAbilities, "zh"), "數學能力 +1");
    run = { ...run, sceneId: "s2-ab-profit", phase: "scene" };
    run = applyChoice(run, "s2-ab-profit-work");
    assert.equal(run.abilities.math, 8);
    assert.equal(run.abilities.bafs, 6);
    assert.equal(abilityDeltaLine(run.lastAbilities, "zh"), "數學能力 +2、BAFS能力 +1");
    const ordered = PLAYLIST.flatMap((beat) => (beat.kind === "scene" ? [beat.id] : []));
    const positions = ABILITY_SCENE_IDS.map((id) => ordered.indexOf(id));
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
    assert.ok(positions[0] > ordered.indexOf("s1-arrival"));
    const electiveAt = PLAYLIST.findIndex((beat) => beat.kind === "electives");
    assert.ok(positions[positions.length - 1] < electiveAt);
    for (const id of ABILITY_SCENE_IDS) {
      const scene = sceneById(id);
      assert.equal(scene?.choices(sampleContexts()[0]).length, 2);
      assert.equal(PLAYLIST.find((beat) => beat.kind === "scene" && beat.id === id && beat.pace === "all"), undefined);
    }
    assert.equal(ABILITY_SCENE_IDS.length, 16);
  });

  it("warns on confirm and still accepts the mix", () => {
    const base = startAbilities();
    const weakChem: Abilities = { ...base, chem: 4 };
    const gap = electiveDilemmas(weakChem, ["chem", "hist", "geog"]);
    assert.deepEqual(gap.map((item) => item.id), ["gap-chem"]);
    assert.equal(gap[0]?.text.zh, "化學呢科你而家一般啲 — 之後跟堂可能會吃力少少。你仲想堅持，定係想再諗吓？");

    const two = electiveDilemmas(base, ["phy", "chem", "geog"]);
    assert.equal(two[0]?.text.zh, "你揀咗兩科科學。實驗同溫習會忙啲，時間要分配得好。");
    const three = electiveDilemmas(base, ["phy", "chem", "bio"]);
    assert.match(three[0]?.text.zh ?? "", /三科科學/);

    const biz = electiveDilemmas({ ...base, math: 4 }, ["econ", "bafs", "geog"]);
    assert.equal(biz.find((item) => item.id === "biz-math")?.text.zh, "經濟／BAFS 好多時要用到數學。你數學暫時弱啲，計數題要預多啲時間。");

    const art = electiveDilemmas({ ...base, va: 6 }, ["econ", "bafs", "geog"]);
    assert.equal(art.find((item) => item.id === "art-path")?.text.zh, "你視藝唔錯，不過而家組合偏第二邊。家長可能會問出路，你準備點同佢哋傾？");
    assert.equal(electiveDilemmas({ ...base, va: 6 }, ["va", "ict", "econ"]).some((item) => item.id === "art-path"), false);

    const both = electiveDilemmas({ ...base, math: 7, phy: 7 }, ["hist", "geog", "va"]);
    assert.equal(both.find((item) => item.id === "unused-strength")?.text.zh, "你數學／物理其實幾穩，但未入到組合。想唔想再考慮吓理科？");
    const phyOnly = electiveDilemmas({ ...base, phy: 8 }, ["chem", "bio", "geog"]);
    assert.match(phyOnly.find((item) => item.id === "unused-strength")?.text.zh ?? "", /^你物理其實幾穩/);
    assert.equal(electiveDilemmas({ ...base, math: 9, phy: 9 }, ["phy", "chem", "bio"]).some((item) => item.id === "unused-strength"), false);
    assert.equal(electiveDilemmas(base, ["econ", "geog", "hist"]).length, 0);

    let run = createRun("fast", "zh");
    while (run.phase === "scene") run = applyChoice(run, choiceIds(run)[0]);
    assert.equal(run.phase, "electives");
    run = confirmElectives(run, ["chem", "hist", "geog"], "none");
    assert.equal(run.phase, "scene");
    assert.deepEqual(run.electives, ["chem", "hist", "geog"]);
  });

  it("keeps a neutral ability board from changing the game index", () => {
    const run = createRun("fast", "zh");
    run.electives = ["phy", "chem", "bio"];
    run.mathModule = "m2";
    const programme = programmeById("monghoi-phy");
    assert.ok(programme);
    const neutral = programmeScore(run, programme);
    assert.equal(abilityLift(run, programme), 0);
    const strong = programmeScore(
      { ...run, abilities: { ...run.abilities, phy: 10, math: 8, chi: 7, eng: 7 } },
      programme,
    );
    assert.ok(strong > neutral);
    assert.equal(parseRun({ ...JSON.parse(JSON.stringify(run)), abilities: undefined, lastAbilities: undefined })?.abilities.math, 5);
  });
});

function sceneViewAt(run: RunState, sceneId: string): string {
  const replay = { ...run, phase: "scene" as const, sceneId };
  return sceneView(replay)?.body.zh ?? "";
}
