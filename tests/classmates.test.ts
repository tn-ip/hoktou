import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "node:test";
import {
  CLASSMATES,
  classmateStatus,
  cohortBeat,
  PATHWAY_BANDS,
  pickClassmates,
} from "@/content/classmates";
import { CohortMargin, PathwayLineup } from "@/components/widgets";
import { programmeById } from "@/content/programmes";
import { pathwayRows } from "@/lib/cohort";
import { createRun, programmeScore } from "@/lib/engine";
import { parseRun } from "@/lib/storage";
import type { PathwayBand } from "@/lib/types";

describe("same-September classmates", () => {
  it("picks one classmate from each pathway, stably", () => {
    const first = pickClassmates("  家琪  ", ["science", "language"]);
    const again = pickClassmates("家琪", ["science", "language"]);
    assert.deepEqual(first, again);
    assert.equal(new Set(first).size, 4);
    const bands = first.map((id) => CLASSMATES.find((mate) => mate.id === id)?.pathway);
    assert.deepEqual(bands, [...PATHWAY_BANDS]);
    const other = pickClassmates("家琪", ["language", "science"]);
    assert.notDeepEqual(first, other);
    const named = createRun("standard", "zh", { nickname: "  家琪 ", interests: ["science", "science", "language"] });
    const plain = createRun("standard", "zh", { nickname: "家琪", interests: ["science", "language"] });
    assert.deepEqual(named.classmates, plain.classmates);
    assert.equal(named.version, 3);
  });

  it("does not tie housing to the hardest road", () => {
    assert.ok(CLASSMATES.some((mate) => mate.housing === "public" && mate.pathway !== "work"));
    assert.ok(CLASSMATES.some((mate) => mate.housing === "private" && (mate.pathway === "work" || mate.pathway === "subdegree")));
    for (const band of PATHWAY_BANDS) {
      assert.equal(CLASSMATES.filter((mate) => mate.pathway === band).length, 3);
    }
  });

  it("updates the margin line at electives, the list, and the offer", () => {
    const run = createRun("standard", "zh", { nickname: "家琪", interests: ["art", "service"] });
    assert.equal(cohortBeat(run), "arrival");
    const mate = CLASSMATES.find((item) => item.id === run.classmates[0]);
    assert.ok(mate);
    assert.equal(classmateStatus(mate, "arrival"), mate.personality);
    const chosen = { ...run, electives: ["phy", "chem", "bio"] as const, phase: "scene" as const, sceneId: "s4-open" };
    assert.equal(cohortBeat(chosen), "electives");
    assert.equal(classmateStatus(mate, "electives"), mate.electives);
    assert.equal(cohortBeat({ ...chosen, phase: "ranking" }), "list");
    const offered = { ...chosen, phase: "offer" as const, offerKind: "degree" as const, offerId: "monghoi-phy" };
    assert.equal(cohortBeat(offered), "offer");
    assert.notEqual(classmateStatus(mate, "offer").zh, mate.personality.zh);
    const html = renderToStaticMarkup(createElement(CohortMargin, { run, lang: "zh" }));
    assert.match(html, /data-testid="classmates"/);
    assert.match(html, /data-beat="arrival"/);
    assert.match(html, /同年九月/);
    assert.match(html, new RegExp(mate.personality.zh));
    const later = renderToStaticMarkup(createElement(CohortMargin, { run: offered, lang: "en" }));
    assert.match(later, /data-beat="offer"/);
    assert.match(later, new RegExp(mate.name.en));
  });

  it("lines the player up with the four roads, hardest band first", () => {
    const base = createRun("fast", "en", { nickname: "Ka-ki", interests: ["science", "computer"] });
    const work = {
      ...base,
      phase: "summary" as const,
      electives: ["va", "pe", "geog"] as const,
      offerKind: "work" as const,
      offerId: null,
    };
    const rows = pathwayRows(work, "zh");
    assert.deepEqual(
      rows.map((row) => row.band),
      ["work", "work", "subdegree", "stretch", "likely"],
    );
    const you = rows.filter((row) => row.you);
    assert.equal(you.length, 1);
    assert.equal(you[0]?.name, "Ka-ki");
    assert.match(you[0]?.meta ?? "", /視覺藝術/);
    assert.ok(rows.findIndex((row) => row.you) > rows.findIndex((row) => !row.you && row.band === "work"));
    const html = renderToStaticMarkup(createElement(PathwayLineup, { run: work, lang: "zh", closing: true }));
    assert.match(html, /data-testid="lineup-you"/);
    assert.match(html, /沒有人能選自己在哪一區小學畢業/);
    assert.equal(html.includes("outlived"), false);
    const degree = {
      ...base,
      electives: ["phy", "chem", "ict"] as const,
      mathModule: "m2" as const,
      offerKind: "degree" as const,
      offerId: "harbour-eng",
      stats: { academic: 96, curiosity: 90, wellbeing: 80, social: 80 },
      abilities: { ...base.abilities, phy: 9, chem: 9, ict: 9, math: 9, eng: 8, chi: 8 },
    };
    const likely = pathwayRows(degree, "en");
    const player = likely.find((row) => row.you);
    assert.ok(player);
    const programme = programmeById("harbour-eng");
    assert.ok(programme);
    const score = programmeScore(degree, programme);
    const band: PathwayBand = score >= programme.threshold + 6 ? "likely" : "stretch";
    assert.equal(player.band, band);
    assert.equal(programmeScore(work, programme), programmeScore({ ...work, classmates: [...work.classmates].reverse() }, programme));
  });

  it("fills classmates when an older save has none", () => {
    const current = createRun("standard", "zh", { nickname: "家琪", interests: ["humanities", "art"] });
    current.reflections = [{ id: "s1", text: "一句", skipped: false }];
    const legacy = JSON.parse(JSON.stringify(current)) as Record<string, unknown>;
    legacy.version = 2;
    delete legacy.classmates;
    const parsed = parseRun(legacy);
    assert.equal(parsed?.version, 3);
    assert.deepEqual(parsed?.classmates, pickClassmates("家琪", ["humanities", "art"]));
    assert.equal(parsed?.reflections[0]?.text, "一句");
    assert.equal(parsed?.pause, null);
    const broken = { ...legacy, version: 3, classmates: ["nope", "nope", "nope", "nope"] };
    assert.deepEqual(parseRun(broken)?.classmates, pickClassmates("家琪", ["humanities", "art"]));
  });
});
