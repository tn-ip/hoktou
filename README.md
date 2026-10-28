# 學途 Hoktou

香港中學生活模擬遊戲。玩家由虛構的望潮中學中一讀到中六，在中三選科，在中六排列一份**遊戲裡的**升學志願，然後看到與這條路相連的工作與生活。

This is a fictional secondary-school life simulation set in Hong Kong. You begin Secondary 1 at the invented Mongchiu Secondary School, choose electives in S3, rank a short fictional preference list in S6, and see a work-and-life epilogue tied to that path.

## 免責 Disclaimer

學途是虛構遊戲，與任何考試機構、大學或招生系統無關。畫面上的「學業、好奇、身心、人際」、遊戲指數、選科後果同學途聯招取錄，全部由本遊戲規則計算。**它們不是公開試成績，亦不是升學或就業輔導。** 相同的選擇會得到相同結果，方便課堂上問「如果當時選另一項」。

Hoktou is a game. It is not affiliated with any examinations body, university, or admissions system. The four stats, the game index, subject consequences and preference-round offers are calculated by these rules. **They are not public-exam results and they are not counselling advice.** The same choices always give the same result, so a class can ask what another action would have done.

## 本地執行 Run locally

需要 Node.js 20 或以上。

```bash
npm install
npm run dev
```

瀏覽器打開 [http://localhost:3000](http://localhost:3000)。

To check the rules and production build:

```bash
npm test
npm run build
npm start
```

進度只存在這部瀏覽器的 `localStorage`（鍵名 `hoktou.v1`）。沒有帳戶，也不會上傳。

Progress stays in this browser under `localStorage` (`hoktou.v1`). There is no account and nothing is uploaded.

## 怎樣玩 How to play

1. 標題畫面選語言（繁體中文／English）、旅程長度，然後開始。
2. **快速**大約十個決定；**標準**在中一至中三多停幾張卡，大約二十個決定。兩種長度都會走完中一、中二、中三選科、中四至中六、志願同尾聲。
3. 每張卡是一年裡的一個場面，選一至三個做法。四項狀態會跟著動。
4. 中三選三科選修，可另選數學延伸單元一或二。
5. 中六把虛構課程由上至下排列。遊戲由第一志願開始，第一個同時符合科目條件同門檻的課程會取錄。
6. 尾聲是早年工作與生活。總結可以重新開始。

The title screen has Traditional Chinese and English, plus Fast and Standard length. Fast is about ten decisions. Standard lingers in junior secondary, about twenty. Both include S1–S3, electives, S4–S6, the preference round and the epilogue. Each card has one to three actions. The four on-screen stats are 學業 Study, 好奇 Curiosity, 身心 Wellbeing and 人際 Bonds.

## MVP 範圍 Scope

包含：

- 望潮中學，中一至中六的年度敘事卡
- 中三選科（預設組合或自選三科，加可選延伸數學）
- 選修會改寫之後的課堂、中五作品（科學展、店子點子、口述、創作、小工具或學習周）同學途聯招結果
- 四項狀態、快速／標準長度、繁體中文與英文
- 本地儲存、總結與重新開始

未包含：帳戶、多人、真實學校資料、教師後台、真過去卷。靈感只借「一年一卡、選擇、狀態、總結」這種玩法結構；文字、校名、課程同畫面都是原創。

Included: year cards from S1 to S6, S3 electives, later scenes and a fictional preference round that follow those electives, four stats, two lengths, zh-Hant-HK and English, local save, summary and restart.

Not included: accounts, multiplayer, real school data, a teacher dashboard, or past papers. The year-card structure is a common life-sim shape. The writing, school, courses and interface are original.

## 開發 Development

內容在 `content/`（場面、科目、虛構課程、結局）。規則在 `lib/engine.ts`。介面在 `components/GameApp.tsx`。

Content lives in `content/`. Rules live in `lib/engine.ts`. The interface is `components/GameApp.tsx`.
