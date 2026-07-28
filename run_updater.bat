@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Gemini API Quota Auto Updater

echo ====================================================
echo  🚀 啟動 Gemini API Rate Limit 數據自動更新任務
echo ====================================================

:: 檢查網路連線狀態
:ping_loop
ping -n 1 8.8.8.8 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⏳ 偵測到網路尚未連線，等待 5 秒後重試...
    timeout /t 5 >nul
    goto ping_loop
)

echo 🌐 網路連線正常，正在發起數據更新與推送...

python run.py

if %ERRORLEVEL% EQU 0 (
    echo ====================================================
    echo  ✅ 數據抓取並上傳成功！
    echo ====================================================
) else (
    echo ====================================================
    echo  ❌ 執行過程中出錯。
    echo ====================================================
)

timeout /t 10
