# teach-math-web（國中數學教學整合網）專案藍圖

任何 Agent、任何電腦，每個 session 先讀本檔與 [handoff.md](handoff.md)。教材製作規則的唯一正文在 [參考手冊](docs/reference/README.md)；本檔只維護專案架構、協作與任務入口。

## 專案與範圍

- 國中六冊數學教學靜態網站，供課堂智慧白板使用。實際章節、完成狀態以 [curriculum.js](curriculum.js) 為準。
- 線上：[teach-math-web](https://changyiwu.github.io/teach-math-web/)；儲存庫：[changyiwu/teach-math-web](https://github.com/changyiwu/teach-math-web)。
- 架構與元件規格見 [W3](docs/reference/web-production.md#w3-前端架構共用工具與操作)，部署見 [W7](docs/reference/web-production.md#w7-整合與發布)。
- 「考卷檢討」現屬 teach-class-score，從側欄的「課堂表現登記系統」登入後進入；exam-review 已退場。不要搬回本站，也不在本 repo 存考卷資料夾 ID。

## 文件職責與必讀入口

| 任務 | 必讀 | 需要時才讀 |
|---|---|---|
| 新建／修改教材頁 | [手冊入口](docs/reference/README.md)、[網頁規則](docs/reference/web-production.md)、[數學規則](docs/reference/mathematics.md)、目標冊別；再按本地 [製作技能](.agents/skills/math-interactive-material/SKILL.md) 執行 | 手冊連到的工具附錄、目標節原始教材、圖片提示及上游漫畫技能 |
| 出卷／其他數學專案 | [數學規則](docs/reference/mathematics.md)、目標冊別，加目標專案本身的規範 | 個別教材或題目原文 |
| 開工／收工 | 本檔與 [handoff.md](handoff.md)，並使用對應 project-startup／project-shutdown 技能 | 歷史決策 |
| 查舊規則或原因 | [來源對照](docs/reference/sources.md) | [歷史里程碑](docs/history/project-milestones.md)、Obsidian 專案工作流程 |

- 本手冊各主題只有一份規則正文；技能只排步驟，冊別檔只維護章節特有內容。新規則改所屬正文，其他檔案以連結引用。
- `handoff.md` 只保存下一次接續狀態、未決事項及暫時 workaround；長期規則移進對應手冊，歷史移進歷史紀錄。
- 歷史資料中的舊規則編號、狀態與參數不作為現行指令；查 sources.md 的現行位置。

## 資料夾與同步

| 位置 | 用途 |
|---|---|
| index.html、style.css、script.js | 首頁與入口介面 |
| curriculum.js | 課程分類與完成狀態 |
| materials/<冊-章-節>/ | 各節 HTML、CSS、canvas.js 與正式圖片 |
| materials/math-canvas.js | 各節共用 Canvas 工具 |
| tools-sidebar、lesson-nav、annotate 的 CSS／JS | 工具側欄、前後節導覽與課堂畫筆 |
| wordcloud.html | 依手冊 W7 管理的獨立即時文字雲 |
| docs/reference/ | 現行教材規則、各冊索引與按需操作附錄 |
| docs/history/ | 保留原文的歷史里程碑 |
| tools/ | 抽字、HTTP 預覽、Canvas 擷取、索引更新等工具 |
| comfyui/ | ignored 的提示、原圖、候選、漫畫中介檔及 QA，由 GDrive 跨機同步 |
| .agents/skills/math-interactive-material/ | 此專案教材建置流程入口 |

同步層級：L1 本地／GDrive；L2 GitHub（main）；L3 Obsidian 的 `teach-math-web/專案工作流程.md`。目前進度、待驗與跨機限制讀 handoff，不在本檔另列副本。

## 協作約定

- 所有回應與文件使用繁體中文；檔案操作回報完整位置。Windows 優先用 PowerShell。
- 修改共用檔前重讀最新內容。Git 判斷以 diff／log 為準，不只靠雲端檔案時間戳。
- 開工檢查 Git 並依 project-startup 規則 fetch；不自行 pull。若發現大量疑似變動，先比較 `git diff HEAD`：Google Drive 可能同步回舊 index。僅在證明內容無差異後才處理索引，不以 checkout 丟棄工作；LF／CRLF 的假差異也先驗證再處理。
- 收工必更新 handoff，檢查 API key、Token、學生姓名等敏感資料；只 stage 本次相關檔案，不使用無差別的 `git add .`。commit／push 必須有使用者明確授權。
- 若任務已授權並行 agent，暫存檔帶小節前綴，頁面與截圖服務的埠都各自分配；瀏覽器分頁共用，每次量測先核對 pathname。遇 429 保留成果，恢復後接續，不重開整批。
- 雲端 Git 權限錯誤先以 `git -c core.fsmonitor=false` 重試；仍受限時依工具權限流程重試同一操作，不修復／重建 repo 或自行 pull。

## Obsidian 第二大腦

預設 Vault：`C:\Users\chang\我的雲端硬碟\2ndbrain`。使用者說「Obsidian」「Secondbrain」「我的筆記本」「第二大腦」時均指此處。

任務涉及筆記、剪藏、知識庫、創作庫、每日筆記或專案工作流程時，優先讀該 Vault 的 `AGENTS.md`、`02-知識庫/index.md` 與 `02-知識庫/log.md`；實際讀寫仍受工作區授權或 Obsidian MCP 設定限制。筆記規則只維護在 Vault，不在此複製。
