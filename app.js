document.addEventListener("DOMContentLoaded", () => {
    let allModels = [];
    let activeCategory = "all";
    let searchQuery = "";

    const tbody = document.getElementById("quota-tbody");
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
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 30px; color: var(--color-red);">
                        <i class="fa-solid fa-triangle-exclamation" style="margin-right: 8px;"></i> 載入資料失敗。請確認是否已生成 gemini_rate_limits.json。
                    </td>
                </tr>
            `;
        }
    }

    // Render table rows
    function renderTable() {
        tbody.innerHTML = "";

        // Filter models
        const filtered = allModels.filter(model => {
            // Category filter
            const matchesCategory = activeCategory === "all" || model.category === activeCategory;
            
            // Search filter
            const term = searchQuery.toLowerCase().trim();
            const matchesSearch = !term || 
                model.display_name.toLowerCase().includes(term) || 
                model.api_name.toLowerCase().includes(term) || 
                model.category.toLowerCase().includes(term);

            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 30px; color: var(--text-muted);">
                        找不到符合條件的 API 模型
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(model => {
            const tr = document.createElement("tr");

            // Category badge mapping
            let catBadge = "badge-other";
            if (model.category === "Text-out models") catBadge = "badge-text";
            else if (model.category === "Image/Video") catBadge = "badge-video";
            else if (model.category === "Live API") catBadge = "badge-live";

            // Tier badge mapping
            const isPaid = model.tier && model.tier.toLowerCase().includes("pay");
            const tierBadge = isPaid ? "badge-paid" : "badge-free";

            // Format limits values (e.g. highlight high limit numbers)
            const rpmHtml = formatLimitValue(model.rpm, "RPM");
            const tpmHtml = formatLimitValue(model.tpm, "TPM");
            const rpdHtml = formatLimitValue(model.rpd, "RPD");

            tr.innerHTML = `
                <td style="font-weight: 600; color: var(--text-primary);">${model.display_name}</td>
                <td class="model-api-name">${model.api_name}</td>
                <td><span class="badge ${catBadge}">${model.category || "其他模型"}</span></td>
                <td><span class="badge ${tierBadge}">${model.tier || "Free tier"}</span></td>
                <td class="text-right">${rpmHtml}</td>
                <td class="text-right">${tpmHtml}</td>
                <td class="text-right">${rpdHtml}</td>
            `;
            tbody.appendChild(tr);
        });
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
