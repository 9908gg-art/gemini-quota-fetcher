const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  const cookiePath = path.join(__dirname, 'cookies.json');
  if (!fs.existsSync(cookiePath)) {
    console.error('【錯誤】請先將導出的 cookies.json 放入與本腳本相同的目錄中！');
    process.exit(1);
  }

  const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf8'));

  console.log('【1/4】啟動瀏覽器中...');
  const browser = await puppeteer.launch({
    headless: true, // 在本地運行時，可改為 false 以便看見瀏覽器畫面
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // 設定視窗大小
  await page.setViewport({ width: 1280, height: 800 });

  console.log('【2/4】載入 Google 登入 Cookie...');
  await page.setCookie(...cookies);

  let quotaData = null;

  // 監聽網頁發送的所有網絡回應
  page.on('response', async (response) => {
    const url = response.url();
    // 監聽 Google AI Studio 請求的後端 API 端點
    if (url.includes('alkalimeta') || url.includes('quota') || url.includes('limits')) {
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('application/json')) {
          const json = await response.json();
          // 檢查 JSON 結構是否包含配額或限制資訊
          const jsonStr = JSON.stringify(json);
          if (jsonStr.includes('limit') || jsonStr.includes('rpm') || jsonStr.includes('tpm') || jsonStr.includes('requests')) {
            quotaData = json;
            console.log(`🎉 成功攔截到 API 數據！來源網址: ${url.substring(0, 80)}...`);
          }
        }
      } catch (e) {
        // 忽略非 JSON 的回應
      }
    }
  });

  console.log('【3/4】導航至 Google AI Studio 額度頁面...');
  await page.goto('https://aistudio.google.com/app/limits', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  console.log('正在等待網頁加載與背景 API 傳輸 (5秒)...');
  await new Promise(r => setTimeout(r, 5000));

  // 拍照存證，方便確認頁面是否載入成功
  const screenshotPath = path.join(__dirname, 'screenshot.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`📸 已將當前網頁畫面截圖存為: ${screenshotPath}`);

  console.log('【4/4】處理擷取到的數據...');
  if (quotaData) {
    const outputPath = path.join(__dirname, 'raw_limits.json');
    fs.writeFileSync(outputPath, JSON.stringify(quotaData, null, 2), 'utf8');
    console.log(`\n🎉 【成功】數據已成功儲存至: ${outputPath}`);
    console.log('你可以打開該檔案查看抓取到的模型與配額詳情！');
  } else {
    console.log('\n❌ 【失敗】未能攔截到符合條件的 API 數據。');
    console.log('原因可能包括：');
    console.log('1. cookies.json 已過期，需要重新從瀏覽器匯出。');
    console.log('2. 網址有變更，或網頁加載未完成。');
  }

  await browser.close();
}

run().catch(console.error);
