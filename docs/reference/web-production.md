# 教學網頁製作重點

[回手冊索引](README.md) · [數學規則](mathematics.md)

本檔是網頁製作規則的唯一正文。數學、命題與精確圖形只在 mathematics.md 維護；本檔引用其章節，不另寫一份。尺寸、元件、配色及部署參數屬 teach-math-web，移用到別站時替換成該站設定。

## W1 教材分析與頁面結構

教材抽字統一使用 `tools/extract_material_text.py`，輸出 UTF-8；掃描 PDF 先 OCR。環境定位、跨平台 `.doc` 轉檔與指定版本 PDF 骨架擷取見 [O1](operations.md#o1-文件處理與編碼)，只在需要時讀。

概念清單的拆分判準及版本範圍依 [M1](mathematics.md#m1-先定概念與範圍再決定呈現或配題)。新頁規劃先將清單及依據列給使用者過目。

本站頁面由「課前暖身漫畫 → 各概念區塊 → 小節總結與核心回顧」構成。每概念預設配置重點整理、1 個視覺互動探索、2 題單選形成性評量；若題型需要 3 題，交付說明理由。這個配置只供網站使用。

## W2 互動的教學語意與狀態

- 互動須有學生可操作的參數、選項或物件；純靜態示範歸入重點整理。
- 畫布能單獨讀懂：標出求什麼、設什麼為未知數、當前式子與每一步結果。數值列是同內容的可複製文字版，不能拿來代替畫布算式。
- 當前狀態的敘述符合 [M2](mathematics.md#m2-數學敘述條件與反例)。限制輸入或顯示不成立的原因，不能夾住輸出偽造等式；選取態須真的反映模式。
- 步驟名、中文說明、算式分欄；中文用 measureText 折行。依步驟數與畫布高度配列距，以 numberRows(rows) 等方式重編編號，不將編號寫死在 name。
- 操作驗收依 [W6](#w6-成品驗收)；正解／誘答依 [M4](mathematics.md#m4-題目誘答答案與解析)，示範洩題依 [M5](mathematics.md#m5-防止示範或提示洩漏答案)。

## W3 前端架構共用工具與操作

| 項目 | 規格 |
|---|---|
| 架構 | HTML5、Vanilla CSS／JavaScript；未明確要求不引入 Tailwind 等 CSS 框架。一般自訂資料留 localStorage；獨立即時互動頁可依指定技能使用 Firebase。 |
| 課程資料 | 小節資料夾使用 V-C-S；完成狀態只寫 curriculum.js 的 status，不在 script.js 加條件。 |
| 共用引擎 | 新頁載入 ../math-canvas.js；不要複製共用工具。使用前讀實際函式簽章、回傳形狀與適用範圍。 |
| 導覽元件 | 使用下方相對路徑載入工具側欄、前後節導覽與課堂畫筆。 |
| 輸入座標 | X、Y 分別以 canvas.width/rect.width、canvas.height/rect.height 換算 client 座標；touches／changedTouches 及滑鼠輸入都要支援。 |
| 捲動 | 本站教材頁由 body 捲動；相關功能同時處理 body 與文件捲動來源。 |
| 字型重畫 | 每個互動 init 最後使用 drawWithFonts(draw)，評量附圖使用 drawWithFonts(initQuizFigs)。draw 只按當前狀態重畫，不生成亂數、累加狀態或重複註冊事件。 |
| 命名 | 新全域符號先搜整個 materials；區域變數也不得遮蔽 T、VF、FR、RT 等元件。主題色票用小節前綴，顏色由呼叫端傳入共用工具。 |
| 模式隔離 | 重用引擎用 opts 傳 canvasId、控制項前綴及預設模式；新舊群組的 selector 都限於自己的 data-* 範圍，不能只依樣式 class 選取。 |
| 無用控制項 | 模式不使用的滑桿從該卡 HTML 移除，JS 對可省略元素加防護，不留永遠停用的 UI。 |
| 動作按鈕 | 重來、清除、換題另放 btn-group-row，不混入 bindPickGroup 綁定的選項群組。 |

```html
<link rel="stylesheet" href="../../tools-sidebar.css">
<link rel="stylesheet" href="../../lesson-nav.css">
<link rel="stylesheet" href="../../annotate.css">
<script src="../../curriculum.js"></script>
<script src="../../tools-sidebar.js" data-home="../../index.html"></script>
<script src="../../lesson-nav.js"></script>
<script src="../../annotate.js"></script>
```

改動或抽取共用工具時，讀 [O4](operations.md#o4-共用工具與重構比對)；平常不必載入重構程序。

## W4 版面與數學排版

### 介面與投影

- 本站維持深色磨砂玻璃、高對比及節制 hover 微動畫；背景為 background.png 疊 rgba(10,8,28,0.8) 漸層，保留 3 個 blur(120px) 的彩色 blob-float 光暈。概念標題及關鍵詞對應區塊色；總結卡與情境段落有可區別的主題色。
- 選項文字統一灰白色 #cbd5e1；hover／selected 使用同一小節主題色及純白高亮，不將四個選項各自染不同色。options-container 在桌面雙欄、小於 640px 單欄。
- Grid 使用 minmax(0, 1fr)；有最小寬度時用 minmax(min(300px, 100%), 1fr)。flex 不以 align-items:center 裝超寬內容；改 stretch，需置中的子元素自行 margin-inline:auto。
- 兩欄 Canvas 顯示約為原始尺寸的 0.7 倍；密集格子文字需適當加大（既有案例 17→20px）。不可用縮小文字或分數來掩蓋溢出。

### MathJax 與數值列

本站使用 MathJax 3 的 tex-mml-chtml 載入方式。數學語意及記號依 [M3](mathematics.md#m3-算式與答案的呈現)；技術呈現如下：

| 項目 | 實作要求 |
|---|---|
| 字距 | mjx-msup > mjx-script 的 margin-left 為 0.18em；mjx-mn > mjx-c + mjx-c 為 0.09em；Canvas 的 POW_KERN 為 0.17。 |
| 度數例外 | 溫度 ^\circ 的腳標字距回到 0；以 :has(mjx-c.mjx-c2218) 排除。這是本站 Chrome／Edge 使用情境，移植時確認 CSS 支援。 |
| 長算式 | 先等價簡寫，再以 aligned 分行。顯示型保留 \frac，不換 \tfrac；行內單獨一行也放不下時，改顯示型再拆。 |
| 顯示型保險 | explanation-card 與 explanation-box 均加 mjx-container[display="true"] 的 overflow-x:auto；它是保險，不取代修正真正的長式。 |
| 行內對齊 | 不在行內 mjx-container 直接加 overflow-x 破壞基線。 |
| 表格 | 外包 table-scroll；不把 table 本身改 display:block，以免表頭與內容失去欄寬同步。 |
| 數值列 | flex-wrap:wrap、overflow-y:hidden、padding-block／padding-inline 各 2px；捲軸 width／height 均設 8px，不以 scrollbar-width:none 隱藏真溢出。可用寬須扣 padding。 |
| 隱藏 MathML | .value-display mjx-assistive-mml 的 width 限為 1px，避免不可見層撐出捲動範圍。 |
| 斷點 | wbrEq() 吃裸 LaTeX，以 `<wbr>` 接各段；不等關係用 wbrRel()。多行逐行處理，不可先包 `\( \)` 再傳入。後段以空 `{}` 保留運算子字距，不以空白取代零寬斷點。 |
| 需人工斷行 | wbrEq 不追蹤絕對值豎線；含絕對值時在合法等號處手動分段。wbrRel 不拆括號內加總，過長時自行分段。 |
| 中文回饋 | 不把純中文說明包入不換行的 \text{}；flex 回饋內容包單一 block 容器。算式與文字間用一般空白或逗號，不以 U+3000 分隔。 |
| 字串 | 變數、負數與坐標使用 `\( ... \)`；LaTeX 運算子使用半形。JS 模板中的反斜線用雙反斜線；HTML 中關係符號用 \lt／\gt／\le／\ge，不直接寫 <、>。 |
| 著色 | 著色 span 放 LaTeX 外，不在式內塞 \color{#hex}。 |
| Canvas 算式 | 分數用 VF／FR 等正式元件；小字 hint 的「除以」用中文，不用縮小後難分辨的 ÷。 |

要量排版或處理既有工具參數時，分別查 [O2](operations.md#o2-瀏覽器量測與假溢出)、[O4](operations.md#o4-共用工具與重構比對)。

## W5 圖片與漫畫製作

### 圖像用途與一致性

圖形的數學語意、數量、比例、工具結果及退回純情境的判準只依 [M6](mathematics.md#m6-圖形比例與量測)。

- 先看本節暖身漫畫與內文情境詞頻，再決定場景；不要自行加一套無關主題。單節插圖與漫畫保持同一媒材及主角，不要求全站同畫風。
- 使用者指定的畫風直接採用；未指定時依上游流程提出可選風格。重生同角色時使用已定稿圖作參考。
- 提示逐項寫出髮色、髮型、綁髮位置、髮束方向、服裝、配件，以及動物材質、尾巴與眼色；同一道具避免互斥狀態或無意畫成兩份。
- 幾何提示寫可見結構：等長兩排合成同一完整長方形，對應用對齊而非易接錯的連線，箭頭端點先設實心點；貼在線上的底座讓線從下面穿過再出來。尺與被比較木條分開，避免尺被畫成比較物件；模型仍畫錯時依 M6 判準處理。
- 手部同時追蹤肩、肘、前臂、腕、掌背、拇指及四指；左右手以角色解剖定位，不固定以畫面左右判定。配件在手腕，透空物件後方身體不得被抹掉。
- 材料、支撐、能源及操作尺度合理。兒童用桌上模型；發光物須有可見合理電源。難以交代時選不發光的簡單模型。
- 乘坐設施的角色須在設施內、有對應安全裝置、身體確實坐／踩在支撐物上，把手與器材相連；同種安全裝置的兩份外形、位置與尺度一致。修圖後重新檢查整張的支撐及軌道連續性。
- alt 只描述定稿畫面，寫完從瀏覽器讀回；另搜內文清除描述舊插圖的句子。

### 暖身漫畫的本專案規格

上游為 `C:\Users\chang\我的雲端硬碟\agents\teach-comic\skills\comic-generator\SKILL.md`。實作時讀它的完整流程，按其第 0 步定位 SKILL_DIR；確認 scripts/normalize_comic.ps1 存在後才操作。找不到時說明缺項並請使用者提供位置，不退回自行加字流程。

| 項目 | 規格 |
|---|---|
| 內容 | 固定 1 個核心動機、1 張 2×2 四格；取該教材的生活或素養情境。 |
| 版型 | 直式 4:5，1080×1350，每格 540×675；四格中線須對齊整張圖中線。 |
| 對話泡 | 生圖畫空白泡，禁止文字；後製只排字，不加 -DrawBubbles。泡不可遮臉或核心數學元素，每格最多 2 泡。 |
| 尺寸與字級 | 一般泡內緣至少 240×110、shout 至少 300×150；建議字級 24–28、最小不低於 18。先驗數學內容與物件，再比較泡是否排得下。 |
| 檔案鏈 | raw → normalized → bubbles JSON → final，不覆寫原稿；若有前處理另存 prepped。 |
| 比例處理 | normalize 使用 letterbox 補邊，不裁掉四格內容。 |
| 排字座標 | 從實際 normalized 圖量泡完整內緣；w/h 不預先內縮，讓腳本處理 padding；不使用 position、speaker_x、speaker_y、draw_bubble 欄位。 |
| 四格一致 | 同一張生成稿內維持角色、機位、背景、道具形狀與尺寸；情節未要求改變時，同種物件數量也一致。不得拼接不同候選的格子。 |
| 尺寸改變 | 逐格寫明相對尺寸；物件變少仍保持原尺寸與盤面留白，不能放大填滿空位。 |
| 最終檢查 | 逐格放大查看字形、說話者、泡尾、框線、數量與道具；腳本成功不代表符號真的有字形。 |

泡框量測、重疊、字級及生成模型的操作細節集中在 [O5](operations.md#o5-圖片量測與漫畫後製)，遇相關問題才讀。

### 正式資產與保存

- 正式資產在 materials/<小節>/，頁面以相對路徑引用；不從網站連到上游絕對路徑。暖身檔名為 motivation_comic.webp。
- 插圖存寬 640，畫面常用顯示寬 220px；漫畫寬度依上表。插圖按內容決定裁切，不能為湊方形裁掉重要內容。
- WebP：平面插圖 q85、高頻紙紋／網點／dithering 插圖 q75；漫畫一律 q85。有紙纖維即歸高頻；插圖最低不再低於 q75。只剩 WebP 的歷史檔可依需求重壓，從保留的來源檔輸出時優先用來源。
- 圖片除首屏暖身漫畫外採 loading="lazy"，並提供 alt。
- 生圖原稿、候選、提示、漫畫中介與 QA 在 ignored 的 comfyui/<小節>/codex-<日期>/；ComfyUI 各輪保存 seed、工作流程、修改及淘汰原因。Git 只收正式資產及相關頁面。
- Logo／favicon 用手寫 SVG，本站色票精確一致；光暈用 radialGradient，不依賴 feGaussianBlur 濾鏡，於 16／32／64／180px 比對。單檔互動頁內嵌 SVG，favicon 用百分比編碼 data URL，SVG id 加頁面前綴。

## W6 成品驗收

| 範圍 | 判準或唯一規則入口 |
|---|---|
| 數學及命題 | [M4](mathematics.md#m4-題目誘答答案與解析)、[M5](mathematics.md#m5-防止示範或提示洩漏答案)、[M7](mathematics.md#m7-獨立驗算與邊界)。 |
| 版面 | 真實 414px、1280px，各查靜態內容與滑桿 min／中／max 組合、所有候選、模式、動作按鈕及推導步驟；不是只改 zoom。 |
| 容器 | value-display、explanation-card／explanation-desc／explanation-box、visual-feedback、summary-card／context-story 四類均查；頁面與圖片零水平溢出。 |
| 字型 | 字型到齊、MathJax 完成後重複量到穩定；靜態掃描間隔約 3 秒兩次相同才記錄。另清空 Canvas、觸發未載字型的 loadingdone，確認會重畫。 |
| 內容載入 | 全圖自然尺寸非零；console 零警告／錯誤、MathJax 零錯誤。 |
| 預覽 | HTTP 使用 tools/nostore.py，不以 file:// 快照或一般快取服務驗收本站；服務根目錄固定為 teach-math-web。 |
| 變更風險 | 共用工具或版面變更需要時做 [O4](operations.md#o4-共用工具與重構比對)；有差異須說明範圍。 |

驗收若遭遇零尺寸、假捲軸、隱藏圖、逾時或排版佇列問題，才查 [O2](operations.md#o2-瀏覽器量測與假溢出) 與 [O3](operations.md#o3-狀態掃描與排版排程)。

## W7 整合與發布

- 完成頁面後檢查導覽與資產相對路徑，更新課程資料；不留下待圖 onerror 掩蓋缺資產，並在交付時區分已驗／未驗。
- 本站 main 根目錄採 GitHub Pages classic 分支部署，沒有 .github/workflows 屬正常。發布須依 AGENTS 的協作授權；完成後確認 built，並比對正式線上資產與提交版本的雜湊。
- 不硬編碼帳密、Token；不將學生或本機自訂資料送分析平台。外連使用 target="_blank" rel="noopener noreferrer"。
- 正式 Firebase 互動頁由使用者一般瀏覽器實測或查看 App Check Metrics，不以自動化瀏覽器的低可信拒絕判定故障。
- wordcloud.html 固定由全域 audience-wordcloud 技能模板管理；CLOUD_ID 為 teaching_web，資料在 clouds/teaching_web/words/，同步模板保留 background.png 客製化。
- 修改重點清單後，依 [手冊維護流程](README.md#維護與引用) 更新冊別目錄。

## W8 交付檢查入口

- [ ] [W1](#w1-教材分析與頁面結構)：結構完成。
- [ ] [W2](#w2-互動的教學語意與狀態)：互動完成。
- [ ] [M8](mathematics.md#m8-出卷審題的檢查入口)：數學及評量完成。
- [ ] [W5](#w5-圖片與漫畫製作)：圖像完成。
- [ ] [W6](#w6-成品驗收)：成品驗收完成。
- [ ] [W7](#w7-整合與發布)：整合與交付狀態已記錄。
