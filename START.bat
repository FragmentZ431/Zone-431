@echo off
cd /d "%~dp0"

start "ZONE-431 SERVER" /min py -m http.server 4310

timeout /t 3 /nobreak >nul

start "" "http://127.0.0.1:4310/main page.html"

pause