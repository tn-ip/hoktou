# 學途 Hoktou

線上玩：[https://tn-ip.github.io/hoktou/](https://tn-ip.github.io/hoktou/)

香港中學生活模擬遊戲。玩家由虛構的望潮中學中一讀到中六，在中三選科，在中六排列一份**遊戲裡的**升學志願，然後看到與這條路相連的工作與生活。

This is a fictional secondary-school life simulation set in Hong Kong. You begin Secondary 1 at the invented Mongchiu Secondary School, choose electives in S3, rank a short fictional preference list in S6, and see a work-and-life epilogue tied to that path.

## 線上版 GitHub Pages

推送到 `main` 會跑 [`.github/workflows/pages.yml`](.github/workflows/pages.yml)。流程用 `npm ci`、`npm test`、`npm run build`，再以官方的 `actions/upload-pages-artifact` 與 `actions/deploy-pages` 發佈 `out/`。沒有用 Vercel。

網站是 GitHub 專案頁，掛在子路徑 `/hoktou`。`next.config.ts` 設定 `output: 'export'`、`basePath`、`assetPrefix` 同 `trailingSlash`，所以腳本、樣式同字型都會從 `https://tn-ip.github.io/hoktou/` 載入。未知路徑會回到同一套客戶端頁面（`out/404.html`）。

這個倉庫的 Pages source 已設為 **GitHub Actions**（Settings → Pages → Build and deployment → Source）。

Pushes to `main` run [`.github/workflows/pages.yml`](.github/workflows/pages.yml): `npm ci`, `npm test`, `npm run build`, then the official `actions/upload-pages-artifact` and `actions/deploy-pages` steps publish the `out/` folder. This does not use Vercel.

The site is a GitHub project page under `/hoktou`. `next.config.ts` sets `output: 'export'`, `basePath`, `assetPrefix`, and `trailingSlash`, so scripts, CSS, and fonts load from `https://tn-ip.github.io/hoktou/`. Unknown paths serve the same client app (`out/404.html`).

This repository's Pages source is **GitHub Actions** (Settings → Pages → Build and deployment → Source).

## 免責 Disclaimer

學途是虛構遊戲，與任何考試機構、大學或招生系統無關。畫面上的「學業、好奇、身心、人際」、遊戲指數、選科後果同學途聯招取錄，全部由本遊戲規則計算。**它們不是公開試成績，亦不是升學或就業輔導。** 相同的選擇會得到相同結果，方便課堂上問「如果當時選另一項」。

Hoktou is a game. It is not affiliated with any examinations body, university, or admissions system. The four stats, the game index, subject consequences and preference-round offers are calculated by these rules. **They are not public-exam results and they are not counselling advice.** The same choices always give the same result, so a class can ask what another action would have done.

## 本地執行 Run locally

需要 Node.js 20 或以上。

```bash
npm install
npm run dev
```

瀏覽器打開 [http://localhost:3000/hoktou](http://localhost:3000/hoktou)。開發同線上都用 `/hoktou` 子路徑。

To check the rules and the static export:

```bash
npm test
npm run build
npm start
```

`npm run build` 寫入 `out/`。`npm start` 用同一個子路徑預覽靜態檔：[http://localhost:3000/hoktou/](http://localhost:3000/hoktou/)。`next start` 不適用於靜態匯出。

`npm run build` writes `out/`. `npm start` previews those static files at [http://localhost:3000/hoktou/](http://localhost:3000/hoktou/). `next start` does not serve a static export.

進度只存在這部瀏覽器的 `localStorage`（鍵名 `hoktou.v1`）。沒有帳戶，也不會上傳。

Progress stays in this browser under `localStorage` (`hoktou.v1`). There is no account and nothing is uploaded.

## 怎樣玩 How to play

1. 標題畫面選語言（繁體中文／English），寫花名，揀兩至三項興趣，然後開始。新遊戲一律走完整條標準旅程。
2. 興趣會定好開局能力表（十五科，1 至 10，大約由 5 起步）同四項狀態（學業、好奇、身心、人際，大約 5 至 6）。
3. 每張卡是一個場面，選二至四個做法。四項狀態、各科能力、選科提示、遊戲指數或尾聲會跟著動。狀態或科目到 4 或以下，相關嘅比賽、工作坊同活動會去不成，並寫明原因。中一、中二有十六個能力場面，選完會顯示能力同狀態。
4. 中三能力表一直留喺畫面。遊戲會按能力同興趣建議一組三科選修，你可以照用，亦可以自己改。提醒只在交表時出現，可以堅持，也可以返回改。
5. 中六把虛構課程由上至下排列。遊戲由第一志願開始，第一個同時符合科目條件同門檻的課程會取錄。
6. 尾聲是早年工作與生活。總結可以重新開始。

四個里程會暫停片刻：中一第一個選擇之後、進入選科之前、進入學途聯招之前，以及離開校園、看見下一段之前。每次可以寫一句（最多約 120 字），也可以跳過。寫下的句子會以你的原話引在總結上，並註明是哪一個里程；跳過或空白不會出現。這些句子只是敘事，不改變狀態、選科或取錄。

The title screen has Traditional Chinese and English. A new game asks for a nickname and two or three interests, then takes the full standard journey from S1 into work and life. Interests seed the fifteen subject abilities (1 to 10, starting near 5) and the four stats 學業 Study, 好奇 Curiosity, 身心 Wellbeing and 人際 Bonds (shown as 1 to 10, starting near 5 or 6). At 4 or below, matching contests, workshops and trips are closed, with a reason on the card. S3 keeps the full ability board up, suggests a three-elective mix, and still lets you change it. Reminders appear only when the form is handed in.

The journey pauses four times: after the first S1 choice, before electives, before the Hoktou list, and once school is over, before the next stretch. Each pause asks for one optional line (about 120 characters) or a skip. Written lines are quoted on the summary in your words, labelled by milestone. Skipped or blank lines are left out. The lines are narrative only. They do not change stats, electives, or the offer.

## MVP 範圍 Scope

包含：

- 望潮中學，中一至中六的年度敘事卡
- 中三選科（預設組合或自選三科，加可選延伸數學）
- 選修會改寫之後的課堂、中五作品（科學展、店子點子、口述、創作、小工具或學習周）同學途聯招結果
- 四項狀態（1 至 10）、花名同興趣、繁體中文與英文。新遊戲走標準長度
- 本地儲存、總結與重新開始
- 四個里程的暫停片刻：可寫一句，或跳過。寫下的話會引在總結

未包含：帳戶、多人、真實學校資料、教師後台、真過去卷。靈感只借「一年一卡、選擇、狀態、總結」這種玩法結構；文字、校名、課程同畫面都是原創。

Included: year cards from S1 to S6, S3 electives, later scenes and a fictional preference round that follow those electives, four stats, a nickname and interests, zh-Hant-HK and English, local save, summary and restart. Four milestone pauses can keep one line each, or be skipped; written lines are quoted on the summary. New games use the full standard length.

Not included: accounts, multiplayer, real school data, a teacher dashboard, or past papers. The year-card structure is a common life-sim shape. The writing, school, courses and interface are original.

## 開發 Development

內容在 `content/`（場面、科目、虛構課程、結局）。規則在 `lib/engine.ts`。介面在 `components/GameApp.tsx`。

Content lives in `content/`. Rules live in `lib/engine.ts`. The interface is `components/GameApp.tsx`.
