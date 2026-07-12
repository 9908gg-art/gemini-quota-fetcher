import urllib.request
import json
import os

# Try loading from .env
env_paths = [
    '/home/g9908qq/taiwan-stock-chips/.env',
    '/home/g9908qq/gemini-quota-fetcher/.env',
    '/home/g9908qq/.env',
    '.env'
]

# Simple env parser
def load_env(path):
    if not os.path.exists(path):
        return
    with open(path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            parts = line.split('=', 1)
            if len(parts) == 2:
                os.environ[parts[0].strip()] = parts[1].strip().strip('"').strip("'")

for p in env_paths:
    load_env(p)

apikey = os.getenv('PORKBUN_API_KEY')
secretapikey = os.getenv('PORKBUN_API_SECRET')

if not apikey or not secretapikey:
    print("❌ 診斷失敗: 未找到 PORKBUN_API_KEY 或 PORKBUN_API_SECRET。")
    exit(1)

print("🔍 [Porkbun 診斷] 1. 正在測試 Ping API...")
ping_url = "https://porkbun.com/api/json/v3/ping"
data = {
    "apikey": apikey,
    "secretapikey": secretapikey
}

req_ping = urllib.request.Request(
    ping_url,
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req_ping) as response:
        res = json.loads(response.read().decode('utf-8'))
        print(f"  • Ping 結果: {res}")
except Exception as e:
    print(f"  ❌ Ping 失敗 (403 表示金鑰無效或此 IP 未被授權): {e}")

print("\n🔍 [Porkbun 診斷] 2. 正在測試網域清單 API...")
list_url = f"https://porkbun.com/api/json/v3/domain/list"
req_list = urllib.request.Request(
    list_url,
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req_list) as response:
        res = json.loads(response.read().decode('utf-8'))
        print(f"  • 網域清單結果: 成功！(找到 {len(res.get('domains', []))} 個網域)")
        for d in res.get('domains', []):
            print(f"    - 網域: {d.get('domain')} (API 狀態: {d.get('status')})")
except Exception as e:
    print(f"  ❌ 獲取網域清單失敗 (若 Ping 成功但此項失敗，表示網域未開啟 API 開關): {e}")
