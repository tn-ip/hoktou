import type {
  CareerId,
  ElectiveId,
  LocaleText,
  MathModule,
  RunState,
  Stats,
} from "@/lib/types";
import { line } from "@/lib/text";

export type Boost =
  | "science"
  | "medicine"
  | "engineering"
  | "design"
  | "business"
  | "policy"
  | "humanities"
  | "teaching"
  | "accounting"
  | "media";

export type Programme = {
  id: string;
  institution: LocaleText;
  name: LocaleText;
  blurb: LocaleText;
  requirement: LocaleText;
  threshold: number;
  tier: "degree" | "subdegree";
  weights: Stats;
  electives: ElectiveId[];
  math?: Array<Exclude<MathModule, "none">>;
  matchEach: number;
  boost: Boost;
  career: CareerId;
  eligible: (run: Pick<RunState, "electives" | "mathModule">) => boolean;
  adjust?: (run: Pick<RunState, "stats">) => number;
};

const has = (run: Pick<RunState, "electives">, id: ElectiveId) => run.electives.includes(id);
const any = (run: Pick<RunState, "electives">, ids: ElectiveId[]) => ids.some((id) => has(run, id));

export const PROGRAMMES: Programme[] = [
  {
    id: "monghoi-phy",
    institution: line("望海大學", "Monghoi University"),
    name: line("物理與地球觀測", "Physics and Earth observation"),
    blurb: line("由課堂物理走到海岸同大氣的數據。", "From classroom physics toward coastal and atmospheric data."),
    requirement: line("物理", "Physics"),
    threshold: 80,
    tier: "degree",
    weights: { academic: 0.48, curiosity: 0.28, wellbeing: 0.12, social: 0.12 },
    electives: ["phy"],
    math: ["m2"],
    matchEach: 8,
    boost: "science",
    career: "research",
    eligible: (run) => has(run, "phy"),
  },
  {
    id: "monghoi-chem",
    institution: line("望海大學", "Monghoi University"),
    name: line("化學", "Chemistry"),
    blurb: line("實驗室、材料同小心核對的習慣。", "Labs, materials, and the habit of checking twice."),
    requirement: line("化學", "Chemistry"),
    threshold: 80,
    tier: "degree",
    weights: { academic: 0.5, curiosity: 0.26, wellbeing: 0.14, social: 0.1 },
    electives: ["chem"],
    math: ["m1", "m2"],
    matchEach: 8,
    boost: "science",
    career: "research",
    eligible: (run) => has(run, "chem"),
  },
  {
    id: "monghoi-life",
    institution: line("望海大學", "Monghoi University"),
    name: line("生命科學", "Life science"),
    blurb: line("生物為主，化學會讓你讀得更順。", "Biology leads. Chemistry makes the reading smoother."),
    requirement: line("生物", "Biology"),
    threshold: 78,
    tier: "degree",
    weights: { academic: 0.46, curiosity: 0.28, wellbeing: 0.14, social: 0.12 },
    electives: ["bio", "chem"],
    math: ["m1"],
    matchEach: 6,
    boost: "science",
    career: "research",
    eligible: (run) => has(run, "bio"),
  },
  {
    id: "monghoi-med",
    institution: line("望海大學", "Monghoi University"),
    name: line("醫學入門課程", "Gateway medical studies"),
    blurb: line("遊戲裡最長的一條路。身心若長期偏低，指數會下調。", "The longest path in this game. A long dip in wellbeing lowers the index."),
    requirement: line("生物及化學", "Biology and chemistry"),
    threshold: 93,
    tier: "degree",
    weights: { academic: 0.58, curiosity: 0.14, wellbeing: 0.2, social: 0.08 },
    electives: ["bio", "chem"],
    matchEach: 7,
    boost: "medicine",
    career: "medicine",
    eligible: (run) => has(run, "bio") && has(run, "chem"),
    adjust: (run) => (run.stats.wellbeing < 42 ? -14 : run.stats.wellbeing < 50 ? -6 : 0),
  },
  {
    id: "harbour-eng",
    institution: line("維港理工學院", "Harbour Polytechnic"),
    name: line("電子與計算機工程", "Electronic and computer engineering"),
    blurb: line("線路、程式同工場裡的實習。", "Circuits, code, and workshop placements."),
    requirement: line("物理或資訊及通訊科技", "Physics or ICT"),
    threshold: 78,
    tier: "degree",
    weights: { academic: 0.44, curiosity: 0.26, wellbeing: 0.12, social: 0.18 },
    electives: ["phy", "ict"],
    math: ["m1", "m2"],
    matchEach: 6,
    boost: "engineering",
    career: "engineering",
    eligible: (run) => has(run, "phy") || has(run, "ict"),
  },
  {
    id: "harbour-design",
    institution: line("維港理工學院", "Harbour Polytechnic"),
    name: line("產品設計", "Product design"),
    blurb: line("把觀察做成用得著的物件。", "Turning observation into objects people use."),
    requirement: line("視覺藝術", "Visual arts"),
    threshold: 72,
    tier: "degree",
    weights: { academic: 0.22, curiosity: 0.4, wellbeing: 0.16, social: 0.22 },
    electives: ["va"],
    matchEach: 10,
    boost: "design",
    career: "design",
    eligible: (run) => has(run, "va"),
  },
  {
    id: "lion-bba",
    institution: line("獅子山大學", "Lion Rock University"),
    name: line("工商管理", "Business administration"),
    blurb: line("小組、個案，同街口對不上教科書的地方。", "Groups, cases, and the places a textbook misses the street."),
    requirement: line("經濟或企業會計", "Economics or business"),
    threshold: 76,
    tier: "degree",
    weights: { academic: 0.4, curiosity: 0.18, wellbeing: 0.14, social: 0.28 },
    electives: ["econ", "bafs"],
    math: ["m1"],
    matchEach: 6,
    boost: "business",
    career: "business",
    eligible: (run) => has(run, "econ") || has(run, "bafs"),
  },
  {
    id: "lion-policy",
    institution: line("獅子山大學", "Lion Rock University"),
    name: line("社會政策", "Social policy"),
    blurb: line("訪問、社區同「這條規則影響誰」。", "Interviews, neighbourhoods, and who a rule affects."),
    requirement: line("地理、歷史、中史或經濟", "Geography, history, Chinese history, or economics"),
    threshold: 70,
    tier: "degree",
    weights: { academic: 0.3, curiosity: 0.28, wellbeing: 0.14, social: 0.28 },
    electives: ["geog", "hist", "chist", "econ"],
    matchEach: 4,
    boost: "policy",
    career: "policy",
    eligible: (run) => any(run, ["geog", "hist", "chist", "econ"]),
  },
  {
    id: "lion-hist",
    institution: line("獅子山大學", "Lion Rock University"),
    name: line("中國語言及歷史", "Chinese language and history"),
    blurb: line("文本、時代，同把複雜的事說清楚。", "Texts, eras, and saying a complicated thing clearly."),
    requirement: line("中國歷史或歷史", "Chinese history or history"),
    threshold: 74,
    tier: "degree",
    weights: { academic: 0.4, curiosity: 0.32, wellbeing: 0.12, social: 0.16 },
    electives: ["chist", "hist"],
    matchEach: 7,
    boost: "humanities",
    career: "humanities",
    eligible: (run) => has(run, "chist") || has(run, "hist"),
  },
  {
    id: "green-teach",
    institution: line("青洲教育大學", "Green Isle University of Education"),
    name: line("科學與數學教育", "Science and mathematics education"),
    blurb: line("回到課室的另一邊，留白給學生問。", "Back into a classroom, this time leaving space for questions."),
    requirement: line("一科理科，或任一延伸數學", "One science elective, or either maths module"),
    threshold: 70,
    tier: "degree",
    weights: { academic: 0.32, curiosity: 0.18, wellbeing: 0.22, social: 0.28 },
    electives: ["phy", "chem", "bio"],
    math: ["m1", "m2"],
    matchEach: 4,
    boost: "teaching",
    career: "teaching",
    eligible: (run) => any(run, ["phy", "chem", "bio"]) || run.mathModule === "m1" || run.mathModule === "m2",
  },
  {
    id: "east-acc",
    institution: line("東岸城市大學", "East Shore City University"),
    name: line("會計", "Accounting"),
    blurb: line("準時、準確，同旺季的長晝。", "On time, accurate, and the long days of peak season."),
    requirement: line("經濟或企業會計", "Economics or business"),
    threshold: 80,
    tier: "degree",
    weights: { academic: 0.55, curiosity: 0.12, wellbeing: 0.13, social: 0.2 },
    electives: ["bafs", "econ"],
    math: ["m1"],
    matchEach: 6,
    boost: "accounting",
    career: "accounting",
    eligible: (run) => has(run, "bafs") || has(run, "econ"),
  },
  {
    id: "east-media",
    institution: line("東岸城市大學", "East Shore City University"),
    name: line("創意媒體", "Creative media"),
    blurb: line("影像、聲音，同知道什麼時候不要加旁白。", "Image, sound, and knowing when to leave the voiceover out."),
    requirement: line("視覺藝術或資訊及通訊科技", "Visual arts or ICT"),
    threshold: 70,
    tier: "degree",
    weights: { academic: 0.24, curiosity: 0.38, wellbeing: 0.14, social: 0.24 },
    electives: ["va", "ict"],
    matchEach: 6,
    boost: "media",
    career: "media",
    eligible: (run) => has(run, "va") || has(run, "ict"),
  },
  {
    id: "mongchiu-sub-sci",
    institution: line("望潮延伸學院", "Mongchiu Continuing College"),
    name: line("應用科學副學位", "Applied science associate degree"),
    blurb: line("一條斜一點的橋，仍通向實驗室同解說工作。", "A steeper bridge, still leading toward labs and explanation."),
    requirement: line("無特定選修", "No required elective"),
    threshold: 73,
    tier: "subdegree",
    weights: { academic: 0.4, curiosity: 0.24, wellbeing: 0.18, social: 0.18 },
    electives: ["phy", "chem", "bio", "ict"],
    math: ["m1", "m2"],
    matchEach: 4,
    boost: "science",
    career: "sub-sci",
    eligible: () => true,
  },
  {
    id: "waterfront-sub-biz",
    institution: line("海傍學院", "Waterfront College"),
    name: line("商業副學位", "Business associate degree"),
    blurb: line("先值早班、看帳，再決定要不要銜接。", "Early shifts and accounts first. Articulation can come after."),
    requirement: line("無特定選修", "No required elective"),
    threshold: 73,
    tier: "subdegree",
    weights: { academic: 0.4, curiosity: 0.16, wellbeing: 0.18, social: 0.26 },
    electives: ["econ", "bafs", "geog"],
    math: ["m1"],
    matchEach: 4,
    boost: "business",
    career: "sub-biz",
    eligible: () => true,
  },
  {
    id: "waterfront-sub-arts",
    institution: line("海傍學院", "Waterfront College"),
    name: line("文化與傳意副學位", "Culture and communication associate degree"),
    blurb: line("社區訪問、文字，同把日常說清楚。", "Neighbourhood interviews, writing, and making ordinary days clear."),
    requirement: line("無特定選修", "No required elective"),
    threshold: 75,
    tier: "subdegree",
    weights: { academic: 0.34, curiosity: 0.26, wellbeing: 0.18, social: 0.22 },
    electives: ["hist", "chist", "geog", "va"],
    matchEach: 4,
    boost: "humanities",
    career: "sub-arts",
    eligible: () => true,
  },
];

export function programmeById(id: string | null | undefined): Programme | undefined {
  if (!id) return undefined;
  return PROGRAMMES.find((item) => item.id === id);
}
