import json
import urllib.request
import os

API_KEY = "AIzaSyAomY0Xv38ZYfcrh-4euCzXOiur4Boa6wk"
URL = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"

def main():
    print("Fetching live model list from Google AI Studio v1beta/models...")
    try:
        req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            models = data.get("models", [])
            print(f"Successfully retrieved {len(models)} live models from Google API!")
            print("="*60)
            live_names = []
            for m in models:
                name = m.get("name", "").replace("models/", "")
                disp = m.get("displayName", "")
                methods = m.get("supportedGenerationMethods", [])
                live_names.append({
                    "api_name": name,
                    "display_name": disp,
                    "methods": methods
                })
                print(f"API Name: {name:<40} | Display: {disp:<30} | Methods: {methods}")
            
            with open("live_google_models.json", "w", encoding="utf-8") as f:
                json.dump(live_names, f, indent=4, ensure_ascii=False)
            print("Saved live model list to live_google_models.json")
    except Exception as e:
        print(f"Error fetching models: {e}")

if __name__ == "__main__":
    main()
