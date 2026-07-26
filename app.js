document.addEventListener("DOMContentLoaded", () => {
    let allModels = [];
    let activeCategory = "all";
    let searchQuery = "";
    
    // 1. Multi-language Translations Dictionary
    const translations = {
        "zh-TW": {
            "app-title": "Gemini API 官方額度查詢與監控",
            "official-source": "官方資料來源：<strong>Google AI Studio</strong>",
            "last-updated": "最後更新時間：",
            "loading": "載入中...",
            "search-placeholder": "搜尋模型名稱 (例如: flash, pro, live)...",
            "dl-json-btn": "下載 JSON 格式配置",
            "dl-csv-btn": "下載 CSV 報表",
            "tab-all": "🌐 全部模型",
            "tab-text": "📝 文字與語言",
            "tab-vision": "👁️ 視覺辨識",
            "tab-speech": "🎙️ 語音對話/TTS",
            "tab-image-gen": "🎨 圖像與影音生成",
            "tab-live": "⚡ 即時對話 Live API",
            "tab-grounding": "🔍 搜尋/地圖接地",
            "tab-other": "📦 向量與其他",
            
            "live-api-explainer-title": "⚡ 什麼是 Live API？ (Multimodal Live API)",
            "live-api-explainer-desc": "Live API 是 Google 推出的基於 <strong>WebSocket 協議</strong> 的雙向低延遲對話接口（類似 Gemini Live 音訊體驗），允許使用者直接傳輸連續語音/視訊流並獲得極速語音回應。",
            "grounding-explainer-title": "🔍 什麼是 Grounding (搜尋與地圖接地)？",
            "grounding-explainer-desc": "Grounding 代表模型具備連結 <strong>Google Web 即時搜尋</strong> 或 <strong>Google Maps 地理資料庫</strong> 的能力，讓回答不再侷限於模型訓練截止日，自動附帶最新實時出處網址。",
            "image-billing-warning-title": "⚠️ 圖像生成 (Imagen / Nano Banana) 綁卡說明",
            "image-billing-warning-desc": "Google 官方規定圖像與影音生成 endpoints (Imagen 3 / Veo) 必須在 GCP 專案上<strong>繫結 Pay-As-You-Go 結算帳戶 (信用卡)</strong>。純免費未綁卡專案發送請求會返回 403 Billing 錯誤。",

            "purpose-title": "面板用途與第三方 AI 軟體串接優勢",
            "purpose-desc": "本面板即時同步 Google AI Studio 官方的速率限制規格（Rate Limits），特別為開發者與 AI 軟體提供以下兩大核心優勢：",
            "purpose-card1-title": "免費模型配置 API (JSON 直連)",
            "purpose-card1-desc": "提供結構化的 <strong>JSON 數據接口</strong> (`gemini_rate_limits.json`)，您的語音輸入工具、AI 助手或本機腳本可直接遠端獲取包含 `is_free_tier: true` 的最新免費模型名單與規範（RPM/TPM/RPD），省去手動判斷邏輯。",
            "purpose-card2-title": "故障切換與自動降級 (Failover)",
            "purpose-card2-desc": "當您的工具呼叫單一免費模型觸發 <strong>HTTP 429 額度超限</strong>時，可透過讀取本站接口，在背景自動切換到其他健康的備用免費模型，確保您的工具運作永不中斷。",

            "free-table-title": "🎁 官方免費模型額度限制 (Free Tier - RPD > 0)",
            "free-badge": "免費模型 (每日限額 RPD > 0)",
            "paid-table-title": "💳 付費隨用隨付與獨佔模型限制 (Pay-as-you-go / Paid Only)",
            "paid-badge": "付費/綁卡層級 (無免費每日額度)",
            
            "col-display-name": "模型顯示名稱",
            "col-api-id": "API 識別碼",
            "col-category": "細項用途分類",
            "col-usage-desc": "用途說明與特點",
            "col-rpm": "RPM (分)",
            "col-tpm": "TPM (分)",
            "col-rpd": "RPD (日上限)",
            
            "glossary-title": "額度限額名詞說明",
            "glossary-desc-rpm": "每分鐘最多可發送的 API 請求次數限制。",
            "glossary-desc-tpm": "每分鐘最多可傳輸的總 Token 數限制（包含輸入與輸出）。",
            "glossary-desc-rpd": "每日最多可發送的 API 總請求次數上限 (RPD > 0 代表免費模型)。",
            "glossary-desc-free-paid": "免費層級具有每日限制；付費層級依量計費，限額較高。",
            
            "footer-copyright": "© 2026 Gemini API Monitor. 基於 Playwright 雲端無頭抓取技術自動生成。",
            "footer-badge": "本頁面定時自動爬取並重新發布於 GitHub Pages | 100% 免費且公開存取",
            "no-free-found": "找不到符合條件的免費 API 模型",
            "no-paid-found": "找不到符合條件的付費 API 模型",
            "load-failed": "載入資料失敗。",
            "load-data-free": "正在讀取免費模型資料...",
            "load-data-paid": "正在讀取付費模型資料...",
            "intro-text": "本站即時同步 Google AI Studio (Gemini API) 官方模型額度規格。自動將模型劃分為「🎁 免費模型 (RPD > 0)」與「💳 付費與獨佔模型 (RPD = 0)」，並提供完整用途細項分類（包含 Live API 與 Grounding 名詞解密），供開發者與 AI 軟體直接下載 JSON 無縫套用。",
            
            "amazon-title": "🛒 亞馬遜聯盟行銷精選推薦 (Amazon Hub)",
            "amazon-subtitle": "精選好物推薦",
            "amz-bestsellers": "暢銷產品榜",
            "amz-bestsellers-desc": "發掘亞馬遜每小時更新的最受歡迎商品，看看大家都在買什麼。",
            "amz-new-releases": "熱門新品榜",
            "amz-new-releases-desc": "第一時間掌握最新上架與即將推出的高人氣創意新品。",
            "amz-most-wished": "最想收到好物",
            "amz-most-wished-desc": "匯集全球消費者最常加入個人願望清單的夢幻商品清單。",
            "amz-most-gifted": "送禮首選推薦",
            "amz-most-gifted-desc": "節日送禮、生日慶祝最受歡迎的熱門禮品排行榜。",
            "amz-action": "即刻探索 ➡️",
            "footer-views-label": "本站總瀏覽量：",
            "footer-views-unit": " 次",
            "footer-users-label": "訪客數：",
            "footer-users-unit": " 人"
        },
        "en": {
            "app-title": "Gemini API Quota & Rate Limits Monitor",
            "official-source": "Official Data Source: <strong>Google AI Studio</strong>",
            "last-updated": "Last Updated: ",
            "loading": "Loading...",
            "search-placeholder": "Search model names (e.g. flash, pro, live)...",
            "dl-json-btn": "Download JSON Config",
            "dl-csv-btn": "Download CSV Report",
            "tab-all": "🌐 All Models",
            "tab-text": "📝 Text & Code",
            "tab-vision": "👁️ Vision & OCR",
            "tab-speech": "🎙️ Audio & Speech",
            "tab-image-gen": "🎨 Image & Video Gen",
            "tab-live": "⚡ Live API",
            "tab-grounding": "🔍 Grounding & Search",
            "tab-other": "📦 Embedding & Other",
            
            "live-api-explainer-title": "⚡ What is Live API? (Multimodal Live API)",
            "live-api-explainer-desc": "Live API is Google's bidirectional low-latency streaming API built on <strong>WebSocket</strong> (similar to Gemini Live voice experience), enabling continuous voice/video streaming with instant responses.",
            "grounding-explainer-title": "🔍 What is Grounding (Search & Maps)?",
            "grounding-explainer-desc": "Grounding allows models to connect to <strong>Google Web Search</strong> or <strong>Google Maps</strong> in real-time, delivering up-to-date facts with cited source URLs.",
            "image-billing-warning-title": "⚠️ Image Generation (Imagen / Nano Banana) Billing Notice",
            "image-billing-warning-desc": "Google requires a linked <strong>Pay-As-You-Go Billing Account (Credit Card)</strong> on your GCP project for image/video endpoints (Imagen 3 / Veo). Unbilled free projects get 403 Billing errors.",

            "purpose-title": "Dashboard Purpose & Developer Failover Advantages",
            "purpose-desc": "This dashboard synchronizes official Rate Limits from Google AI Studio in real-time, providing key advantages for developers and AI software:",
            "purpose-card1-title": "Free Model Config API (JSON Direct)",
            "purpose-card1-desc": "Provides a structured <strong>JSON API endpoint</strong> (`gemini_rate_limits.json`) with `is_free_tier: true` for your AI tools, voice assistants, or local scripts to fetch latest free models instantly.",
            "purpose-card2-title": "Failover & Automatic Degrade",
            "purpose-card2-desc": "When your AI tool hits <strong>HTTP 429 Rate Limit Exceeded</strong>, automatically switch to other healthy free fallback models in the background via our JSON endpoint.",

            "free-table-title": "🎁 Official Free Tier Rate Limits (RPD > 0)",
            "free-badge": "Free Tier (Daily Cap RPD > 0)",
            "paid-table-title": "💳 Pay-as-you-go & Paid Tier Limits (RPD = 0)",
            "paid-badge": "Paid Tier (Billing Account Required)",
            
            "col-display-name": "Model Display Name",
            "col-api-id": "API Identifier",
            "col-category": "Fine Category",
            "col-usage-desc": "Capabilities & Description",
            "col-rpm": "RPM (Min)",
            "col-tpm": "TPM (Min)",
            "col-rpd": "RPD (Daily Cap)",
            
            "glossary-title": "Glossary of Rate Limits",
            "glossary-desc-rpm": "Requests Per Minute limit.",
            "glossary-desc-tpm": "Tokens Per Minute limit (Input + Output).",
            "glossary-desc-rpd": "Requests Per Day cap (RPD > 0 indicates Free Tier models).",
            "glossary-desc-free-paid": "Free tier has daily caps; Pay-as-you-go charges by usage.",
            
            "footer-copyright": "© 2026 Gemini API Monitor. Generated automatically using Playwright cloud headless technology.",
            "footer-badge": "This page is periodically scraped and redeployed to GitHub Pages | 100% Free & Open Access",
            "no-free-found": "No free API models found matching criteria",
            "no-paid-found": "No paid API models found matching criteria",
            "load-failed": "Failed to load data.",
            "load-data-free": "Loading Free Tier model data...",
            "load-data-paid": "Loading Paid Tier model data...",
            "intro-text": "This site synchronizes Google AI Studio Gemini API rate limits in real-time, categorizing models into Free Tier (RPD > 0) and Paid Tier (RPD = 0), with JSON configuration downloads for instant AI integration.",
            
            "amazon-title": "🛒 Amazon Influencer Recommended Deals",
            "amazon-subtitle": "Featured Recommendations",
            "amz-bestsellers": "Bestsellers",
            "amz-bestsellers-desc": "Explore hourly updated list of the most popular products on Amazon.",
            "amz-new-releases": "Hot New Releases",
            "amz-new-releases-desc": "Discover the best new and upcoming releases on Amazon.",
            "amz-most-wished": "Most Wished For",
            "amz-most-wished-desc": "See the products most often added to customer wishlists globally.",
            "amz-most-gifted": "Best Gift Ideas",
            "amz-most-gifted-desc": "The most popular products ordered as gifts for any occasion.",
            "amz-action": "Explore Now ➡️",
            "footer-views-label": "Total Views: ",
            "footer-views-unit": " times",
            "footer-users-label": "Visitors: ",
            "footer-users-unit": " people"
        }
    };

    // 2. Language Detection
    let userLang = "zh-TW";
    const browserLang = (navigator.language || navigator.userLanguage || "zh-TW").toLowerCase();
    if (!browserLang.startsWith("zh")) {
        userLang = "en";
    }

    const freeTbody = document.getElementById("free-quota-tbody");
    const paidTbody = document.getElementById("paid-quota-tbody");
    const searchInput = document.getElementById("search-input");
    const updateTimeText = document.getElementById("update-time-text");
    const tabContainer = document.getElementById("category-tabs-container");
    const langSelect = document.getElementById("lang-select");

    // 3. Apply translations to DOM
    function applyI18n() {
        const langObj = translations[userLang] || translations["zh-TW"];
        
        document.querySelectorAll("[data-i18n]").forEach(elem => {
            const key = elem.getAttribute("data-i18n");
            if (langObj[key]) {
                elem.innerHTML = langObj[key];
            }
        });

        if (searchInput) {
            searchInput.setAttribute("placeholder", langObj["search-placeholder"]);
        }

        if (langSelect) {
            langSelect.value = userLang;
        }
    }

    applyI18n();

    if (langSelect) {
        langSelect.addEventListener("change", () => {
            userLang = langSelect.value in translations ? langSelect.value : "zh-TW";
            applyI18n();
            renderTable();
        });
    }

    // 4. Fetch and load JSON data
    async function loadLimitsData() {
        const langObj = translations[userLang] || translations["zh-TW"];
        try {
            const response = await fetch("gemini_rate_limits.json?nocache=" + new Date().getTime());
            if (!response.ok) {
                throw new Error("無法讀取 limits JSON 檔案");
            }
            
            const lastModified = response.headers.get("Last-Modified");
            if (lastModified) {
                const date = new Date(lastModified);
                updateTimeText.textContent = `${langObj["last-updated"]}${date.toLocaleString(userLang === "zh-TW" ? "zh-TW" : "en-US")}`;
            } else {
                updateTimeText.textContent = `${langObj["last-updated"]}Just Now (Auto synced)`;
            }

            allModels = await response.json();
            renderTable();
        } catch (error) {
            console.error("載入數據錯誤：", error);
            const errMsg = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 30px; color: var(--color-red);">
                        <i class="fa-solid fa-triangle-exclamation" style="margin-right: 8px;"></i> ${langObj["load-failed"]}
                    </td>
                </tr>
            `;
            freeTbody.innerHTML = errMsg;
            paidTbody.innerHTML = errMsg;
        }
    }

    // 5. Render tables with fine categories & free/paid logic
    function renderTable() {
        const langObj = translations[userLang] || translations["zh-TW"];
        freeTbody.innerHTML = "";
        paidTbody.innerHTML = "";

        const filtered = allModels.filter(model => {
            let matchesCategory = false;
            const fineCat = model.fine_category || "other";
            
            if (activeCategory === "all") {
                matchesCategory = true;
            } else if (activeCategory === "text") {
                matchesCategory = fineCat === "text";
            } else if (activeCategory === "vision") {
                matchesCategory = fineCat === "vision";
            } else if (activeCategory === "speech") {
                matchesCategory = fineCat === "speech";
            } else if (activeCategory === "image_gen") {
                matchesCategory = fineCat === "image_gen";
            } else if (activeCategory === "live_api") {
                matchesCategory = fineCat === "live_api";
            } else if (activeCategory === "grounding") {
                matchesCategory = fineCat === "grounding";
            } else if (activeCategory === "other") {
                matchesCategory = fineCat === "other" || fineCat === "embedding";
            }
            
            const term = searchQuery.toLowerCase().trim();
            const matchesSearch = !term || 
                (model.display_name && model.display_name.toLowerCase().includes(term)) || 
                (model.api_name && model.api_name.toLowerCase().includes(term)) || 
                (model.fine_category_name_zh && model.fine_category_name_zh.toLowerCase().includes(term)) ||
                (model.usage_description_zh && model.usage_description_zh.toLowerCase().includes(term));

            return matchesCategory && matchesSearch;
        });

        // Split models into Free Tier (RPD > 0) and Paid Tier (RPD = 0)
        const freeModels = filtered.filter(m => m.is_free_tier || (m.rpd_limit && m.rpd_limit > 0));
        const paidModels = filtered.filter(m => !m.is_free_tier && (!m.rpd_limit || m.rpd_limit === 0));

        populateTbody(freeTbody, freeModels, langObj["no-free-found"], true);
        populateTbody(paidTbody, paidModels, langObj["no-paid-found"], false);
    }

    function populateTbody(tbodyElement, modelsList, emptyMsg, isFreeTable) {
        const langObj = translations[userLang] || translations["zh-TW"];
        if (modelsList.length === 0) {
            tbodyElement.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 30px; color: var(--text-muted);">
                        ${emptyMsg}
                    </td>
                </tr>
            `;
            return;
        }

        modelsList.forEach(model => {
            const tr = document.createElement("tr");

            // Category badge mapping
            let catBadgeClass = "badge-other";
            const fineCat = model.fine_category || "other";
            
            if (fineCat === "text") catBadgeClass = "badge-text";
            else if (fineCat === "vision") catBadgeClass = "badge-video";
            else if (fineCat === "speech") catBadgeClass = "badge-speech";
            else if (fineCat === "image_gen") catBadgeClass = "badge-image-gen";
            else if (fineCat === "live_api") catBadgeClass = "badge-live";
            else if (fineCat === "grounding") catBadgeClass = "badge-grounding";

            const catText = model.fine_category_name_zh || model.category || "通用模型";
            const usageDesc = model.usage_description_zh || "通用 AI API 服務。";

            // Free vs Billing status tags
            let statusTag = "";
            if (model.is_free_tier) {
                statusTag += `<span style="font-size:0.75rem; background:rgba(52,211,153,0.15); color:#34d399; padding:2px 6px; border-radius:4px; margin-left:6px; font-weight:600;">🎁 免費</span>`;
            } else {
                statusTag += `<span style="font-size:0.75rem; background:rgba(96,165,250,0.15); color:#60a5fa; padding:2px 6px; border-radius:4px; margin-left:6px; font-weight:600;">💳 付費</span>`;
            }

            if (model.requires_billing_account) {
                statusTag += `<span style="font-size:0.75rem; background:rgba(245,158,11,0.15); color:#fbbf24; padding:2px 6px; border-radius:4px; margin-left:4px; font-weight:600;" title="需繫結結算帳戶/信用卡">⚠️ 需綁卡</span>`;
            }

            const rpmHtml = formatLimitValue(model.rpm, "RPM");
            const tpmHtml = formatLimitValue(model.tpm, "TPM");
            const rpdHtml = formatLimitValue(model.rpd, "RPD");

            tr.innerHTML = `
                <td style="font-weight: 600; color: var(--text-primary);">${model.display_name} ${statusTag}</td>
                <td class="model-api-name"><code>${model.api_name}</code></td>
                <td><span class="badge ${catBadgeClass}">${catText}</span></td>
                <td style="font-size: 0.83rem; color: var(--text-muted); max-width: 260px; line-height: 1.4;">${usageDesc}</td>
                <td class="text-right">${rpmHtml}</td>
                <td class="text-right">${tpmHtml}</td>
                <td class="text-right">${rpdHtml}</td>
            `;
            tbodyElement.appendChild(tr);
        });
    }

    function formatLimitValue(val, type) {
        if (!val || val === "N/A" || val.toUpperCase() === "N/A") {
            return `<span class="limit-val na">N/A</span>`;
        }
        
        const num = parseFloat(val.replace(/,/g, ""));
        if (isNaN(num)) {
            return `<span class="limit-val">${val}</span>`;
        }

        let isHigh = false;
        if (type === "RPM" && num >= 1000) isHigh = true;
        if (type === "TPM" && num >= 100000) isHigh = true;
        if (type === "RPD" && num >= 10000) isHigh = true;

        const classVal = isHigh ? "high" : "low";
        return `<span class="limit-val ${classVal}">${val}</span>`;
    }

    tabContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".tab-btn");
        if (!btn) return;

        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        activeCategory = btn.dataset.category;
        renderTable();
    });

    searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value;
        renderTable();
    });

    loadLimitsData();
});
