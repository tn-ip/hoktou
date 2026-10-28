export type Lang = "zh" | "en";

export type Pace = "fast" | "standard";

export type YearId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "life";

export type Phase =
  | "scene"
  | "electives"
  | "ranking"
  | "offer"
  | "epilogue"
  | "summary";

export type StatKey = "academic" | "curiosity" | "wellbeing" | "social";

export const STAT_KEYS: StatKey[] = [
  "academic",
  "curiosity",
  "wellbeing",
  "social",
];

export type Stats = Record<StatKey, number>;

export type LocaleText = { zh: string; en: string };

export type ElectiveId =
  | "phy"
  | "chem"
  | "bio"
  | "econ"
  | "geog"
  | "hist"
  | "chist"
  | "va"
  | "ict"
  | "bafs";

export type MathModule = "none" | "m1" | "m2";

export type ProjectTrack =
  | "science"
  | "business"
  | "humanities"
  | "creative"
  | "tech"
  | "general";

export type Cca = "science" | "sport" | "service" | "none";

export type FairResult = "none" | "prize" | "shown" | "school" | "rushed" | "skip";

export type Flags = {
  cca: Cca;
  spark: "" | "museum" | "family" | "rest";
  tutor: boolean;
  home: "" | "honest" | "grind" | "autonomy";
  miniProject: boolean;
  lean: "" | "science" | "broad" | "realistic";
  voices: "" | "steady" | "interest" | "open";
  fair: FairResult;
  projectTrack: ProjectTrack | "";
  mock: "" | "plan" | "understand" | "rest";
  heavyTutor: boolean;
  honestTired: boolean;
  summerPreview: "" | "preview" | "group" | "swim";
  s4focus: "" | "study" | "people" | "balance";
  doubt: boolean;
  grindExam: boolean;
  spring: "" | "steady" | "cram" | "care";
  taster: "" | "science" | "biz" | "art";
  mathPull: "" | "m1" | "m2" | "core";
  reference: "" | "full" | "plain" | "careful";
  slp: "" | "thick" | "honest" | "thin";
  interview: "" | "drill" | "story" | "skip";
  listStyle: "" | "reach" | "safe" | "advice";
  backup: "" | "sub" | "work" | "retry";
  folio: "" | "start" | "later" | "skip";
  campus: "" | "people" | "map" | "home";
  hours: "" | "bounded" | "overtime" | "shifts";
  dwelling: "" | "home" | "dorm" | "share";
  payday: "" | "save" | "family" | "tool";
  mentor: "" | "ask" | "watch" | "none";
  oldFriends: "" | "keep" | "new" | "quiet";
  sideQuest: "" | "question" | "teach" | "drop";
  sunday: "" | "sea" | "work" | "people";
};

export type OfferKind = "none" | "degree" | "subdegree" | "work";

export type CareerId =
  | "research"
  | "medicine"
  | "engineering"
  | "design"
  | "business"
  | "policy"
  | "humanities"
  | "teaching"
  | "accounting"
  | "media"
  | "sub-sci"
  | "sub-biz"
  | "sub-arts"
  | "work";

export type LogEntry = {
  sceneId: string;
  year: YearId;
  choiceId: string;
  title: LocaleText;
  choice: LocaleText;
};

export type RunState = {
  version: 1;
  pace: Pace;
  lang: Lang;
  phase: Phase;
  sceneId: string;
  stats: Stats;
  electives: ElectiveId[];
  mathModule: MathModule;
  flags: Flags;
  log: LogEntry[];
  ranking: string[];
  offerId: string | null;
  offerKind: OfferKind;
  passedOver: string[];
  lastEcho: LocaleText | null;
  lastEffects: Partial<Stats> | null;
};

export type SceneCtx = {
  stats: Stats;
  electives: ElectiveId[];
  mathModule: MathModule;
  flags: Flags;
  pace: Pace;
};

export type Choice = {
  id: string;
  label: LocaleText;
  detail: LocaleText;
  effects: Partial<Stats>;
  flags?: Partial<Flags>;
  after?: (run: RunState, stats: Stats) => Partial<Flags>;
};

export type MaybeText = LocaleText | ((ctx: SceneCtx) => LocaleText);

export type Scene = {
  id: string;
  year: YearId;
  kicker: MaybeText;
  title: MaybeText;
  focus: MaybeText;
  body: (ctx: SceneCtx) => LocaleText;
  choices: (ctx: SceneCtx) => Choice[];
};

export type StepId =
  | "S1"
  | "S2"
  | "S3"
  | "pick"
  | "sum"
  | "S4"
  | "S5"
  | "S6"
  | "out";

export type StepStatus = "done" | "now" | "todo";

export type Outlook = "ineligible" | "likely" | "edge" | "stretch" | "long";
