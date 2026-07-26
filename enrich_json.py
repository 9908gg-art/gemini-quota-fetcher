import json
import os

JSON_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "gemini_rate_limits.json"))

def enrich_model(model):
    display_name = model.get("display_name", "")
    api_name = model.get("api_name", "")
    category = model.get("category", "")
    tier = model.get("tier", "")
    rpd_limit = model.get("rpd_limit", 0)
    rpm_limit = model.get("rpm_limit", 0)
    tpm_limit = model.get("tpm_limit", 0)

    name_lower = display_name.lower()
    cat_lower = category.lower()
    tier_lower = tier.lower()

    # Rule 1: Free Tier definition (RPD > 0 is Free model)
    # Per user directive: "所有的免費模型，只要是RPD。大於0才是免費模型，其他的都不是。"
    is_free = rpd_limit > 0
    model["is_free_tier"] = is_free

    # Rule 2: Billing Account Requirement (Imagen / Veo / Pay-as-you-go / Paid-only models)
    # Explanation: Image generation models (Imagen 3 / Nano Banana) require a linked GCP billing account even when RPD > 0.
    requires_billing = (
        "imagen" in name_lower or 
        "veo" in name_lower or 
        "banana" in name_lower or
        "pay-as-you-go" in tier_lower or
        not is_free
    )
    model["requires_billing_account"] = requires_billing

    # Rule 3: Fine-grained Category Classification & Chinese Name
    if "live api" in cat_lower or "live" in name_lower:
        fine_cat = "live_api"
        fine_cat_zh = "即時對話 Live API"
    elif "grounding" in cat_lower or "grounding" in name_lower:
        fine_cat = "grounding"
        fine_cat_zh = "Google 搜尋與地圖接地"
    elif "imagen" in name_lower or "veo" in name_lower or "banana" in name_lower:
        fine_cat = "image_gen"
        fine_cat_zh = "圖像與影音生成"
    elif "tts" in name_lower or "audio" in name_lower or "speech" in name_lower or "lyria" in name_lower:
        fine_cat = "speech"
        fine_cat_zh = "語音對話與TTS"
    elif "computer use" in name_lower or "vision" in name_lower:
        fine_cat = "vision"
        fine_cat_zh = "視覺與多模態辨識"
    elif "flash" in name_lower or "pro" in name_lower or "gemma" in name_lower or cat_lower in ["text-out models", "agents"]:
        fine_cat = "text"
        fine_cat_zh = "文字語言模型"
    elif "embedding" in name_lower or "aqa" in name_lower:
        fine_cat = "embedding"
        fine_cat_zh = "向量嵌入與檢索"
    else:
        fine_cat = "other"
        fine_cat_zh = "其他專用模型"

    model["fine_category"] = fine_cat
    model["fine_category_name_zh"] = fine_cat_zh

    # Rule 4: Usage Description and Capabilities List
    caps = []
    if fine_cat == "text":
        caps = ["text_generation", "code_completion", "reasoning", "translation", "summarization"]
        desc = "適用於大批量文字創作、程式碼編寫、長文摘要、問答與翻譯。"
    elif fine_cat == "vision":
        caps = ["vision_ocr", "image_understanding", "screenshot_analysis", "pdf_parsing"]
        desc = "支援圖片、PDF 報告與螢幕截圖辨識，可進行高精度 OCR 擷取與圖像分析。"
    elif fine_cat == "speech":
        caps = ["tts", "text_to_speech", "voice_synthesis", "audio_dialog"]
        desc = "文字轉高擬真語音 (TTS)，適合語音助理、廣播配音與對話讀報。"
    elif fine_cat == "image_gen":
        caps = ["image_generation", "video_generation"]
        desc = "文字生成高畫質圖片與短影片 (Imagen / Veo)。⚠️ 官方規定需在 GCP 專案繫結信用卡結算帳戶方可發送請求。"
    elif fine_cat == "live_api":
        caps = ["websocket_live", "realtime_audio_video", "low_latency_dialog"]
        desc = "基於 WebSocket 的低延遲即時雙向影音/語音對話 API (類似 Gemini Live 體驗)。"
    elif fine_cat == "grounding":
        caps = ["google_search", "google_maps", "realtime_fact_checking"]
        desc = "結合 Google Web 即時搜尋與 Google Maps 地理資訊，提供附帶參考來源網址的實時精準答案。"
    elif fine_cat == "embedding":
        caps = ["text_embedding", "semantic_search", "rag_retrieval"]
        desc = "用於文字向量化與語意搜尋 (RAG)，適合建立企業知識庫與文檔檢索。"
    else:
        caps = ["general_ai"]
        desc = "通用或特定開發者專用 API 服務模型。"

    model["capabilities"] = caps
    model["usage_description_zh"] = desc
    return model

def main():
    if not os.path.exists(JSON_PATH):
        print(f"File not found: {JSON_PATH}")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    enriched_data = [enrich_model(item) for item in data]

    # Sort so that Free Tier models (RPD > 0) come first
    free_models = [m for m in enriched_data if m["is_free_tier"]]
    paid_models = [m for m in enriched_data if not m["is_free_tier"]]

    # Sort free models by RPD limit descending
    free_models.sort(key=lambda x: (x.get("rpd_limit") or 0, x.get("rpm_limit") or 0), reverse=True)
    sorted_data = free_models + paid_models

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(sorted_data, f, indent=4, ensure_ascii=False)

    print(f"Successfully enriched {len(sorted_data)} models in gemini_rate_limits.json!")
    print(f"- Free models (RPD > 0): {len(free_models)}")
    print(f"- Paid/Exclusive models (RPD = 0): {len(paid_models)}")

if __name__ == "__main__":
    main()
