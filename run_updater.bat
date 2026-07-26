@echo off
cd /d "%~dp0"
title Gemini API Quota Auto Updater

:: 使用 PowerShell 獲取標準的 YYYY-MM-DD 日期，不受 Windows 11 移除 WMIC 的影響
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd'"') do set today=%%i


set flag_file=last_run_date.txt

:: 讀取上一次執行的日期
if exist %flag_file% (
    set /p last_run=<%flag_file%
) else (
    set last_run=none
)

:: 去除空格
set "last_run=%last_run: =%"
set "today=%today: =%"

:: 檢查今日是否已執行過
if "%last_run%"=="%today%" (
    echo ====================================================
    echo  [Gemini Monitor] 今日 %today% 已經成功更新過數據。
    echo  👉 不需要重複執行。視窗將於 5 秒後自動關閉...
    echo ====================================================
    timeout /t 5 >nul
    exit /b
)

echo ====================================================
echo  🚀 開始執行 Gemini API 額度更新任務 (今日首次執行)
echo  📅 日期: %today%
echo ====================================================

:: 偵測網路狀態，確保開機後網路正常才開始執行
:ping_loop
ping -n 1 8.8.8.8 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⏳ [Gemini Monitor] 偵測到網路尚未連線，等待 5 秒後重試...
    timeout /t 5 >nul
    goto ping_loop
)
echo 🌐 [Gemini Monitor] 網路連線正常，啟動更新！

set "git_cmd=git"
if exist "C:\Program Files\Microsoft Visual Studio\2022\Professional\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe" (
    set "git_cmd=C:\Program Files\Microsoft Visual Studio\2022\Professional\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe"
) else if exist "C:\Program Files\Git\cmd\git.exe" (
    set "git_cmd=C:\Program Files\Git\cmd\git.exe"
)

echo 🔄 [Gemini Monitor] 正在從 GitHub 強制同步最新代碼...
"%git_cmd%" fetch origin
"%git_cmd%" reset --hard origin/main

python run.py

if %ERRORLEVEL% EQU 0 (
    echo %today% > %flag_file%
    echo ====================================================
    echo  ✅ 數據抓取並上傳成功！已記錄今日執行日期。
    echo ====================================================
) else (
    echo ====================================================
    echo  ❌ 執行過程中出錯，未記錄日期。
    echo  👉 下次開機或排程觸發時將會重新嘗試。
    echo ====================================================
)

timeout /t 10
