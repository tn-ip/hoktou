import {
  BAND_LABEL,
  classmatesOf,
  HOUSING_LABEL,
  LEAN_LABEL,
  MOI_LABEL,
  PATHWAY_BANDS,
  playerBand,
} from "@/content/classmates";
import { offerView } from "@/content/endings";
import { programmeById } from "@/content/programmes";
import { joinElectives } from "@/content/subjects";
import { outlookOf } from "@/lib/engine";
import { tx } from "@/lib/text";
import type { Lang, PathwayBand, RunState } from "@/lib/types";

export type LineupRow = {
  key: string;
  you: boolean;
  name: string;
  meta: string;
  detail: string;
  band: PathwayBand;
};

export function pathwayRows(run: RunState, lang: Lang): LineupRow[] {
  const programme = run.offerId ? programmeById(run.offerId) : undefined;
  const outlook = programme ? outlookOf(run, programme) : null;
  const band = playerBand(run.offerKind, outlook);
  const youName = run.nickname || tx(lang, { zh: "你", en: "You" });
  const rows: LineupRow[] = classmatesOf(run.classmates).map((mate) => ({
    key: mate.id,
    you: false,
    name: tx(lang, mate.name),
    meta: [tx(lang, HOUSING_LABEL[mate.housing]), tx(lang, MOI_LABEL[mate.moi]), tx(lang, LEAN_LABEL[mate.lean])].join(" · "),
    detail: tx(lang, mate.outcome),
    band: mate.pathway,
  }));
  rows.push({
    key: "you",
    you: true,
    name: youName,
    meta: `${joinElectives(run.electives, lang)} · ${tx(lang, BAND_LABEL[band])}`,
    detail: offerView(run, lang).headline,
    band,
  });
  return rows.sort((left, right) => {
    const byBand = PATHWAY_BANDS.indexOf(left.band) - PATHWAY_BANDS.indexOf(right.band);
    if (byBand !== 0) return byBand;
    return Number(left.you) - Number(right.you);
  });
}
