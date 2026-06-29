document.addEventListener("DOMContentLoaded", () => {
    let allModels = [];
    let activeCategory = "all";
    let searchQuery = "";

    const freeTbody = document.getElementById("free-quota-tbody");
    const paidTbody = document.getElementById("paid-quota-tbody");
    const searchInput = document.getElementById("search-input");
    const updateTimeText = document.getElementById("update-time-text");
    const tabContainer = document.getElementById("category-tabs-container");

    // Fetch and load the JSON limits data
    async function loadLimitsData() {
        try {
            const response = await fetch("gemini_rate_limits.json?nocache=" + new Date().getTime());
            if (!response.ok) {
                throw new Error("無法讀取 limits JSON 檔案");
            }
            
            // Get last modified header
            const lastModified = response.headers.get("Last-Modified");
            if (lastModified) {
                const date = new Date(lastModified);
                updateTimeText.textContent = `最後更新時間：${date.toLocaleString("zh-TW")}`;
            } else {
                updateTimeText.textContent = `最後更新時間：剛剛 (自動定時更新)`;
            }

            allModels = await response.json();
            renderTable();
        } catch (error) {
            console.error("載入數據錯誤：", error);
            const errMsg = `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 30px; color: var(--color-red);">
                        <i class="fa-solid fa-triangle-exclamation" style="margin-right: 8px;"></i> 載入資料失敗。
                    </td>
                </tr>
            `;
            freeTbody.innerHTML = errMsg;
            paidTbody.innerHTML = errMsg;
        }
    }

    // Render table rows
    function renderTable() {
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
            
            // Filter out models where rpm_limit, tpm_limit, and rpd_limit are all explicitly 0
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
                const catLower = (model.category || "").toLowerCase();
                const nameLower = (model.display_name || "").toLowerCase();
                
                if (catLower === "text-out models" || catLower === "agents") {
                    catBadge = "badge-text";
                } else if (catLower === "multi-modal generative models" && (nameLower.includes("imagen") || nameLower.includes("veo"))) {
                    catBadge = "badge-video";
                } else if ((catLower === "multi-modal generative models" || catLower.includes("audio") || catLower.includes("speech") || catLower.includes("tts")) && (nameLower.includes("tts") || nameLower.includes("audio") || nameLower.includes("lyria"))) {
                    catBadge = "badge-speech";
                } else if (catLower === "live api") {
                    catBadge = "badge-live";
                } else if (catLower.includes("grounding")) {
                    catBadge = "badge-grounding";
                }

                // Format limits values
                const rpmHtml = formatLimitValue(model.rpm, "RPM");
                const tpmHtml = formatLimitValue(model.tpm, "TPM");
                const rpdHtml = formatLimitValue(model.rpd, "RPD");

                tr.innerHTML = `
                    <td style="font-weight: 600; color: var(--text-primary);">${model.display_name}</td>
                    <td class="model-api-name">${model.api_name}</td>
                    <td><span class="badge ${catBadge}">${model.category || "其他模型"}</span></td>
                    <td class="text-right">${rpmHtml}</td>
                    <td class="text-right">${tpmHtml}</td>
                    <td class="text-right">${rpdHtml}</td>
                `;
                tbodyElement.appendChild(tr);
            });
        }

        populateTbody(freeTbody, freeModels, "找不到符合條件的免費 API 模型");
        populateTbody(paidTbody, paidModels, "找不到符合條件的付費 API 模型");
    }

    // Helper to format limits values
    function formatLimitValue(val, type) {
        if (!val || val === "N/A" || val.toUpperCase() === "N/A") {
            return `<span class="limit-val na">N/A</span>`;
        }
        
        // Clean commas to parse number
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
