document.addEventListener("DOMContentLoaded", () => {
    let allModels = [];
    let activeCategory = "all";
    
    // 1. Multi-language Translations Dictionary
    const translations = {
        "zh-TW": {
            "app-title": "Gemini API 官方額度查詢與監控 <span class='sync-daily-tag' style='background: rgba(52,211,153,0.2); color: #34d399; font-size: 0.82rem; padding: 3px 8px; border-radius: 12px; border: 1px solid rgba(52,211,153,0.3); margin-left: 6px;'><i class='fa-solid fa-arrows-rotate'></i> 每日自動同步更新</span>",
            "official-source": "官方資料來源：<strong>Google AI Studio</strong>",
            "last-updated": "最後更新時間：",
            "loading": "載入中...",
            "dl-json-btn": "下載 JSON 配置",
            "dl-csv-btn": "下載 CSV 報表",
            "tab-all": "🌐 全部模型",
            "tab-text": "📝 文字與語言大模型",
            "tab-vision": "👁️ 視覺與截圖辨識 (Multimodal)",
            "tab-speech": "🎙️ 語音合成與 TTS",
            "tab-image-gen": "🎨 圖像與影音生成 (Imagen/Veo)",
            "tab-live": "⚡ 即時對話 (Live API)",
            "tab-grounding": "🌐 實時網路搜尋與地圖引註",
            "tab-other": "📦 向量與其他專用模型",
            
            "free-table-title": "🎁 官方免費模型額度限制 (Free Tier - RPD > 0)",
            "free-badge": "免費模型 (高分優選排序)",
            "paid-table-title": "💳 付費隨用隨付與獨佔模型限制 (Pay-as-you-go / Paid Only)",
            "paid-badge": "付費/綁卡層級 (無免費每日額度)",
            
            "col-display-name": "模型顯示名稱",
            "col-score": "綜合評分",
            "col-api-id": "API 識別碼",
            "col-category": "用途分類",
            "col-rpm": "RPM (分)",
            "col-tpm": "TPM (分)",
            "col-rpd": "RPD (日上限)",
            "col-action": "詳細說明",
            
            "footer-copyright": "© 2026 Gemini API Monitor. 每日定時自動採集與重新發布。",
            "footer-badge": "本頁面每日自動爬取並公開發布於 GitHub Pages | 100% 免費存取",
            "no-free-found": "找不到符合條件的免費 API 模型",
            "no-paid-found": "找不到符合條件的付費 API 模型",
            "load-failed": "載入資料失敗。",
            "load-data-free": "正在載入免費模型數據...",
            "load-data-paid": "正在載入付費模型數據...",
            
            "amazon-title": "🛒 亞馬遜聯盟行銷精選推薦 (Amazon Hub)",
            "amazon-subtitle": "精選好物推薦",
            "amz-bestsellers": "暢銷產品榜",
            "amz-bestsellers-desc": "發掘亞馬遜每小時更新的最受歡迎商品。",
            "amz-new-releases": "熱門新品榜",
            "amz-new-releases-desc": "掌握最新上架與即將推出的創意新品。",
            "amz-most-wished": "最想收到好物",
            "amz-most-wished-desc": "消費者最常加入個人願望清單的夢幻商品。",
            "amz-most-gifted": "送禮首選推薦",
            "amz-most-gifted-desc": "節日送禮、生日慶祝最受歡迎的熱門禮品。",
            "amz-action": "即刻探索 ➡️",
            "footer-views-label": "本站總瀏覽量：",
            "footer-views-unit": " 次",
            "footer-users-label": "訪客數：",
            "footer-users-unit": " 人"
        },
        "en": {
            "app-title": "Gemini API Quota & Rate Limits Monitor <span class='sync-daily-tag' style='background: rgba(52,211,153,0.2); color: #34d399; font-size: 0.82rem; padding: 3px 8px; border-radius: 12px; border: 1px solid rgba(52,211,153,0.3); margin-left: 6px;'><i class='fa-solid fa-arrows-rotate'></i> Daily Auto Synced</span>",
            "official-source": "Official Data Source: <strong>Google AI Studio</strong>",
            "last-updated": "Last Updated: ",
            "loading": "Loading...",
            "dl-json-btn": "Download JSON Config",
            "dl-csv-btn": "Download CSV Report",
            "tab-all": "🌐 All Models",
            "tab-text": "📝 Text & Language",
            "tab-vision": "👁️ Vision & Multimodal",
            "tab-speech": "🎙️ Speech & TTS",
            "tab-image-gen": "🎨 Image & Video Gen",
            "tab-live": "⚡ Live API",
            "tab-grounding": "🌐 Real-time Search & Maps",
            "tab-other": "📦 Embedding & Other",
            
            "free-table-title": "🎁 Official Free Tier Rate Limits (RPD > 0)",
            "free-badge": "Free Tier (Ranked by Rating)",
            "paid-table-title": "💳 Pay-as-you-go & Paid Tier Limits (RPD = 0)",
            "paid-badge": "Paid Tier (Billing Account Required)",
            
            "col-display-name": "Model Name",
            "col-score": "Rating",
            "col-api-id": "API Identifier",
            "col-category": "Category",
            "col-rpm": "RPM (Min)",
            "col-tpm": "TPM (Min)",
            "col-rpd": "RPD (Daily Cap)",
            "col-action": "Details",
            
            "footer-copyright": "© 2026 Gemini API Monitor. Periodically auto-scraped & published.",
            "footer-badge": "This page is daily auto-scraped and published to GitHub Pages | 100% Free Access",
            "no-free-found": "No free API models found matching criteria",
            "no-paid-found": "No paid API models found matching criteria",
            "load-failed": "Failed to load data.",
            "load-data-free": "Loading Free Tier model data...",
            "load-data-paid": "Loading Paid Tier model data...",
            
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
                    <td colspan="8" class="text-center" style="padding: 30px; color: var(--color-red);">
                        <i class="fa-solid fa-triangle-exclamation" style="margin-right: 8px;"></i> ${langObj["load-failed"]}
                    </td>
                </tr>
            `;
            freeTbody.innerHTML = errMsg;
            paidTbody.innerHTML = errMsg;
        }
    }

    // 5. Render tables with fine categories & vision fixes
    function renderTable() {
        const langObj = translations[userLang] || translations["zh-TW"];
        freeTbody.innerHTML = "";
        paidTbody.innerHTML = "";

        const filtered = allModels.filter(model => {
            let matchesCategory = false;
            const fineCat = model.fine_category || "other";
            const isVisionCapable = model.is_vision_capable || false;
            const nameLower = (model.display_name || "").toLowerCase();
            const catLower = (model.category || "").toLowerCase();

            if (activeCategory === "all") {
                matchesCategory = true;
            } else if (activeCategory === "text") {
                matchesCategory = fineCat === "text" || catLower === "text-out models" || catLower === "agents";
            } else if (activeCategory === "vision") {
                // Multimodal Vision Fix: Gemini 2.5 Flash, 2.5 Pro, 3 Flash, 3.1 Pro, Computer Use ARE ALL Vision models!
                matchesCategory = isVisionCapable || fineCat === "vision" || nameLower.includes("flash") || nameLower.includes("pro") || nameLower.includes("computer use");
            } else if (activeCategory === "speech") {
                matchesCategory = fineCat === "speech" || nameLower.includes("tts") || nameLower.includes("audio");
            } else if (activeCategory === "image_gen") {
                matchesCategory = fineCat === "image_gen" || nameLower.includes("imagen") || nameLower.includes("veo") || nameLower.includes("banana");
            } else if (activeCategory === "live_api") {
                matchesCategory = fineCat === "live_api" || catLower.includes("live") || nameLower.includes("live");
            } else if (activeCategory === "grounding") {
                matchesCategory = fineCat === "grounding" || catLower.includes("grounding") || nameLower.includes("grounding");
            } else if (activeCategory === "other") {
                matchesCategory = fineCat === "other" || fineCat === "embedding" || nameLower.includes("embedding") || nameLower.includes("gemma");
            }

            return matchesCategory;
        });

        // Split models into Free Tier (RPD > 0) and Paid Tier (RPD = 0)
        const freeModels = filtered.filter(m => m.is_free_tier || (m.rpd_limit && m.rpd_limit > 0));
        const paidModels = filtered.filter(m => !m.is_free_tier && (!m.rpd_limit || m.rpd_limit === 0));

        // Sort by model_score descending so high score models appear FIRST!
        freeModels.sort((a, b) => (b.model_score || 0) - (a.model_score || 0));
        paidModels.sort((a, b) => (b.model_score || 0) - (a.model_score || 0));

        populateTbody(freeTbody, freeModels, langObj["no-free-found"]);
        populateTbody(paidTbody, paidModels, langObj["no-paid-found"]);
    }

    function populateTbody(tbodyElement, modelsList, emptyMsg) {
        if (modelsList.length === 0) {
            tbodyElement.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center" style="padding: 30px; color: var(--text-muted);">
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

            const catText = model.fine_category_name_zh || "通用模型";
            const scoreVal = (model.model_score || 9.0).toFixed(1);

            // Rating Badge (Gold for >= 9.5, Blue for < 9.5)
            const scoreColor = scoreVal >= 9.5 ? "#f59e0b" : "#3b82f6";
            const scoreBadge = `<span style="display:inline-flex; align-items:center; gap:3px; background:rgba(245,158,11,0.12); color:${scoreColor}; font-weight:800; font-size:0.83rem; padding:2px 8px; border-radius:12px; border:1px solid rgba(245,158,11,0.25);"><i class="fa-solid fa-star" style="font-size:0.75rem;"></i> ${scoreVal}</span>`;

            // Status tags
            let statusTag = "";
            if (model.is_free_tier) {
                statusTag += `<span style="font-size:0.72rem; background:rgba(52,211,153,0.15); color:#34d399; padding:2px 5px; border-radius:4px; margin-left:4px; font-weight:600;">🎁 免費</span>`;
            } else {
                statusTag += `<span style="font-size:0.72rem; background:rgba(96,165,250,0.15); color:#60a5fa; padding:2px 5px; border-radius:4px; margin-left:4px; font-weight:600;">💳 付費</span>`;
            }

            if (model.requires_billing_account) {
                statusTag += `<span style="font-size:0.72rem; background:rgba(245,158,11,0.15); color:#fbbf24; padding:2px 5px; border-radius:4px; margin-left:4px; font-weight:600;" title="需繫結結算帳戶/信用卡">⚠️ 需綁卡</span>`;
            }

            const rpmHtml = formatLimitValue(model.rpm, "RPM");
            const tpmHtml = formatLimitValue(model.tpm, "TPM");
            const rpdHtml = formatLimitValue(model.rpd, "RPD");

            tr.innerHTML = `
                <td style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">${model.display_name} ${statusTag}</td>
                <td>${scoreBadge}</td>
                <td class="model-api-name"><code>${model.api_name}</code></td>
                <td><span class="badge ${catBadgeClass}" style="font-size: 0.78rem;">${catText}</span></td>
                <td class="text-right">${rpmHtml}</td>
                <td class="text-right">${tpmHtml}</td>
                <td class="text-right">${rpdHtml}</td>
                <td class="text-center">
                    <a href="#details-section" class="btn-jump-detail" style="color: var(--color-accent-light); font-size: 0.78rem; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;">
                        📖 說明 ⬇️
                    </a>
                </td>
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
        if (type === "RPM" && num >= 15) isHigh = true;
        if (type === "TPM" && num >= 100000) isHigh = true;
        if (type === "RPD" && num >= 1000) isHigh = true;

        const classVal = isHigh ? "high" : "low";
        return `<span class="limit-val ${classVal}">${val}</span>`;
    }

    // Large Category Tabs click handler
    tabContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".tab-btn-lg");
        if (!btn) return;

        document.querySelectorAll(".tab-btn-lg").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        activeCategory = btn.dataset.category;
        renderTable();
    });

    loadLimitsData();
});
