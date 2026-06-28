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
            const matchesCategory = activeCategory === "all" || model.category === activeCategory;
            
            // Search filter
            const term = searchQuery.toLowerCase().trim();
            const matchesSearch = !term || 
                model.display_name.toLowerCase().includes(term) || 
                model.api_name.toLowerCase().includes(term) || 
                (model.category && model.category.toLowerCase().includes(term));

            return matchesCategory && matchesSearch;
        });

        // Split into Free and Paid
        const freeModels = filtered.filter(m => !m.tier || !m.tier.toLowerCase().includes("pay"));
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
                if (model.category === "Text-out models") catBadge = "badge-text";
                else if (model.category === "Image/Video") catBadge = "badge-video";
                else if (model.category === "Live API") catBadge = "badge-live";

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
