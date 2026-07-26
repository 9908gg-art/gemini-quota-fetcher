document.addEventListener("DOMContentLoaded", () => {
    let allModels = [];
    let activeCategory = "all";
    
    // 1. Multi-language Translations Dictionary (zh-TW, en, ja, ko)
    const translations = {
        "zh-TW": {
            "header-main-title": "官方免費額度查詢與模型分類",
            "sync-tag-text": "每日更新",
            "official-source": "官方來源：Google AI Studio",
            "last-updated-date": "最近更新：",
            "loading": "載入中...",
            "dl-json-btn": "下載 JSON",
            "dl-csv-btn": "下載 CSV",
            "tab-all": "🌐 全部模型",
            "tab-code": "💻 程式碼與複雜推理",
            "tab-chat": "💬 一般對話與創作",
            "tab-vision": "👁️ 視覺與截圖辨識 (Multimodal)",
            "tab-speech": "🎙️ 語音合成與 TTS",
            "tab-image-gen": "🎨 圖像與影音生成 (Imagen/Veo)",
            "tab-live": "⚡ 即時對話 (Live API)",
            "tab-grounding": "🌐 實時網路搜尋與地圖引註",
            "tab-embedding": "🔍 向量檢索 (Embedding)",
            
            "free-table-title": "🎁 官方免費模型額度限制 (Free Tier - RPD > 0 / Unlimited)",
            "free-badge": "免費模型 (按動態評分優先排序)",
            "paid-table-title": "💳 付費隨用隨付與獨佔模型限制 (Pay-as-you-go / Paid Only)",
            "paid-badge": "付費/綁卡層級 (無免費每日額度)",
            
            "col-display-name": "模型顯示名稱",
            "col-score": "動態評分",
            "col-api-id": "API 識別碼",
            "col-category": "用途分類",
            "col-rpm": "RPM (分)",
            "col-tpm": "TPM (分)",
            "col-rpd": "RPD (日上限)",
            "col-action": "詳細說明",
            
            "footer-copyright": "© 2026 官方免費額度查詢與模型分類. 每日定時自動採集與同步更新。",
            "sponsor-btn": "贊助開發者一杯咖啡 / Buy Me a Coffee",
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
            "header-main-title": "Official Gemini API Quotas & Model Categories",
            "sync-tag-text": "Daily Updated",
            "official-source": "Source: Google AI Studio",
            "last-updated-date": "Updated: ",
            "loading": "Loading...",
            "dl-json-btn": "Download JSON",
            "dl-csv-btn": "Download CSV",
            "tab-all": "🌐 All Models",
            "tab-code": "💻 Coding & Deep Reasoning",
            "tab-chat": "💬 General Chat & Creation",
            "tab-vision": "👁️ Vision & Multimodal",
            "tab-speech": "🎙️ Speech & TTS",
            "tab-image-gen": "🎨 Image & Video Gen",
            "tab-live": "⚡ Live API",
            "tab-grounding": "🌐 Real-time Search & Maps",
            "tab-embedding": "🔍 Embedding & RAG",
            
            "free-table-title": "🎁 Official Free Tier Rate Limits (RPD > 0 / Unlimited)",
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
            
            "footer-copyright": "© 2026 Official Gemini API Quotas. Daily auto-synced.",
            "sponsor-btn": "Buy Me a Coffee",
            "no-free-found": "No free API models found matching criteria",
            "no-paid-found": "No paid API models found matching criteria",
            "load-failed": "Failed to load data.",
            "load-data-free": "Loading Free Tier model data...",
            "load-data-paid": "Loading Paid Tier model data...",
            
            "amazon-title": "🛒 Amazon Recommended Deals",
            "amazon-subtitle": "Featured Deals",
            "amz-bestsellers": "Bestsellers",
            "amz-bestsellers-desc": "Explore hourly updated list of popular products on Amazon.",
            "amz-new-releases": "Hot New Releases",
            "amz-new-releases-desc": "Discover the best new releases on Amazon.",
            "amz-most-wished": "Most Wished For",
            "amz-most-wished-desc": "Products most added to customer wishlists.",
            "amz-most-gifted": "Best Gift Ideas",
            "amz-most-gifted-desc": "Popular gift items for any celebration.",
            "amz-action": "Explore Now ➡️",
            "footer-views-label": "Total Views: ",
            "footer-views-unit": " times",
            "footer-users-label": "Visitors: ",
            "footer-users-unit": " people"
        },
        "ja": {
            "header-main-title": "Google Gemini API 無料利用枠＆モデル分類一覧",
            "sync-tag-text": "毎日更新",
            "official-source": "情報元：Google AI Studio",
            "last-updated-date": "最終更新：",
            "loading": "読み込み中...",
            "dl-json-btn": "JSON ダウンロード",
            "dl-csv-btn": "CSV ダウンロード",
            "tab-all": "🌐 すべてのモデル",
            "tab-code": "💻 コーディング＆高度な推論",
            "tab-chat": "💬 一般対話＆テキスト生成",
            "tab-vision": "👁️ 画像認識＆マルチモーダル",
            "tab-speech": "🎙️ 音声合成・TTS",
            "tab-image-gen": "🎨 画像・動画生成 (Imagen/Veo)",
            "tab-live": "⚡ リアルタイム対話 (Live API)",
            "tab-grounding": "🌐 リアルタイム検索・マップ参照",
            "tab-embedding": "🔍 ベクトル検索 (Embedding)",
            
            "free-table-title": "🎁 公式無料枠 Rate Limits (RPD > 0 / 無制限)",
            "free-badge": "無料モデル (スコア順)",
            "paid-table-title": "💳 従量課金＆有料限定モデル (RPD = 0)",
            "paid-badge": "有料層 (クレジットカード必須)",
            
            "col-display-name": "モデル表示名",
            "col-score": "スコア",
            "col-api-id": "API 識別子",
            "col-category": "用途分類",
            "col-rpm": "RPM (分)",
            "col-tpm": "TPM (分)",
            "col-rpd": "RPD (日上限)",
            "col-action": "詳細説明",
            
            "footer-copyright": "© 2026 Gemini API Quotas Monitor. 毎日自動同期更新。",
            "sponsor-btn": "開発者をサポート / Buy Me a Coffee",
            "no-free-found": "該当する無料モデルが見つかりません",
            "no-paid-found": "該当する有料モデルが見つかりません",
            "load-failed": "データの読み込みに失敗しました。",
            "load-data-free": "無料モデルデータを読み込んでいます...",
            "load-data-paid": "有料モデルデータを読み込んでいます...",
            
            "amazon-title": "🛒 Amazon おすすめ商品",
            "amazon-subtitle": "厳選おすすめ",
            "amz-bestsellers": "売れ筋ランキング",
            "amz-bestsellers-desc": "Amazonで最も人気のある商品を探索。",
            "amz-new-releases": "新着ランキング",
            "amz-new-releases-desc": "最新の注目商品をチェック。",
            "amz-most-wished": "ほしい物リスト",
            "amz-most-wished-desc": "ユーザーが最も欲しがっている商品。",
            "amz-most-gifted": "ギフト人気商品",
            "amz-most-gifted-desc": "プレゼントに最適な人気アイテム。",
            "amz-action": "今すぐ見る ➡️",
            "footer-views-label": "総閲覧数：",
            "footer-views-unit": " 回",
            "footer-users-label": "訪問者数：",
            "footer-users-unit": " 人"
        },
        "ko": {
            "header-main-title": "공식 Gemini API 무료 한도 및 모델 분류",
            "sync-tag-text": "매일 업데이트",
            "official-source": "출처: Google AI Studio",
            "last-updated-date": "최근 업데이트: ",
            "loading": "로딩 중...",
            "dl-json-btn": "JSON 다운로드",
            "dl-csv-btn": "CSV 다운로드",
            "tab-all": "🌐 전체 모델",
            "tab-code": "💻 코딩 및 복합 추론",
            "tab-chat": "💬 일반 대화 및 창작",
            "tab-vision": "👁️ 비전 및 캡처 인식 (Multimodal)",
            "tab-speech": "🎙️ 음성 합성 및 TTS",
            "tab-image-gen": "🎨 이미지 및 비디오 생성 (Imagen/Veo)",
            "tab-live": "⚡ 실시간 대화 (Live API)",
            "tab-grounding": "🌐 실시간 웹 검색 및 지도 참조",
            "tab-embedding": "🔍 임베딩 검색 (Embedding)",
            
            "free-table-title": "🎁 공식 무료 요금제 한도 (RPD > 0 / 무제한)",
            "free-badge": "무료 모델 (평점순 정렬)",
            "paid-table-title": "💳 종량제 및 유료 전용 모델 (RPD = 0)",
            "paid-badge": "유료 계정 (신용카드 등록 필요)",
            
            "col-display-name": "모델 표시 이름",
            "col-score": "평점",
            "col-api-id": "API 식별자",
            "col-category": "용도 분류",
            "col-rpm": "RPM (분)",
            "col-tpm": "TPM (분)",
            "col-rpd": "RPD (일 한도)",
            "col-action": "상세 설명",
            
            "footer-copyright": "© 2026 Gemini API Quotas Monitor. 매일 자동 동기화.",
            "sponsor-btn": "개발자 후원하기 / Buy Me a Coffee",
            "no-free-found": "조건에 맞는 무료 모델이 없습니다",
            "no-paid-found": "조건에 맞는 유료 모델이 없습니다",
            "load-failed": "데이터를 불러오지 못했습니다.",
            "load-data-free": "무료 모델 데이터를 불러오는 중...",
            "load-data-paid": "유료 모델 데이터를 불러오는 중...",
            
            "amazon-title": "🛒 아마존 추천 상품",
            "amazon-subtitle": "엄선된 추천",
            "amz-bestsellers": "베스트셀러",
            "amz-bestsellers-desc": "아마존에서 가장 인기 있는 상품을 둘러보세요.",
            "amz-new-releases": "신상품 랭킹",
            "amz-new-releases-desc": "최신 출시 및 예정 상품을 확인하세요.",
            "amz-most-wished": "위시리스트 인기 상품",
            "amz-most-wished-desc": "고객들이 가장 많이 담은 상품.",
            "amz-most-gifted": "선물 추천 상품",
            "amz-most-gifted-desc": "선물용으로 가장 인기 있는 아이템.",
            "amz-action": "지금 둘러보기 ➡️",
            "footer-views-label": "총 조회수: ",
            "footer-views-unit": " 회",
            "footer-users-label": "방문자 수: ",
            "footer-users-unit": " 명"
        }
    };

    // 2. Automatic Browser Language Detection (zh-TW, en, ja, ko)
    let userLang = "zh-TW";
    const navLang = (navigator.language || navigator.userLanguage || "").toLowerCase();
    if (navLang.startsWith("ja")) {
        userLang = "ja";
    } else if (navLang.startsWith("ko")) {
        userLang = "ko";
    } else if (navLang.startsWith("zh")) {
        userLang = "zh-TW";
    } else {
        userLang = "en";
    }

    const freeTbody = document.getElementById("free-quota-tbody");
    const paidTbody = document.getElementById("paid-quota-tbody");
    const updateDateText = document.getElementById("update-date-text");
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

    // 4. Fetch and load JSON data (Format Date ONLY: YYYY/MM/DD)
    async function loadLimitsData() {
        const langObj = translations[userLang] || translations["zh-TW"];
        try {
            const response = await fetch("gemini_rate_limits.json?nocache=" + new Date().getTime());
            if (!response.ok) {
                throw new Error("無法讀取 limits JSON 檔案");
            }
            
            const lastModified = response.headers.get("Last-Modified");
            let dateStr = "";
            if (lastModified) {
                const date = new Date(lastModified);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                dateStr = `${year}/${month}/${day}`;
            } else {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                dateStr = `${year}/${month}/${day}`;
            }

            if (updateDateText) {
                updateDateText.innerHTML = `<i class="fa-regular fa-calendar-check"></i> ${langObj["last-updated-date"]}${dateStr}`;
            }

            const rawData = await response.json();
            allModels = Array.isArray(rawData) ? rawData : (rawData.models || []);
            renderTable();
        } catch (error) {
            console.error("載入數據錯誤：", error);
            const errMsg = `
                <tr>
                    <td colspan="8" class="text-center" style="padding: 24px; color: var(--color-red);">
                        <i class="fa-solid fa-triangle-exclamation" style="margin-right: 8px;"></i> ${langObj["load-failed"]}
                    </td>
                </tr>
            `;
            freeTbody.innerHTML = errMsg;
            paidTbody.innerHTML = errMsg;
        }
    }

    // 5. Render tables with strict classification audit
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

            const isTTSOrAudio = fineCat === "speech" || nameLower.includes("tts") || nameLower.includes("audio") || nameLower.includes("lyria");
            const isEmbedding = fineCat === "embedding" || nameLower.includes("embedding") || nameLower.includes("aqa");
            const isImageGen = fineCat === "image_gen" || nameLower.includes("imagen") || nameLower.includes("veo") || nameLower.includes("banana");
            const isLive = fineCat === "live_api" || catLower.includes("live") || nameLower.includes("live");

            if (activeCategory === "all") {
                matchesCategory = true;
            } else if (activeCategory === "code") {
                matchesCategory = !isTTSOrAudio && !isEmbedding && !isImageGen && !isLive && (nameLower.includes("pro") || nameLower.includes("flash") || nameLower.includes("computer use"));
            } else if (activeCategory === "chat") {
                matchesCategory = !isTTSOrAudio && !isEmbedding && !isImageGen && !isLive && (fineCat === "text" || fineCat === "grounding" || fineCat === "vision");
            } else if (activeCategory === "vision") {
                matchesCategory = isVisionCapable && !isTTSOrAudio && !isEmbedding && !isImageGen;
            } else if (activeCategory === "speech") {
                matchesCategory = isTTSOrAudio;
            } else if (activeCategory === "image_gen") {
                matchesCategory = isImageGen;
            } else if (activeCategory === "live_api") {
                matchesCategory = isLive;
            } else if (activeCategory === "grounding") {
                matchesCategory = fineCat === "grounding" || catLower.includes("grounding") || nameLower.includes("grounding");
            } else if (activeCategory === "embedding") {
                matchesCategory = isEmbedding;
            }

            return matchesCategory;
        });

        // Split models into Free Tier (RPD > 0 or Unlimited) and Paid Tier (RPD = 0)
        const freeModels = filtered.filter(m => m.is_free_tier || (m.rpd_limit && (m.rpd_limit > 0 || m.rpd_limit === -1)));
        const paidModels = filtered.filter(m => !m.is_free_tier && (!m.rpd_limit || m.rpd_limit === 0));

        // Sort by model_score descending
        freeModels.sort((a, b) => (b.model_score || 0) - (a.model_score || 0));
        paidModels.sort((a, b) => (b.model_score || 0) - (a.model_score || 0));

        populateTbody(freeTbody, freeModels, langObj["no-free-found"]);
        populateTbody(paidTbody, paidModels, langObj["no-paid-found"]);
    }

    function populateTbody(tbodyElement, modelsList, emptyMsg) {
        if (modelsList.length === 0) {
            tbodyElement.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center" style="padding: 24px; color: var(--text-muted);">
                        ${emptyMsg}
                    </td>
                </tr>
            `;
            return;
        }

        modelsList.forEach(model => {
            const tr = document.createElement("tr");

            let catBadgeClass = "badge-other";
            const fineCat = model.fine_category || "other";
            
            if (fineCat === "text") catBadgeClass = "badge-text";
            else if (fineCat === "vision") catBadgeClass = "badge-video";
            else if (fineCat === "speech") catBadgeClass = "badge-speech";
            else if (fineCat === "image_gen") catBadgeClass = "badge-image-gen";
            else if (fineCat === "live_api") catBadgeClass = "badge-live";
            else if (fineCat === "grounding") catBadgeClass = "badge-grounding";
            else if (fineCat === "embedding") catBadgeClass = "badge-other";

            const catText = model.fine_category_name_zh || "通用模型";
            const scoreVal = (model.model_score || 9.0).toFixed(1);

            const scoreColor = scoreVal >= 9.5 ? "#f59e0b" : (scoreVal >= 9.0 ? "#3b82f6" : "#94a3b8");
            const scoreBadge = `<span style="display:inline-flex; align-items:center; gap:3px; background:rgba(245,158,11,0.1); color:${scoreColor}; font-weight:800; font-size:0.83rem; padding:2px 8px; border-radius:12px; border:1px solid rgba(245,158,11,0.2);"><i class="fa-solid fa-star" style="font-size:0.75rem;"></i> ${scoreVal}</span>`;

            let statusTag = "";
            const rpdStr = String(model.rpd || "").toLowerCase();
            if (model.is_free_tier) {
                if (rpdStr.includes("unlimited") || model.rpd_limit === -1) {
                    statusTag += `<span style="font-size:0.72rem; background:rgba(52,211,153,0.2); color:#34d399; padding:2px 6px; border-radius:4px; margin-left:4px; font-weight:700;">🎁 免費 (日額度無上限)</span>`;
                } else {
                    statusTag += `<span style="font-size:0.72rem; background:rgba(52,211,153,0.15); color:#34d399; padding:2px 6px; border-radius:4px; margin-left:4px; font-weight:600;">🎁 免費</span>`;
                }
            } else {
                statusTag += `<span style="font-size:0.72rem; background:rgba(96,165,250,0.15); color:#60a5fa; padding:2px 6px; border-radius:4px; margin-left:4px; font-weight:600;">💳 付費</span>`;
            }

            if (model.requires_billing_account) {
                statusTag += `<span style="font-size:0.72rem; background:rgba(245,158,11,0.15); color:#fbbf24; padding:2px 6px; border-radius:4px; margin-left:4px; font-weight:600;" title="需繫結結算帳戶/信用卡">⚠️ 需綁卡</span>`;
            }

            const rpmHtml = formatLimitValue(model.rpm, "RPM");
            const tpmHtml = formatLimitValue(model.tpm, "TPM");
            const rpdHtml = formatLimitValue(model.rpd, "RPD");

            tr.innerHTML = `
                <td style="font-weight: 700; color: var(--text-primary); font-size: 0.94rem;">${model.display_name} ${statusTag}</td>
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

        if (val.toLowerCase().includes("unlimited")) {
            return `<span class="limit-val high" style="color:#34d399; font-weight:800;">Unlimited</span>`;
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
