document.addEventListener("DOMContentLoaded", () => {
    let allModels = [];
    let activeCategory = "all";
    let searchQuery = "";
    
    // 1. Translation Dictionary
    const translations = {
        "zh-TW": {
            "app-title": "Gemini API 官方額度限制面板",
            "official-source": "官方資料來源：<strong>Google AI Studio</strong>",
            "last-updated": "最後更新時間：",
            "loading": "載入中...",
            "search-placeholder": "搜尋模型名稱 (例如: flash, pro)...",
            "tab-all": "全部模型",
            "tab-text": "文字模型",
            "tab-image-video": "影像與視覺",
            "tab-speech": "語音模型",
            "tab-live": "Live API",
            "tab-other": "其他 (Gemma/Embedding/定位)",
            "purpose-title": "面板用途與第三方工具串接優勢",
            "purpose-desc": "本面板即時同步 Google AI Studio 官方的速率限制規格（Rate Limits），特別為開發者提供以下兩大核心優勢：",
            "purpose-card1-title": "免費模型配置 API",
            "purpose-card1-desc": "提供純數字格式的 <strong>JSON 數據接口</strong>，您的語音輸入工具、AI 助手或本機腳本可直接遠端獲取最新的免費模型名單與規範（RPM/TPM/RPD），省去手動維護代碼的成本。",
            "purpose-card2-title": "故障切換與自動降級 (Failover)",
            "purpose-card2-desc": "當您的工具呼叫單一免費模型觸發 <strong>HTTP 429 額度超限</strong>時，可透過讀取本站接口，在背景自動切換到其他健康的備用免費模型，確保您的工具運作永不中斷。",
            "free-tier-title": "🎁 免費模型特別說明 (Free Tier)",
            "free-tier-desc": "Google AI Studio 提供了非常佛心的<strong>免費額度層級 (Free Tier)</strong>，適合個人開發者、學生或做為產品雛形測試。以下是熱門免費模型的特點：",
            "free-tier-card1-title": "Flash 輕量極速模型",
            "free-tier-card1-desc": "• <strong>免費額度高</strong>：提供較高頻率的 RPM / RPD 限制。<br>• <strong>極速輕量</strong>：支援多模態輸入，最適合語音輸入、翻譯與日常快速問答。",
            "free-tier-card2-title": "Pro 強大推理模型",
            "free-tier-card2-desc": "• <strong>功能強大</strong>：支援超長上下文視窗，具備強悍推理能力。<br>• <strong>適合複雜任務</strong>：頻率限制通常較低，最適合複雜分析、邏輯推理與程式碼生成。",
            "free-table-title": "免費模型額度限制 (Free Tier)",
            "free-badge": "免費層級 (有每日限額)",
            "paid-table-title": "付費隨用隨付模型額度限制 (Pay-as-you-go Tier)",
            "paid-badge": "付費層級 (無每日限制)",
            "col-display-name": "模型顯示名稱",
            "col-api-id": "API 識別碼",
            "col-category": "用途分類",
            "col-rpm": "RPM (每分鐘請求)",
            "col-tpm": "TPM (每分鐘 Token)",
            "col-rpd": "RPD (每日請求)",
            "glossary-title": "額度限額名詞說明",
            "glossary-desc-rpm": "每分鐘最多可發送的 API 請求次數限制。",
            "glossary-desc-tpm": "每分鐘最多可傳輸的總 Token 數限制（包含輸入與輸出）。",
            "glossary-desc-rpd": "每日最多可發送的 API 總請求次數上限。",
            "glossary-desc-free-paid": "免費層級具有每日限制；付費層級依量計費，限額較高。",
            "footer-copyright": "© 2026 Gemini API Monitor. 基於 Playwright 雲端無頭抓取技術自動生成。",
            "footer-badge": "本頁面定時自動爬取並重新發布於 GitHub Pages | 100% 免費且公開存取",
            "no-free-found": "找不到符合條件的免費 API 模型",
            "no-paid-found": "找不到符合條件的付費 API 模型",
            "load-failed": "載入資料失敗。",
            "load-data-free": "正在讀取免費模型資料...",
            "load-data-paid": "正在讀取付費模型資料...",
            "intro-text": "本站提供 Google AI Studio (Gemini API) 官方模型免費版與付費版額度的即時監控與查詢。數據每日定時透過自動化技術同步更新，提供開發者串接、AI 工具調度與故障備援 (Failover) 的即時參考。",
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
            "badge-text": "文字模型",
            "badge-video": "影像與視覺",
            "badge-speech": "語音模型",
            "badge-live": "Live API",
            "badge-grounding": "定位與接地",
            "badge-other": "其他模型"
        },
        "en": {
            "app-title": "Gemini API Rate Limits Monitor",
            "official-source": "Official Data Source: <strong>Google AI Studio</strong>",
            "last-updated": "Last Updated: ",
            "loading": "Loading...",
            "search-placeholder": "Search model names (e.g. flash, pro)...",
            "tab-all": "All Models",
            "tab-text": "Text Models",
            "tab-image-video": "Image & Video",
            "tab-speech": "Audio & Speech",
            "tab-live": "Live API",
            "tab-other": "Other (Gemma/Embedding/Grounding)",
            "purpose-title": "Dashboard Purpose & Developer Failover Advantages",
            "purpose-desc": "This dashboard synchronizes official Rate Limits from Google AI Studio in real-time, providing two key advantages for developers:",
            "purpose-card1-title": "Free Model Configuration API",
            "purpose-card1-desc": "Provides a raw <strong>JSON Data API</strong> for your voice input tools, AI assistants, or local scripts to fetch the latest free model lists and rules (RPM/TPM/RPD) dynamically.",
            "purpose-card2-title": "Failover & Automatic Degrade",
            "purpose-card2-desc": "When your AI tool hits <strong>HTTP 429 Rate Limit Exceeded</strong>, automatically switch to other healthy free fallback models in the background via our JSON endpoint.",
            "free-tier-title": "🎁 Free Tier Special Notes",
            "free-tier-desc": "Google AI Studio provides a very generous <strong>Free Tier</strong>, ideal for individual developers, students, or prototyping. Key features of popular models:",
            "free-tier-card1-title": "Flash: Lightweight & Hyper-fast",
            "free-tier-card1-desc": "• <strong>Higher Limits</strong>: Offers generous RPM and RPD limits.<br>• <strong>Fast & Multimodal</strong>: Best for voice input, translation, and quick daily chat.",
            "free-tier-card2-title": "Pro: Powerful Reasoning Model",
            "free-tier-card2-desc": "• <strong>Deep Reasoning</strong>: Large context window and strong code generation capabilities.<br>• <strong>Complex Tasks</strong>: Lower rate limits; best for complex logic and analysis.",
            "free-table-title": "Free Tier Rate Limits",
            "free-badge": "Free Tier (Daily Limit)",
            "paid-table-title": "Pay-as-you-go Tier Rate Limits",
            "paid-badge": "Paid Tier (No Daily Limit)",
            "col-display-name": "Model Name",
            "col-api-id": "API Identifier",
            "col-category": "Category",
            "col-rpm": "RPM (Req/Min)",
            "col-tpm": "TPM (Tokens/Min)",
            "col-rpd": "RPD (Req/Day)",
            "glossary-title": "Glossary of Rate Limits",
            "glossary-desc-rpm": "Requests Per Minute. Maximum API calls allowed per minute.",
            "glossary-desc-tpm": "Tokens Per Minute. Maximum tokens (input + output) processed per minute.",
            "glossary-desc-rpd": "Requests Per Day. Maximum API calls allowed daily.",
            "glossary-desc-free-paid": "Free tier has daily caps; Pay-as-you-go charges by usage with much higher limits.",
            "footer-copyright": "© 2026 Gemini API Monitor. Generated automatically using Playwright cloud headless technology.",
            "footer-badge": "This page is periodically scraped and redeployed to GitHub Pages | 100% Free & Open Access",
            "no-free-found": "No free API models found matching criteria",
            "no-paid-found": "No paid API models found matching criteria",
            "load-failed": "Failed to load data.",
            "load-data-free": "Loading Free Tier model data...",
            "load-data-paid": "Loading Paid Tier model data...",
            "intro-text": "This site provides real-time monitoring and queries for the official rate limits of Google AI Studio (Gemini API) free and paid models. Data is synchronized daily via automation to offer developers a real-time reference for tool integration, scheduling, and failover support.",
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
            "badge-text": "Text Models",
            "badge-video": "Image & Video",
            "badge-speech": "Audio & Speech",
            "badge-live": "Live API",
            "badge-grounding": "Grounding & Safety",
            "badge-other": "Other Models"
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

    // 3. Apply translations to DOM
    function applyI18n() {
        const langObj = translations[userLang];
        
        // Find all data-i18n elements
        document.querySelectorAll("[data-i18n]").forEach(elem => {
            const key = elem.getAttribute("data-i18n");
            if (langObj[key]) {
                elem.innerHTML = langObj[key];
            }
        });

        // Set search placeholder
        if (searchInput) {
            searchInput.setAttribute("placeholder", langObj["search-placeholder"]);
        }
    }

    // Initialize Translations
    applyI18n();

    // Fetch and load the JSON limits data
    async function loadLimitsData() {
        const langObj = translations[userLang];
        try {
            const response = await fetch("gemini_rate_limits.json?nocache=" + new Date().getTime());
            if (!response.ok) {
                throw new Error("無法讀取 limits JSON 檔案");
            }
            
            // Get last modified header
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
                    <td colspan="6" class="text-center" style="padding: 30px; color: var(--color-red);">
                        <i class="fa-solid fa-triangle-exclamation" style="margin-right: 8px;"></i> ${langObj["load-failed"]}
                    </td>
                </tr>
            `;
            freeTbody.innerHTML = errMsg;
            paidTbody.innerHTML = errMsg;
        }
    }

    // Render table rows
    function renderTable() {
        const langObj = translations[userLang];
        freeTbody.innerHTML = "";
        paidTbody.innerHTML = "";

        // Filter models
        const filtered = allModels.filter(model => {
            // Category filter
            let matchesCategory = false;
            const categoryClean = (model.category || "").toLowerCase();
            const nameClean = (model.display_name || "").toLowerCase();
            
            if (activeCategory === "all") {
                matchesCategory = true;
            } else if (activeCategory === "text") {
                matchesCategory = categoryClean === "text-out models" || categoryClean === "agents";
            } else if (activeCategory === "image_video") {
                matchesCategory = categoryClean === "multi-modal generative models" && 
                                  (nameClean.includes("imagen") || nameClean.includes("veo"));
            } else if (activeCategory === "speech") {
                matchesCategory = (categoryClean === "multi-modal generative models" || categoryClean.includes("audio") || categoryClean.includes("speech") || categoryClean.includes("tts")) && 
                                  (nameClean.includes("tts") || nameClean.includes("audio") || nameClean.includes("lyria"));
            } else if (activeCategory === "live") {
                matchesCategory = categoryClean === "live api";
            } else if (activeCategory === "other") {
                // Grounding, embedding, gemma and other models that are not image or speech
                const isImage = nameClean.includes("imagen") || nameClean.includes("veo");
                const isSpeech = nameClean.includes("tts") || nameClean.includes("audio") || nameClean.includes("lyria");
                matchesCategory = categoryClean.includes("grounding") || 
                                  categoryClean.includes("other") || 
                                  nameClean.includes("embedding") || 
                                  nameClean.includes("gemma") ||
                                  (categoryClean === "multi-modal generative models" && !isImage && !isSpeech);
            }
            
            // Search filter
            const term = searchQuery.toLowerCase().trim();
            const matchesSearch = !term || 
                model.display_name.toLowerCase().includes(term) || 
                model.api_name.toLowerCase().includes(term) || 
                (model.category && model.category.toLowerCase().includes(term));

            return matchesCategory && matchesSearch;
        });

        // Split into Free and Paid
        const freeModels = filtered.filter(m => {
            const isPay = m.tier && m.tier.toLowerCase().includes("pay");
            if (isPay) return false;
            
            const hasRpm = m.rpm_limit !== 0;
            const hasTpm = m.tpm_limit !== 0;
            const hasRpd = m.rpd_limit !== 0;
            return hasRpm || hasTpm || hasRpd;
        });
        const paidModels = filtered.filter(m => m.tier && m.tier.toLowerCase().includes("pay"));

        // Helper to populate a table body
        function populateTbody(tbodyElement, modelsList, emptyMsg) {
            if (modelsList.length === 0) {
                tbodyElement.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center" style="padding: 30px; color: var(--text-muted);">
                            ${emptyMsg}
                        </td>
                    </tr>
                `;
                return;
            }

            modelsList.forEach(model => {
                const tr = document.createElement("tr");

                // Category badge mapping
                let catBadge = "badge-other";
                let catText = langObj["badge-other"];
                const catLower = (model.category || "").toLowerCase();
                const nameLower = (model.display_name || "").toLowerCase();
                
                if (catLower === "text-out models" || catLower === "agents") {
                    catBadge = "badge-text";
                    catText = langObj["badge-text"];
                } else if (catLower === "multi-modal generative models" && (nameLower.includes("imagen") || nameLower.includes("veo"))) {
                    catBadge = "badge-video";
                    catText = langObj["badge-video"];
                } else if ((catLower === "multi-modal generative models" || catLower.includes("audio") || catLower.includes("speech") || catLower.includes("tts")) && (nameLower.includes("tts") || nameLower.includes("audio") || nameLower.includes("lyria"))) {
                    catBadge = "badge-speech";
                    catText = langObj["badge-speech"];
                } else if (catLower === "live api") {
                    catBadge = "badge-live";
                    catText = langObj["badge-live"];
                } else if (catLower.includes("grounding")) {
                    catBadge = "badge-grounding";
                    catText = langObj["badge-grounding"];
                }

                // Format limits values
                const rpmHtml = formatLimitValue(model.rpm, "RPM");
                const tpmHtml = formatLimitValue(model.tpm, "TPM");
                const rpdHtml = formatLimitValue(model.rpd, "RPD");

                tr.innerHTML = `
                    <td style="font-weight: 600; color: var(--text-primary);">${model.display_name}</td>
                    <td class="model-api-name">${model.api_name}</td>
                    <td><span class="badge ${catBadge}">${catText}</span></td>
                    <td class="text-right">${rpmHtml}</td>
                    <td class="text-right">${tpmHtml}</td>
                    <td class="text-right">${rpdHtml}</td>
                `;
                tbodyElement.appendChild(tr);
            });
        }

        populateTbody(freeTbody, freeModels, langObj["no-free-found"]);
        populateTbody(paidTbody, paidModels, langObj["no-paid-found"]);
    }

    // Helper to format limits values
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

    // Tab buttons event listener
    tabContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".tab-btn");
        if (!btn) return;

        // Toggle active style
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        activeCategory = btn.dataset.category;
        renderTable();
    });

    // Search input listener
    searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value;
        renderTable();
    });

    // Initial Load
    loadLimitsData();
});
