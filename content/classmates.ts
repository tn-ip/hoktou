import { line } from "@/lib/text";
import type {
  Classmate,
  HousingId,
  InterestId,
  LeanId,
  LocaleText,
  MoiId,
  OfferKind,
  Outlook,
  PathwayBand,
  RunState,
} from "@/lib/types";

export const PATHWAY_BANDS: PathwayBand[] = ["work", "subdegree", "stretch", "likely"];

export const cohortHeading = line("同年九月", "Same September");

export const cohortNote = line("四位虛構同學，和你一起走進望潮。", "Four fictional classmates, entering Mongchiu with you.");

export const lineupHeading = line("五條路", "Five roads");

export const lineupOrder = line(
  "下面由工作與證書排到學位尚有餘地。斜度不同，人沒有高下。",
  "Below, the roads run from work and a certificate to a degree with some room. The slopes differ. The people do not.",
);

export const lineupClosing = line(
  "「沒有人能選自己在哪一區小學畢業。」你們同一年九月走進望潮。遊戲把路並排，是為了看見斜度，不是為了分高下。",
  "“Nobody gets to choose the district where they finish primary school.” You entered Mongchiu the same September. The game lines the roads up so the slope is visible. It is not a ranking of who tried.",
);

export const youLabel = line("你", "You");

export const HOUSING_LABEL: Record<HousingId, LocaleText> = {
  public: line("公屋", "Public rental"),
  hos: line("居屋", "Home ownership"),
  private: line("私樓", "Private flat"),
  village: line("新界村屋", "Village house"),
};

export const MOI_LABEL: Record<MoiId, LocaleText> = {
  cmi: line("小學中文", "Chinese primary"),
  emi: line("小學英文", "English primary"),
};

export const LEAN_LABEL: Record<LeanId, LocaleText> = {
  science: line("理科", "Science"),
  arts: line("文科", "Arts"),
  business: line("商科", "Business"),
  sport: line("體育", "Sport"),
  service: line("服務", "Service"),
};

export const BAND_LABEL: Record<PathwayBand, LocaleText> = {
  work: line("工作與證書", "Work and a certificate"),
  subdegree: line("副學位", "Associate degree"),
  stretch: line("學位，剛夠", "A degree, just enough"),
  likely: line("學位，尚有餘地", "A degree, with some room"),
};

export const CLASSMATES: Classmate[] = [
  {
    id: "cheung-long",
    name: line("張朗", "Cheung Long"),
    housing: "hos",
    moi: "emi",
    lean: "sport",
    pathway: "work",
    personality: line("小息會把多出的蛋糕分給鄰座。", "At recess, the extra piece of cake goes to the next seat."),
    electives: line("選修視藝、體育、地理。", "Electives: visual arts, PE, geography."),
    listNote: line("志願表很短，工作也寫在上面。", "The list is short, and work is written on it too."),
    outcome: line("遊戲裡沒有學位取錄。海傍全職，晚上讀證書。", "No degree offer in the game. Full-time on the waterfront, and a certificate at night."),
  },
  {
    id: "yuen-suk",
    name: line("阮淑", "Yuen Suk"),
    housing: "village",
    moi: "cmi",
    lean: "service",
    pathway: "work",
    personality: line("放學先去老人中心，書包放在櫃邊。", "After school, the elderly centre comes first. The bag sits by the cupboard."),
    electives: line("選修中史、歷史、體育。", "Electives: Chinese history, history, PE."),
    listNote: line("名單未排滿，先問家裡的班次。", "The list is not full yet. The family shift is asked about first."),
    outcome: line("遊戲裡走到全職，晚上仍翻中學筆記。", "The game reaches full-time work. The school notes are still opened at night."),
  },
  {
    id: "ma-hei",
    name: line("馬希", "Ma Hei"),
    housing: "private",
    moi: "cmi",
    lean: "arts",
    pathway: "work",
    personality: line("畫畫時會把橡皮擦得很乾淨。", "When drawing, the eraser is used until the page is clean."),
    electives: line("選修視藝、資訊及通訊科技、地理。", "Electives: visual arts, ICT, geography."),
    listNote: line("第一志願是設計，後面留了工作。", "Design is first. Work is left further down."),
    outcome: line("設計的門檻這次未到。先在小店做全職。", "The design threshold is missed this run. Full-time work at a small shop comes first."),
  },
  {
    id: "kwok-maan",
    name: line("郭漫", "Kwok Maan"),
    housing: "private",
    moi: "cmi",
    lean: "arts",
    pathway: "subdegree",
    personality: line("圖書館的窗邊，永遠是同一張椅。", "The same chair, by the library window."),
    electives: line("選修中史、歷史、視藝。", "Electives: Chinese history, history, visual arts."),
    listNote: line("學位放前面，副學位留在後面。", "Degrees sit at the top. An associate place is kept further down."),
    outcome: line("學位未到。遊戲補上一席文化與傳意。", "The degrees miss. The game adds a place in culture and communication."),
  },
  {
    id: "yip-tsing",
    name: line("葉晴", "Yip Tsing"),
    housing: "public",
    moi: "emi",
    lean: "business",
    pathway: "subdegree",
    personality: line("會把零用記在電話備忘錄。", "Pocket money is written into a phone note."),
    electives: line("選修經濟、企業會計與財務、地理。", "Electives: economics, BAFS, geography."),
    listNote: line("商科志願為主，副學位放在最後。", "Business courses lead the list. An associate place is last."),
    outcome: line("學位的門檻未過。商業副學位先接住。", "The degree thresholds are not met. A business associate place catches this run."),
  },
  {
    id: "sham-pak",
    name: line("岑柏", "Sham Pak"),
    housing: "hos",
    moi: "cmi",
    lean: "science",
    pathway: "subdegree",
    personality: line("實驗前會把步驟抄多一遍。", "Before a lab, the steps are copied out once more."),
    electives: line("選修生物、化學、地理。", "Electives: biology, chemistry, geography."),
    listNote: line("科學館相關的副學位也排了進去。", "An associate place tied to the science museum is on the list too."),
    outcome: line("學士課程未到門檻。科學副學位取錄。", "The bachelor courses miss their thresholds. A science associate place offers."),
  },
  {
    id: "chow-kei",
    name: line("周祈", "Chow Kei"),
    housing: "public",
    moi: "emi",
    lean: "science",
    pathway: "stretch",
    personality: line("問老師之前，先把問題寫在掌心。", "The question is written on a palm before it is asked."),
    electives: line("選修物理、化學、生物。", "Electives: physics, chemistry, biology."),
    listNote: line("第一志願的門檻很高，仍放在最上。", "The first choice has a high threshold, and stays at the top."),
    outcome: line("學位取錄，指數剛過那道門檻。", "A degree offers. The index has only just cleared the threshold."),
  },
  {
    id: "tang-hau",
    name: line("鄧巧", "Tang Hau"),
    housing: "village",
    moi: "cmi",
    lean: "business",
    pathway: "stretch",
    personality: line("周末在家裡的店看收銀機。", "Weekends are spent by the till in the family shop."),
    electives: line("選修經濟、企業會計與財務、資訊及通訊科技。", "Electives: economics, BAFS, ICT."),
    listNote: line("會計放第一，也留了較穩的商科。", "Accounting is first, with a steadier business course kept below."),
    outcome: line("商科學位取錄，餘地不多。", "A business degree offers, with little room to spare."),
  },
  {
    id: "fung-lai",
    name: line("馮禮", "Fung Lai"),
    housing: "private",
    moi: "emi",
    lean: "sport",
    pathway: "stretch",
    personality: line("練波之後，仍會趕第一節的功課。", "After training, the first lesson's homework is still done."),
    electives: line("選修體育、生物、地理。", "Electives: PE, biology, geography."),
    listNote: line("教育課程放前，科學放在後面。", "Education sits higher. Science is further down."),
    outcome: line("教育學位取錄，剛好踏上門檻。", "An education degree offers, just over the line."),
  },
  {
    id: "leung-yau",
    name: line("梁悠", "Leung Yau"),
    housing: "village",
    moi: "cmi",
    lean: "business",
    pathway: "likely",
    personality: line("溫習時會煮一碗麵給弟弟。", "Revision comes with a bowl of noodles for a younger brother."),
    electives: line("選修經濟、企業會計與財務、數學延伸。", "Electives: economics, BAFS, and extended maths."),
    listNote: line("名單和選修對得上，第一個不太險。", "The list matches the electives. The first choice is not a long shot."),
    outcome: line("商科學位取錄，門檻之上還有餘地。", "A business degree offers, with room above the threshold."),
  },
  {
    id: "choi-hang",
    name: line("蔡行", "Choi Hang"),
    housing: "public",
    moi: "emi",
    lean: "science",
    pathway: "likely",
    personality: line("英文預告會先在走廊小聲讀一次。", "An English presentation is rehearsed quietly in the corridor first."),
    electives: line("選修物理、化學、資訊及通訊科技。", "Electives: physics, chemistry, ICT."),
    listNote: line("工程放第一，條件和選修相符。", "Engineering is first. The rule matches the electives."),
    outcome: line("工程學位取錄，指數高過門檻一截。", "An engineering degree offers. The index sits a step above the threshold."),
  },
  {
    id: "kong-choi",
    name: line("江采", "Kong Choi"),
    housing: "hos",
    moi: "cmi",
    lean: "service",
    pathway: "likely",
    personality: line("班上有人缺席，會把筆記影一份。", "If someone is absent, a copy of the notes appears."),
    electives: line("選修地理、歷史、生物。", "Electives: geography, history, biology."),
    listNote: line("社會政策放前，教育留在第二。", "Social policy is first. Education is second."),
    outcome: line("社會政策學位取錄，還有一點餘地。", "A social-policy degree offers, with a little room left."),
  },
];

const BY_ID = new Map(CLASSMATES.map((mate) => [mate.id, mate]));

export function classmateById(id: string): Classmate | undefined {
  return BY_ID.get(id);
}

export type CohortBeat = "arrival" | "electives" | "list" | "offer";

export function cohortBeat(run: Pick<RunState, "phase" | "electives" | "offerKind">): CohortBeat {
  if (run.phase === "offer" || run.phase === "epilogue" || run.phase === "summary" || run.offerKind !== "none") return "offer";
  if (run.phase === "ranking") return "list";
  if (run.electives.length === 3 && run.phase !== "electives") return "electives";
  return "arrival";
}

export function classmateStatus(mate: Classmate, beat: CohortBeat): LocaleText {
  if (beat === "electives") return mate.electives;
  if (beat === "list") return mate.listNote;
  if (beat === "offer") return mate.outcome;
  return mate.personality;
}

function mix(seed: number, salt: number): number {
  let hash = seed ^ Math.imul(salt, 0x9e3779b1);
  hash = Math.imul(hash ^ (hash >>> 16), 0x7feb352d);
  hash = Math.imul(hash ^ (hash >>> 15), 0x846ca68b);
  return (hash ^ (hash >>> 16)) >>> 0;
}

export function cohortSeed(nickname: string, interests: readonly InterestId[]): number {
  const text = `${nickname.trim()}\n${interests.join(",")}`;
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function pickClassmates(nickname: string, interests: readonly InterestId[]): string[] {
  const seed = cohortSeed(nickname, interests);
  return PATHWAY_BANDS.map((band, index) => {
    const group = CLASSMATES.filter((mate) => mate.pathway === band);
    return group[mix(seed, index + 1) % group.length].id;
  });
}

export function classmatesOf(ids: readonly string[]): Classmate[] {
  return ids.flatMap((id) => {
    const mate = classmateById(id);
    return mate ? [mate] : [];
  });
}

export function playerBand(offerKind: OfferKind, outlook: Outlook | null): PathwayBand {
  if (offerKind === "subdegree") return "subdegree";
  if (offerKind === "degree") return outlook === "likely" ? "likely" : "stretch";
  return "work";
}

export const cohortCatalogue = {
  heading: cohortHeading,
  note: cohortNote,
  lineupHeading,
  lineupOrder,
  lineupClosing,
  youLabel,
  housing: HOUSING_LABEL,
  moi: MOI_LABEL,
  lean: LEAN_LABEL,
  bands: BAND_LABEL,
  classmates: CLASSMATES,
};
