document.addEventListener("DOMContentLoaded", () => {
    let allModels = [];
    let activeCategory = "all";
    let searchQuery = "";
    
    // 1. Translation Dictionary
    const translations = {
        "zh-TW": {
            "app-title": "Gemini API 官方額度查詢與監控",
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
            "app-title": "Gemini API Quota & Rate Limits Monitor",
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
        },
        "ja": {
            "app-title": "Gemini API 公式クォータ・レート制限モニター",
            "official-source": "公式データソース：<strong>Google AI Studio</strong>",
            "last-updated": "最終更新時間：",
            "loading": "読み込み中...",
            "search-placeholder": "モデル名で検索 (例: flash, pro)...",
            "tab-all": "すべてのモデル",
            "tab-text": "テキストモデル",
            "tab-image-video": "画像と動画",
            "tab-speech": "音声モデル",
            "tab-live": "Live API",
            "tab-other": "その他 (Gemma/Embedding/位置情報)",
            "purpose-title": "ダッシュボードの目的とサードパーティ統合の利点",
            "purpose-desc": "本ダッシュボードは Google AI Studio の公式レート制限（Rate Limits）とリアルタイムに同期しており、開発者に次の2つのコアメリットを提供します：",
            "purpose-card1-title": "無料モデル設定 API",
            "purpose-card1-desc": "純粋な数字形式の <strong>JSON データインターフェース</strong> を提供し、音声入力ツール、AI アシスタント、またはローカルスクリプトから最新の無料モデルリストと制限（RPM/TPM/RPD）を直接取得できます。",
            "purpose-card2-title": "フェイルオーバーと自動デグレード",
            "purpose-card2-desc": "AI ツールが無料モデルの呼び出しで <strong>HTTP 429 制限超過</strong> に達した場合、バックグラウンドで自動的に他の健全な無料代替モデルに切り替えます。",
            "free-tier-title": "🎁 無料枠に関する特記事項 (Free Tier)",
            "free-tier-desc": "Google AI Studio は非常に寛大な<strong>無料枠 (Free Tier)</strong> を提供しており、個人開発者、学生、またはプロトタイプテストに最適です。人気のある無料モデルの特徴：",
            "free-tier-card1-title": "Flash 軽量超高速モデル",
            "free-tier-card1-desc": "• <strong>高い無料枠</strong>：より高い RPM および RPD 制限を提供します。<br>• <strong>高速でマルチモーダル</strong>：音声入力、翻訳、日常の迅速な対話に最適です。",
            "free-tier-card2-title": "Pro 強力な推論モデル",
            "free-tier-card2-desc": "• <strong>強力な機能</strong>：非常に長いコンテキストウィンドウと強力なコード生成能力を備えています。<br>• <strong>複雑なタスク向け</strong>：レート制限は低めですが、複雑な分析と推論に最適です。",
            "free-table-title": "無料モデルのレート制限 (Free Tier)",
            "free-badge": "無料枠 (1日あたりの制限あり)",
            "paid-table-title": "従量課金モデルのレート制限 (Pay-as-you-go Tier)",
            "paid-badge": "有料枠 (1日の制限なし)",
            "col-display-name": "モデル名",
            "col-api-id": "API 識別子",
            "col-category": "カテゴリ",
            "col-rpm": "RPM (分間リクエスト)",
            "col-tpm": "TPM (分間トークン)",
            "col-rpd": "RPD (日間リクエスト)",
            "glossary-title": "制限用語の説明",
            "glossary-desc-rpm": "Requests Per Minute。1分間に許可される最大 API リクエスト数。",
            "glossary-desc-tpm": "Tokens Per Minute。1分間に処理できる最大トークン数（入力と出力の合計）。",
            "glossary-desc-rpd": "Requests Per Day。1日あたりに許可される最大 API リクエスト数。",
            "glossary-desc-free-paid": "無料枠には日制限があります。従量課金枠は使用量に応じて課金され、制限ははるかに高くなります。",
            "footer-copyright": "© 2026 Gemini API Monitor. Playwright クラウドヘッドレス技術を使用して自動生成。",
            "footer-badge": "本ページは定期的に自動クロールされ、GitHub Pages に再公開されます | 100% 無料かつオープンアクセス",
            "no-free-found": "条件に一致する無料 API モデルが見つかりません",
            "no-paid-found": "条件に一致する有料 API モデルが見つかりません",
            "load-failed": "データの読み込みに失敗しました。",
            "load-data-free": "無料モデルのデータを読み込み中...",
            "load-data-paid": "有料モデルのデータを読み込み中...",
            "intro-text": "本サイトは、Google AI Studio (Gemini API) の公式無料モデルおよび有料モデルのクォータ制限をリアルタイムに監視および照会する機能を提供します。データは毎日自動的に同期更新され、開発者の統合、AI ツールのスケジュール、およびフェイルオーバーサポートの参照を提供します。",
            "amazon-title": "🛒 Amazon インフルエンサー推奨セール",
            "amazon-subtitle": "おすすめのセール商品",
            "amz-bestsellers": "ベストセラー",
            "amz-bestsellers-desc": "Amazon で最も人気のある商品を探索しましょう。毎時間更新されます。",
            "amz-new-releases": "新着商品",
            "amz-new-releases-desc": "Amazon の最新のヒット作や今後のリリースをいち早くチェック。",
            "amz-most-wished": "ほしい物リスト人気",
            "amz-most-wished-desc": "世界中の顧客が最もほしい物リストに追加している夢のアイテム清単。",
            "amz-most-gifted": "ギフトに最適",
            "amz-most-gifted-desc": "休日や誕生日のプレゼントに選ばれる最も人気のあるアイテムギフト。",
            "amz-action": "今すぐ探索 ➡️",
            "badge-text": "テキスト",
            "badge-video": "画像と動画",
            "badge-speech": "音声",
            "badge-live": "Live API",
            "badge-grounding": "グラウンディング",
            "badge-other": "その他モデル"
        },
        "ko": {
            "app-title": "Gemini API 공식 쿼터 및 속도 제한 모니터",
            "official-source": "공식 데이터 소스: <strong>Google AI Studio</strong>",
            "last-updated": "최종 업데이트 시간:",
            "loading": "로딩 중...",
            "search-placeholder": "모델명으로 검색 (예: flash, pro)...",
            "tab-all": "모든 모델",
            "tab-text": "텍스트 모델",
            "tab-image-video": "이미지 및 비디오",
            "tab-speech": "음성 모델",
            "tab-live": "Live API",
            "tab-other": "기타 (Gemma/Embedding/위치)",
            "purpose-title": "대시보드 목적 및 서드파티 도구 통합의 장점",
            "purpose-desc": "본 대시보드는 Google AI Studio의 공식 속도 제한(Rate Limits) 규격을 실시간으로 동기화하여 개발자에게 다음 두 가지 핵심 장점을 제공합니다:",
            "purpose-card1-title": "무료 모델 구성 API",
            "purpose-card1-desc": "순수 숫자 형식의 <strong>JSON 데이터 인터페이스</strong>를 제공하여 음성 입력 도구, AI 비서 또는 로컬 스크립트에서 최신 무료 모델 목록 및 제한(RPM/TPM/RPD)을 직접 원격으로 가져올 수 있습니다.",
            "purpose-card2-title": "장애 극복 및 자동 강하 (Failover)",
            "purpose-card2-desc": "AI 도구가 무료 모델 호출 시 <strong>HTTP 429 요청 한도 초과</strong>에 도달하면 백그라운드에서 정상적인 다른 무료 대체 모델로 자동 전환합니다.",
            "free-tier-title": "🎁 무료 계층에 관한 특별 설명 (Free Tier)",
            "free-tier-desc": "Google AI Studio는 개인 개발자, 학생 또는 프로토타입 테스트에 완벽한 매우 넉넉한 <strong>무료 한도 계층 (Free Tier)</strong>을 제공합니다. 인기 있는 무료 모델의 특징:",
            "free-tier-card1-title": "Flash 가볍고 빠른 모델",
            "free-tier-card1-desc": "• <strong>높은 무료 한도</strong>: 더 높은 RPM 및 RPD 한도를 제공합니다.<br>• <strong>초고속 및 멀티모달</strong>: 음성 입력, 번역 및 빠른 일상 대화에 가장 적합합니다.",
            "free-tier-card2-title": "Pro 강력한 추론 모델",
            "free-tier-card2-desc": "• <strong>강력한 추론</strong>: 매우 긴 컨텍스트 창과 강력한 코드 생성 기능을 제공합니다.<br>• <strong>복잡한 분석용</strong>: 속도 제한은 낮지만 복잡한 분석과 추론에 가장 적합합니다.",
            "free-table-title": "무료 모델 속도 제한 (Free Tier)",
            "free-badge": "무료 계층 (일일 제한 있음)",
            "paid-table-title": "종량제 모델 속도 제한 (Pay-as-you-go Tier)",
            "paid-badge": "유료 계층 (일일 제한 없음)",
            "col-display-name": "모델 이름",
            "col-api-id": "API 식별자",
            "col-category": "분류",
            "col-rpm": "RPM (분당 요청)",
            "col-tpm": "TPM (분당 토큰)",
            "col-rpd": "RPD (일당 요청)",
            "glossary-title": "속도 제한 용어 설명",
            "glossary-desc-rpm": "Requests Per Minute. 1분 동안 허용되는 최대 API 요청 횟수.",
            "glossary-desc-tpm": "Tokens Per Minute. 1분 동안 처리할 수 있는 최대 토큰 수 (입력 + 출력 합계).",
            "glossary-desc-rpd": "Requests Per Day. 하루 동안 허용되는 최대 API 요청 횟수.",
            "glossary-desc-free-paid": "무료 계층은 일일 제한이 있습니다. 종량제 계층은 사용량에 따라 부과되며 한도가 훨씬 높습니다.",
            "footer-copyright": "© 2026 Gemini API Monitor. Playwright 클라우드 헤드리스 기술을 통해 자동 생성됨.",
            "footer-badge": "이 페이지는 정기적으로 자동 크롤링되어 GitHub Pages에 다시 게시됩니다 | 100% 무료 및 공개 액세스",
            "no-free-found": "조건에 맞는 무료 API 모델을 찾을 수 없습니다",
            "no-paid-found": "조건에 맞는 유료 API 모델을 찾을 수 없습니다",
            "load-failed": "데이터 로드 실패.",
            "load-data-free": "무료 모델 데이터를 불러오는 중...",
            "load-data-paid": "유료 모델 데이터를 불러오는 중...",
            "intro-text": "본 사이트는 Google AI Studio (Gemini API) 공식 무료 및 유료 모델의 속도 한도를 실시간으로 모니터링하고 조회하는 기능을 제공합니다. 데이터는 매일 자동 동기화되어 개발자 통합, AI 도구 예약 및 장애 복구에 대한 참조를 제공합니다.",
            "amazon-title": "🛒 Amazon 인플루언서 추천 추천",
            "amazon-subtitle": "추천 특가 상품",
            "amz-bestsellers": "베스트셀러",
            "amz-bestsellers-desc": "매 시간 업데이트되는 Amazon에서 가장 인기 있는 베스트셀러 상품을 탐색하세요.",
            "amz-new-releases": "핫 신상품",
            "amz-new-releases-desc": "Amazon에서 가장 인기 있는 신상품 및 출시 예정 상품을 확인해 보세요.",
            "amz-most-wished": "가장 갖고 싶은 선물",
            "amz-most-wished-desc": "전 세계 고객이 자신의 위시리스트에 가장 자주 추가하는 선물 상품 목록입니다.",
            "amz-most-gifted": "최고의 선물 아이디어",
            "amz-most-gifted-desc": "특별한 기념일에 가장 많이 선물되는 인기 상품 아이디어 모음입니다.",
            "amz-action": "지금 확인하기 ➡️",
            "badge-text": "텍스트",
            "badge-video": "이미지 & 비디오",
            "badge-speech": "오디오",
            "badge-live": "Live API",
            "badge-grounding": "그라운딩",
            "badge-other": "기타 모델"
        }
    };

    // 2. Language Detection
    let userLang = "zh-TW";
    const browserLang = (navigator.language || navigator.userLanguage || "zh-TW").toLowerCase();
    if (browserLang.startsWith("ja")) {
        userLang = "ja";
    } else if (browserLang.startsWith("ko")) {
        userLang = "ko";
    } else if (!browserLang.startsWith("zh")) {
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

        // Set lang dropdown value
        if (langSelect) {
            langSelect.value = userLang;
        }
    }

    // Initialize Translations
    applyI18n();

    // Language Dropdown Event Listener
    if (langSelect) {
        langSelect.addEventListener("change", () => {
            userLang = langSelect.value;
            applyI18n();
            renderTable();
        });
    }

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
                updateTimeText.textContent = `${langObj["last-updated"]}${date.toLocaleString(userLang === "zh-TW" ? "zh-TW" : (userLang === "ja" ? "ja-JP" : (userLang === "ko" ? "ko-KR" : "en-US")))}`;
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
