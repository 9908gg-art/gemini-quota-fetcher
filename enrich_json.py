import json
import os

JSON_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "gemini_rate_limits.json"))

def calculate_model_score(model):
    name_lower = (model.get("display_name") or "").lower()
    cat_lower = (model.get("category") or "").lower()
    rpd_limit = model.get("rpd_limit") or 0
    rpm_limit = model.get("rpm_limit") or 0

    # Base rating based on model capability & generation tier
    score = 8.0
    if "3.5" in name_lower or "3.1 pro" in name_lower:
        score = 9.8
    elif "3.1 flash" in name_lower or "3.0 flash" in name_lower or "3 flash" in name_lower:
        score = 9.6
    elif "2.5 pro" in name_lower:
        score = 9.5
    elif "2.5 flash" in name_lower:
        score = 9.3
    elif "gemma" in name_lower:
        score = 8.9
    elif "live" in name_lower or "live api" in cat_lower:
        score = 9.4
    elif "grounding" in name_lower or "grounding" in cat_lower:
        score = 9.3
    elif "tts" in name_lower or "speech" in name_lower or "audio" in name_lower:
        score = 9.1
    elif "imagen" in name_lower or "veo" in name_lower or "banana" in name_lower:
        score = 9.0
    elif "embedding" in name_lower:
        score = 8.8

    # Free Tier Bonus (High RPD & RPM)
    if rpd_limit >= 1500:
        score += 0.2
    elif rpd_limit > 0:
        score += 0.1

    if rpm_limit >= 15:
        score += 0.1

    return min(round(score, 1), 9.9)

def enrich_model(model):
    display_name = model.get("display_name", "")
    api_name = model.get("api_name", "")
    category = model.get("category", "")
    tier = model.get("tier", "")
    rpd_limit = model.get("rpd_limit") or 0
    rpm_limit = model.get("rpm_limit") or 0
    tpm_limit = model.get("tpm_limit") or 0

    name_lower = display_name.lower()
    cat_lower = category.lower()
    tier_lower = tier.lower()

    # Rule 1: Free Tier definition (RPD > 0 is Free model)
    is_free = rpd_limit > 0
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

    # Rule 3: Comprehensive Rating Score
    score = calculate_model_score(model)
    model["model_score"] = score

    # Rule 4: Fine-grained Category & Multimodal Vision Detection
    # NOTE: Gemini 2.5 Flash, 2.5 Pro, 3.0 Flash, 3.1 Pro, etc. ARE ALL Vision & Multimodal models!
    is_vision_capable = (
        "flash" in name_lower or 
        "pro" in name_lower or 
        "computer use" in name_lower or 
        "vision" in name_lower
    )
    model["is_vision_capable"] = is_vision_capable

    if "live api" in cat_lower or "live" in name_lower:
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

    # Capabilities Array
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
        desc = "基於 WebSocket 的低延遲即時雙向影音/語音對話 API (類似 Gemini Live 體驗)。"
    elif fine_cat == "grounding":
        caps.extend(["google_search", "google_maps", "realtime_fact_checking"])
        desc = "結合 Google Web 實時搜尋與 Google Maps 地理座標，提供附帶來源網址的最新精準答案。"
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
        data = json.load(f)

    enriched_data = [enrich_model(item) for item in data]

    # Split into Free Tier (RPD > 0) and Paid Tier (RPD = 0)
    free_models = [m for m in enriched_data if m["is_free_tier"]]
    paid_models = [m for m in enriched_data if not m["is_free_tier"]]

    # Rank by model_score descending so highest rated models appear first!
    free_models.sort(key=lambda x: (x.get("model_score") or 0, x.get("rpd_limit") or 0), reverse=True)
    paid_models.sort(key=lambda x: (x.get("model_score") or 0, x.get("rpm_limit") or 0), reverse=True)

    sorted_data = free_models + paid_models

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(sorted_data, f, indent=4, ensure_ascii=False)

    print(f"Successfully enriched & ranked {len(sorted_data)} models in gemini_rate_limits.json!")
    print(f"- Free models (RPD > 0): {len(free_models)} (Top Score: {free_models[0]['model_score'] if free_models else 'N/A'})")
    print(f"- Paid/Exclusive models (RPD = 0): {len(paid_models)} (Top Score: {paid_models[0]['model_score'] if paid_models else 'N/A'})")

if __name__ == "__main__":
    main()
