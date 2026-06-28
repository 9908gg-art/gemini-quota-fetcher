import os
import sys
import json
import csv
import threading
import queue
import shutil
import traceback
import re
from datetime import datetime
# Optional Tkinter import for headless safety
try:
    import tkinter as tk
    from tkinter import ttk, messagebox, filedialog
    HAS_TKINTER = True
except ImportError:
    HAS_TKINTER = False
from bs4 import BeautifulSoup

# Try importing Playwright
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    msg = "偵測到未安裝 playwright，請先在終端機運行:\npip install playwright\nplaywright install"
    if HAS_TKINTER:
        messagebox.showerror("缺少依賴庫", msg)
    else:
        print("❌ 缺少依賴庫:", msg)
    sys.exit(1)

# Application Configuration
DEFAULT_URL = "https://aistudio.google.com/rate-limit?timeRange=last-28-days&project=gen-lang-client-0286062465"
PROFILE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "aistudio_profile"))
CSV_OUTPUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "gemini_rate_limits.csv"))
JSON_OUTPUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "gemini_rate_limits.json"))

# Standard Friendly Name to API ID Mapping
MODEL_NAME_TO_API_ID = {
    # Text-out models
    "gemini 2.5 flash": "gemini-2.5-flash",
    "gemini 2.5 flash lite": "gemini-2.5-flash-lite",
    "gemini 2.5 pro": "gemini-2.5-pro",
    "gemini 3.0 flash": "gemini-3.0-flash",
    "gemini 3 flash": "gemini-3.0-flash",
    "gemini 3.1 flash lite": "gemini-3.1-flash-lite",
    "gemini 3.1 pro": "gemini-3.1-pro",
    "gemini 3.5 flash": "gemini-3.5-flash",
    "gemini embedding 1": "text-embedding-004",
    "gemini embedding 2": "text-embedding-005",
    "gemma 4 26b": "gemma-4-26b",
    "gemma 4 31b": "gemma-4-31b",
    "computer use preview": "computer-use-preview",
    "deep research pro preview": "deep-research-pro-preview",
    
    # Image/Video
    "imagen 4 generate": "imagen-3.0-generate-002",
    "imagen 4 fast generate": "imagen-3.0-fast-generate-002",
    "imagen 4 ultra generate": "imagen-3.0-ultra-generate-002",
    "veo 3 generate": "veo-3.0-generate",
    "veo 3 fast generate": "veo-3.0-fast-generate",
    "veo 3 lite generate": "veo-3.0-lite-generate",
    
    # Audio/Speech
    "gemini 2.5 flash tts": "gemini-2.5-flash-tts",
    "gemini 3.1 flash tts": "gemini-3.1-flash-tts",
    
    # Live API
    "gemini 2.5 flash native audio dialog": "gemini-2.5-flash-native-audio",
    "gemini 3 flash live": "gemini-3.0-flash-live",
    "gemini 3.5 live translate": "gemini-3.5-live-translate",
}

def get_api_model_id(display_name, category=""):
    """Convert friendly model display name to standard Google API identifier."""
    name_clean = display_name.lower().strip()
    
    # Remove metadata suffix like 'info' from scraper artifacts
    if name_clean.endswith("info"):
        name_clean = name_clean[:-4].strip()
        
    # Check direct mapping
    if name_clean in MODEL_NAME_TO_API_ID:
        return MODEL_NAME_TO_API_ID[name_clean]
        
    # Check substring matches
    for friendly, api_id in MODEL_NAME_TO_API_ID.items():
        if friendly in name_clean:
            return api_id
            
    # Auto-generate kebab-case name if unknown
    val = name_clean.replace(" ", "-").replace("/", "-")
    # Clean redundant dashes
    while "--" in val:
        val = val.replace("--", "-")
    
    # Append category context to distinguish grounding or agents
    cat_clean = category.lower().strip()
    if "map grounding" in cat_clean:
        val = f"{val}-map-grounding"
    elif "search grounding" in cat_clean:
        val = f"{val}-search-grounding"
    elif "agents" in cat_clean:
        val = f"{val}-agents"
        
    return val.strip("-")

def show_unhandled_exception(exc_type, exc_value, exc_traceback):
    """Intercept all unhandled exceptions in Tkinter main loop to prevent silent crashes."""
    err_msg = "".join(traceback.format_exception(exc_type, exc_value, exc_traceback))
    print("❌ 偵測到未預期的程式錯誤:\n", err_msg)
    messagebox.showerror("系統未預期錯誤 (程式已攔截)", 
                         f"程式執行時發生未預期錯誤，已自動攔截並阻止程式關閉。\n\n詳細錯誤資訊:\n{err_msg}")

class ScraperThread(threading.Thread):
    def __init__(self, url, headless, log_queue, result_queue, error_callback, prompt_manual_toggle):
        super().__init__()
        self.url = url
        self.headless = headless
        self.log_queue = log_queue
        self.result_queue = result_queue
        self.error_callback = error_callback
        self.prompt_manual_toggle = prompt_manual_toggle
        self.playwright = None
        self.browser_context = None
        self.is_running = True
        self.sync_event = threading.Event()

    def log(self, message):
        self.log_queue.put(f"[{datetime.now().strftime('%H:%M:%S')}] {message}\n")

    def run(self):
        try:
            self.scrape()
        except Exception as e:
            err_tb = traceback.format_exc()
            self.log(f"🔴 執行緒發生異常錯誤:\n{err_tb}")
            self.error_callback(f"執行緒內部錯誤:\n{str(e)}\n\n詳細資訊:\n{err_tb}")
        finally:
            self.is_running = False

    def scrape(self):
        self.log("🚀 啟動 Playwright 瀏覽器核心 (同步安全模式)...")
        self.playwright = sync_playwright().start()
        
        try:
            # Create user data profile directory if it doesn't exist
            os.makedirs(PROFILE_DIR, exist_ok=True)
            self.log(f"📂 使用瀏覽器設定檔目錄: {PROFILE_DIR}")

            # Launch Firefox with persistent context to keep login cookies
            self.browser_context = self.playwright.firefox.launch_persistent_context(
                user_data_dir=PROFILE_DIR,
                headless=self.headless,
                viewport={'width': 1280, 'height': 800},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0"
            )
            
            # Load cookies from environment variable or local JSON if available
            cookies = None
            cookies_env = os.environ.get("GOOGLE_COOKIES")
            if cookies_env:
                try:
                    cookies = json.loads(cookies_env)
                    self.log("🔑 已從環境變數 GOOGLE_COOKIES 載入會話 Cookies。")
                except Exception as e:
                    self.log(f"⚠️ 解析環境變數 GOOGLE_COOKIES 失敗: {e}")
                    
            if not cookies and os.path.exists("cookies.json"):
                try:
                    with open("cookies.json", "r", encoding="utf-8") as f:
                        cookies = json.load(f)
                        self.log("🔑 已從本地 cookies.json 檔案載入會話 Cookies。")
                except Exception as e:
                    self.log(f"⚠️ 讀取 cookies.json 失敗: {e}")
                    
            if cookies:
                # 確保 cookies 內部的 sameSite 符合 Playwright 大小寫要求 (Strict, Lax, None)
                # 並移除不支援的 partitionKey
                cleaned_cookies = []
                for c in cookies:
                    if "partitionKey" in c:
                        del c["partitionKey"]
                    if "sameSite" in c:
                        ss = str(c["sameSite"]).lower().strip()
                        if ss in ["lax", "strict", "none"]:
                            # 將首字母大寫以符合要求 (Lax, Strict, None)
                            c["sameSite"] = ss.capitalize()
                        else:
                            # 如果是其它不合規字串，刪除該欄位讓 Playwright 走預設值
                            del c["sameSite"]
                    cleaned_cookies.append(c)
                
                try:
                    self.browser_context.add_cookies(cleaned_cookies)
                    self.log("✔️ 成功注入 Google 登入狀態 Cookies！")
                except Exception as e:
                    self.log(f"⚠️ 注入 Cookies 失敗: {e}")
            
            page = self.browser_context.new_page()
            self.log(f"🌐 正在導航至網址: {self.url}")
            page.goto(self.url, wait_until="load", timeout=90000)

            # Check if login is required
            self.log("🔍 檢查是否需要登入 Google 帳號...")
            page.wait_for_timeout(2000)
            
            # Loop check for login screen
            while "accounts.google.com" in page.url or page.locator("text=Sign in").count() > 0:
                self.log("⚠️ 偵測到需要登入！請在打開的瀏覽器視窗中完成 Google 登入...")
                if self.headless:
                    raise Exception("需要登入，但目前設定為無頭模式 (Headless)。請勾選「顯示瀏覽器畫面」後重新運行以手動登入。")
                page.wait_for_timeout(3000)

            self.log("🟢 已登入或無需登入，正在等待 AI Studio 載入費率限制頁面...")
            
            # Wait for content containing rate limit info to load
            try:
                page.wait_for_selector("text=Rate limits by model", timeout=30000)
                self.log("🎉 成功載入費率限制頁面！")
            except Exception:
                self.log("⚠️ 載入頁面超時，可能網路較慢。將嘗試繼續執行...")

            # Smart search and click for "All models" slider
            self.log("🔘 正在尋找「All models」滑動開關...")
            clicked = self.click_all_models_toggle(page)
            
            if not clicked:
                self.log("❌ 自動點擊「All models」滑塊失敗，準備彈出提醒以進行手動操作...")
                # Trigger manual prompt (thread-safe UI communication)
                user_confirmed = self.prompt_manual_toggle()
                if user_confirmed:
                    self.log("👍 使用者已手動完成點擊，繼續下一步。")
                else:
                    self.log("🛑 使用者取消操作。")
                    raise Exception("無法點擊 All Models 滑塊，使用者終止程序。")
            else:
                self.log("✨ 成功開啟「All models」滑塊，所有模型已展開！")
                page.wait_for_timeout(2000) # Wait for page structure update
                
            # Smart search and click for "See more" button if it exists
            self.log("🔘 正在檢查是否有「See more」(展開更多) 按鈕...")
            try:
                see_more = page.locator("button.see-more-button, text=See more").first
                if see_more.is_visible(timeout=2000):
                    self.log("找到「See more」按鈕，正在點擊以展開所有模型...")
                    see_more.scroll_into_view_if_needed()
                    see_more.click(force=True)
                    page.wait_for_timeout(2000) # Wait for list expansion
                    self.log("✔️ 已點擊「See more」展開按鈕！")
                else:
                    self.log("沒有找到「See more」按鈕，或模型已全部顯示。")
            except Exception as e:
                self.log(f"檢查或點擊「See more」時出現微小異常 (可能不需點擊): {str(e)}")

            # Extract Page Content
            self.log("📥 正在抓取頁面內容...")
            html_content = page.content()
            text_content = page.evaluate("() => document.body.innerText")

            # Parse Limits
            self.log("🧩 正在解析數據 (RPM, TPM, RPD)...")
            data = parse_rate_limits(html_content, text_content, self.log)
            
            if data:
                self.log(f"✅ 解析完成！共取得 {len(data)} 個模型的資料。")
                self.result_queue.put(data)
            else:
                self.log("❌ 無法從頁面中解析出任何模型費率限制數據。")
                # Save source files for debugging
                debug_html_path = os.path.join(os.path.dirname(__file__), "debug_page_source.html")
                debug_text_path = os.path.join(os.path.dirname(__file__), "debug_page_text.txt")
                with open(debug_html_path, "w", encoding="utf-8") as f:
                    f.write(html_content)
                with open(debug_text_path, "w", encoding="utf-8") as f:
                    f.write(text_content)
                self.log(f"📝 已將網頁源碼及文字輸出至檔案以便除錯: {debug_html_path}")
                raise Exception("資料解析失敗，請檢查 debug_page_source.html 內容是否載入完整。")

        except Exception as e:
            err_tb = traceback.format_exc()
            self.log(f"🔴 抓取錯誤: {str(e)}")
            self.error_callback(f"抓取核心錯誤: {str(e)}\n\n詳細追蹤資訊:\n{err_tb}")
        finally:
            if self.browser_context:
                self.log("🔒 正在關閉瀏覽器...")
                try:
                    self.browser_context.close()
                except Exception:
                    pass
            if self.playwright:
                try:
                    self.playwright.stop()
                except Exception:
                    pass
            self.log("🏁 抓取任務結束。")

    def click_all_models_toggle(self, page):
        # We can find the button directly:
        toggle_button = None
        button_selectors = [
            "button[aria-label='Toggle view all models']",
            "button[id^='mat-mdc-slide-toggle-']",
            "button[role='switch']",
            "mat-slide-toggle button",
            "input[type='checkbox']"
        ]
        
        for sel in button_selectors:
            try:
                loc = page.locator(sel).first
                if loc.is_visible(timeout=1000):
                    toggle_button = loc
                    self.log(f"找到滑塊按鈕選擇器: {sel}")
                    break
            except Exception:
                continue
                
        if toggle_button:
            try:
                aria_checked = toggle_button.get_attribute("aria-checked")
                self.log(f"目前滑塊狀態 (aria-checked): {aria_checked}")
                if aria_checked == "true":
                    self.log("滑塊已經是開啟狀態。")
                    return True
                
                # Standard click
                self.log("正在嘗試標準點擊開關...")
                toggle_button.scroll_into_view_if_needed()
                toggle_button.click(force=True)
                page.wait_for_timeout(1000)
                
                aria_checked = toggle_button.get_attribute("aria-checked")
                if aria_checked == "true":
                    self.log("✔️ 成功切換滑塊！(aria-checked=true)")
                    return True
                    
                # Container click fallback
                self.log("常規點擊未生效，嘗試點擊滑塊的外層容器...")
                parent = page.locator("mat-slide-toggle").first
                if parent.is_visible():
                    parent.click(force=True)
                    page.wait_for_timeout(1000)
                    
                aria_checked = toggle_button.get_attribute("aria-checked")
                if aria_checked == "true":
                    self.log("✔️ 經由外層容器成功切換滑塊！")
                    return True
                    
                # JS click fallback
                self.log("嘗試使用 Javascript 強制觸發點擊事件...")
                toggle_button.evaluate("el => el.click()")
                page.wait_for_timeout(1000)
                
                aria_checked = toggle_button.get_attribute("aria-checked")
                if aria_checked == "true":
                    self.log("✔️ 經由 JS 強制點擊成功切換滑塊！")
                    return True
            except Exception as e:
                self.log(f"點擊滑塊時發生錯誤: {str(e)}")
                
        # Label text click fallback
        try:
            label_loc = page.locator("text=All models").first
            if label_loc.is_visible(timeout=1000):
                self.log("找到 'All models' 文字標籤，嘗試點擊該標籤...")
                label_loc.click(force=True)
                page.wait_for_timeout(1000)
                if toggle_button and toggle_button.get_attribute("aria-checked") == "true":
                    self.log("✔️ 經由文字標籤點擊成功切換滑塊！")
                    return True
        except Exception as e:
            self.log(f"文字標籤點擊錯誤: {str(e)}")
            
        return False


def parse_rate_limits(html_content, text_content, log_func=print):
    results = []
    
    # Method 1: BS4 Table Parsing
    soup = BeautifulSoup(html_content, 'html.parser')
    tables = soup.find_all('table')
    log_func(f"🔎 網頁中找到 {len(tables)} 個表格，正在嘗試表格欄位解析...")
    
    for idx, table in enumerate(tables):
        headers = [th.text.strip().lower() for th in table.find_all('th')]
        rows = table.find_all('tr')
        if not rows:
            continue
            
        is_rate_table = False
        model_col_idx = -1
        rpm_col_idx = -1
        tpm_col_idx = -1
        rpd_col_idx = -1
        category_col_idx = -1
        
        for h_idx, h in enumerate(headers):
            if "model" in h:
                model_col_idx = h_idx
            elif "rpm" in h or ("minute" in h and "request" in h):
                rpm_col_idx = h_idx
            elif "tpm" in h or "token" in h:
                tpm_col_idx = h_idx
            elif "rpd" in h or "day" in h:
                rpd_col_idx = h_idx
            elif "category" in h:
                category_col_idx = h_idx
                
        if model_col_idx != -1 and (rpm_col_idx != -1 or tpm_col_idx != -1 or rpd_col_idx != -1):
            is_rate_table = True
            log_func(f"🎯 找到限制表格 (表格 {idx})，對齊索引：Model={model_col_idx}, RPM={rpm_col_idx}, TPM={tpm_col_idx}, RPD={rpd_col_idx}")
            
        if not is_rate_table:
            continue
            
        for r_idx, row in enumerate(rows):
            cells = [td.text.strip() for td in row.find_all('td')]
            if not cells:
                continue
                
            if len(cells) <= model_col_idx:
                continue
                
            display_name = cells[model_col_idx]
            
            if not display_name or display_name.lower() in ["model", "models", "rate limits by model"]:
                continue
                
            category = cells[category_col_idx] if (category_col_idx != -1 and len(cells) > category_col_idx) else ""
            
            # Map friendly display name to exact API identifier name
            api_name = get_api_model_id(display_name, category)
            
            # Clean display name from system labels
            clean_display_name = display_name
            if clean_display_name.endswith("info"):
                clean_display_name = clean_display_name[:-4].strip()
                
            rpm = cells[rpm_col_idx] if (rpm_col_idx != -1 and len(cells) > rpm_col_idx) else "N/A"
            tpm = cells[tpm_col_idx] if (tpm_col_idx != -1 and len(cells) > tpm_col_idx) else "N/A"
            rpd = cells[rpd_col_idx] if (rpd_col_idx != -1 and len(cells) > rpd_col_idx) else "N/A"
            
            tier = "Free tier"
            if "pay-as-you-go" in text_content.lower() or "billing set up" in text_content.lower():
                tier = "Pay-as-you-go"
                
            results.append({
                "api_name": api_name,
                "display_name": clean_display_name,
                "category": category,
                "tier": tier,
                "rpm": clean_limit_val(rpm, "RPM"),
                "tpm": clean_limit_val(tpm, "TPM"),
                "rpd": clean_limit_val(rpd, "RPD")
            })

    # Method 2: Text Blocks Parsing (Fallback/Validation)
    log_func("🔎 正在進行網頁文字區塊正則與行解析...")
    text_results = []
    lines = [l.strip() for l in text_content.split('\n') if l.strip()]
    
    for i, line in enumerate(lines):
        line_l = line.lower()
        is_model = False
        if any(kw in line_l for kw in ["gemini-", "text-embedding-", "imagen-", "aqa-"]):
            is_model = True
        elif line_l in ["aqa", "gemini"]:
            is_model = True
        elif len(line) > 3 and '-' in line and line.islower() and " " not in line:
            is_model = True
            
        if is_model:
            display_name = line
            category = "Other models"
            if "flash" in line_l or "pro" in line_l:
                category = "Text-out models"
            elif "embedding" in line_l:
                category = "Other models"
            elif "live" in line_l:
                category = "Live API"
            elif "grounding" in line_l:
                category = "Search grounding"
                
            tier = "Free tier"
            rpm, tpm, rpd = "N/A", "N/A", "N/A"
            
            # Inspect next 6 lines
            for offset in range(1, 7):
                if i + offset >= len(lines):
                    break
                sub = lines[i + offset]
                sub_l = sub.lower()
                
                # If encountered next model, stop
                if any(kw in sub_l for kw in ["gemini-", "text-embedding-", "imagen-"]) and '-' in sub:
                    break
                    
                if "rpm" in sub_l:
                    rpm = sub
                elif "tpm" in sub_l:
                    tpm = sub
                elif "rpd" in sub_l:
                    rpd = sub
                elif "free" in sub_l:
                    tier = "Free tier"
                elif "pay-as-you-go" in sub_l or "billing" in sub_l or "paid" in sub_l:
                    tier = "Pay-as-you-go"
                    
            clean_display_name = display_name
            if clean_display_name.endswith("info"):
                clean_display_name = clean_display_name[:-4].strip()
                
            api_name = get_api_model_id(clean_display_name, category)
            
            text_results.append({
                "api_name": api_name,
                "display_name": clean_display_name,
                "category": category,
                "tier": tier,
                "rpm": clean_limit_val(rpm, "RPM"),
                "tpm": clean_limit_val(tpm, "TPM"),
                "rpd": clean_limit_val(rpd, "RPD")
            })

    # Merge Results
    merged = {}
    
    # Load Table parsing first
    for item in results:
        merged[item["api_name"]] = item
        
    # Supplement from Text parsing
    for item in text_results:
        m = item["api_name"]
        if m not in merged:
            merged[m] = item
        else:
            if merged[m]["rpm"] == "N/A" and item["rpm"] != "N/A":
                merged[m]["rpm"] = item["rpm"]
            if merged[m]["tpm"] == "N/A" and item["tpm"] != "N/A":
                merged[m]["tpm"] = item["tpm"]
            if merged[m]["rpd"] == "N/A" and item["rpd"] != "N/A":
                merged[m]["rpd"] = item["rpd"]

    # Filter system labels
    final_list = []
    for api_name, data in merged.items():
        if api_name.lower() in ["model", "models", "rate-limits-by-model", "free-tier", "project", "time-range", "limit"]:
            continue
        final_list.append(data)
        
    return final_list

def clean_limit_val(val, unit):
    if not val or val == "N/A":
        return "N/A"
    val_clean = val.replace(unit, "").replace(unit.lower(), "").strip()
    return val_clean if val_clean else "N/A"


class AppGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Gemini API Rate Limit 抓取工具")
        self.root.geometry("1100x700")
        self.root.minsize(900, 600)
        
        self.log_queue = queue.Queue()
        self.result_queue = queue.Queue()
        self.scraped_data = []
        self.scraper_thread = None
        self.manual_prompt_event = threading.Event()
        self.manual_prompt_result = False
        
        self.setup_styles()
        self.create_widgets()
        self.root.after(100, self.poll_queues)

    def setup_styles(self):
        self.bg_main = "#1e1e2e"       
        self.bg_card = "#2a2b3d"       
        self.fg_main = "#f8f9fa"       
        self.fg_dim = "#a5adcb"        
        self.accent_blue = "#06b6d4"    
        self.accent_orange = "#f97316"  
        self.border_color = "#3b3d54"   
        
        self.root.configure(bg=self.bg_main)
        
        self.style = ttk.Style()
        self.style.theme_use("clam")
        
        self.style.configure("TFrame", background=self.bg_main)
        self.style.configure("Card.TFrame", background=self.bg_card, borderwidth=1, relief="solid")
        
        self.style.configure("TLabel", background=self.bg_main, foreground=self.fg_main, font=("Microsoft JhengHei", 10))
        self.style.configure("Title.TLabel", font=("Microsoft JhengHei", 16, "bold"), foreground=self.accent_blue, background=self.bg_main)
        self.style.configure("Card.TLabel", background=self.bg_card, foreground=self.fg_main)
        self.style.configure("CardDim.TLabel", background=self.bg_card, foreground=self.fg_dim, font=("Microsoft JhengHei", 9))
        
        self.style.configure("TEntry", fieldbackground=self.bg_main, foreground=self.fg_main, bordercolor=self.border_color)
        
        self.style.configure("TButton", font=("Microsoft JhengHei", 10, "bold"), borderwidth=0, focuscolor="none")
        self.style.map("TButton",
            background=[("active", "#0891b2"), ("!disabled", self.accent_blue)],
            foreground=[("active", "#ffffff"), ("!disabled", "#ffffff")]
        )
        
        self.style.configure("Orange.TButton", font=("Microsoft JhengHei", 10, "bold"))
        self.style.map("Orange.TButton",
            background=[("active", "#ea580c"), ("!disabled", self.accent_orange)],
            foreground=[("active", "#ffffff"), ("!disabled", "#ffffff")]
        )
        
        self.style.configure("TCheckbutton", background=self.bg_main, foreground=self.fg_main, focuscolor="none")
        
        self.style.configure("Treeview", 
            background=self.bg_card, 
            foreground=self.fg_main, 
            fieldbackground=self.bg_card, 
            rowheight=28,
            font=("Consolas", 10)
        )
        self.style.configure("Treeview.Heading", 
            background=self.bg_main, 
            foreground=self.accent_blue, 
            font=("Microsoft JhengHei", 10, "bold"),
            borderwidth=1,
            relief="solid"
        )
        self.style.map("Treeview", 
            background=[("selected", "#3e405b")],
            foreground=[("selected", "#ffffff")]
        )

    def create_widgets(self):
        header_frame = ttk.Frame(self.root, padding=(20, 15, 20, 5))
        header_frame.pack(fill="x")
        
        lbl_title = ttk.Label(header_frame, text="Gemini API Rate Limit 智慧抓取中心", style="Title.TLabel")
        lbl_title.pack(side="left")
        
        lbl_ver = ttk.Label(header_frame, text="v1.0.2 Stable", font=("Consolas", 9, "italic"), foreground=self.fg_dim)
        lbl_ver.pack(side="left", padx=10, pady=5)
        
        control_card = ttk.Frame(self.root, padding=15, style="Card.TFrame")
        control_card.pack(fill="x", padx=20, pady=10)
        
        url_frame = ttk.Frame(control_card, style="Card.TFrame")
        url_frame.pack(fill="x", pady=5)
        
        lbl_url = ttk.Label(url_frame, text="後台監控網址:", style="Card.TLabel", width=12)
        lbl_url.pack(side="left", padx=5)
        
        self.ent_url = tk.Entry(url_frame, bg="#1e1e2e", fg="#ffffff", insertbackground="#ffffff", 
                                highlightthickness=1, highlightbackground=self.border_color, 
                                highlightcolor=self.accent_blue, bd=0, font=("Consolas", 10))
        self.ent_url.pack(side="left", fill="x", expand=True, padx=5, ipady=4)
        self.ent_url.insert(0, DEFAULT_URL)
        
        btn_frame = ttk.Frame(control_card, style="Card.TFrame")
        btn_frame.pack(fill="x", pady=10)
        
        self.var_show_browser = tk.BooleanVar(value=True)
        chk_show = ttk.Checkbutton(btn_frame, text="顯示瀏覽器畫面 (建議勾選)", variable=self.var_show_browser, style="TCheckbutton")
        chk_show.pack(side="left", padx=5)
        
        self.btn_start = ttk.Button(btn_frame, text="🔍 開始抓取資料", command=self.start_scrape)
        self.btn_start.pack(side="left", padx=15, ipadx=10, ipady=3)
        
        btn_clear_cookies = ttk.Button(btn_frame, text="🗑️ 清除登入快取", command=self.clear_login_cache, style="Orange.TButton")
        btn_clear_cookies.pack(side="left", padx=5, ipadx=5, ipady=3)
        
        paned = tk.PanedWindow(self.root, orient="horizontal", bg=self.bg_main, sashwidth=6)
        paned.pack(fill="both", expand=True, padx=20, pady=5)
        
        left_frame = ttk.Frame(paned)
        paned.add(left_frame, minsize=500, stretch="always")
        
        lbl_grid_title = ttk.Label(left_frame, text="📊 費率限制數據表 (Rate Limits)", font=("Microsoft JhengHei", 11, "bold"), foreground=self.fg_main)
        lbl_grid_title.pack(anchor="w", pady=(0, 5))
        
        tree_scroll_y = ttk.Scrollbar(left_frame, orient="vertical")
        tree_scroll_x = ttk.Scrollbar(left_frame, orient="horizontal")
        
        cols = ("api_name", "display_name", "category", "tier", "rpm", "tpm", "rpd")
        self.tree = ttk.Treeview(left_frame, columns=cols, show="headings", yscrollcommand=tree_scroll_y.set, xscrollcommand=tree_scroll_x.set)
        
        self.tree.heading("api_name", text="API 模型名稱")
        self.tree.heading("display_name", text="顯示名稱 (Friendly Name)")
        self.tree.heading("category", text="主要分類與用途")
        self.tree.heading("tier", text="專案階級 (Tier)")
        self.tree.heading("rpm", text="RPM (Reqs/Min)")
        self.tree.heading("tpm", text="TPM (Tokens/Min)")
        self.tree.heading("rpd", text="RPD (Reqs/Day)")
        
        self.tree.column("api_name", width=150, anchor="w")
        self.tree.column("display_name", width=160, anchor="w")
        self.tree.column("category", width=150, anchor="w")
        self.tree.column("tier", width=80, anchor="center")
        self.tree.column("rpm", width=80, anchor="e")
        self.tree.column("tpm", width=95, anchor="e")
        self.tree.column("rpd", width=80, anchor="e")
        
        tree_scroll_y.config(command=self.tree.yview)
        tree_scroll_x.config(command=self.tree.xview)
        
        tree_scroll_y.pack(side="right", fill="y")
        self.tree.pack(fill="both", expand=True)
        tree_scroll_x.pack(side="bottom", fill="x")
        
        right_frame = ttk.Frame(paned)
        paned.add(right_frame, minsize=320, stretch="always")
        
        lbl_log_title = ttk.Label(right_frame, text="💻 系統日誌與執行狀態 (Logs)", font=("Microsoft JhengHei", 11, "bold"), foreground=self.fg_main)
        lbl_log_title.pack(anchor="w", pady=(0, 5))
        
        log_scroll = ttk.Scrollbar(right_frame, orient="vertical")
        self.txt_log = tk.Text(right_frame, bg="#11121d", fg="#e0e0e0", insertbackground="#ffffff", 
                               selectbackground="#3e405b", bd=0, font=("Consolas", 10), 
                               yscrollcommand=log_scroll.set, wrap="word")
        log_scroll.config(command=self.txt_log.yview)
        log_scroll.pack(side="right", fill="y")
        self.txt_log.pack(fill="both", expand=True)
        
        export_frame = ttk.Frame(self.root, padding=(20, 10, 20, 10))
        export_frame.pack(fill="x")
        
        self.btn_csv = ttk.Button(export_frame, text="📥 匯出 CSV 檔案", state="disabled", command=self.export_csv)
        self.btn_csv.pack(side="left", padx=5, ipadx=5)
        
        self.btn_json = ttk.Button(export_frame, text="📥 匯出 JSON 檔案", state="disabled", command=self.export_json)
        self.btn_json.pack(side="left", padx=5, ipadx=5)
        
        self.lbl_status = ttk.Label(export_frame, text="就緒", foreground=self.fg_dim, font=("Microsoft JhengHei", 9))
        self.lbl_status.pack(side="right", padx=10)

    def write_log(self, text):
        self.txt_log.insert(tk.END, text)
        self.txt_log.see(tk.END)

    def update_status(self, text):
        self.lbl_status.config(text=text)

    def poll_queues(self):
        while not self.log_queue.empty():
            msg = self.log_queue.get()
            self.write_log(msg)
            
        if not self.result_queue.empty():
            self.scraped_data = self.result_queue.get()
            self.populate_treeview()
            self.btn_csv.config(state="normal")
            self.btn_json.config(state="normal")
            self.btn_start.config(state="normal")
            self.update_status(f"🎉 抓取成功！共匯入 {len(self.scraped_data)} 筆數據。")
            self.auto_save_files()
            
        if self.manual_prompt_event.is_set():
            self.manual_prompt_event.clear()
            msg = ("🚨 無法自動開啟「All models」滑動開關。\n\n"
                   "請在開啟的瀏覽器視窗中，點擊「All models」滑塊將其切換為開 (顯示所有模型)。\n"
                   "完成手動點擊後，請回到此處點擊「確定」按鈕以繼續擷取數據。")
            result = messagebox.askokcancel("手動輔助提示", msg)
            self.manual_prompt_result = result
            if self.scraper_thread:
                self.scraper_thread.sync_event.set()

        self.root.after(100, self.poll_queues)

    def start_scrape(self):
        url = self.ent_url.get().strip()
        if not url:
            messagebox.showwarning("欄位空白", "請輸入有效的 Google AI Studio 後台網址！")
            return
            
        self.btn_start.config(state="disabled")
        self.btn_csv.config(state="disabled")
        self.btn_json.config(state="disabled")
        self.update_status("正在進行網頁抓取...")
        self.txt_log.delete("1.0", tk.END)
        self.tree.delete(*self.tree.get_children())
        self.scraped_data.clear()
        
        headless = not self.var_show_browser.get()
        self.scraper_thread = ScraperThread(
            url=url,
            headless=headless,
            log_queue=self.log_queue,
            result_queue=self.result_queue,
            error_callback=self.on_scrape_error,
            prompt_manual_toggle=self.trigger_manual_prompt_dialog
        )
        self.scraper_thread.start()

    def trigger_manual_prompt_dialog(self):
        self.scraper_thread.sync_event.clear()
        self.manual_prompt_event.set()
        self.scraper_thread.sync_event.wait()
        return self.manual_prompt_result

    def on_scrape_error(self, err_msg):
        self.root.after(0, lambda: messagebox.showerror("抓取錯誤 (程序已暫停)", f"在執行抓取時發生了錯誤:\n\n{err_msg}\n\n請確認網路連線或是否需要手動登入。"))
        self.root.after(0, lambda: self.btn_start.config(state="normal"))
        self.root.after(0, lambda: self.update_status("任務失敗"))

    def populate_treeview(self):
        self.tree.delete(*self.tree.get_children())
        for row in self.scraped_data:
            self.tree.insert("", "end", values=(
                row["api_name"],
                row["display_name"],
                row["category"],
                row["tier"],
                row["rpm"],
                row["tpm"],
                row["rpd"]
            ))

    def clear_login_cache(self):
        confirm = messagebox.askyesno("確認刪除", "這會清除所有保存在當地的瀏覽器快取與登入 Cookie，您下次必須重新登入 Google 帳號。確定要清除嗎？")
        if confirm:
            try:
                if os.path.exists(PROFILE_DIR):
                    shutil.rmtree(PROFILE_DIR)
                    self.write_log(f"🧹 已成功清除瀏覽器快取設定檔: {PROFILE_DIR}\n")
                    messagebox.showinfo("清理完成", "已清除快取，下次執行將會開啟乾淨的瀏覽器視窗。")
                else:
                    messagebox.showinfo("提示", "目前沒有快取資料可供清除。")
            except Exception as e:
                messagebox.showerror("錯誤", f"清除快取時發生錯誤: {str(e)}")

    def auto_save_files(self):
        try:
            with open(CSV_OUTPUT, "w", newline="", encoding="utf-8-sig") as f:
                writer = csv.writer(f)
                writer.writerow(["API Model Name", "Display Name", "Category/Purpose", "Tier", "RPM (Requests/Min)", "TPM (Tokens/Min)", "RPD (Requests/Day)"])
                for row in self.scraped_data:
                    writer.writerow([row["api_name"], row["display_name"], row["category"], row["tier"], row["rpm"], row["tpm"], row["rpd"]])
                    
            with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
                json.dump(self.scraped_data, f, indent=4, ensure_ascii=False)
                
            self.write_log(f"💾 數據已自動存檔至:\n- CSV: {CSV_OUTPUT}\n- JSON: {JSON_OUTPUT}\n")
        except Exception as e:
            self.write_log(f"⚠️ 自動存檔時發生錯誤: {str(e)}\n")

    def export_csv(self):
        if not self.scraped_data:
            return
        file_path = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV 檔案", "*.csv")])
        if file_path:
            try:
                with open(file_path, "w", newline="", encoding="utf-8-sig") as f:
                    writer = csv.writer(f)
                    writer.writerow(["API Model Name", "Display Name", "Category/Purpose", "Tier", "RPM (Requests/Min)", "TPM (Tokens/Min)", "RPD (Requests/Day)"])
                    for row in self.scraped_data:
                        writer.writerow([row["api_name"], row["display_name"], row["category"], row["tier"], row["rpm"], row["tpm"], row["rpd"]])
                messagebox.showinfo("匯出成功", f"成功存檔至: {file_path}")
            except Exception as e:
                messagebox.showerror("匯出失敗", f"寫入檔案時出錯: {str(e)}")

    def export_json(self):
        if not self.scraped_data:
            return
        file_path = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON 檔案", "*.json")])
        if file_path:
            try:
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(self.scraped_data, f, indent=4, ensure_ascii=False)
                messagebox.showinfo("匯出成功", f"成功存檔至: {file_path}")
            except Exception as e:
                messagebox.showerror("匯出失敗", f"寫入檔案時出錯: {str(e)}")


if __name__ == "__main__":
    # Check if offline parsing is requested
    if "--parse-offline" in sys.argv:
        print("📦 [Offline Parsing] 正在從本地 HTML 檔案解析數據...")
        html_file = "aistudio_limits.html"
        txt_file = "aistudio_limits.txt"
        if not os.path.exists(html_file) or not os.path.exists(txt_file):
            print(f"❌ [錯誤] 找不到本地檔案 {html_file} 或 {txt_file}，請先執行 node fetch_quotas.js 抓取網頁。")
            sys.exit(1)
            
        with open(html_file, "r", encoding="utf-8") as f:
            html_content = f.read()
        with open(txt_file, "r", encoding="utf-8") as f:
            text_content = f.read()
            
        data = parse_rate_limits(html_content, text_content, print)
        if data:
            # Save CSV
            with open(CSV_OUTPUT, "w", newline="", encoding="utf-8-sig") as f:
                writer = csv.writer(f)
                writer.writerow(["API Model Name", "Display Name", "Category/Purpose", "Tier", "RPM (Requests/Min)", "TPM (Tokens/Min)", "RPD (Requests/Day)"])
                for row in data:
                    writer.writerow([row["api_name"], row["display_name"], row["category"], row["tier"], row["rpm"], row["tpm"], row["rpd"]])
            # Save JSON
            with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            print(f"\n🎉 [Offline] 數據解析成功並存檔:\n- CSV: {CSV_OUTPUT}\n- JSON: {JSON_OUTPUT}")
            sys.exit(0)
        else:
            print("❌ [Offline] 無法從本地檔案中解析出任何模型費率限制數據。")
            sys.exit(1)

    # Check if CLI mode or Auto mode is requested
    if "--cli" in sys.argv or "--auto" in sys.argv:
        print("🚀 [CLI] 啟動 Gemini API Rate Limit 自動抓取任務...")
        url = DEFAULT_URL
        for arg in sys.argv:
            if arg.startswith("http"):
                url = arg
                
        log_queue = queue.Queue()
        result_queue = queue.Queue()
        
        def cli_log(msg):
            print(msg.strip())
            
        def cli_error(err):
            print(f"❌ [CLI 錯誤]: {err}")
            sys.exit(1)
            
        def cli_manual_prompt():
            print("❌ [CLI 提示] 無法自動點擊開關。在無頭/自動模式下，不支援手動輔助操作。")
            return False

        headless = "--headful" not in sys.argv
        
        # Instantiate ScraperThread but call scrape directly in the main thread
        scraper = ScraperThread(
            url=url,
            headless=headless,
            log_queue=log_queue,
            result_queue=result_queue,
            error_callback=cli_error,
            prompt_manual_toggle=cli_manual_prompt
        )
        scraper.log = cli_log
        
        try:
            scraper.scrape()
        except Exception as e:
            print(f"❌ [CLI 致命錯誤]: {e}")
            sys.exit(1)
            
        # Handle Output
        if not result_queue.empty():
            data = result_queue.get()
            try:
                # Save CSV
                with open(CSV_OUTPUT, "w", newline="", encoding="utf-8-sig") as f:
                    writer = csv.writer(f)
                    writer.writerow(["API Model Name", "Display Name", "Category/Purpose", "Tier", "RPM (Requests/Min)", "TPM (Tokens/Min)", "RPD (Requests/Day)"])
                    for row in data:
                        writer.writerow([row["api_name"], row["display_name"], row["category"], row["tier"], row["rpm"], row["tpm"], row["rpd"]])
                # Save JSON
                with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                print(f"\n🎉 [CLI] 抓取完成！資料已存檔:\n- CSV: {CSV_OUTPUT}\n- JSON: {JSON_OUTPUT}")
                
                # Check if --push is specified to push changes to GitHub
                if "--push" in sys.argv:
                    print("📤 正在推送變更至 GitHub...")
                    os.system("git add gemini_rate_limits.json gemini_rate_limits.csv")
                    os.system('git commit -m "chore: 手動更新額度限制數據 [skip ci]"')
                    os.system("git push origin main")
                    print("✔️ 已成功推送到 GitHub 倉庫！")
                
                sys.exit(0)
            except Exception as e:
                print(f"❌ [CLI 存檔失敗]: {e}")
                sys.exit(1)
        else:
            print("❌ [CLI] 未取得抓取結果。")
            sys.exit(1)

    if not HAS_TKINTER:
        print("⚠️ 系統未偵測到 Tkinter 元件，且未指定 --cli 參數。自動切換至 CLI 模式運行...")
        sys.argv.append("--cli")
        # Re-run main logic by importing/re-executing CLI block
        os.system(f"python3 {__file__} --cli")
        sys.exit(0)

    try:
        if sys.platform.startswith("win"):
            try:
                import ctypes
                ctypes.windll.shcore.SetProcessDpiAwareness(1)
            except Exception:
                pass
                
        root = tk.Tk()
        root.report_callback_exception = show_unhandled_exception
        app = AppGUI(root)
        root.mainloop()
    except Exception as e:
        err_msg = traceback.format_exc()
        try:
            messagebox.showerror("程式啟動致命錯誤", f"程式啟動失敗，已攔截異常並保持開啟：\n\n{err_msg}")
        except Exception:
            print("Fatal Startup Error:")
            print(err_msg)
            input("按 Enter 鍵結束程式...")
