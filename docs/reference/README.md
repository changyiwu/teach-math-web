# 數學教材與教學網頁參考手冊

本目錄是現行教材製作規範的統一入口。規則按主題各有一份完整正文，其他文件以連結引用；日常建頁不必翻舊 AGENTS 或各節 QA 尋找通則。

## 日常閱讀路徑

| 任務 | 必讀正文 | 執行流程 |
|---|---|---|
| 新建或修改教學頁 | [網頁製作](web-production.md) ＋ [數學規則](shared-math/math-rules.md) ＋ [各章提醒](shared-math/chapter-notes.md) 的目標章 ＋ 目標冊別索引 | 本專案 [製作技能](../../.agents/skills/math-interactive-material/SKILL.md) |
| 考卷、題庫、講義等數學專案 | [數學規則](shared-math/math-rules.md) ＋ [各章提醒](shared-math/chapter-notes.md) | 目標專案自己的命題及成品輸出流程；teach-math-exam 已有同內容鏡像 |
| 處理工具問題或抽取共用引擎 | 正文中指向的 [操作附錄](operations.md) 對應小節 | 只讀當下需要的部分 |

開工仍按專案要求讀 [AGENTS.md](../../AGENTS.md) 與 [handoff.md](../../handoff.md)。它們分別處理協作與接續狀態；教材規則不在其中另列副本。實際教材及目標節提示詞是任務素材，不能以這份手冊取代。

## 跨專案共用檔（shared-math/）

[shared-math/](shared-math/) 的 `math-rules.md`（M1–M8）、`chapter-notes.md`（各冊各章提醒）與 `sync_shared_math.py`，和 [changyiwu/teach-math-exam](https://github.com/changyiwu/teach-math-exam) 的 `.agents/skills/math-exam/references/shared-math/` 逐位元組相同。**本 repo 是正本**：

1. 只改本 repo 的 shared-math/，鏡像不就地改。
2. 改完執行 `python docs/reference/shared-math/sync_shared_math.py --write` 覆蓋鏡像（兩個 repo 須並排在同一資料夾，或加 `--other` 指定路徑）。
3. 不帶參數執行即檢查兩邊是否一致；不一致回傳 1。兩個 repo 各自提交、推送。
4. 共用檔只放兩邊都適用的內容，內部只連同資料夾的檔案或 GitHub 完整網址；網頁專屬約定寫在 web-production.md。

## 各冊教材頁索引

| 冊別 | 章節 | 小節數 |
|---|---|---:|
| [第一冊](book-1.md) | 整數的運算、分數的運算、一元一次方程式 | 11 |
| [第二冊](book-2.md) | 二元一次聯立方程式、直角坐標與圖形、比與比例式、不等式、統計、生活中的幾何 | 11 |
| [第三冊](book-3.md) | 乘法公式與多項式、平方根與畢氏定理、因式分解、一元二次方程式、統計資料處理 | 12 |
| [第四冊](book-4.md) | 數列與級數、函數、三角形的基本性質、平行與四邊形 | 12 |
| [第五冊](book-5.md) | 相似形、圓、幾何與證明 | 8 |
| [第六冊](book-6.md) | 二次函數、統計與機率、生活中的立體圖形 | 4 |

目前六冊共 24 章、58 節。冊別檔的 BEGIN／END LESSONS 區塊由正式教材自動產生，列出各節教材頁的重點標題與連結；各章人工提醒在 [chapter-notes.md](shared-math/chapter-notes.md)。重點數只描述現有頁面，不限制未來教材或考卷。

## 規則的維護位置

| 主題 | 唯一正文 |
|---|---|
| 概念拆分、數學敘述、算式記號、命題、洩題、精確圖形、獨立驗算 | shared-math/math-rules.md 的 M1–M8（跨專案共用） |
| 特定章節範圍與易錯點 | shared-math/chapter-notes.md（跨專案共用） |
| 頁面結構、互動呈現、前端元件、排版、本站記號與圖像約定、網頁驗收、整合發布 | web-production.md 的 W1–W7 |
| 文件環境、量測假陽性、掃描排程、工具 API／A/B、圖片後製疑難 | operations.md 的 O1–O5 |
| 各節教材頁重點索引 | book-N.md（自動產生） |
| 專案架構、授權及協作 | 根目錄 AGENTS.md |
| 當前待決事項、暫時限制及待驗項目 | handoff.md；手冊只連結，不複製狀態 |

## 維護與引用

1. 規則變更只改上表所屬正文；需要別處讀到時加入連結，不複寫規則全文。涉及兩類的原條文可拆為語意與實作兩部分，各自只有一個維護位置。
2. 課本版本／範圍改動時更新 chapter-notes.md 的目標章並同步鏡像，再核對實際教材；不要拿舊頁標題作為新版本課綱。
3. 修改教材重點標題或課程結構後，執行 `python tools/update_reference_catalog.py`；檢查使用 `--check`。新增章節時先在相應冊別加章名、提醒連結及對應 BEGIN／END LESSONS 標記，並在 chapter-notes.md 補該章。
4. 工具或上游技能的操作方式，以該工具的實際介面為準；本手冊只維護本站的規格。生圖／排字時才載入所指定的外部技能，不必日常全文閱讀。
5. 歷史變更查 Git 或 Obsidian 的 teach-math-web/專案工作流程.md；個別生成證據查 ignored 的 comfyui/<小節>/。舊版里程碑原文（原 docs/history/project-milestones.md）、舊規則編號對照（原 sources.md）與 catalog.json 已於 2026-11-08 移除，需要時看提交 [6d2e58f 的 docs/](https://github.com/changyiwu/teach-math-web/tree/6d2e58f/docs)；其中的舊指令不覆蓋現行正文。
