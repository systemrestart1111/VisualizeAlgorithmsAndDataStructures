# 演算法與資料結構視覺化

以 React + TypeScript + Vite 製作的互動式視覺化工具，共 209 項（25 種資料結構、184 種演算法），介面為繁體中文。完整清單與附錄檢核結果見 [docs/ALGORITHMS.md](docs/ALGORITHMS.md)。

線上版：https://systemrestart1111.github.io/VisualizeAlgorithmsAndDataStructures/

## 使用

```bash
npm install
npm run dev
```

開啟終端機顯示的網址（預設 http://localhost:5173）。

- 演算法頁：修改輸入（或按骰子圖示隨機產生；搜尋類的目標值會從目前陣列中挑選）後按「執行」，用播放列逐步觀看，右側虛擬碼會同步高亮。
- 資料結構頁：直接輸入值並執行插入、刪除、搜尋等操作，每個操作都會產生動畫。
- 首頁的「學習路徑」把全部項目分成 13 個由淺入深的階段；「先備知識樹」可選任一主題，畫出學它之前需要先懂的項目與建議學習順序。項目頁也會列出先備知識與接著可以學的項目，並可「標記為已學會」記錄進度（存在瀏覽器裡）。
- 每一項下方都有 Python、C、C++、Java、JavaScript 五種語言的完整實作與執行結果。
- 快捷鍵：空白鍵播放／暫停，← → 單步，Home／End 跳到開頭／結尾。
- 介面採 Material 3 Expressive 風格：右上角調色盤可選主題色（以 `@material/material-color-utilities` 動態產生配色）與淺色／深色／跟隨系統。系統設定「減少動態效果」時會關閉動畫。

## 指令

| 指令 | 說明 |
|---|---|
| `npm run dev` | 開發伺服器 |
| `npm run build` | 型別檢查並建置到 `dist/`（可直接以靜態檔案部署） |
| `npm test` | 執行所有項目的冒煙測試與資料結構不變量測試 |
| `npm run docs` | 由程式重新產生 `docs/ALGORITHMS.md` 的清單 |
| `npm run check:impl` | 編譯並執行 `impl/` 下五種語言的實作，確認輸出彼此一致並更新 `impl/output/`（需 gcc、g++、java、python；可用 `npm run check:impl -- <id 或分類>` 只檢查部分項目） |

## 部署

推送到 `main` 後，GitHub Actions（`.github/workflows/deploy.yml`）會執行測試、建置並發布到 GitHub Pages。

## 架構

- `src/core/`：型別、畫格記錄器 `Rec`、圖／樹／串列的配置與繪圖輔助。
- `src/algos/`：每個分類一個檔案，每個演算法是一個 `AlgoDef`，`run(input)` 回傳一連串畫格（Frame）。
- `src/ds/`：資料結構，每個操作回傳該操作的畫格。
- `src/ui/`：播放器與六種畫面元件（長條圖、表格／格子、圖、平面座標圖、變數、文字）。
- `src/registry.ts`：分類與所有項目的註冊表。
- `src/learning.ts`：每一項的直接先備知識與學習階段；`npm test` 會檢查沒有環、每項都有歸屬且先備不晚於所屬階段。
- `impl/<語言>/<id>.<副檔名>`：五種語言的實作，`impl/output/<id>.txt` 為五種語言一致的輸出。

新增演算法：在對應分類檔案加入一個 `AlgoDef`，以 `Rec.snap(訊息, panels, 虛擬碼行號)` 記錄每一步即可。
