import json
import os
import re

JSON_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "gemini_rate_limits.json"))

def calculate_dynamic_version_score(model):
    display_name = model.get("display_name", "")
    api_name = model.get("api_name", "")
    text = f"{display_name} {api_name}".lower()

    # Dynamic Version Parsing (extracts version numbers like 1.5, 2.5, 3.0, 3.1, 3.5, 4.0, 5.0, etc.)
    version_matches = re.findall(r'(\d+\.\d+|\b[2-9]\b)', text)
    ver_num = 2.5
    if version_matches:
        try:
            val = float(version_matches[0])
            if 1.0 <= val <= 20.0:
                ver_num = val
        except ValueError:
            pass

    # Version-Aware Scalable Base Score (Future-proof for 4.0, 5.0, etc.)
    # Version 2.0 = 8.5, Version 2.5 = 8.8, Version 3.0 = 9.0, Version 3.5 = 9.25, Version 4.0 = 9.5, Version 5.0 = 9.9
    base_score = 7.5 + (ver_num * 0.5)

    # Capability Variant Bonus
    if "pro" in text or "ultra" in text or "thinking" in text:
        base_score += 0.5  # High reasoning and logic capability
    elif "flash" in text:
        base_score += 0.3  # High speed & balanced intelligence
    elif "lite" in text:
        base_score += 0.1  # Ultra lightweight
    elif "live" in text or "grounding" in text:
        base_score += 0.2  # Real-time streaming or search capability
    elif "gemma" in text:
        base_score += 0.1

    final_score = min(max(round(base_score, 1), 7.0), 9.9)
    return final_score

def enrich_model(model):
    display_name = model.get("display_name", "")
    api_name = model.get("api_name", "")
    category = model.get("category", "")
    tier = model.get("tier", "")
    rpd_str = str(model.get("rpd", "")).lower()
    rpd_limit = model.get("rpd_limit") if model.get("rpd_limit") is not None else 0

    name_lower = display_name.lower()
    cat_lower = category.lower()
    tier_lower = tier.lower()

    # Rule 1: Free Tier definition
    # A model is Free if rpd_limit > 0 OR rpd_limit == -1 OR "unlimited" is in rpd string.
    # If rpd_limit == 0 and "unlimited" is not in rpd_str, it has NO free daily quota (rpd = 0)!
    if rpd_limit > 0 or rpd_limit == -1 or "unlimited" in rpd_str:
        is_free = True
    else:
        is_free = False

    model["is_free_tier"] = is_free

    # Rule 2: Billing Account Requirement
    requires_billing = (
        "imagen" in name_lower or 
        "veo" in name_lower or 
        "banana" in name_lower or
        "pay-as-you-go" in tier_lower or
        not is_free
    )
    model["requires_billing_account"] = requires_billing

    # Rule 3: Dynamic Version-Aware Rating Score
    score = calculate_dynamic_version_score(model)
    model["model_score"] = score

    # Rule 4: Fine-grained Category & Multimodal Vision Detection
    is_vision_capable = (
        "flash" in name_lower or 
        "pro" in name_lower or 
        "computer use" in name_lower or 
        "vision" in name_lower
    )
    model["is_vision_capable"] = is_vision_capable

    if "live api" in cat_lower or "live" in name_lower or "audio dialog" in name_lower:
        fine_cat = "live_api"
        fine_cat_zh = "⚡ 即時對話 (Live API)"
    elif "grounding" in cat_lower or "grounding" in name_lower:
        fine_cat = "grounding"
        fine_cat_zh = "🌐 實時網路搜尋與地圖引註"
    elif "imagen" in name_lower or "veo" in name_lower or "banana" in name_lower:
        fine_cat = "image_gen"
        fine_cat_zh = "🎨 圖像與影音生成"
    elif "tts" in name_lower or "audio" in name_lower or "speech" in name_lower or "lyria" in name_lower:
        fine_cat = "speech"
        fine_cat_zh = "🎙️ 語音合成與 TTS"
    elif "computer use" in name_lower or "vision" in name_lower:
        fine_cat = "vision"
        fine_cat_zh = "👁️ 視覺與截圖辨識"
    elif "flash" in name_lower or "pro" in name_lower or "gemma" in name_lower or cat_lower in ["text-out models", "agents"]:
        fine_cat = "text"
        fine_cat_zh = "📝 文字與語言大模型"
    elif "embedding" in name_lower or "aqa" in name_lower:
        fine_cat = "embedding"
        fine_cat_zh = "🔍 向量檢索 (Embedding)"
    else:
        fine_cat = "other"
        fine_cat_zh = "📦 其他專用模型"

    model["fine_category"] = fine_cat
    model["fine_category_name_zh"] = fine_cat_zh

    # Capabilities & Description
    caps = []
    if is_vision_capable:
        caps.append("vision_screenshot_ocr")
    if "flash" in name_lower or "pro" in name_lower:
        caps.extend(["text_generation", "code_completion", "reasoning", "translation"])

    if fine_cat == "speech":
        caps.extend(["tts", "text_to_speech", "voice_synthesis"])
        desc = "文字轉高擬真語音 (TTS)，適合語音助理、廣播配音與對話讀報。"
    elif fine_cat == "image_gen":
        caps.extend(["image_generation", "video_generation"])
        desc = "文字生成高畫質圖片與短影片 (Imagen / Veo)。⚠️ 需在 GCP 專案繫結信用卡結算帳戶。"
    elif fine_cat == "live_api":
        caps.extend(["websocket_live", "realtime_audio_video", "low_latency_dialog"])
        desc = "基於 WebSocket 協議的低延遲即時雙向影音/語音對話 API (類似 Gemini Live 語音體驗)。"
    elif fine_cat == "grounding":
        caps.extend(["google_search", "google_maps", "realtime_fact_checking", "chat_dialog"])
        desc = "完全支援一般日常對話與文字創作，並在此基礎上自動連結 Google 實時 Web 搜尋與 Maps 提供最新出處解答。"
    elif fine_cat == "embedding":
        caps.extend(["text_embedding", "semantic_search"])
        desc = "用於文字向量化與語意搜尋 (RAG)，適合建立企業知識庫。"
    elif is_vision_capable:
        desc = "原生多模態模型，支援圖片、PDF 報告與螢幕截圖辨識，具備高精度 OCR 與文字創作能力。"
    else:
        desc = "通用或特定開發者專用 API 服務模型。"

    model["capabilities"] = list(set(caps))
    model["usage_description_zh"] = desc
    return model

def main():
    if not os.path.exists(JSON_PATH):
        print(f"File not found: {JSON_PATH}")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    # Filter out developer guide if it exists from previous run
    if isinstance(raw_data, dict) and "models" in raw_data:
        data = raw_data["models"]
    elif isinstance(raw_data, list):
        data = [item for item in raw_data if isinstance(item, dict) and "api_name" in item]
    else:
        data = []

    enriched_data = [enrich_model(item) for item in data]

    # Split into Free Tier (RPD > 0 or Unlimited) and Paid Tier
    free_models = [m for m in enriched_data if m["is_free_tier"]]
    paid_models = [m for m in enriched_data if not m["is_free_tier"]]

    # Rank by model_score descending
    free_models.sort(key=lambda x: (x.get("model_score") or 0, x.get("rpd_limit") or 0), reverse=True)
    paid_models.sort(key=lambda x: (x.get("model_score") or 0, x.get("rpm_limit") or 0), reverse=True)

    sorted_data = free_models + paid_models

    # Developer Integration Guide embedded directly into JSON file
    output_obj = {
        "_developer_guide": {
            "title": "Gemini API 官方額度與模型能力 JSON 接口操作指南 (專為 AI 軟體與工具 Failover 設計)",
            "sorting_rule": "所有模型已按動態綜合評分 `model_score` 由高至低排序，且免費模型 (is_free_tier: true) 優先排列於最前面。",
            "recommended_usage": "當您的 AI 軟體或腳本導入此 JSON 時，可以直接讀取 `models` 陣列的第一個元素 (Index 0) 作為預設首選最佳模型。",
            "failover_instruction": "當調用當前模型遇到 HTTP 429 Rate Limit 超限時，順序存取下一個 `is_free_tier: true` 的模型即可實現 100% 不中斷自動降級與備援。",
            "rpd_unlimited_note": "RPD 顯示為 Unlimited 或 -1 代表『每日發送請求次數完全無上限』，只要每分鐘請求 (RPM) 不超限即可無限次呼叫。",
            "field_definitions": {
                "model_score": "模型動態綜合效能評分 (最高 9.9)，依據英文 API 名稱中的代際版本號 (2.5/3.0/3.5/4.0/5.0...) 與推理/速度/多模態能力動態演算法計算，具備未來相容性。",
                "is_free_tier": "是否具備免費額度 (RPD > 0 或 RPD Unlimited)。",
                "requires_billing_account": "是否強制要求 GCP 專案繫結信用卡/結算帳戶 (如 Imagen/Veo)。",
                "fine_category": "細項用途標籤: text, vision, speech, image_gen, live_api, grounding, embedding",
                "capabilities": "模型具備的功能列表，如 vision_screenshot_ocr, google_search, tts, chat_dialog 等。"
            }
        },
        "models": sorted_data
    }

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(output_obj, f, indent=4, ensure_ascii=False)

    print(f"Successfully enriched & ranked {len(sorted_data)} models in gemini_rate_limits.json!")
    print(f"- Free models (RPD > 0 or Unlimited): {len(free_models)} (Top Score: {free_models[0]['model_score'] if free_models else 'N/A'})")
    print(f"- Paid/Exclusive models (RPD = 0): {len(paid_models)} (Top Score: {paid_models[0]['model_score'] if paid_models else 'N/A'})")

if __name__ == "__main__":
    main()
