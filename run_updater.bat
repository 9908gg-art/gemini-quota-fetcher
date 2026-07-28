@echo off
cd /d "%~dp0"
title Gemini API Quota Auto Updater

echo ====================================================
echo  Gemini API Quota Auto Updater
echo ====================================================

python run.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================
    echo  SUCCESS: Quota data updated and pushed successfully!
    echo ====================================================
) else (
    echo.
    echo ====================================================
    echo  ERROR: Failed to update quota data.
    echo ====================================================
)

echo.
timeout /t 10
