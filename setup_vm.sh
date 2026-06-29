#!/usr/bin/env bash
# ==============================================================================
# GCP Ubuntu VM - Gemini Quota Fetcher 一鍵自動部署腳本 (setup_vm.sh)
# ==============================================================================

set -e

echo "🚀 [1/6] 正在設定 4GB Swap 虛擬記憶體 (防止 Chrome 崩潰)..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 4G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=4096
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✔️ Swap 虛擬記憶體設定完成！"
else
    echo "✔️ Swap 虛擬記憶體已存在，跳過。"
fi

echo -e "\n🔄 [2/6] 正在更新系統軟體源並安裝基本套件..."
sudo apt update -y
sudo apt install -y python3 python3-pip python3-venv git cron curl

echo -e "\n📦 [3/6] 正在安裝 Python 依賴庫..."
python3 -m pip install --upgrade pip
pip3 install playwright beautifulsoup4

echo -e "\n🌐 [4/6] 正在下載 Playwright 瀏覽器核心 (Chromium)..."
playwright install chromium
sudo playwright install-deps

echo -e "\n🤖 [5/6] 正在確認環境與設定 Telegram 通知..."
REPO_DIR=$(pwd)
echo "目前工作目錄: $REPO_DIR"

read -p "❓ 是否要設定 Telegram 機器人通知？(y/n): " set_tg
if [[ "$set_tg" =~ ^[Yy]$ ]]; then
    read -p "➡️  請輸入您的 Telegram Bot Token (tg_token): " user_token
    read -p "➡️  請輸入您的 Telegram 個人 ID (TG_USER_ID): " user_chat_id
    
    # Save to .env file
    echo "tg_token=\"$user_token\"" > .env
    echo "TG_USER_ID=\"$user_chat_id\"" >> .env
    echo "✔️ 成功建立 .env 設定檔並寫入 Telegram 憑證！"
else
    echo "⚠️ 跳過 Telegram 憑證設定。若日後需要，可手動建立 .env 檔案並寫入。"
fi

# Print instruction for cookies
echo -e "\n=================================================================="
echo "🔑 重要步驟：導入 Google 登入 Cookie"
echo "=================================================================="
echo "1. 請在您的本機電腦執行更新程式，登入成功後會在您本機資料夾內產生 'cookies.json'。"
echo "2. 請在雲端電腦的此目錄下建立 'cookies.json' 檔案："
echo "   指令: nano cookies.json"
echo "3. 將您本機的 cookies.json 內容複製並貼上，存檔關閉 (Ctrl+O -> Enter -> Ctrl+X)。"
echo "4. 您可以使用以下指令測試無頭抓取是否成功："
echo "   python3 main.py --cli --push"
echo "=================================================================="

echo -e "\n⏰ [6/6] 正在將任務寫入系統定時排程 (每天晚上 23:00 自動執行)..."
CRON_JOB="0 23 * * * cd $REPO_DIR && python3 main.py --cli --push >> $REPO_DIR/cron_log.txt 2>&1"
(crontab -l 2>/dev/null | grep -F "main.py" || true) > /tmp/current_cron || true

if grep -q "main.py" /tmp/current_cron; then
    echo "✔️ 排程已存在，無需重複寫入。"
else
    echo "$CRON_JOB" >> /tmp/current_cron
    crontab /tmp/current_cron
    echo "✔️ 成功寫入系統排程！"
fi
rm -f /tmp/current_cron

echo -e "\n🎉 部署腳本執行完畢！請依照上方指示導入 'cookies.json' 完成最後設定！"
