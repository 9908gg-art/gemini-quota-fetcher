import urllib.request
import json
import os

# Try loading from .env
env_paths = [
    '/home/g9908qq/taiwan-stock-chips/.env',
    '/home/g9908qq/gemini-quota-fetcher/.env',
    '../taiwan-stock-chips/.env',
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
    print("❌ Error: PORKBUN_API_KEY or PORKBUN_API_SECRET not found in environment or .env files.")
    print("請確認您已在 ~/.env 或 ~/taiwan-stock-chips/.env 設定 Porkbun 憑證。")
    exit(1)

# Target configuration
subdomain = "quota"
domain = "gugopro.com"
cname_target = "9908gg-art.github.io"

print(f"🚀 [Porkbun API] 正在新增 DNS CNAME 紀錄: {subdomain}.{domain} -> {cname_target}...")

url = f"https://porkbun.com/api/json/v3/dns/create/{domain}"
data = {
    "apikey": apikey,
    "secretapikey": secretapikey,
    "name": subdomain,
    "type": "CNAME",
    "content": cname_target,
    "ttl": "600"
}

req = urllib.request.Request(
    url,
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        if res_data.get('status') == 'SUCCESS':
            print("✅ 成功在 Porkbun 建立 DNS CNAME 紀錄！")
            print(f"現在，您可以透過 https://{subdomain}.{domain}/ 存取您的網站（設定生效可能需要數分鐘到數小時）。")
        else:
            print(f"❌ Porkbun API 回傳錯誤: {res_data}")
except Exception as e:
    print(f"❌ 發生例外狀況: {e}")
