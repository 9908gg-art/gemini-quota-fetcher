# 📊 Gemini API Rate Limits Monitor (額度限制監控看板)

這是一個自動化的 Gemini API 費率限制 (RPM, TPM, RPD) 監控面板。它利用 Playwright 無頭瀏覽器技術，每天定時自動抓取 Google AI Studio 官方的費率限制網頁，並生成視覺化的極速對稱面板發布至 GitHub Pages 上。

🔗 **線上監控網址**: *(您的 GitHub Pages 網址，例如：`https://9908gg-art.github.io/gemini-quota-fetcher/`)*

---

## 🚀 它是如何運作的？ (解決 GitHub 無螢幕抓取問題)

因為 GitHub Actions 的伺服器是沒有顯示器螢幕的 (Headless)，且 Google AI Studio 需要 Google 帳號登入，本專案採用了以下的高階解決方案：

1.  **無頭瀏覽器 (Headless Playwright)**: 程式被改造為不需要任何 GUI 畫面 (如 Tkinter)，在雲端記憶體中運行虛擬 Chromium 核心渲染網頁。
2.  **Cookie 注入免登入機制**: 爬蟲在啟動時，會自動讀取您存放在 GitHub Secrets 中的 Google 會話 Cookie (即 `GOOGLE_COOKIES`)，並將其注入瀏覽器上下文中。這讓爬蟲可以直接繞過登入驗證頁面，直接加載費率限制數據。

---

## 🛠️ 如何設定您的 Google Cookies (一次性設定)

為了讓背景機器人能夠代替您進行官方資料抓取，請跟著以下步驟設定您的 Google Cookies：

### 第一步：在您的瀏覽器匯出 Google Cookies
1.  在電腦或手機瀏覽器上，打開並登入 [Google AI Studio 額度頁面](https://aistudio.google.com/rate-limit)。
2.  安裝 Chrome/Edge 擴充套件，例如 **EditThisCookie** 或 **Get cookies.txt LOCALLY**。
3.  使用該套件將 `aistudio.google.com` 和 `google.com` 的 Cookie **匯出為 JSON 格式**。
4.  複製整串 JSON 內容（例如 `[{"domain": ".google.com", "name": "SID", ...}]`）。

### 第二步：將 Cookie 存入 GitHub 機密變數 (Secrets)
1.  進入您本專案的 GitHub 倉庫頁面。
2.  點擊 **Settings** ➔ 選擇左側選單的 **Secrets and variables** ➔ 點擊 **Actions**。
3.  點擊右上角的 **New repository secret**。
4.  將名稱 (Name) 設為：`GOOGLE_COOKIES`。
5.  將剛剛複製的 Cookie JSON 內容貼入值 (Value) 輸入框中。
6.  點選 **Add secret** 儲存。

---

## 📅 自動更新頻率
*   **定時自動更新**: 專案已配置 GitHub Actions 任務，每天中午 12:00 (台北時間) 會自動啟動爬蟲，抓取最新限額並更新網頁。
*   **手動觸發**: 您隨時可以到 GitHub 的 **Actions** 頁面，點選「自動更新 Gemini API 額度限制」任務，點擊右側的 **Run workflow** 手動立刻更新！

---

## 💻 本地手動運行方法
如果您想在本地電腦上手動以圖形介面 (GUI) 運行本程式：
```bash
# 安裝依賴庫
pip install playwright beautifulsoup4
playwright install

# 啟動圖形化抓取介面 (Tkinter)
python main.py
```
如果是想在本地以無頭 CLI 模式運行：
```bash
python main.py --cli
```
*(本地 CLI 模式下會自動抓取當前目錄的 `cookies.json` 檔案進行登入注入)*
