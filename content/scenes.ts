import { ABILITY_SCENES } from "@/content/ability-scenes";
import { EXTRA_SCENES } from "@/content/decisions";
import { joinElectives, seniorAbilityNote } from "@/content/subjects";
import { decideFair, projectTrack } from "@/lib/track";
import type {
  Choice,
  ElectiveId,
  LocaleText,
  MathModule,
  ProjectTrack,
  Scene,
  SceneCtx,
} from "@/lib/types";
import { line } from "@/lib/text";

export type Beat =
  | { kind: "scene"; id: string; pace: "all" | "standard" }
  | { kind: "electives"; pace: "all" | "standard" };

const standard = (id: string): Beat => ({ kind: "scene", id, pace: "standard" });

export const PLAYLIST: Beat[] = [
  { kind: "scene", id: "s1-arrival", pace: "all" },
  standard("s1-ab-olympiad"),
  standard("s1-recess"),
  standard("s1-ab-labday"),
  standard("s1-english"),
  standard("s1-ab-debate"),
  standard("s1-ab-museum"),
  standard("s1-pe"),
  standard("s1-ab-societies"),
  standard("s1-homework"),
  standard("s1-ab-tutor"),
  { kind: "scene", id: "s1-quiz", pace: "standard" },
  standard("s1-ab-geog"),
  standard("s1-library"),
  standard("s1-ab-pe"),
  standard("s1-rain"),
  { kind: "scene", id: "s1-summer", pace: "standard" },
  { kind: "scene", id: "s2-clubs", pace: "all" },
  standard("s2-ab-chem"),
  standard("s2-lab"),
  standard("s2-ab-circuit"),
  standard("s2-phone"),
  standard("s2-ab-bio"),
  standard("s2-group"),
  standard("s2-ab-stem"),
  { kind: "scene", id: "s2-home", pace: "standard" },
  standard("s2-ab-stall"),
  standard("s2-festival"),
  standard("s2-ab-firm"),
  standard("s2-trial"),
  standard("s2-ab-invest"),
  { kind: "scene", id: "s2-spring", pace: "standard" },
  standard("s2-ab-profit"),
  standard("s2-sea"),
  { kind: "scene", id: "s3-crossroad", pace: "all" },
  standard("s3-taster"),
  standard("s3-strength"),
  standard("s3-fear"),
  { kind: "scene", id: "s3-voices", pace: "standard" },
  standard("s3-clash"),
  standard("s3-split"),
  standard("s3-math-talk"),
  standard("s3-parents"),
  standard("s3-shadow"),
  standard("s3-draft"),
  { kind: "electives", pace: "all" },
  { kind: "scene", id: "s3-summer", pace: "standard" },
  standard("s3b-camp"),
  { kind: "scene", id: "s4-open", pace: "all" },
  standard("s4-partner"),
  standard("s4-oral"),
  { kind: "scene", id: "s4-mid", pace: "standard" },
  standard("s4-talk"),
  standard("s4-sick"),
  standard("s4-invite"),
  { kind: "scene", id: "s4-exam", pace: "standard" },
  standard("s4-night"),
  { kind: "scene", id: "s5-heat", pace: "all" },
  standard("s5-predict"),
  standard("s5-sleep"),
  { kind: "scene", id: "s5-showcase", pace: "all" },
  standard("s5-team"),
  standard("s5-mentor"),
  standard("s5-folio"),
  { kind: "scene", id: "s5-body", pace: "standard" },
  standard("s5-trip"),
  { kind: "scene", id: "s6-mock", pace: "all" },
  standard("s6-reference"),
  standard("s6-slp"),
  standard("s6-infoday"),
  standard("s6-interview"),
  standard("s6-strategy"),
  standard("s6-who"),
  standard("s6-backup"),
  { kind: "scene", id: "s6-spring", pace: "standard" },
  standard("s6-eve"),
];

export const LIFE_PLAYLIST: Beat[] = [
  "life-orientation",
  "life-hours",
  "life-rent",
  "life-pay",
  "life-mentor",
  "life-friends",
  "life-question",
  "life-sunday",
].map((id) => standard(id));

function mathSentence(math: MathModule): LocaleText {
  if (math === "m1") {
    return line("延伸數學你修單元一，統計會跟著你。", "You added extended maths module 1, so statistics will follow you.");
  }
  if (math === "m2") {
    return line("延伸數學你修單元二，代數會再密一點。", "You added extended maths module 2, so algebra will sit closer to the week.");
  }
  return line("你沒有加修延伸數學。", "You did not add extended maths.");
}

function classLine(electives: ElectiveId[]): LocaleText {
  const withChing = electives.some((id) => id === "phy" || id === "chem" || id === "ict");
  const withKaki = electives.some((id) => id === "econ" || id === "bafs" || id === "geog" || id === "va");
  if (withChing && withKaki) {
    return line(
      "林澄同你有課同班，家琪亦會在另一科碰到你。課室分散，小息仍在。",
      "Ching shares a class with you, and Ka-ki crosses your path in another. The rooms are scattered. Recess still exists.",
    );
  }
  if (withChing) {
    return line(
      "林澄同你走進同一間實驗室。家琪的課在另一座，你們約在小食部見面。",
      "Ching walks into the same lab as you. Ka-ki's class is in the other block. You meet at the tuck shop.",
    );
  }
  if (withKaki) {
    return line(
      "家琪同你的時間表有一段重疊。林澄去了實驗室，你們約在小食部見面。",
      "Ka-ki's timetable overlaps yours for a stretch. Ching has gone to the lab. You meet at the tuck shop.",
    );
  }
  return line(
    "林澄同家琪都去了別的組。小息你要走一段走廊才見到他們。",
    "Ching and Ka-ki are both in other sets. At recess you walk a corridor before you find them.",
  );
}

const MID: Record<
  ProjectTrack,
  { title: LocaleText; body: LocaleText; dig: LocaleText; group: LocaleText; comply: LocaleText }
> = {
  science: {
    title: line("抄錯的一行", "The wrong row"),
    body: line(
      "實驗課上，你的小組把數據抄錯一行。梁老師沒有當眾責備，只把本子推回來說：科學最貴的，往往是這一行。",
      "In the lab your group copies one row of data into the wrong place. Mr Leung does not scold you in front of the class. He slides the book back and says the expensive part of science is often that one row.",
    ),
    dig: line("留校重做，直到那一行對上", "Stay back and redo it until the row agrees"),
    group: line("跟組員分工，逐格核對", "Split the grid with your group and check cell by cell"),
    comply: line("改完便交，心裡仍覺得這科未必貼身", "Hand in the correction with a doubt still attached"),
  },
  business: {
    title: line("茶餐廳的帳", "The café's books"),
    body: line(
      "企業會計的功課是一間虛構茶餐廳。你把租金一加，利潤就薄得可憐。家琪說：「這還未計老闆自己的人工。」",
      "The business homework is a fictional café. Add the rent and the profit goes thin. Ka-ki says, \"That still leaves out the owner's own wages.\"",
    ),
    dig: line("把人工同損耗都補進表裡", "Put wages and waste into the sheet as well"),
    group: line("跟家琪分工，一個人算、一個人寫解釋", "Split it with Ka-ki: one calculates, one explains"),
    comply: line("按課堂要求交齊，不再加行", "Hand in exactly what the lesson asked, and stop"),
  },
  humanities: {
    title: line("一條街的二十年", "Twenty years of one street"),
    body: line(
      "口頭報告的題目是「一條街的二十年」。老師說可以找資料，也可以去問人。問人比較慢，也比較難裝懂。",
      "The oral is \"twenty years of one street\". The teacher says you may use sources, or you may ask people. Asking people is slower, and harder to fake.",
    ),
    dig: line("真的去海傍問一問舊店", "Actually walk the waterfront and ask an old shop"),
    group: line("跟同學合做，一人一段時期", "Share the decades with classmates"),
    comply: line("用圖書館的材料寫穩，不再出門", "Stay with the library sources and do not go out"),
  },
  creative: {
    title: line("三張速寫", "Three sketches"),
    body: line(
      "視藝課要你交三張速寫。你畫了校服領、海，同小食部的鋁窗。老師問：你在看物件，還是在看自己每天被看見的樣子？",
      "Visual arts asks for three sketches. You draw a collar, the sea, and the tuck shop's aluminium window. The teacher asks whether you are looking at objects, or at the self other people see every day.",
    ),
    dig: line("再畫一輪，直到自己看得出分別", "Draw another round until you can see the difference"),
    group: line("跟同學交換看，聽一句誠實的話", "Swap with a classmate and hear one honest sentence"),
    comply: line("三張夠數便交", "Three sheets is enough; hand them in"),
  },
  tech: {
    title: line("會停住的習作", "The exercise that stalls"),
    body: line(
      "資訊科技的習作是一個簡單資料庫。你的版本一按搜尋就停住。鄰座已經做好，把螢幕轉開，沒有笑你。",
      "The ICT exercise is a simple database. Yours stalls when you search. The person beside you is finished. They angle the screen away and do not laugh.",
    ),
    dig: line("逐行看，問到自己明白為止", "Read it line by line until you understand it"),
    group: line("請鄰座講一次思路，然後自己重做", "Ask for the approach, then rebuild it yourself"),
    comply: line("改到能運行便交，不再追問", "Make it run, hand it in, and stop asking"),
  },
  general: {
    title: line("社區裡的一個問題", "One question in the neighbourhood"),
    body: line(
      "專題課要你選一個社區問題。海傍有垃圾，也有很多人的午餐。題目一寫大，就什麼都像該你管；寫小，又怕老師說不夠。",
      "The project lesson asks for one neighbourhood question. The waterfront has litter, and it also has everyone's lunch. Write the topic too wide and it feels like all of it is yours. Write it small and you worry it will look thin.",
    ),
    dig: line("把題目收窄到你真的查得到的範圍", "Narrow it to something you can actually check"),
    group: line("跟同學各查一塊，再拼起來", "Each person checks a piece, then you join them"),
    comply: line("選一個安全的題目，按格式交", "Pick a safe topic and follow the format"),
  },
};

const SHOW: Record<
  ProjectTrack,
  { title: LocaleText; body: LocaleText; commit: LocaleText; modest: LocaleText; skip: LocaleText }
> = {
  science: {
    title: line("港灣青少年科學展", "Harbour Youth Science Fair"),
    body: line(
      "梁老師問你同林澄要不要組隊。題目可以是海傍的微塑膠、課室的空氣，或者樓梯燈為什麼整夜亮。校外那個展覽叫港灣青少年科學展，是遊戲裡的名字。中五的功課已經很多。",
      "Mr Leung asks whether you and Ching want a team. The question could be microplastics on the waterfront, the air in a classroom, or why the stair lights burn all night. The fair beyond school is called the Harbour Youth Science Fair — a name that exists in this game. S5 homework is already heavy.",
    ),
    commit: line("以海傍微塑膠做題，爭取展出", "Take microplastics on the waterfront, and aim to show it"),
    modest: line("只做校內的課室空氣調查", "Keep it to an in-school study of classroom air"),
    skip: line("今年不做展覽，保住睡眠同其他科", "Skip the fair this year and protect sleep and the other subjects"),
  },
  business: {
    title: line("青年店子點子", "Youth shop challenge"),
    body: line(
      "學校轉來一張「港灣青年店子點子」的海報，是遊戲裡的商業比賽。主辦方想看一間小店怎樣在租金同人手之間仍開得了門。你可以去問真的老闆，也可以只在課室裡寫。",
      "A poster arrives for the Harbour Youth Shop Challenge, a business contest inside this game. They want to see how a small shop stays open between rent and staffing. You can ask a real owner, or you can write it from the classroom.",
    ),
    commit: line("用真實小店的數字去比賽", "Enter with a real shop's numbers"),
    modest: line("只交一份穩妥的課堂報告", "Hand in a solid classroom report and stop there"),
    skip: line("推掉比賽，專心測考", "Turn the contest down and stay with tests"),
  },
  humanities: {
    title: line("海傍口述", "Waterfront voices"),
    body: line(
      "歷史科老師說，社區中心想留一點海傍的口述。店主、船、搬家的原因。這不是官方的大型比賽，只是一次可以把耳朵借出去的功課。做深了，就會占用溫習的晚上。",
      "The history teacher says the community centre wants a little of the waterfront told aloud: shopkeepers, boats, reasons for moving. It is not a grand official contest. It is homework that lends out your ears. Take it deep, and it will spend your revision nights.",
    ),
    commit: line("訪問店主，做成一段口述記錄", "Interview a shopkeeper and make an oral record"),
    modest: line("改寫一篇文獻充足的短文", "Write a careful short essay from published sources"),
    skip: line("推掉訪問，把晚上留給溫習", "Skip the interviews and keep the evenings for revision"),
  },
  creative: {
    title: line("校服與海風", "Uniform and sea wind"),
    body: line(
      "校內藝術展快到了。你一直在畫校服同海風，題目小，卻每天都被人看見。老師說可以只交作業，也可以把系列放出課室。放出去，就要被人站在前面看。",
      "The in-school art show is close. You have been drawing uniform and sea wind. The subject is small, and people see it every day. The teacher says you can submit the classwork only, or put the series outside the room. Outside, people will stand in front of it.",
    ),
    commit: line("把系列放到校展，讓人站著看", "Put the series in the school show and let people stand with it"),
    modest: line("交最低限度的三張作業", "Hand in the minimum three pieces"),
    skip: line("先停筆，把時間補回其他科", "Put the pencil down and give the time back to other subjects"),
  },
  tech: {
    title: line("失物小工具", "The lost-and-found tool"),
    body: line(
      "校務處的失物箱永遠滿。資訊科技老師說，你可以做一個很小的頁面：拾獲、地點、有沒有被領回。做給課室看是一回事，做給校務處試用是另一回事。",
      "The general office lost-property box is always full. The ICT teacher says you could make a very small page: found, location, claimed or not. Making it for the classroom is one thing. Letting the office try it is another.",
    ),
    commit: line("做給校務處試用的失物頁", "Build a lost-property page the office can try"),
    modest: line("只完成課堂要求的功能", "Finish only the features the lesson requires"),
    skip: line("先放下，保住其他科", "Set it down and protect the other subjects"),
  },
  general: {
    title: line("學習周", "Learning week"),
    body: line(
      "學校的學習周要每班交一個小問題。沒有獎盃的壓力，卻有走廊展示板。你可以追一件自己在意的事，也可以幫人貼海報，或者把那週還給溫習。",
      "Learning week asks each class for a small question. There is no trophy pressure, but there is a board in the corridor. You can follow something you care about, help hang posters, or give the week back to revision.",
    ),
    commit: line("追一個自己的小問題，並貼出來", "Follow a question of your own and put it on the board"),
    modest: line("幫活動做後勤，不出風頭", "Do the logistics and stay off the stage"),
    skip: line("把這週留給溫習", "Give the week to revision"),
  },
};

function activityChoice(ctx: SceneCtx): { label: LocaleText; detail: LocaleText } {
  if (ctx.flags.cca === "science") {
    return {
      label: line("科學學會的實驗日照去", "Keep the science club lab days"),
      detail: line("保住好奇，同那班一起留下的人", "Keep the curiosity, and the people who stay after school"),
    };
  }
  if (ctx.flags.cca === "sport") {
    return {
      label: line("校隊訓練照去", "Keep showing up for the school team"),
      detail: line("身體同人際還有一個固定的位置", "Body and bonds keep a fixed place in the week"),
    };
  }
  if (ctx.flags.cca === "service") {
    return {
      label: line("服務團的探訪照去", "Keep the service group's visits"),
      detail: line("跟人碰面的時間還在日曆上", "Time with people stays on the calendar"),
    };
  }
  return {
    label: line("每週留一個下午給自己的活動", "Keep one afternoon a week for something of your own"),
    detail: line("不全放進溫習", "Not every hour goes to revision"),
  };
}

function commitChoice(ctx: SceneCtx, label: LocaleText): Choice {
  const track = projectTrack(ctx.electives, ctx.flags.cca);
  return {
    id: "s5-commit",
    label,
    detail: line("做深一點。好奇會升，身心會被拿走一塊。", "Go deeper. Curiosity rises. Wellbeing gives something up."),
    effects: { curiosity: 8, academic: 4, wellbeing: -7, social: 2 },
    flags: { projectTrack: track },
    after: (_run, stats) => ({ fair: decideFair(stats) }),
  };
}

function modestChoice(ctx: SceneCtx, label: LocaleText): Choice {
  const track = projectTrack(ctx.electives, ctx.flags.cca);
  return {
    id: "s5-modest",
    label,
    detail: line("有作品，也有界線。", "There is a piece of work, and there is a boundary."),
    effects: { curiosity: 5, academic: 3, wellbeing: -2, social: 2 },
    flags: { projectTrack: track, fair: "school" },
  };
}

function skipChoice(ctx: SceneCtx, label: LocaleText): Choice {
  const track = projectTrack(ctx.electives, ctx.flags.cca);
  return {
    id: "s5-skip",
    label,
    detail: line("把時間還給休息同其他科。", "Give the time back to rest and the other subjects."),
    effects: { academic: 4, wellbeing: 7, curiosity: -3, social: 1 },
    flags: { projectTrack: track, fair: "skip" },
  };
}

const BASE_SCENES: Scene[] = [
  {
    id: "s1-arrival",
    year: "S1",
    kicker: line("中一 · 九月", "S1 · September"),
    title: line("窗邊的海風", "Salt on the window"),
    focus: line("安頓", "Settling in"),
    body: () =>
      line(
        "開學禮散場。你站在望潮中學課室的窗邊，海風帶一點鹹。操場外面是窄窄的海傍，遠處有貨櫃船。班主任陳老師說：「中一不用急著證明所有事。先學會問。」林澄拉你的袖口，指樓上。何家琪已經在時間表上用顏色筆畫好箭嘴。",
        "Assembly is over. You stand by the window of your form room at Mongchiu Secondary School. The wind is slightly salty. Beyond the playground is a thin waterfront, and container ships sit far out. Ms Chan, your form teacher, says, \"S1 is not for proving everything. Learn to ask first.\" Lam Ching tugs your sleeve and points upstairs. Ho Ka-ki has already drawn arrows on the timetable in colour.",
      ),
    choices: () => [
      {
        id: "s1-rooftop",
        label: line("跟林澄走上天台，先看清這間學校", "Follow Ching up to the roof and get a sense of the school"),
        detail: line("先滿足好奇，也認識一個朋友。", "Curiosity first, and one new friend."),
        effects: { academic: -2, curiosity: 8, social: 4, wellbeing: 1 },
      },
      {
        id: "s1-timetable",
        label: line("跟家琪對時間表，問清楚課室", "Check the timetable with Ka-ki and find the rooms"),
        detail: line("人際同學業都先穩一點。", "Bonds and study both settle a little."),
        effects: { academic: 4, social: 7, curiosity: 1, wellbeing: 1 },
      },
      {
        id: "s1-notes",
        label: line("自己坐下，先抄好中文科溫習表", "Sit down and copy out a Chinese study plan"),
        detail: line("學業上升，人際先放一放。", "Study rises. Bonds can wait."),
        effects: { academic: 8, social: -2, wellbeing: -2, curiosity: 1 },
      },
    ],
  },
  {
    id: "s1-quiz",
    year: "S1",
    kicker: line("中一 · 十月", "S1 · October"),
    title: line("默書之後", "After the dictation"),
    focus: line("測考", "Tests"),
    body: () =>
      line(
        "第一次中文默書，你未到自己期望的分數。書包裡多了一張補習社傳單。晚飯時媽媽沒有罵你，只問：「要不要找人幫一下？」窗外有人在拍球。",
        "The first Chinese dictation misses the mark you had hoped for. A tutorial-centre leaflet appears in your bag. At dinner your mother does not scold you. She asks whether you want someone to help. Outside, a ball hits a wall.",
      ),
    choices: () => [
      {
        id: "s1-tutor",
        label: line("週末去補習社，把默書補回來", "Go to the tutorial centre at the weekend and repair the dictation"),
        detail: line("分數會好追一點，週末會變短。", "The mark is easier to chase. The weekend gets shorter."),
        effects: { academic: 8, wellbeing: -6, curiosity: -1, social: -1 },
        flags: { tutor: true },
      },
      {
        id: "s1-teacher",
        label: line("問陳老師借筆記，自己逐個字補", "Borrow Ms Chan's notes and patch the words yourself"),
        detail: line("學業同好奇一起動，人也不算孤立。", "Study and curiosity both move, and you are not on your own."),
        effects: { academic: 5, curiosity: 4, wellbeing: -1, social: 2 },
      },
      {
        id: "s1-football",
        label: line("當它是一場小風波，週末去拍球", "Treat it as a squall, and go out to play ball"),
        detail: line("身心同人際回升，默書先放低。", "Wellbeing and bonds recover. The dictation can wait."),
        effects: { wellbeing: 7, social: 6, academic: -4 },
      },
    ],
  },
  {
    id: "s1-summer",
    year: "S1",
    kicker: line("中一 · 七月", "S1 · July"),
    title: line("第一個暑假", "The first summer"),
    focus: line("暑假", "Summer"),
    body: () =>
      line(
        "考試完了。望潮的夏天很亮，海傍的單車同行人多了。你有六個星期。沒有人會把每一日都替你排好。",
        "Exams are over. Summer at Mongchiu is bright, and the waterfront fills with bicycles and people on foot. You have six weeks. Nobody is going to schedule every day for you.",
      ),
    choices: () => [
      {
        id: "s1-museum",
        label: line("去科學館泡半日，把問題寫進小簿", "Spend half a day at the science museum and write questions in a notebook"),
        detail: line("好奇被具體的展品勾住。", "Curiosity catches on something you can see."),
        effects: { curiosity: 8, academic: 2, wellbeing: 2 },
        flags: { spark: "museum" },
      },
      {
        id: "s1-family",
        label: line("陪外婆買餸，下午在她家慢慢看書", "Shop for food with your grandmother, then read slowly at her place"),
        detail: line("人際同身心都暖一點。", "Bonds and wellbeing both warm up."),
        effects: { social: 5, wellbeing: 5, curiosity: 2, academic: 1 },
        flags: { spark: "family" },
      },
      {
        id: "s1-sleep",
        label: line("每日溫一小時，其餘真的休息", "Revise for an hour a day, and actually rest after that"),
        detail: line("睡眠回來，學業亦有一點。", "Sleep returns, and study moves a little."),
        effects: { academic: 4, wellbeing: 8, curiosity: 1 },
        flags: { spark: "rest" },
      },
    ],
  },
  {
    id: "s2-clubs",
    year: "S2",
    kicker: line("中二 · 九月", "S2 · September"),
    title: line("禮堂裡的學會檔", "Club day in the hall"),
    focus: line("學會", "Clubs"),
    body: () =>
      line(
        "招募日，禮堂鋪滿摺椅。科學學會在示範一小杯會變色的水。校隊在收報名表。服務團的海報寫著本月去探訪院舍。家琪說：「你總要留下一點放學後的自己。」",
        "On recruitment day the hall is full of folding chairs. The science club is demonstrating a small cup of water that changes colour. The sports teams are collecting forms. The service group's poster says they will visit a care home this month. Ka-ki says, \"You have to leave a bit of yourself for after school.\"",
      ),
    choices: () => [
      {
        id: "s2-science",
        label: line("加入科學學會", "Join the science club"),
        detail: line("好奇同實驗會變成每週的事。", "Curiosity and experiments become weekly."),
        effects: { curiosity: 8, academic: 3, social: 2 },
        flags: { cca: "science" },
      },
      {
        id: "s2-sport",
        label: line("加入運動校隊", "Join a school sports team"),
        detail: line("訓練換來體力同隊友。", "Training buys stamina and teammates."),
        effects: { wellbeing: 8, social: 6, academic: -2 },
        flags: { cca: "sport" },
      },
      {
        id: "s2-service",
        label: line("加入社會服務團", "Join the social service group"),
        detail: line("你會定期看見課室以外的人。", "You will regularly meet people outside the classroom."),
        effects: { social: 8, curiosity: 3, wellbeing: 2 },
        flags: { cca: "service" },
      },
    ],
  },
  {
    id: "s2-home",
    year: "S2",
    kicker: line("中二 · 十一月", "S2 · November"),
    title: line("蒸魚同成績表", "Steamed fish and the report"),
    focus: line("家人", "Family"),
    body: () =>
      line(
        "家長日之後，晚飯有蒸魚。爸爸把成績表摺好，沒有拍在桌上。他問你最近最有精神的是哪一科。屋裡只有抽氣扇的聲音。",
        "After parents' day, dinner is steamed fish. Your father folds the report. He does not slap it on the table. He asks which subject has had the most of your energy lately. The only sound in the flat is the exhaust fan.",
      ),
    choices: () => [
      {
        id: "s2-honest",
        label: line("照實說你喜歡的，同你提不起勁的", "Say plainly what you like, and what you cannot raise energy for"),
        detail: line("家人聽見的是你，不是只有分數。", "Home hears you, not only the marks."),
        effects: { curiosity: 4, social: 4, academic: 2 },
        flags: { home: "honest" },
      },
      {
        id: "s2-promise",
        label: line("答應接下來加倍溫書", "Promise to double the revision from here"),
        detail: line("學業會被推高，身心要付款。", "Study gets a push. Wellbeing pays."),
        effects: { academic: 8, wellbeing: -6, social: 1 },
        flags: { home: "grind" },
      },
      {
        id: "s2-autonomy",
        label: line("問可不可以自己排溫習時間", "Ask whether you can set your own revision hours"),
        detail: line("你要回報，也換來一點空間。", "You still report back, and you gain a little room."),
        effects: { wellbeing: 5, curiosity: 4, academic: 2 },
        flags: { home: "autonomy" },
      },
    ],
  },
  {
    id: "s2-spring",
    year: "S2",
    kicker: line("中二 · 三月", "S2 · March"),
    title: line("一個很小的題目", "A very small question"),
    focus: line("好奇", "Curiosity"),
    body: () =>
      line(
        "林澄在小息把你拉到走廊盡頭。他想做一個小報告：海傍的垃圾，或者樓梯間的燈為什麼整夜亮著。老師說可以做，但不會因此加分。",
        "At recess Ching pulls you to the end of the corridor. He wants a small report: litter on the waterfront, or why the stairwell lights burn all night. A teacher says you may do it. It will not add marks.",
      ),
    choices: () => [
      {
        id: "s2-project",
        label: line("跟他做完，哪怕成品很簡陋", "Finish it with him, even if the result is rough"),
        detail: line("你會留下一次自己追問的經驗。", "You keep one experience of following a question."),
        effects: { curiosity: 8, social: 4, academic: 1, wellbeing: -2 },
        flags: { miniProject: true },
      },
      {
        id: "s2-examfocus",
        label: line("你說想把時間留給測驗", "Say you want the time for the test"),
        detail: line("學業優先，那個小題目先放下。", "Study comes first. The small question waits."),
        effects: { academic: 6, curiosity: -2, wellbeing: -1 },
      },
      {
        id: "s2-stall",
        label: line("改為幫班會在小息賣餅", "Help the class association sell biscuits at recess instead"),
        detail: line("人際熱起來，好奇先不追。", "Bonds warm up. Curiosity does not get this chase."),
        effects: { social: 8, wellbeing: 2, academic: -1 },
      },
    ],
  },
  {
    id: "s3-crossroad",
    year: "S3",
    kicker: line("中三 · 一月", "S3 · January"),
    title: line("選科簡介會", "The electives briefing"),
    focus: line("選科", "Electives"),
    body: () =>
      line(
        "禮堂屏幕列出一排科目。同學開始用「理科」「商科」「文科」給自己站隊。你知道這些名字很響，但它們不是人格。陳老師說表格四月才交，今天只是去聽。",
        "The hall screen lists subjects in a row. Classmates start sorting themselves into science, business, and humanities. The names are loud. They are not personalities. Ms Chan says the form is due in April. Today is for listening.",
      ),
    choices: () => [
      {
        id: "s3-science-booth",
        label: line("去理科攤位，聽實驗課怎樣上", "Stay at the science booths and hear how the labs run"),
        detail: line("你會帶著理科的具體畫面離開。", "You leave with a concrete picture of science lessons."),
        effects: { curiosity: 5, academic: 1 },
        flags: { lean: "science" },
      },
      {
        id: "s3-other-booths",
        label: line("把商科、文科同藝術的攤位都走一遍", "Walk the business, humanities, and art booths"),
        detail: line("視野闊一點，站隊的聲音就細一點。", "The view gets wider, and the pressure to pick a camp gets quieter."),
        effects: { curiosity: 5, social: 2 },
        flags: { lean: "broad" },
      },
      {
        id: "s3-ask-seniors",
        label: line("先問師兄師姐真實的功課量", "Ask older students about the real workload"),
        detail: line("周博說：先問功課量，再問心動。", "Chow Bok says: ask about the load, then about what moves you."),
        effects: { wellbeing: 3, social: 3, academic: 2 },
        flags: { lean: "realistic" },
      },
    ],
  },
  {
    id: "s3-voices",
    year: "S3",
    kicker: line("中三 · 三月", "S3 · March"),
    title: line("三句說話", "Three sentences"),
    focus: line("期望", "Expectations"),
    body: () =>
      line(
        "表格還沒交。三個人分別同你講了一句。你今晚只帶得走一句，不是因為其他兩句錯，而是你的袋子已經很重。",
        "The form is not in yet. Three people each leave you with a sentence. Tonight you can carry one. The other two are not wrong. Your bag is already heavy.",
      ),
    choices: () => [
      {
        id: "s3-steady",
        label: line("媽媽說：選穩陣一點，以後的路會闊一點", "Your mother says: choose something steadier, and later paths stay wider"),
        detail: line("你把「穩陣」放進考慮，而不把它當成命令。", "You keep \"steady\" in the consideration. You do not treat it as an order."),
        effects: { social: 2, wellbeing: 1 },
        flags: { voices: "steady" },
      },
      {
        id: "s3-interest",
        label: line("爸爸說：有興趣，你才走得完高中三年", "Your father says: interest is what carries you through three senior years"),
        detail: line("你把興趣當成耐力，不只是心情。", "You treat interest as stamina, not only as mood."),
        effects: { curiosity: 4, wellbeing: 2 },
        flags: { voices: "interest" },
      },
      {
        id: "s3-teacher-voice",
        label: line("陳老師說：科目是工具，不是你的全部身份", "Ms Chan says: a subject is a tool, not the whole of your identity"),
        detail: line("你把這句放在表格旁邊。", "You set that sentence beside the form."),
        effects: { wellbeing: 5, academic: 2, curiosity: 2 },
        flags: { voices: "open" },
      },
    ],
  },
  {
    id: "s3-summer",
    year: "S3",
    kicker: line("中三 · 七月", "S3 · July"),
    title: line("表格交了之後", "After the form"),
    focus: line("暑假", "Summer"),
    body: (ctx) => {
      const math = mathSentence(ctx.mathModule);
      return line(
        `表格交了。你的選修是${joinElectives(ctx.electives, "zh")}。${math.zh}暑假的海很平。高中還沒有開始，傳聞已經開始。`,
        `The form is in. Your electives are ${joinElectives(ctx.electives, "en")}. ${math.en} The summer sea is flat. Senior secondary has not started. The rumours have.`,
      );
    },
    choices: () => [
      {
        id: "s3-preview",
        label: line("預先翻一翻選修的第一章", "Preview the first chapter of an elective"),
        detail: line("高中會熟一點，暑假會短一點。", "Senior secondary will feel less strange. Summer gets shorter."),
        effects: { academic: 6, curiosity: 4, wellbeing: -4 },
        flags: { summerPreview: "preview" },
      },
      {
        id: "s3-group",
        label: line("同選了相近科目的同學組個暑期小組", "Start a summer group with people who chose a similar mix"),
        detail: line("你不會一個人走進九月。", "You will not walk into September alone."),
        effects: { social: 6, curiosity: 4, academic: 2 },
        flags: { summerPreview: "group" },
      },
      {
        id: "s3-swim",
        label: line("這個暑假以游泳同睡覺為主", "Let this summer be mostly swimming and sleep"),
        detail: line("身心儲一點，留給高中用。", "Wellbeing stores something for senior secondary to spend."),
        effects: { wellbeing: 8, social: 2, curiosity: 1 },
        flags: { summerPreview: "swim" },
      },
    ],
  },
  {
    id: "s4-open",
    year: "S4",
    kicker: line("中四 · 九月", "S4 · September"),
    title: line("時間表變了", "The timetable changes"),
    focus: line("高中", "Senior secondary"),
    body: (ctx) => {
      const math = mathSentence(ctx.mathModule);
      const friends = classLine(ctx.electives);
      const note = seniorAbilityNote(ctx.abilities, ctx.electives);
      return line(
        `高中第一天，選修換成${joinElectives(ctx.electives, "zh")}。${math.zh}${friends.zh}必修的中文、英文、數學同公民與社會發展仍在。你要決定這一學年把重心放在哪裡。${note.zh}`,
        `On the first day of senior secondary your electives are ${joinElectives(ctx.electives, "en")}. ${math.en} ${friends.en} Chinese, English, mathematics, and Citizenship and Social Development are still there. You decide where this school year leans.${note.en ? ` ${note.en}` : ""}`,
      );
    },
    choices: () => [
      {
        id: "s4-study",
        label: line("學業為先，放學多數留下溫習", "Put study first, and stay behind most days"),
        detail: line("成績會被托住，休息會變少。", "Marks get held up. Rest gets smaller."),
        effects: { academic: 9, wellbeing: -7, curiosity: 2, social: -2 },
        flags: { s4focus: "study" },
      },
      {
        id: "s4-people",
        label: line("保住學會、朋友同放學後的談話", "Keep the club, your friends, and the after-school talk"),
        detail: line("人際很暖，學業要讓出一點。", "Bonds stay warm. Study gives up a little ground."),
        effects: { social: 8, curiosity: 2, academic: -3, wellbeing: 2 },
        flags: { s4focus: "people" },
      },
      {
        id: "s4-balance",
        label: line("兩邊都留，並盡量準時睡", "Keep a share of both, and try to sleep on time"),
        detail: line("各項都移動得少，日子比較站得住。", "Each stat moves less. The days are easier to stand in."),
        effects: { academic: 4, wellbeing: 5, social: 3, curiosity: 2 },
        flags: { s4focus: "balance" },
      },
    ],
  },
  {
    id: "s4-mid",
    year: "S4",
    kicker: line("中四 · 十二月", "S4 · December"),
    title: (ctx) => MID[projectTrack(ctx.electives, ctx.flags.cca)].title,
    focus: line("課堂", "Class"),
    body: (ctx) => MID[projectTrack(ctx.electives, ctx.flags.cca)].body,
    choices: (ctx) => {
      const pack = MID[projectTrack(ctx.electives, ctx.flags.cca)];
      return [
        {
          id: "s4-dig",
          label: pack.dig,
          detail: line("追問到底。好奇上升，身心會降。", "Follow it through. Curiosity rises. Wellbeing dips."),
          effects: { curiosity: 8, academic: 4, wellbeing: -4, social: 1 },
        },
        {
          id: "s4-group",
          label: pack.group,
          detail: line("跟同學做完。人際同學業都有一點。", "Finish it with classmates. Bonds and study both move a little."),
          effects: { social: 6, academic: 3, curiosity: 2 },
        },
        {
          id: "s4-comply",
          label: pack.comply,
          detail: line("交得出，心裡留了一個問號。", "You can hand it in. A question mark stays."),
          effects: { academic: 2, wellbeing: -1, curiosity: -2 },
          flags: { doubt: true },
        },
      ];
    },
  },
  {
    id: "s4-exam",
    year: "S4",
    kicker: line("中四 · 六月", "S4 · June"),
    title: line("第一個高中考試", "The first senior exams"),
    focus: line("溫習", "Revision"),
    body: () =>
      line(
        "中四考試不是公開試，走廊的氣氛卻已經在預習緊張。有人比較補習社的筆記，有人假裝不在乎。陳老師只說：「考完記得吃飯。」",
        "S4 exams are not the public exam, but the corridor is already rehearsing the tension. Some people compare tutorial notes. Some people pretend not to care. Ms Chan only says, \"Eat after you finish.\"",
      ),
    choices: () => [
      {
        id: "s4-allnighter",
        label: line("開夜溫，能多看一章便多看", "Stay up, and cover one more chapter whenever you can"),
        detail: line("短期分數上去，睡眠明顯下來。", "Short-term study goes up. Sleep goes down plainly."),
        effects: { academic: 8, wellbeing: -8 },
        flags: { grindExam: true },
      },
      {
        id: "s4-enough",
        label: line("溫重點，到點就停", "Revise the core points, then stop"),
        detail: line("學業有進步，人也還在。", "Study improves, and so do you."),
        effects: { academic: 5, wellbeing: 3, curiosity: 1 },
      },
      {
        id: "s4-hike",
        label: line("考完那天跟朋友去行山", "Go hiking with friends the day it ends"),
        detail: line("身心同人際回升，分數讓出一點。", "Wellbeing and bonds recover. The mark gives a little back."),
        effects: { wellbeing: 8, social: 4, academic: -2 },
      },
    ],
  },
  {
    id: "s5-heat",
    year: "S5",
    kicker: line("中五 · 十月", "S5 · October"),
    title: line("傳單塞滿書包", "Leaflets fill the bag"),
    focus: line("壓力", "Pressure"),
    body: (ctx) =>
      line(
        `中五像被人按了快進。補習社傳單、模擬時間表、學會海報疊在一起。公開試仍未到，它的影子已經坐在課室最後一排。${
          ctx.flags.grindExam ? "你還記得中四那個開夜的胃。" : "你還有選擇，要把哪一塊時間留下。"
        }`,
        `S5 feels as if someone has pressed fast-forward. Tutorial leaflets, mock timetables and club posters pile up. The public exam is not here yet. Its shadow already sits in the back row. ${
          ctx.flags.grindExam
            ? "You still remember the stomach from that S4 all-nighter."
            : "You still get to choose which block of time stays yours."
        }`,
      ),
    choices: (ctx) => {
      const activity = activityChoice(ctx);
      return [
        {
          id: "s5-tutor",
          label: line("再加一科補習", "Add one more tutorial class"),
          detail: line("學業被托住，好奇同睡眠一起讓位。", "Study is propped up. Curiosity and sleep both step aside."),
          effects: { academic: 8, wellbeing: -9, curiosity: -2, social: -2 },
          flags: { heavyTutor: true },
        },
        {
          id: "s5-activity",
          label: activity.label,
          detail: activity.detail,
          effects: { academic: 2, curiosity: 6, social: 5, wellbeing: 1 },
        },
        {
          id: "s5-honest",
          label: line("同屋企說，你其實已經很攰", "Tell your family that you are, in fact, exhausted"),
          detail: line("說出來不會自動減功課，但人會鬆一點。", "Saying it does not delete homework. A person can unclench a little."),
          effects: { wellbeing: 8, social: 4, academic: -1, curiosity: 1 },
          flags: { honestTired: true },
        },
      ];
    },
  },
  {
    id: "s5-showcase",
    year: "S5",
    kicker: line("中五 · 一月", "S5 · January"),
    title: (ctx) => SHOW[projectTrack(ctx.electives, ctx.flags.cca)].title,
    focus: line("作品", "A piece of work"),
    body: (ctx) => SHOW[projectTrack(ctx.electives, ctx.flags.cca)].body,
    choices: (ctx) => {
      const pack = SHOW[projectTrack(ctx.electives, ctx.flags.cca)];
      return [commitChoice(ctx, pack.commit), modestChoice(ctx, pack.modest), skipChoice(ctx, pack.skip)];
    },
  },
  {
    id: "s5-body",
    year: "S5",
    kicker: line("中五 · 四月", "S5 · April"),
    title: line("身體先舉手", "The body raises a hand first"),
    focus: line("身心", "Wellbeing"),
    body: (ctx) =>
      ctx.stats.wellbeing < 45
        ? line(
            "你最近常常在第一節打瞌睡，午餐也吃得很少。家琪把水杯推到你桌角，沒有說話。陳老師後來在走廊叫住你，只問這週睡得怎麼樣。",
            "Lately you doze in the first lesson, and lunch is small. Ka-ki slides a cup of water to the corner of your desk and does not speak. Later Ms Chan stops you in the corridor and only asks how you slept this week.",
          )
        : line(
            "事情很多，你還沒有倒下。陳老師在走廊叫住你，只問了一句：你這週睡得怎麼樣？這個問題比任何模擬試都難裝。",
            "There is a lot to do, and you have not fallen over. Ms Chan stops you in the corridor and asks only how you slept this week. That question is harder to fake than any mock exam.",
          ),
    choices: () => [
      {
        id: "s5-walk",
        label: line("請假半日去散步，不帶筆記", "Take half a day to walk, and leave the notes at home"),
        detail: line("身心明顯回升，學業稍停。", "Wellbeing rises plainly. Study pauses."),
        effects: { wellbeing: 10, academic: -2 },
      },
      {
        id: "s5-with-kaki",
        label: line("約家琪一起溫，中間允許聊天", "Revise with Ka-ki, and allow talk in the middle"),
        detail: line("人在旁邊，書也在。", "A person is beside you, and so are the books."),
        effects: { social: 6, wellbeing: 4, academic: 3 },
      },
      {
        id: "s5-push",
        label: line("再頂一頂，告訴自己快考完", "Push on, and tell yourself the exams are soon over"),
        detail: line("學業再挪一點，身體先記帳。", "Study inches forward. The body keeps the account."),
        effects: { academic: 6, wellbeing: -8 },
      },
    ],
  },
  {
    id: "s6-mock",
    year: "S6",
    kicker: line("中六 · 一月", "S6 · January"),
    title: line("校內模擬試", "The school mock"),
    focus: line("面對", "Facing it"),
    body: (ctx) => {
      const tone =
        ctx.stats.academic >= 72
          ? line(
              "模擬試的名次穩在班裡前段。你沒有想像中輕鬆，胃仍然緊。陳老師說：「穩，是用來讓你睡得著，不是用來比較。」",
              "Your mock places you toward the front of the class. You are not as light as you imagined. Your stomach is still tight. Ms Chan says, \"Steady is for sleeping, not for comparing.\"",
            )
          : ctx.stats.academic >= 55
            ? line(
                "有科目亮，有科目暗。總分落在中間。這不是判決，但它足夠讓你晚上睜着眼。",
                "Some subjects are bright and some are dim. The total sits in the middle. It is not a verdict. It is enough to keep your eyes open at night.",
              )
            : line(
                "分數未如你所願。陳老師叫你坐低，第一句不是責備：「我們還有時間，先看哪一科最值得救。」",
                "The marks are not what you wanted. Ms Chan asks you to sit. The first sentence is not a scolding: \"We still have time. Let us see which subject is most worth saving.\"",
              );
      const extra = ctx.flags.heavyTutor
        ? line("補習很多，你開始分不清哪一頁是自己的。", "The tutorials have piled up. You are starting to lose track of which page is yours.")
        : line("", "");
      const note = seniorAbilityNote(ctx.abilities, ctx.electives);
      return line(`${tone.zh}${extra.zh}${note.zh}`, `${tone.en} ${extra.en} ${note.en}`.replace(/\s+/g, " ").trim());
    },
    choices: () => [
      {
        id: "s6-plan",
        label: line("針對弱項，重排之後的時間表", "Aim at the weak subjects and redraw the timetable"),
        detail: line("學業再推一把，休息再少一點。", "Study gets another push. Rest gets smaller again."),
        effects: { academic: 8, curiosity: 2, wellbeing: -4 },
        flags: { mock: "plan" },
      },
      {
        id: "s6-understand",
        label: line("請老師講思路，不要只對答案", "Ask a teacher for the reasoning, not only the answers"),
        detail: line("好奇回到分數裡面。", "Curiosity comes back inside the marks."),
        effects: { academic: 4, curiosity: 8, social: 2 },
        flags: { mock: "understand" },
      },
      {
        id: "s6-rest",
        label: line("跟朋友互相打氣，今晚早睡", "Encourage one another, and sleep early tonight"),
        detail: line("身心同人際回升，學業仍有一點。", "Wellbeing and bonds recover. Study still moves a little."),
        effects: { wellbeing: 8, social: 6, academic: 2 },
        flags: { mock: "rest" },
      },
    ],
  },
  {
    id: "s6-spring",
    year: "S6",
    kicker: line("中六 · 四月", "S6 · April"),
    title: line("最後幾星期", "The last few weeks"),
    focus: line("節奏", "Pace"),
    body: () =>
      line(
        "學校把禮堂一角改成安靜溫習區。早上的海霧很白。你不需要向任何人報告每一科的感覺。這幾星期，你只決定怎樣過。遊戲不會給你一張真實的公開試成績單。",
        "The school turns a corner of the hall into a quiet revision space. The morning sea mist is white. You do not have to report how every paper feels. These weeks, you only decide how to pass them. The game will not hand you a real public-exam slip.",
      ),
    choices: () => [
      {
        id: "s6-pace",
        label: line("按自己的練習表走，不比較別人", "Follow your own practice plan and skip the comparisons"),
        detail: line("學業同身心一起站穩。", "Study and wellbeing both find their feet."),
        effects: { academic: 6, wellbeing: 4, social: 1 },
        flags: { spring: "steady" },
      },
      {
        id: "s6-cram",
        label: line("最後衝刺，能少睡便少睡", "A last sprint, sleeping as little as you can stand"),
        detail: line("學業再抬高，身體會記得。", "Study lifts again. The body will remember."),
        effects: { academic: 8, wellbeing: -10, curiosity: -1 },
        flags: { spring: "cram" },
      },
      {
        id: "s6-wonton",
        label: line("每考完一科，就去海傍吃一碗雲吞", "After each paper, eat a bowl of wonton by the water"),
        detail: line("家琪說這是策略。你的肩膀信她。", "Ka-ki calls it a strategy. Your shoulders believe her."),
        effects: { wellbeing: 6, social: 3, academic: 2 },
        flags: { spring: "care" },
      },
    ],
  },
];

export const SCENES: Scene[] = [...BASE_SCENES, ...ABILITY_SCENES, ...EXTRA_SCENES];

export function sceneById(id: string): Scene | undefined {
  return SCENES.find((scene) => scene.id === id);
}
