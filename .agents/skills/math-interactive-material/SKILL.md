---
name: math-interactive-material
description: 當使用者提供國中/高中數學教材、PDF、Word 檔，或要求針對特定章節/小節製作教學網頁、互動 Canvas 元件、隨堂評量時，觸發此技能。
---

# 互動數學教材網頁建置流程

此技能是 teaching-web 專案內的流程入口。相對路徑以本 SKILL.md 為基準，專案根目錄為 `../../..`；在其他工作目錄執行時先解析成實際路徑。規格的唯一正文由 [參考手冊](../../../docs/reference/README.md) 管理，不在本技能重述數值或教學規則。

## 1. 定位與讀取

確認目標教材版本、小節及專案位置；讀 [AGENTS.md](../../../AGENTS.md) 與 [handoff.md](../../../handoff.md)。再讀手冊指定的「網頁製作」「數學與命題」及目標冊別，這些是製作教材的必讀規範，不是選讀摘要。

## 2. 解析與規劃

按 [W1](../../../docs/reference/web-production.md#w1-教材分析與頁面結構) 的抽字入口取得教材文字，依 [M1](../../../docs/reference/mathematics.md#m1-先定概念與範圍再決定呈現或配題) 建立有依據的概念清單，列給使用者過目。據此規劃本頁結構、互動與評量，不套用過往小節的重點數。

## 3. 建置與命題

依 [W2](../../../docs/reference/web-production.md#w2-互動的教學語意與狀態)、[W3](../../../docs/reference/web-production.md#w3-前端架構共用工具與操作)、[W4](../../../docs/reference/web-production.md#w4-版面與數學排版) 實作頁面。數學及評量按 M2–M7 審查；需要重構時才讀手冊的相應附錄。

## 4. 製作圖片與暖身漫畫

依 [W5](../../../docs/reference/web-production.md#w5-圖片與漫畫製作) 確認角色、風格、稿件位置及投影規格。暖身漫畫必須調用 W5 指定的 teaching-comic 技能，按其正式流程操作；不要自行另寫生成／排字流程。工具定位或後製遇問題時，只讀 W5 連到的對應附錄。

## 5. 驗收與整合

依 [W6](../../../docs/reference/web-production.md#w6-成品驗收) 完成對應檢查，按 [W7](../../../docs/reference/web-production.md#w7-整合與發布) 整合頁面與索引。網站技術結果與數學檢查分別記錄，未驗證項目明列。

## 6. 交付

回報檔案、完成內容、驗收結果及未決事項。若教材重點有調整，依手冊維護流程更新概念目錄。Git 與收工動作依 AGENTS 的協作約定執行。
