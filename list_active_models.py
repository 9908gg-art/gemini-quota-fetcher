import os
import urllib.request
import json

def fetch_active_models(api_key=None):
    if not api_key:
        api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        print("【提示】未檢測到 GEMINI_API_KEY 環境變數。")
        print("請設定環境變數或在程式中傳入 API Key 以獲取你帳號下的完整模型列表。")
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    
    print("正在從 Google API 獲取當前可用的模型清單...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            
        models = data.get('models', [])
        print(f"🎉 成功獲取！共找到 {len(models)} 個可用模型。")
        
        # 整理成乾淨的結構
        clean_models = []
        for m in models:
            # 移除 'models/' 前綴
            model_id = m.get('name', '').replace('models/', '')
            clean_models.append({
                "model_id": model_id,
                "display_name": m.get('displayName'),
                "description": m.get('description'),
                "input_token_limit": m.get('inputTokenLimit'),
                "output_token_limit": m.get('outputTokenLimit'),
                "supported_methods": m.get('supportedGenerationMethods', [])
            })
            
        # 儲存為 JSON 檔案
        output_path = os.path.join(os.path.dirname(__file__), "active_models.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(clean_models, f, ensure_ascii=False, indent=2)
            
        print(f"數據已儲存至: {output_path}")
        return clean_models
        
    except Exception as e:
        print(f"❌ 獲取失敗，錯誤訊息: {e}")
        return None

if __name__ == "__main__":
    # 你可以在這裡直接貼上你的 API Key 進行測試
    # fetch_active_models("你的_GEMINI_API_KEY")
    fetch_active_models()
