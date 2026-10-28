import { programmeById } from "@/content/programmes";
import { joinElectives, mathLabel } from "@/content/subjects";
import { programmeScore } from "@/lib/engine";
import { projectTrack } from "@/lib/track";
import type { CareerId, Lang, LocaleText, ProjectTrack, RunState } from "@/lib/types";
import { line, tx } from "@/lib/text";

const WORK: Record<CareerId, { title: LocaleText; body: LocaleText }> = {
  research: {
    title: line("海岸實驗室", "A coastal lab"),
    body: line(
      "你在望海大學讀完學士，留在海岸實驗室做初級研究助理，負責整理海水同空氣樣本。中學那個未完成的問題，變成履歷上第一段自己的句子。你還未帶研究組，但你知道樣本編號不能抄錯。",
      "After a bachelor's degree at Monghoi University you stay on as a junior assistant in a coastal lab, logging seawater and air samples. An unfinished question from school becomes the first sentence on your CV that is actually yours. You do not lead a group yet. You do know a sample number cannot be copied wrong.",
    ),
  },
  medicine: {
    title: line("很長的起步", "A long beginning"),
    body: line(
      "你獲遊戲中的醫學入門課程取錄。頭兩年仍是基礎科學、體能同很長的閱讀，離獨立看症很遠。你把作息寫在白板上，因為這條路比任何一次模擬試都長。",
      "The game offers you a place on the gateway medical course. The first two years are still basic science, physical stamina and long reading. Independent practice is far away. You write your hours on a whiteboard, because this road is longer than any mock exam.",
    ),
  },
  engineering: {
    title: line("工場的第一個實習", "A first workshop placement"),
    body: line(
      "維港理工的工程學院把你派到機電工作室實習。你學會看線路圖，也學會問師傅：「這一步可以再核對嗎？」海傍的風灌進工場門時，你會想起望潮的走廊。",
      "Harbour Polytechnic's engineering school sends you to a building-services workshop. You learn to read a circuit drawing, and to ask the technician, \"Can we check this step again?\" When the waterfront wind comes through the workshop door, you think of the corridor at Mongchiu.",
    ),
  },
  design: {
    title: line("一個被人摸到的蓋", "A lid people touch"),
    body: line(
      "你在一間小型產品工作室做初級設計。第一個真的被做出來的東西，是海傍垃圾桶的蓋。它不華麗。每天有很多人的手會摸到它。",
      "You join a small product studio as a junior designer. The first object that is actually made is a lid for the bins on the waterfront. It is not glamorous. A lot of hands will touch it every day.",
    ),
  },
  business: {
    title: line("街口對不上的模型", "The model and the street"),
    body: line(
      "你讀完工商管理，先在一間本地小店看客流同進貨。教科書的模型很整齊，街口的人潮不是。你開始習慣把兩者都寫下來，而不是只交一份漂亮的報告。",
      "After business school you start by watching footfall and deliveries at a local shop. The textbook model is tidy. The crowd at the junction is not. You get used to writing both down, instead of handing in only a handsome report.",
    ),
  },
  policy: {
    title: line("社區中心的筆記", "Notes from the centre"),
    body: line(
      "你讀社會政策，實習去了社區中心。你訪問街坊怎樣過暑假，筆記比任何模擬試都厚。你仍會緊張，但你問得出問題。",
      "You study social policy and your placement is at a community centre. You ask neighbours how they spend the summer. The notes are thicker than any mock exam. You still get nervous. You can ask the question.",
    ),
  },
  humanities: {
    title: line("舊漁船的牌", "The sign on an old fishing boat"),
    body: line(
      "你讀歷史與中文，在博物館做導賞見習，帶中學生看一艘舊漁船的牌。你會停一停，等最安靜的那個提問。",
      "You study history and Chinese, and train as a museum guide. You take secondary students to the sign on an old fishing boat. You pause, and wait for the quietest question.",
    ),
  },
  teaching: {
    title: line("工作紙上的留白", "Blank space on the worksheet"),
    body: line(
      "青洲教育大學的實習把你送回一間中學實驗室。你記得自己中五那年有多攰，所以工作紙留白多一點，也留時間給學生問為什麼。",
      "A placement from Green Isle University of Education sends you back to a secondary-school lab. You remember how tired S5 was, so the worksheet has more blank space, and time for a student to ask why.",
    ),
  },
  accounting: {
    title: line("旺季的長晝", "The long days of peak season"),
    body: line(
      "你在會計師樓做初級審計。旺季加班是真的。你開始分得清「準時交」同「做完仍知道自己是誰」。午飯如果趕得及，你仍會吃一碗雲吞。",
      "You join an accounting firm as a junior auditor. The peak-season overtime is real. You start to tell \"handed in on time\" apart from \"finished and still knowing who you are\". If lunch allows, you still eat a bowl of wonton.",
    ),
  },
  media: {
    title: line("旁白很少的影片", "A film with very little voiceover"),
    body: line(
      "創意媒體的作業要你交影片。你拍望潮中學舊禮堂拆棚的午後，旁白只有海聲同掃地聲。有人說太靜。你覺得靜也是內容。",
      "A creative-media assignment asks for a film. You shoot the afternoon when Mongchiu's old hall is taken down: sea noise, and a broom. Someone says it is too quiet. You think quiet is also content.",
    ),
  },
  "sub-sci": {
    title: line("斜一點的橋", "A steeper bridge"),
    body: line(
      "副學位頭兩年，你一邊上課，一邊在科學館當解說員。有人問你是不是讀不了學士。你答：我在讀。這條橋斜一點，仍是路。",
      "Through the first two years of the associate degree you study and explain exhibits at the science museum. Someone asks whether you could not get onto a bachelor's course. You answer: I am studying. The bridge is steeper. It is still a road.",
    ),
  },
  "sub-biz": {
    title: line("開門前的早班", "The shift before opening"),
    body: line(
      "商業副學位讓你先接觸帳目同顧客。你值早班，學會在開門前把銀頭數清。你打算之後再銜接學位，這一年先把班次站穩。",
      "The business associate degree puts you next to accounts and customers. You take the early shift and learn to count the float before the door opens. You may articulate onto a degree later. This year you make the shift solid.",
    ),
  },
  "sub-arts": {
    title: line("茶餐廳的早晨", "Morning in the café"),
    body: line(
      "文化與傳意的作業是社區訪問。你記錄茶餐廳老闆的早晨：湯底、報紙，同學生書包碰撞玻璃門的聲音。",
      "The culture-and-communication assignment is a neighbourhood interview. You record a café owner's morning: the soup base, the newspaper, and school bags knocking the glass door.",
    ),
  },
  work: {
    title: line("海傍的全職", "Full-time on the waterfront"),
    body: line(
      "這次模擬沒有給你學位或副學位取錄。你在海傍一間小店做全職，晚上讀兼讀證書，把中學筆記收進膠箱。你同家人說：我想再試，用自己的速度。",
      "This simulation does not offer you a degree or an associate place. You work full-time at a small waterfront shop, take a part-time certificate at night, and put your school notes in a plastic box rather than throwing them out. You tell your family: I want to try again, at a speed that is mine.",
    ),
  },
};

function memoryLine(run: RunState, lang: Lang): string {
  const fair = run.flags.fair;
  const track = (run.flags.projectTrack || projectTrack(run.electives, run.flags.cca)) as ProjectTrack;
  if (fair === "skip" || fair === "none") {
    return lang === "zh"
      ? "中五你把時間留給休息同其他科目。幾年後，你把那個決定看成允許的。"
      : "In S5 you gave the time to rest and your other subjects. Years later, you treat that decision as one you were allowed to make.";
  }
  if (fair === "rushed") {
    return lang === "zh"
      ? "那個項目你做完了，但做得太趕。你記住的是節奏，不是獎項。"
      : "You finished the project, and you rushed it. What stayed with you was the pace, not a prize.";
  }
  const prize = fair === "prize";
  const zh: Record<ProjectTrack, string> = {
    science: prize
      ? "港灣青少年科學展的牌子不大，你仍把當天的照片留在手機裡。"
      : "你在校內把科學作品講給陌生人聽。那是第一次完整地講完。",
    business: prize
      ? "青年店子點子給了你一張證書。你更記得老闆聽到數字時的表情。"
      : "你交了一份跟真實小店有關的報告。數字開始變得具體。",
    humanities: prize
      ? "你的口述記錄被社區中心借去展出。店主的聲音因此多留了一陣。"
      : "你訪問過海傍的店主。那幾段錄音仍在舊手機裡。",
    creative: prize
      ? "校展上有人在你的速寫前站很久。你沒有解釋太多。"
      : "你交了以校服同海風為題的作品。那是你第一次認真看自己的制服。",
    tech: prize
      ? "校務處真的用過你的失物頁一個月。有人因此找回水壺。"
      : "你做完失物小工具的課堂版。它不完美，表單是通的。",
    general: prize
      ? "學習周裡，你的小問題被貼在走廊上。有低年級同學問你資料從哪裡來。"
      : "你在學習周交出一個小小的問題。它沒有得獎，你卻學會了怎樣找資料。",
  };
  const en: Record<ProjectTrack, string> = {
    science: prize
      ? "The Harbour Youth Science Fair plaque is small. You still keep that day's photo on your phone."
      : "You explained a science piece to strangers at school. It was the first time you finished the telling.",
    business: prize
      ? "The youth shop challenge gave you a certificate. You remember the owner's face when the numbers landed."
      : "You handed in a report tied to a real shop. The numbers became concrete.",
    humanities: prize
      ? "The community centre borrowed your oral history for a small display. The shopkeeper's voice stayed a little longer."
      : "You interviewed a waterfront shopkeeper. The recordings are still on an old phone.",
    creative: prize
      ? "At the school show someone stood a long time in front of your sketches. You did not explain much."
      : "You submitted work about uniform and sea wind. It was the first time you really looked at your own uniform.",
    tech: prize
      ? "The office used your lost-property page for a month. Someone got a water bottle back."
      : "You finished the classroom version of the lost-property tool. It was imperfect. The form worked.",
    general: prize
      ? "During learning week your small question was pinned in the corridor. A younger student asked where the information came from."
      : "You offered a small question in learning week. It won nothing. You learned how to look things up.",
  };
  return (lang === "zh" ? zh : en)[track];
}

function lifeAfter(run: RunState, lang: Lang): string[] {
  const { flags } = run;
  if (lang === "zh") {
    const lines: string[] = [];
    if (flags.campus === "people") lines.push("入學或入職第一週，你把名字先認了一圈。");
    else if (flags.campus === "map") lines.push("第一週你先摸清課室、飯堂同洗手間，人稍後才熟。");
    else if (flags.campus === "home") lines.push("第一週你大多留在自己的角落，把節奏先守住。");
    if (flags.hours === "bounded") lines.push("你把收工和收書的時間寫死，並盡量遵守。");
    else if (flags.hours === "overtime") lines.push("你常常留下加時。做出來的東西多，人也更薄。");
    else if (flags.hours === "shifts") lines.push("你的星期被更表切開。你學會在空檔吃飯。");
    if (flags.dwelling === "dorm") lines.push("宿舍的走廊很吵，你卻第一次自己買燈泡。");
    else if (flags.dwelling === "share") lines.push("你跟朋友分租。公事和碗誰洗，要講清楚。");
    else if (flags.dwelling === "home") lines.push("你仍住家裡。晚飯還在，路卻更長。");
    if (flags.payday === "save") lines.push("第一筆錢你先存起一部分。");
    else if (flags.payday === "family") lines.push("第一筆錢你拿了一部分回家。");
    else if (flags.payday === "tool") lines.push("第一筆錢你買了一件會再用的工具或書。");
    if (flags.mentor === "ask") lines.push("你找到一個願意被問的人，問題因此比較不容易爛在肚子裡。");
    else if (flags.mentor === "watch") lines.push("你先看別人怎樣做，再決定要不要問。");
    if (flags.oldFriends === "keep") lines.push("望潮的人你還約。話題換了，位子還在。");
    else if (flags.oldFriends === "new") lines.push("新環境的人慢慢變熟，舊群組就靜了一點。");
    else if (flags.oldFriends === "quiet") lines.push("你把聯絡收細。這是選擇，不是失蹤。");
    if (flags.sideQuest === "question") lines.push("中學那個小問題你還在私下追，不為交功課。");
    else if (flags.sideQuest === "teach") lines.push("你開始把懂的東西講給更年少的人聽。");
    else if (flags.sideQuest === "drop") lines.push("有些中學問題你先放下。手上的生活已經夠滿。");
    if (flags.sunday === "sea") lines.push("星期日你還是會去看海。");
    else if (flags.sunday === "work") lines.push("星期日有時仍在做事。你知道這要有盡頭。");
    else if (flags.sunday === "people") lines.push("星期日留給人，不留給待辦。");
    if (flags.backup === "sub" && run.offerKind === "subdegree") lines.push("副學位是你事先想過的橋，所以你走得比較穩。");
    if (flags.backup === "work" && run.offerKind === "work") lines.push("你早想過可以先工作。真正發生時，你沒有假裝驚訝。");
    if (flags.backup === "retry" && (run.offerKind === "work" || run.offerKind === "subdegree")) lines.push("你把重來一次留在選項裡，同時先過眼前這一年。");
    return lines;
  }
  const lines: string[] = [];
  if (flags.campus === "people") lines.push("In the first week you learned names before you learned shortcuts.");
  else if (flags.campus === "map") lines.push("In the first week you learned the rooms, the canteen, and the washrooms. People came after.");
  else if (flags.campus === "home") lines.push("In the first week you mostly kept to your corner and protected the pace.");
  if (flags.hours === "bounded") lines.push("You wrote down when work and study stop, and you try to keep it.");
  else if (flags.hours === "overtime") lines.push("You often stay late. More gets done. You get thinner.");
  else if (flags.hours === "shifts") lines.push("The week is cut into shifts. You learned to eat in the gaps.");
  if (flags.dwelling === "dorm") lines.push("The hall corridor is noisy. You bought your own light bulb.");
  else if (flags.dwelling === "share") lines.push("You share a flat. Someone has to say who washes the bowls.");
  else if (flags.dwelling === "home") lines.push("You still live at home. Dinner is there. The journey is longer.");
  if (flags.payday === "save") lines.push("From the first pay you set a part aside.");
  else if (flags.payday === "family") lines.push("From the first pay you brought a part home.");
  else if (flags.payday === "tool") lines.push("From the first pay you bought a tool or a book you would use again.");
  if (flags.mentor === "ask") lines.push("You found someone who will be asked. Questions stop rotting in your stomach.");
  else if (flags.mentor === "watch") lines.push("You watch how other people do it before you decide to ask.");
  if (flags.oldFriends === "keep") lines.push("You still meet people from Mongchiu. The topics changed. The seat is there.");
  else if (flags.oldFriends === "new") lines.push("People in the new place become familiar. The old chat goes quieter.");
  else if (flags.oldFriends === "quiet") lines.push("You keep fewer messages. That is a choice, not a disappearance.");
  if (flags.sideQuest === "question") lines.push("You still follow that small school question in private, not for a grade.");
  else if (flags.sideQuest === "teach") lines.push("You started explaining what you know to someone younger.");
  else if (flags.sideQuest === "drop") lines.push("Some school questions can wait. The life in your hands is already full.");
  if (flags.sunday === "sea") lines.push("On Sundays you still go to look at the sea.");
  else if (flags.sunday === "work") lines.push("Some Sundays are still for tasks. You know that needs an edge.");
  else if (flags.sunday === "people") lines.push("Sunday is for people, not for the list.");
  if (flags.backup === "sub" && run.offerKind === "subdegree") lines.push("The associate route was a bridge you had already considered, so you cross it more steadily.");
  if (flags.backup === "work" && run.offerKind === "work") lines.push("You had already imagined starting with work. When it happened, you did not pretend to be shocked.");
  if (flags.backup === "retry" && (run.offerKind === "work" || run.offerKind === "subdegree")) lines.push("Trying again stays on the table, while you live this year first.");
  return lines;
}

function lifeParagraph(run: RunState, lang: Lang): string {
  const { social, wellbeing, curiosity } = run.stats;
  const bits: string[] = [memoryLine(run, lang)];
  if (lang === "zh") {
    if (social >= 62) {
      bits.push("星期六你仍會約林澄同家琪在舊區茶餐廳坐一個鐘。你們很少重溫試卷，多數爭最後一件西多士。");
    } else if (social >= 45) {
      bits.push("家琪偶爾在群組傳訊息，林澄有時寄來一張實驗室或街道的照片。你不是天天回，但知道他們在。");
    } else {
      bits.push("你同中學同學的聯絡變少了。有時在車廂看見相似的校服，會愣一愣，然後繼續趕路。");
    }
    if (wellbeing >= 62) bits.push("你把睡眠當成正事，身體比中六那年鬆一點。");
    else if (wellbeing >= 42) bits.push("你仍然會忙，但知道什麼時候該合上電腦。");
    else bits.push("頭兩年你常常透支。後來你向家人承認自己很攰，並把日程削走一截。這是調整。");
    if (curiosity >= 68) bits.push("床頭仍有一本未完的筆記，題目是你中學時留下的那個問題。");
    else if (curiosity >= 48) bits.push("好奇心沒有消失，它變成你做事時會多問一句的習慣。");
    else bits.push("你暫時少問為什麼。你給自己一年，先把生活站穩。");
    if (run.flags.doubt) bits.push("你記得中四曾經懷疑自己的選修。那份懷疑還在，它現在只是提醒。");
    else if (run.flags.honestTired) bits.push("屋企人知道你會說出累。晚飯因此少了一點盤問，多了一點湯。");
    else if (run.flags.spring === "care") bits.push("你後來仍保留一個小習慣：做完一件難事，就好好吃一頓。");
    else if (run.flags.home === "autonomy") bits.push("你仍然自己排時間。這件事從中二開始，現在變成你的工作方式。");
    bits.push(...lifeAfter(run, "zh"));
  } else {
    if (social >= 62) {
      bits.push("On Saturdays you still sit for an hour with Ching and Ka-ki in an old-district café. You rarely reopen exam papers. You mostly argue over the last piece of French toast.");
    } else if (social >= 45) {
      bits.push("Ka-ki sometimes sends a message. Ching sometimes sends a photo of a lab or a street. You do not answer every day. You know they are there.");
    } else {
      bits.push("You hear less from secondary classmates. Sometimes a similar uniform on the train makes you pause, and then you keep going.");
    }
    if (wellbeing >= 62) bits.push("You treat sleep as a real task. Your body is looser than it was in S6.");
    else if (wellbeing >= 42) bits.push("You are still busy, and you know when to close the computer.");
    else bits.push("For two years you often ran past empty. Then you told your family you were exhausted and cut a strip out of the calendar. That was an adjustment.");
    if (curiosity >= 68) bits.push("An unfinished notebook still sits by the bed. The question in it started at school.");
    else if (curiosity >= 48) bits.push("Curiosity did not vanish. It became the extra question you ask while you work.");
    else bits.push("For now you ask why less often. You gave yourself a year to stand your life up.");
    if (run.flags.doubt) bits.push("You remember doubting your electives in S4. The doubt is still there. These days it only reminds you.");
    else if (run.flags.honestTired) bits.push("Your family knows you will say when you are tired. Dinner has fewer interrogations and more soup.");
    else if (run.flags.spring === "care") bits.push("You kept a small habit: after something hard, you eat a proper meal.");
    else if (run.flags.home === "autonomy") bits.push("You still arrange your own hours. That started in S2. It is now how you work.");
    bits.push(...lifeAfter(run, "en"));
  }
  return bits.join(lang === "zh" ? "" : " ");
}

export function careerOf(run: RunState): CareerId {
  if (!run.offerId || run.offerKind === "work") return "work";
  return programmeById(run.offerId)?.career ?? "work";
}

export type EndingView = {
  kicker: string;
  workTitle: string;
  work: string;
  lifeTitle: string;
  life: string;
};

export function endingView(run: RunState, lang: Lang): EndingView {
  const career = careerOf(run);
  const work = WORK[career];
  return {
    kicker: lang === "zh" ? "幾年後 · 遊戲尾聲" : "A few years on · the game's epilogue",
    workTitle: tx(lang, work.title),
    work: tx(lang, work.body),
    lifeTitle: lang === "zh" ? "生活的一角" : "A corner of life",
    life: lifeParagraph(run, lang),
  };
}

export type OfferView = {
  kicker: string;
  headline: string;
  paragraphs: string[];
  ranked: { id: string; name: string; note: string; hit: boolean }[];
};

function missNote(run: RunState, id: string, lang: Lang): string {
  const programme = programmeById(id);
  if (!programme) return lang === "zh" ? "課程不存在" : "Unknown course";
  if (!programme.eligible(run)) {
    return lang === "zh"
      ? `選修未符合遊戲條件（${tx(lang, programme.requirement)}）`
      : `Electives miss the game requirement (${tx(lang, programme.requirement)})`;
  }
  const score = programmeScore(run, programme);
  return lang === "zh"
    ? `遊戲指數 ${score}，未到門檻 ${programme.threshold}`
    : `Game index ${score}, below the threshold of ${programme.threshold}`;
}

export function offerView(run: RunState, lang: Lang): OfferView {
  const ranked = run.ranking.map((id) => {
    const programme = programmeById(id);
    const name = programme ? `${tx(lang, programme.institution)} · ${tx(lang, programme.name)}` : id;
    const hit = run.offerId === id;
    const note = hit
      ? lang === "zh"
        ? "遊戲取錄"
        : "Game offer"
      : missNote(run, id, lang);
    return { id, name, note, hit };
  });

  const offered = programmeById(run.offerId);
  const offeredName = offered ? `${tx(lang, offered.institution)} · ${tx(lang, offered.name)}` : "";
  const paragraphs: string[] = [];

  if (run.offerKind === "work" || !offered) {
    paragraphs.push(
      lang === "zh"
        ? "遊戲由你的第一志願開始檢查。前面的志願未達到門檻，或選修未符合該課程的遊戲條件。副學位的補錄門檻這次也沒有達到。"
        : "The game checked your list from the top. Earlier choices missed a threshold, or your electives missed that course's rule. The associate-degree safety net missed its threshold too.",
    );
    paragraphs.push(
      lang === "zh"
        ? "下一幕是工作與生活，不是判決。你可以回頭重走，換一組選擇再看。"
        : "The next scene is work and life, not a verdict. You can walk the years again and change the choices.",
    );
  } else {
    const score = programmeScore(run, offered);
    const clearing = run.offerKind === "subdegree" && !run.ranking.includes(offered.id);
    paragraphs.push(
      lang === "zh"
        ? `遊戲由第一志願開始順延。今次取錄的是${offeredName}。遊戲指數 ${score}，該課程門檻 ${offered.threshold}。`
        : `The game walked your list from the top. This run offers ${offeredName}. Game index ${score}, course threshold ${offered.threshold}.`,
    );
    if (run.passedOver.length > 0) {
      paragraphs.push(
        lang === "zh"
          ? "排在前面而沒有取錄的志願，原因寫在下方清單。常見原因是門檻未到，或選修對不上。"
          : "Choices placed higher, without an offer, are listed below. The usual reasons are a missed threshold, or electives that do not match.",
      );
    }
    if (clearing) {
      paragraphs.push(
        lang === "zh"
          ? "這是遊戲裡的副學位補錄，不是你排在名單上的志願。學位課程未達到門檻，系統才走到這裡。"
          : "This is the game's associate-degree safety net, not a course you ranked. The degree courses missed their thresholds, so the game came here.",
      );
    }
    paragraphs.push(
      lang === "zh"
        ? `你的選修是${joinElectives(run.electives, "zh")}，${mathLabel(run.mathModule, "zh", "short")}。這些選擇進入了指數，它們不是真實收生條件。`
        : `Your electives were ${joinElectives(run.electives, "en")}, with ${mathLabel(run.mathModule, "en", "short")}. Those choices fed the index. They are not real entry rules.`,
    );
  }

  paragraphs.push(
    lang === "zh"
      ? "學途聯招是虛構排序遊戲，不是大學聯合招生，亦不提供升學建議。"
      : "The Hoktou preference round is a fictional ranking game. It is not a real university admissions system, and it is not advice.",
  );

  const headline =
    run.offerKind === "work" || !offered
      ? lang === "zh"
        ? "這次沒有課程取錄"
        : "No course offer this run"
      : lang === "zh"
        ? `取錄：${offeredName}`
        : `Offer: ${offeredName}`;

  return {
    kicker: lang === "zh" ? "中六之後 · 學途聯招" : "After S6 · Hoktou preference round",
    headline,
    paragraphs,
    ranked,
  };
}

export function pathLine(run: RunState, lang: Lang): string {
  const track = (run.flags.projectTrack || projectTrack(run.electives, run.flags.cca)) as ProjectTrack;
  const trackName: Record<ProjectTrack, LocaleText> = {
    science: line("理科探索", "Science thread"),
    business: line("商業探索", "Business thread"),
    humanities: line("人文探索", "Humanities thread"),
    creative: line("創作探索", "Creative thread"),
    tech: line("科技探索", "Technology thread"),
    general: line("綜合探索", "General thread"),
  };
  const fairName: Record<RunState["flags"]["fair"], LocaleText> = {
    none: line("未做專題", "No project"),
    prize: line("作品得到遊戲裡的一點認可", "The project earned a little in-game recognition"),
    shown: line("作品有對外講過", "The project was explained to others"),
    school: line("作品留在校內", "The project stayed in school"),
    rushed: line("作品做得太趕", "The project was rushed"),
    skip: line("中五把項目讓出", "The S5 project was set aside"),
  };
  const ending = endingView(run, lang).workTitle;
  return [tx(lang, trackName[track]), tx(lang, fairName[run.flags.fair]), ending].join(lang === "zh" ? " · " : " · ");
}
