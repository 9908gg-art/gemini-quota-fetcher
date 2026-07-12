import os

env_paths = [
    '/home/g9908qq/taiwan-stock-chips/.env',
    '/home/g9908qq/gemini-quota-fetcher/.env',
    '/home/g9908qq/.env',
    '../taiwan-stock-chips/.env',
    '.env'
]

print("🔍 [診斷工具] 開始檢查設定檔環境...")
for path in env_paths:
    exists = os.path.exists(path)
    print(f"路徑: {path} -> {'【檔案存在】' if exists else '【不存在】'}")
    if exists:
        try:
            with open(path, 'r') as f:
                for i, line in enumerate(f, 1):
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    if '=' in line:
                        key = line.split('=', 1)[0].strip()
                        print(f"  • 第 {i} 行找到設定項: '{key}'")
        except Exception as e:
            print(f"  ❌ 讀取錯誤: {e}")

print("\n🔍 檢查系統環境變數中...")
found_env = False
for k in sorted(os.environ.keys()):
    if 'pork' in k.lower() or 'key' in k.lower() or 'secret' in k.lower():
        print(f"  • 環境變數: '{k}'")
        found_env = True
if not found_env:
    print("  • 無相關環境變數")
