import os
import sys
import subprocess

def run_cmd(args):
    try:
        subprocess.check_call(args)
        return True
    except subprocess.CalledProcessError as e:
        print(f"執行出錯: {e}")
        return False

def main():
    print("====================================================")
    print("      Gemini API Quota Monitor - 一鍵更新工具        ")
    print("====================================================")
    
    # 1. 檢查並安裝必要的 Python 庫
    print("\n🔍 [1/3] 正在檢查並自動安裝必要套件...")
    try:
        import playwright
        import bs4
        print("✔️ 必要 Python 套件已安裝。")
    except ImportError:
        print("📦 正在安裝必要套件 (playwright, beautifulsoup4)...")
        if not run_cmd([sys.executable, "-m", "pip", "install", "playwright", "beautifulsoup4"]):
            input("\n❌ 安裝 Python 套件失敗。請按 [Enter] 鍵退出...")
            sys.exit(1)

    # 2. 安裝/更新 Playwright 瀏覽器核心 (Chromium)
    print("\n🔍 [2/3] 正在確認 Playwright 瀏覽器核心 (Chromium)...")
    run_cmd([sys.executable, "-m", "playwright", "install", "chromium"])

    # 3. 執行抓取與推送
    print("\n🚀 [3/3] 正在啟動瀏覽器進行抓取並上傳...")
    print("👉 請注意：我們將優先使用您本機的 Google Chrome 或 Edge 瀏覽器，請在彈出的視窗內完成 Google 登入。")
    
    # 執行 main.py 並帶入 --cli, --headful 與 --push 參數
    success = run_cmd([sys.executable, "main.py", "--cli", "--headful", "--push"])
    
    if success:
        print("\n🎉 恭喜！更新與上傳成功！您的 Gemini Quota 監視網站已同步更新。")
    else:
        print("\n❌ 執行失敗。請確認是否成功登入，且您的電腦是否有 Git 推送權限。")
        
    input("\n請按 [Enter] 鍵結束視窗...")

if __name__ == "__main__":
    main()
