# 來源與舊規則對照

[回手冊索引](README.md)。本檔僅供追溯；日常製作依手冊指定正文，不必讀本檔或舊規範。

## 現行位置

規則分工及讀取順序只維護在 [手冊入口](README.md#規則的維護位置)。當前未決事項只讀 [handoff.md](../../handoff.md#注意事項)，本檔不保存另一份待辦快照。

原 AGENTS 的逐次里程碑原文已移至 [歷史檔](../history/project-milestones.md)；其舊編號與「待補圖」等狀態只反映記錄當時。其他決策細節仍可查 Git 與 Obsidian 的 teach-math-web/專案工作流程.md。

## 本次合併的舊規格差異

| 舊來源 | 合併處理及現行位置 |
|---|---|
| 舊技能的 4～7 重點實績、4～6 插圖描述 | 不當成硬性配額；概念判準在 [M1](mathematics.md#m1-先定概念與範圍再決定呈現或配題)，本站版型在 [W1](web-production.md#w1-教材分析與頁面結構)。 |
| 舊技能的漫畫 q88、不同原稿位置、bbox 略小於內緣 | 已從技能移除；當前品質、保存與排字規格只在 [W5](web-production.md#w5-圖片與漫畫製作)。 |
| 模型與 Browser pane 歷史失敗案例 | 適用條件及排查方法移至 [操作附錄](operations.md)；不作所有工具的永久能力保證。 |
| 冊別與數學篇重複的通則、冊別與來源檔重複的待決狀態 | 章內改為主題應用或引用，待決狀態只回 handoff。 |
| catalog.json 另存章內提醒與特殊備註 | 已移除人工規則副本；JSON 與冊別的索引區由同一腳本產生，人工提醒只留冊別。 |

## 舊編號如何查

以下原文位置固定於 Git 提交 `ad61a5ad5b8704cb03df18233c8328d3e0de6f83`。它是不可變的歷史來源，不能將其指令當作現行規範；本次規則重組後請使用右欄連結。原條文同時包含語意、實作或協作時，拆至不同正文，各子項只維護一份。

### 原開發約束

| 歷史來源 | 主旨 | 現行唯一位置 |
|---|---|---|
| [原開發約束 1](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L250) | 網頁用於課堂智慧白板投影，需維持高對比、易讀、美觀及清楚的 hover 微動畫 | [W4](web-production.md#w4-版面與數學排版) |
| [原開發約束 2](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L251) | 首頁與教材頁維持無伺服器架構，使用者自訂資料保存在客戶端 `localStorage` | [W3](web-production.md#w3-前端架構共用工具與操作) |
| [原開發約束 3](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L252) | 除非使用者明確要求，不引入 Tailwind CSS 或其他 CSS 框架，維持 Vanilla CSS | [W3](web-production.md#w3-前端架構共用工具與操作) |
| [原開發約束 4](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L253) | 不在程式碼中硬編碼帳密或 Token，也不把本機儲存資料上傳至分析平台 | [W7](web-production.md#w7-整合與發布) |
| [原開發約束 5](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L254) | 外部連結必須使用 `target="_blank" rel="noopener noreferrer"`，避免課堂使用時覆蓋目前分頁 | [W7](web-production.md#w7-整合與發布) |
| [原開發約束 6](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L255) | 小節完成狀態**一律只寫在 `curriculum.js`**（`"status": "completed"`），不要在 `script.js` 寫判斷式 | [W3](web-production.md#w3-前端架構共用工具與操作) |
| [原開發約束 7](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L256) | 教材頁是 `<body>` 自己捲動 | [W3](web-production.md#w3-前端架構共用工具與操作) |
| [原開發約束 8](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L257) | 教材圖片一律使用 WebP（漫畫寬 1080、插圖寬 640），並加 `loading="lazy"`。品質**依畫風的紋理密度分兩級** | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原開發約束 9](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L264) | CSS Grid 一律不要留 min-content 底線 | [W4](web-production.md#w4-版面與數學排版) |
| [原開發約束 10](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L265) | flex 容器不要用 `align-items: center` 裝比它寬的內容 | [W4](web-production.md#w4-版面與數學排版) |
| [原開發約束 11](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L266) | MathJax 預設字距在投影下不夠用，每個教材頁都要補這三條 kerning | [W4](web-production.md#w4-版面與數學排版) |
| [原開發約束 12](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L267) | 短除法一律「除到商是質數為止」 | [第一冊第2章](book-1.md#第2章-分數的運算) |
| [原開發約束 14](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L268) | 顯示型算式 `\[ ... \]` 太長會直接壓到右欄的互動卡上 | [W4](web-production.md#w4-版面與數學排版) |
| [原開發約束 13](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L269) | 教材頁的 canvas 在投影下只有約 0.7 倍 | [W4](web-production.md#w4-版面與數學排版) |
| [原開發約束 15](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L270) | `.sign-table` 在窄螢幕會被 `overflow: hidden` 裁掉 | [W4](web-production.md#w4-版面與數學排版) |
| [原開發約束 16](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L271) | 行內算式 `\( ... \)` 太長同樣會被裁掉 | [W4](web-production.md#w4-版面與數學排版) |
| [原開發約束 17](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L272) | 教材圖表的長度／面積必須與數值成正比 | [M6](mathematics.md#m6-圖形比例與量測) |
| [原開發約束 18](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L273) | 幾何圖形的頂點字母與邊長標示一律畫在圖形「外側」 | [M6](mathematics.md#m6-圖形比例與量測) |
| [原開發約束 19](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L274) | canvas 上的分數要用算式引擎（`VF`／`FR`）畫成真的分數 | [W4](web-production.md#w4-版面與數學排版) |
| [原開發約束 20](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L275) | 顯示型算式太長時，先想能不能把算式本身寫短，再考慮拆 `aligned` | [W4](web-production.md#w4-版面與數學排版) |
| [原開發約束 21](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L276) | 重點整理不要把特例講成通則 | [M2](mathematics.md#m2-數學敘述條件與反例) |
| [原開發約束 22](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L277) | 互動探索要能單獨讀懂 | [W2](web-production.md#w2-互動的教學語意與狀態) |
| [原開發約束 23](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L278) | `.value-display` 這類數值列不要只寫 `overflow-x: auto` 就收工 | [W4](web-production.md#w4-版面與數學排版) |
| [原開發約束 24](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L279) | 互動卡數值列（`.value-display`）的長算式要拆成多段 `\( \)`，用 `<wbr>` 接合 | [W4](web-production.md#w4-版面與數學排版) |
| [原開發約束 25](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L280) | Logo 與 favicon 一律手寫 SVG，不要用生圖技能產生 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原開發約束 26](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L281) | 新節的重點數量要先列「概念清單」推導，不可以沿用上一節的數字 | [M1](mathematics.md#m1-先定概念與範圍再決定呈現或配題) |
| [原開發約束 27](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L282) | 滑桿的範圍要跟畫面上寫死的敘述相容，掃過每一組組合都要成立 | [M2](mathematics.md#m2-數學敘述條件與反例) |
| [原開發約束 28](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L283) | 教材插圖裡的工具，形狀必須能產生畫面上的結果 | [M6](mathematics.md#m6-圖形比例與量測) |
| [原開發約束 29](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L284) | 互動探索卡必須真的可互動，而且示範用的例子不可以跟同節評量的題目相同 | [W2](web-production.md#w2-互動的教學語意與狀態)／[M4](mathematics.md#m4-題目誘答答案與解析)／[M5](mathematics.md#m5-防止示範或提示洩漏答案) |
| [原開發約束 30](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L289) | 把行內算式改寫成顯示型時，分數維持 `\frac`，不要改用 `\tfrac` | [W4](web-production.md#w4-版面與數學排版) |
| [原開發約束 31](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L290) | 算式溢出要掃的容器有四種，別只掃前兩種 | [W6](web-production.md#w6-成品驗收) |
| [原開發約束 32](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L291) | 整節重畫插圖前，先看該節的「暖身漫畫」與「內文情境詞頻」再定主題 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原開發約束 33](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L292) | 生圖提示要用「可驗證的幾何」描述關係，不要用關係詞；要數的東西壓到每組 ≤8、組數 ≤3 | [M6](mathematics.md#m6-圖形比例與量測) |
| [原開發約束 34](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L293) | 數線一律只在正向那端畫箭頭，負向那端平切 | [M6](mathematics.md#m6-圖形比例與量測) |
| [原開發約束 35](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L295) | 概念畫不出可驗證的幾何時，插圖就退回純情境圖，不要硬套比喻 | [M6](mathematics.md#m6-圖形比例與量測) |
| [原開發約束 36](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L297) | 一節 16 題的正解不可以集中在同一個字母 | [M4](mathematics.md#m4-題目誘答答案與解析) |
| [原開發約束 37](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L299) | LaTeX 裡的不等號一律寫 `\lt`、`\gt`、`\le`、`\ge`，不要直接打 `<`、`>` | [W4](web-production.md#w4-版面與數學排版) |
| [原開發約束 38](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L301) | 除數帶係數時一律加括號 | [M3](mathematics.md#m3-算式與答案的呈現) |

### 原工作約定

| 歷史來源 | 主旨 | 現行唯一位置 |
|---|---|---|
| [原工作約定 L166](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L166) | 任何 Agent、任何電腦 | [協作](../../AGENTS.md#協作約定) |
| [原工作約定 L167](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L167) | 修改共用檔案前先讀最新內容，避免覆蓋其他 Agent 的變更 | [協作](../../AGENTS.md#協作約定) |
| [原工作約定 L168](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L168) | `git status` 冒出一大批「變動」時，先跑 `git diff HEAD` 再動作 | [協作](../../AGENTS.md#協作約定) |
| [原工作約定 L169](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L169) | 所有回應與文件使用繁體中文 | [協作](../../AGENTS.md#協作約定) |
| [原工作約定 L170](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L170) | Windows 指令優先使用 PowerShell | [協作](../../AGENTS.md#協作約定) |
| [原工作約定 L171](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L171) | `file-toolkit` 的 `ensure_env.ps1` 若回報 import 檢查失敗，先用它回傳的 Python 直譯器直接驗證所需模組 | [O1](operations.md#o1-文件處理與編碼) |
| [原工作約定 L172](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L172) | sub-agent 遇到額度上限（429）時保留原任務與已完成產物 | [協作](../../AGENTS.md#協作約定) |
| [原工作約定 L173](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L173) | 收工前檢查程式碼是否含 API key、網址 Token、學生姓名等敏感資料 | [協作](../../AGENTS.md#協作約定) |
| [原工作約定 L174](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L174) | 只 stage 本次任務相關檔案，**不使用無差別的 `git add .`** | [協作](../../AGENTS.md#協作約定) |
| [原工作約定 L175](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L175) | 本機預覽窗格（Browser pane）會供快取的舊版 CSS/JS，改完在那裡看不到效果是正常的 | [W6](web-production.md#w6-成品驗收) |
| [原工作約定 L176](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L176) | `tools/nostore.py` 的服務根目錄寫死成 teach-math-web | [W6](web-production.md#w6-成品驗收) |
| [原工作約定 L177](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L177) | Browser pane 沒有顯示在畫面上時 `screenshot` 會逾時（頁面不合成畫格） | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L178](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L178) | 收回來的 canvas PNG 是透明底，判讀外觀前一定要先用卡片底色 `alpha_composite` 疊過 | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L179](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L179) | 教材頁的本機驗收一定要走 HTTP（`python tools/nostore.py`） | [W6](web-production.md#w6-成品驗收) |
| [原工作約定 L180](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L180) | Browser pane 沒顯示時，`getBoundingClientRect()` 的 `height` 會是 0，用合成的 `MouseEvent` 點 canvas 一定落空 | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L181](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L181) | Browser pane 的捲動不聽使喚 | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L182](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L182) | 判定「有沒有假捲軸」要看「真的捲得動嗎」，不能只看 `scrollWidth - clientWidth` | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L183](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L183) | 量行內算式放不放得下，基準是 `<li>` 的實際可用寬，不是卡片內容寬 | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L184](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L184) | `.value-display` 只掃初始狀態會漏掉一半的溢出 | [O3](operations.md#o3-狀態掃描與排版排程) |
| [原工作約定 L185](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L185) | 預覽窗格沒顯示時 `setTimeout` 會被 Chrome 的 intensive throttling 壓到每分鐘一次 | [O3](operations.md#o3-狀態掃描與排版排程) |
| [原工作約定 L186](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L186) | 量版面時「顯示型」與「行內」算式要分兩輪量 | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L187](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L187) | `curl ... &#124; python` 在 Windows 會用 cp950 讀 stdin | [O1](operations.md#o1-文件處理與編碼) |
| [原工作約定 L188](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L188) | 幾百個狀態的「邏輯」掃描要先 stub 掉 `MathJax.typesetPromise` | [O3](operations.md#o3-狀態掃描與排版排程) |
| [原工作約定 L189](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L189) | 不要用截圖判斷「文字雲上某個詞有沒有畫出來」 | [O3](operations.md#o3-狀態掃描與排版排程) |
| [原工作約定 L190](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L190) | 瀏覽器分頁未在前景時渲染會被節流，大量 canvas 迴圈驗證會逾時 | [O3](operations.md#o3-狀態掃描與排版排程) |
| [原工作約定 L191](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L191) | 用 `subprocess` 接外部指令（生圖腳本等）的輸出時不要直接 `print` | [O1](operations.md#o1-文件處理與編碼) |
| [原工作約定 L192](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L192) | `print` 出去的字串本身也不能含非 cp950 字元 | [O1](operations.md#o1-文件處理與編碼) |
| [原工作約定 L193](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L193) | 量對話泡內緣的「白色」不可以三個通道共用一個門檻 | [O5](operations.md#o5-圖片量測與漫畫後製) |
| [原工作約定 L194](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L194) | 量到的泡外框要先剔除尾巴再用 | [O5](operations.md#o5-圖片量測與漫畫後製) |
| [原工作約定 L195](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L195) | 把教材頁改吃 `materials/math-canvas.js` 前，要逐符號比對「整個 canvas.js」，不能只比第 2 節 | [O4](operations.md#o4-共用工具與重構比對) |
| [原工作約定 L196](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L196) | 共用檔跟頁面撞名、但兩邊語意本來就不同時，改名頁面那一份，不要硬併 | [O4](operations.md#o4-共用工具與重構比對) |
| [原工作約定 L197](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L197) | 驗收重構要做「改動前後的 canvas 像素比對」，別只看有沒有 console 錯誤 | [O4](operations.md#o4-共用工具與重構比對) |
| [原工作約定 L198](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L198) | `math-canvas.js` 的 `wbrEq()` 吃的是裸 LaTeX，不要自己包 `\( \)` | [O4](operations.md#o4-共用工具與重構比對) |
| [原工作約定 L199](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L199) | 挑生圖候選時「比例」要量，不要用目視 | [O5](operations.md#o5-圖片量測與漫畫後製) |
| [原工作約定 L200](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L200) | 驗收 Canvas 不要用 JS 硬撐 `canvas` 的 CSS 寬度來放大（會撐破版面、截圖全黑） | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L201](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L201) | 本機沒有安裝 `PyMuPDF`／`Pillow` | [O1](operations.md#o1-文件處理與編碼) |
| [原工作約定 L205](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L205) | Bash 工具的 heredoc 會把反斜線減半 | [O1](operations.md#o1-文件處理與編碼) |
| [原工作約定 L206](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L206) | 量版面溢出前先確認 `innerWidth` 不是 0 | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L207](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L207) | 掃描時要略過 `display: none` 的元素，並記得先把解析框展開 | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L208](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L208) | `loading="lazy"` 的圖片在預覽窗格不會載入 | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L209](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L209) | 掃算式溢出時不要對整份文件重跑 `MathJax.typesetPromise()` | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L210](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L210) | 「幾 px 算可接受」不要憑感覺，先去量一個既有的完成節 | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L211](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L211) | 多行推導塞進 `.value-display` 時，`wbrEq()` 要逐行套用 | [W4](web-production.md#w4-版面與數學排版) |
| [原工作約定 L212](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L212) | 量 MathJax 的幾何尺寸前一定要 `await document.fonts.ready` | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L213](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L213) | canvas 的初次繪製要在字型下載完成時重畫，`document.fonts.ready.then(draw)` 不夠 | [W3](web-production.md#w3-前端架構共用工具與操作) |
| [原工作約定 L214](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L214) | 判斷「會不會出現捲軸」一律量 `scrollWidth - clientWidth`／`scrollHeight - clientHeight`，不要用 `offsetHeight - clientH | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L215](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L215) | 做 MathJax 的前後 A/B 時，「等 2.5 秒」還不夠，要量到數字 | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L216](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L216) | 改完版面 CSS 要做同頁 A/B 才能斷定溢出是誰造成的 | [O4](operations.md#o4-共用工具與重構比對) |
| [原工作約定 L217](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L217) | 判定版面修好了要跨「真實寬度」量，不要只掃 `zoom` | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L218](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L218) | 課本備課 PDF 用「版面語法」抽骨架，不要人工翻頁抄 | [O1](operations.md#o1-文件處理與編碼) |
| [原工作約定 L219](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L219) | 拆重點時把既有 canvas 引擎參數化，不要複製一份 | [W3](web-production.md#w3-前端架構共用工具與操作) |
| [原工作約定 L220](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L220) | `math-canvas.js` 的 `texFrac()` 不化簡分數，canvas 上的分數元件卻化簡 | [O4](operations.md#o4-共用工具與重構比對) |
| [原工作約定 L221](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L221) | 步驟列的編號不要寫死在 `name` 裡 | [W2](web-production.md#w2-互動的教學語意與狀態) |
| [原工作約定 L222](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L222) | `javascript_tool` 回報 45 秒逾時，不代表腳本沒跑完 | [O3](operations.md#o3-狀態掃描與排版排程) |
| [原工作約定 L223](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L223) | 驗收腳本從 `.value-display` 讀回 LaTeX 時，要先把 `wbrEq` 插的 `{}` 與 `\text{…}` 的右大括號一起清掉 | [O3](operations.md#o3-狀態掃描與排版排程) |
| [原工作約定 L224](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L224) | `math-canvas.js` 的 `sub()` 只替負數加括號，用在「並置相乘」時會讀成另一個數 | [O4](operations.md#o4-共用工具與重構比對) |
| [原工作約定 L225](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L225) | 「四捨五入到小數第 n 位」的結果要保留尾巴的 0，小數一律用整數運算 | [M3](mathematics.md#m3-算式與答案的呈現) |
| [原工作約定 L226](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L226) | 抽共用工具時，「有差異」的符號分兩種收法：能參數化的參數化，不能參數化的挑一個版本統一並說明 | [O4](operations.md#o4-共用工具與重構比對) |
| [原工作約定 L227](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L227) | `-ref` 副本那招對「改共用檔」無效，但簽章可以存進 `localStorage` 跨頁比對 | [O4](operations.md#o4-共用工具與重構比對) |
| [原工作約定 L228](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L228) | 頁面裡的區域變數也不要用單一大寫字母或共用檔的元件名 | [W3](web-production.md#w3-前端架構共用工具與操作) |
| [原工作約定 L229](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L229) | 並行 subagent 時，`nostore.py` 與 `shots.py` 的埠都要各自指定、互不重疊 | [協作](../../AGENTS.md#協作約定) |
| [原工作約定 L230](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L230) | 驗拖曳互動時，不要用「數值列有沒有變」判斷拖到了沒 | [O2](operations.md#o2-瀏覽器量測與假溢出) |
| [原工作約定 L231](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L231) | 多個 subagent 並行建置時，暫存腳本一律加本節前綴、各自在不同埠開 `python tools/nostore.py <埠>` | [協作](../../AGENTS.md#協作約定) |
| [原工作約定 L232](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L232) | 新節要自訂全域符號（色票、工具函式）前，先確認不會撞到 `math-canvas.js` | [W3](web-production.md#w3-前端架構共用工具與操作) |
| [原工作約定 L234](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L234) | 用行號對檔案動刀前，先自己讀檔算行號，不要照抄 `sed` 輸出的視覺位置 | [O1](operations.md#o1-文件處理與編碼) |
| [原工作約定 L235](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L235) | 用 Python 腳本改中文內容時直接寫中文字面，不要手打 Unicode 逃逸序列 | [O1](operations.md#o1-文件處理與編碼) |
| [原工作約定 L236](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L236) | 數值列與回饋區的 HTML 不要用全形空白 U+3000 當分隔 | [W4](web-production.md#w4-版面與數學排版) |
| [原工作約定 L237](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L237) | canvas 步驟列的小字說明（`drawStepRows` 的 hint，11.5px）不要寫 `÷` | [W4](web-production.md#w4-版面與數學排版) |
| [原工作約定 L238](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L238) | 根式頁的數學驗收用「另一套求值器」反算，不要只信頁面的化簡程式 | [M7](mathematics.md#m7-獨立驗算與邊界) |
| [原工作約定 L239](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L239) | 動作按鈕（重來、清除、換一題）不要放進 `bindPickGroup` 綁定的 `.btn-group` | [W3](web-production.md#w3-前端架構共用工具與操作) |
| [原工作約定 L240](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L240) | 用本機 ComfyUI 生圖一律照 `comfyui` 技能 | [O5](operations.md#o5-圖片量測與漫畫後製) |
| [原工作約定 L241](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L241) | 用 ComfyUI 生圖時，提示詞與每輪的 seed 一律存進 `comfyui/<節>/` | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原工作約定 L242](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L242) | 內建生圖的原圖、候選與漫畫後製檔存進 `comfyui/<節>/codex-<日期>/` | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原工作約定 L243](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L243) | Codex 的圖片標註若給出 `/C:/...`，讀圖時先改成 Windows 的 `C:\...` 絕對路徑 | [O5](operations.md#o5-圖片量測與漫畫後製) |
| [原工作約定 L244](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L244) | 撞題掃描（〈開發約束 29〉第五種形式）要比對原始 HTML，不要比對排版後的 `textContent` | [O3](operations.md#o3-狀態掃描與排版排程) |
| [原工作約定 L245](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L245) | ComfyUI 候選圖的奶油色邊框偶爾會長出淡色的浮水印狀字跡 | [O5](operations.md#o5-圖片量測與漫畫後製) |
| [原工作約定 L246](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L246) | Z-Image 提示裡，同一件道具只能寫一次 | [O5](operations.md#o5-圖片量測與漫畫後製) |

### 原跨專案依賴

| 歷史來源 | 主旨 | 現行唯一位置 |
|---|---|---|
| [原跨專案依賴 L305](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L305) | 教材頁最上方的「課前暖身漫畫」**固定調用** `teach-comic` 專案的 `comic` 技能 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L307](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L307) | 細節規範見 `.agents/skills/math-interactive-material/SKILL.md` 第 3.1 節 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L308](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L308) | Windows 本機圖片路徑一律使用真正的 `C:\...` 絕對路徑，不要寫成 `/C:/...` | [O5](operations.md#o5-圖片量測與漫畫後製) |
| [原跨專案依賴 L309](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L309) | 漫畫前處理不要裁切四格內容 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L310](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L310) | 漫畫只有 `_raw.png` 會呼叫生圖 API 計費，`_prepped`／`_normalized`／`_final` 都是本機處理，改對白重跑不用再花錢 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L311](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L311) | 風格規則為依小節指定，不再全站固定水豚風 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L312](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L312) | 漫畫的角色設定要與該節插圖對齊，而且要在生圖提示裡逐項寫死 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L313](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L313) | 重生同角色圖片時以已定稿圖片作參考，並逐格核對角色輪廓 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L314](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L314) | 左右手配件以角色本人的解剖學左右定位，逐格確認肩、肘、前臂、手腕與手掌連續 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L315](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L315) | 透空輪框或透明物件不能遮掉後方身體 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L316](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L316) | 插圖須核對材料、支撐、能源及操作尺度是否合理 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L317](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L317) | 對話泡一律由生圖階段畫出 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L318](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L318) | 對白座標一律從實際的 `_normalized.png` 量測 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L319](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L319) | `bubbles.json` 的 `w`／`h` 要給泡的完整內緣，不要預先內縮 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L320](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L320) | `add_captions_json.ps1` 用矩形 bbox 判定重疊 | [O5](operations.md#o5-圖片量測與漫畫後製) |
| [原跨專案依賴 L321](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L321) | 挑生圖候選要看泡的內緣尺寸，不是只看畫面好不好看 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L322](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L322) | `add_captions_json.ps1` 的字級自動縮放只在「連折行都放不下」時才降級 | [O5](operations.md#o5-圖片量測與漫畫後製) |
| [原跨專案依賴 L323](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L323) | 漫畫後製成功不能只看腳本 exit code，還要逐格放大檢查每個符號是否真的有字形 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L324](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L324) | 畫面要表現「尺寸變化」時，生圖提示要把每一格的相對尺寸寫死 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L325](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L325) | `normalize_comic.ps1` 與 `add_captions_json.ps1` 覆蓋既有輸出要加 `-Force` | [O5](operations.md#o5-圖片量測與漫畫後製) |
| [原跨專案依賴 L326](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L326) | 不要用 gpt-image-2 的遮罩改圖（`--mask`）做局部修圖 | [O5](operations.md#o5-圖片量測與漫畫後製) |
| [原跨專案依賴 L327](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L327) | 挑漫畫候選時，道具的外形也要逐格比對，不能只數數量 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L328](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L328) | 挑漫畫候選時要逐格數同一種物件的數量，四格必須一致 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L329](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L329) | 不要把不同候選圖的格子拼在一起 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L330](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L330) | 漫畫裡要數的物件數量不要超過 9 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L331](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L331) | 要數的東西一律「平放排成一排或方陣」，不要疊高 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L332](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L332) | 物件外觀要在提示裡寫死並要求四格一致 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L333](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L333) | 天平盤內有立體物件時，生圖提示指定「檯面式上皿天平（Roberval balance）」 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L334](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L334) | 四格後期物件數量減少時，提示需強調「維持原小尺寸、盤面留白、絕不放大」 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L335](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L335) | 生圖提示應簡化背景與微小機件，避免密集小齒輪或複雜鐘錶機構 | [W5](web-production.md#w5-圖片與漫畫製作) |
| [原跨專案依賴 L336](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L336) | 「考卷檢討」不在本 repo | [專案範圍](../../AGENTS.md#專案與範圍) |
| [原跨專案依賴 L337](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L337) | `wordcloud.html` **固定由全域 `audience-wordcloud` 技能模板產生／同步** | [W7](web-production.md#w7-整合與發布) |
| [原跨專案依賴 L338](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/AGENTS.md#L338) | 文字雲固定使用 `CLOUD_ID = teaching_web`，資料位於 `clouds/teaching_web/words/` | [W7](web-production.md#w7-整合與發布) |

### 原技能章節

| 歷史章節 | 現行位置 |
|---|---|
| [舊技能 §1](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/.agents/skills/math-interactive-material/SKILL.md) | [W1](web-production.md#w1-教材分析與頁面結構) |
| [舊技能 §2](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/.agents/skills/math-interactive-material/SKILL.md) | [O1](operations.md#o1-文件處理與編碼) |
| [舊技能 §3](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/.agents/skills/math-interactive-material/SKILL.md) | [M1](mathematics.md#m1-先定概念與範圍再決定呈現或配題)／[W1](web-production.md#w1-教材分析與頁面結構)／[M4](mathematics.md#m4-題目誘答答案與解析) |
| [舊技能 §3.1](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/.agents/skills/math-interactive-material/SKILL.md) | [W5](web-production.md#w5-圖片與漫畫製作)／[O5](operations.md#o5-圖片量測與漫畫後製) |
| [舊技能 §4](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/.agents/skills/math-interactive-material/SKILL.md) | [W4](web-production.md#w4-版面與數學排版)／[W5](web-production.md#w5-圖片與漫畫製作) |
| [舊技能 §5](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/.agents/skills/math-interactive-material/SKILL.md) | [W3](web-production.md#w3-前端架構共用工具與操作)／[M3](mathematics.md#m3-算式與答案的呈現) |
| [舊技能 §6](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/.agents/skills/math-interactive-material/SKILL.md) | [W3](web-production.md#w3-前端架構共用工具與操作)／[W5](web-production.md#w5-圖片與漫畫製作)／[W7](web-production.md#w7-整合與發布) |
| [舊技能 §7](https://github.com/changyiwu/teach-math-web/blob/ad61a5ad5b8704cb03df18233c8328d3e0de6f83/.agents/skills/math-interactive-material/SKILL.md) | [W4](web-production.md#w4-版面與數學排版)／[M3](mathematics.md#m3-算式與答案的呈現) |

逐條對照共 148 條（38 開發約束、77 工作約定、33 跨專案依賴）及舊技能 8 個章節。這些是來源覆蓋數，不代表目前正文仍有 148 條互不重複的規則。
