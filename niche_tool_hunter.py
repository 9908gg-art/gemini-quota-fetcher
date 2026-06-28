import urllib.request
import urllib.parse
import json
import time
import os

def get_google_suggestions(query):
    """
    獲取 Google Autocomplete (自動完成) 的搜尋建議
    """
    encoded_query = urllib.parse.quote(query)
    url = f"http://suggestqueries.google.com/complete/search?client=chrome&q={encoded_query}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            # Google Autocomplete 回傳的格式為: [query, [suggestions], [descriptions], ...]
            # 我們只需要 suggestions 列表
            return data[1]
    except Exception as e:
        # print(f"查詢 {query} 失敗: {e}")
        return []

def hunt_niches():
    # 定義搜尋前綴，這些前綴是用戶尋找工具時常用的詞彙
    prefixes = [
        "online tool for ",
        "free online converter for ",
        "free online calculator for ",
        "generator for "
    ]
    
    alphabet = "abcdefghijklmnopqrstuvwxyz"
    all_suggestions = set()
    
    print("🚀 啟動『利基工具挖掘器 (Niche Tool Hunter)』...")
    print("正在爬取 Google 搜尋引擎自動完成數據，這能反映真實用戶的即時搜尋需求...")
    
    total_queries = len(prefixes) * len(alphabet)
    current_query_num = 0
    
    # 遍歷前綴 + 英文字母，擴展出數百個查詢
    for prefix in prefixes:
        for letter in alphabet:
            current_query_num += 1
            query = f"{prefix}{letter}"
            
            # 顯示進度
            if current_query_num % 10 == 0 or current_query_num == total_queries:
                print(f"進度: {current_query_num}/{total_queries} ...")
                
            suggestions = get_google_suggestions(query)
            for s in suggestions:
                # 排除一些無關的普通搜尋，只保留含有 tool, converter, calculator, generator, maker, tracker 等工具相關詞彙
                s_lower = s.lower()
                indicators = ["tool", "converter", "calculator", "generator", "maker", "tracker", "format", "visualizer", "compressor", "designer"]
                if any(ind in s_lower for ind in indicators):
                    all_suggestions.add(s)
            
            # 禮貌爬取，避免被 Google 封鎖 IP
            time.sleep(0.1)
            
    print(f"🎉 爬取完成！共收集到 {len(all_suggestions)} 個工具關鍵字需求。")
    
    # 進行初步分類整理
    sorted_suggestions = sorted(list(all_suggestions))
    
    # 輸出至 JSON 檔案
    output_dir = os.path.dirname(__file__)
    output_path = os.path.join(output_dir, "niche_suggestions.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(sorted_suggestions, f, ensure_ascii=False, indent=2)
        
    print(f"已將所有關鍵字儲存至: {output_path}")
    
    # 篩選並顯示最有趣、最像有利基潛力的前 30 個關鍵字
    print("\n💡 【初步篩選出的熱門搜尋工具關鍵字範例】：")
    # 排除過於通用的詞（如 online tool for pdf 競爭太大），挑選長尾詞
    candidates = []
    for s in sorted_suggestions:
        words = s.split()
        # 長度大於 4 個單字，代表是精準的長尾需求，通常競爭較小
        if len(words) >= 4:
            candidates.append(s)
            
    return candidates[:40]

if __name__ == "__main__":
    candidates = hunt_niches()
    print("\n--- 候選關鍵字清單 ---")
    for i, c in enumerate(candidates, 1):
        print(f"{i}. {c}")
