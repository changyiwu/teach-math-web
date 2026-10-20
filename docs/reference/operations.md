# 按需操作附錄

[回手冊](README.md)。日常建頁不必全文讀取；本檔只維護工具、排查與重構操作。數學規則在 mathematics.md，網頁規格在 web-production.md。

## O1 文件處理與編碼

- PDF／圖片處理環境用 file-toolkit 的 ensure_env.ps1 定位，不寫死 venv 路徑；若 import 檢查失敗，先用回傳的直譯器驗所需模組，不立即重建環境。不要沿用某台套件狀態作跨機事實。
- 取得直譯器再跑抽字。以下只是在該位置有安裝副本時的例子，其他位置依技能定位：

```powershell
$materialPython = & (Join-Path $HOME '.claude/skills/file-toolkit/scripts/ensure_env.ps1') | Select-Object -Last 1
& $materialPython tools/extract_material_text.py "<教材路徑>" --out "<輸出.txt>"
```

- 抽字工具先複製雲端文件到本地暫存；`.doc` 在 Windows 走 Word COM、macOS 走 textutil。兩者不可用時回報缺項；掃描 PDF 無字先 OCR。本站不改走 LibreOffice，避免既有轉換與字型問題。
- 康軒備課 PDF 曾確認的參數：深色 2301728、18.5pt 是主題；13.2pt 且 DFHeiStd-W7 是例題標題；14.5pt 白色是名詞方塊。1 下另有白色 Arial-BoldMT 的 20.2pt 例題編號、19.2pt 主題編號。用 span 的 size、font、color 共同判斷，再對章節架構圖；換版本先驗參數。
- 檔案用 UTF-8，直接寫可校對的中文字面。若主控台為 cp950，訊息只輸出 ASCII；subprocess 的 errors="replace" 仍可能留下印不出的替代符號，需轉 ASCII replace 或寫 UTF-8 檔案。不為避主控台錯誤而手打 Unicode 逃逸。
- 中文比較避免 `curl | python` 的隱含 stdin 編碼，直接以 encoding="utf-8" 讀來源。改完中文內容讀回網頁的 alt／textContent 校對。
- 含 LaTeX／反斜線的程式以檔案寫入再執行，避開多層 shell 轉義；不要把歷史 Bash heredoc 損壞經驗視作所有 shell 的定律。
- 依行號修改前驗讀實際內容；保留 LF／CRLF，寫回前 assert 目標段落。檔案編碼與主控台編碼分別處理。

## O2 瀏覽器量測與假溢出

- 先確認 pathname、innerWidth 等於目標，不只是非零；rect 也須有尺寸。展開評量解析框，略過真正 display:none 或零尺寸元素。
- 行內式量最近非 inline 祖先的可用寬，扣 padding、清單縮排；顯示型量自身 scrollWidth-clientWidth，排除 table-scroll 中另有合法捲動的表格。
- 先量 scrollWidth-clientWidth／scrollHeight-clientHeight；offset 尺寸含 border，不當捲軸證據。只對 overflow 為 auto／scroll 的方向實測 scrollLeft／scrollTop 能移動多少，排除字墨跡幾 px 的假陽性。
- 隱藏 MathML 不納入實際算式；不對已排版整份文件重跑 typeset，只對改動節點處理，跳過 closest('mjx-assistive-mml')。
- 等 MathJax 完成及 document.fonts.ready；A/B 字串要逐字相同，連續量到穩定，不只等待固定秒數。
- 隱藏頁的 lazy 圖可能不載；驗收暫設 eager 並重新觸發 src，確認 naturalWidth，保留正式載入策略。
- Browser pane 截圖不合成或捲動失效時，以 tools/shots.py 收 Canvas toDataURL，先 alpha_composite 卡片底色，不直接 convert('RGB') 誤判透明填色。版面仍用真實視窗，不硬撐 Canvas CSS 寬度。
- 合成點擊遇 rect.height=0 時，可在隔離驗證內暫時覆寫該 Canvas 的 rect，以畫布原尺寸座標測試，驗後還原；不得修改正式換算掩蓋問題。
- 拖曳不一定改數值列；可用 pointermove 及 grab 游標找頂點，再觀察圖上物件是否移動。
- 工具與歷史不同時先證明現象存在，再採 workaround；排查成功不代表數學已通過驗算。

## O3 狀態掃描與排版排程

- 大量邏輯掃描可暫將 MathJax.typesetPromise stub 為 Promise.resolve，讀原始 innerHTML；驗版面必還原並排版。兩種掃描不塞同一大量迴圈。
- 量排版後尺寸等待 MathJax.startup.promise（或該頁實際 typesetPromise），再讓事件迴圈完成；不忙等固定時間阻擋排版。
- 隱藏頁 setTimeout 可能被節流，可用 MessageChannel 讓步；分批小量掃描，既有 Browser pane 每次 2～3 張互動、大批 Canvas 每批約 100 組以內，依當前工具調整。
- 長掃描將計數與結果存 window 狀態；工具逾時先讀進度，避免重跑已完成批次。固定種子用於可重現比較。
- 解析 LaTeX 先移除 wbr、wbrEq 插入的空 `{}`，處理 text 括號及 left/right；整批案例全失敗先查 parser。
- 洩題掃描抓 no-store 原始 HTML 經 DOMParser，不用 MathJax 排版後 textContent。移除 input 屬性，數字比對加完整邊界，以免將 min/max 或 4 與 45 誤命中；審查範圍依 [M5](mathematics.md#m5-防止示範或提示洩漏答案)。
- 文字雲繪出確認用 wordclouddrawn 事件的 detail.drawn，不憑截圖沒看見小字就判失敗。

## O4 共用工具與重構比對

1. 比對整個頁面檔與共用檔的符號，分完全相同／有差異／獨有；查新名字的巢狀宣告及全樹呼叫者。語意不同者改名保留，不硬併。
2. 有差異時，只有共用版確為超集／更保守且分歧不影響本頁，才替換；必要時記錄傳參證明。刪除孤兒註解。
3. 能參數化則參數化；不宜者優先保留已上課／已定稿版本，說明接受的差異，不單憑新舊選擇。
4. A/B 前載入 Outfit、Noto Sans TC 實用字重（既有驗收為 400–900 正斜體），重畫評量圖；每輪重新載頁、從同起點跑同一固定序列。替代字型的初始圖另外記錄。
5. 只改頁面時可建相同深度的 <小節>-ref，包含 index、canvas、style.css；保存舊來源後比 Canvas 像素／簽章，驗後清理自己的副本。
6. 改 math-canvas.js 時參照頁也讀新版，不能用同一 ref 法；改前保存各狀態簽章到同源 localStorage 或檔案，改後跑相同序列。
7. 案例數依風險決定，不把歷史 40 個抽樣當充分保證。外觀差異用 diff bbox 確認只落在預期物件。
8. CSS 改動用同頁暫設舊值／還原新值量 A/B，區分既有問題及迴歸；不能因只有 1px 就放寬 [W6](web-production.md#w6-成品驗收)。

| API | 陷阱 |
|---|---|
| drawChip 第 7 參數 | 是 bg 色字串，不是 alpha 數字。 |
| drawStepRows rows[].items | 是元件陣列；inkItems 回單一 SEQ，使用 [inkItems(...)]。 |
| texFrac | 不自動約分，先 reduce 再轉文字；倒數中間式依 [M3](mathematics.md#m3-算式與答案的呈現)。 |
| sub | 只替負數加括號，不當通用乘法括號。 |
| FR／自製分數 | 先正規化負分母。 |
| drawArrow | 預設箭頭投影過細，數線／坐標用清楚的實心 axisArrow 類箭頭；既有長 13、半寬 5.5px 可參照。 |

## O5 圖片量測與漫畫後製

- Windows 用真正 C:\... 路徑；/C:/... 先轉換。比例可用亮度／色彩區段找邊界，各通道門檻依材質調整；暖紙的藍色常比紅色低，透視另考慮量測方向。
- 泡白色也分通道：暖泡曾用 r≥240、g≥234、b≥218，另批需 b≥208；連到雲時曾收緊到 250／250／246。它們是起始案例，不是固定門檻；先排除 letterbox 補邊。
- 本體 bbox 剔尾巴與思考小圓：保留與最寬列相連、寬度至少達其 40% 的列。
- caption 以矩形 bbox 查重疊；相鄰橢圓角落誤中時，核圖後縮靠近邊約 15～20px，不加 -AllowOverlap 全面放行。
- 排字先折行，真正放不下才縮字；長數串要一行時另試 font_size，仍依 [W5](web-production.md#w5-圖片與漫畫製作) 底限。缺字換字型或改文字。
- 覆寫 normalized／final 加 -Force；只有 raw 的生成呼叫計費，調對白重排不必重生。
- 幾何與數量依 [M6](mathematics.md#m6-圖形比例與量測)。簡化背景小機件，避免密集齒輪；盤有立體物件可指定 Roberval balance，降低吊鏈碰撞。
- 選圖放大四角看淡色字跡／浮水印，修正不得侵入身體或教學內容；修後重驗全張。
- gpt-image-2 的 mask 曾破壞四格，該既有流程不依賴 mask 修漫畫，改整張編修／重生；其他工具依當前能力驗收，不宣稱有同一限制。
- 提示需要寫數字時採少位數，要求各數字只印一次、置中、不鏡像、不被橫桿遮住，避免翻牌式重複兩排。生成的刻度與端點需放大核對，不以提示已寫清楚代替驗收。
- 本機 ComfyUI 按 comfyui；清單沒有時可讀同級 agent-setup-guide/skills/07-comfyui/SKILL.md。API 啟動、PNG 工作流程擷取按該技能。
- Z-Image 歷史經驗：中文提示、負面提示效果有限；角色位置及單人衣色具體寫出，同道具不重複描述。計算器寫「口袋型電子計算器」避免被讀成電腦；地面線可引導量測方向但終點仍需驗收。只在使用該模型時參考。
