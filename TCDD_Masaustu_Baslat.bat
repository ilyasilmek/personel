@echo off
title TCDD Personel Yonetim Sistemi
color 09

:: TCDD Personel Yonetim Sistemi - Hizli Masaustu Calistirici
:: Node.js veya herhangi bir yukleme gerektirmeden tam masaustu programi olarak acar.

set APP_URL=https://ais-pre-zstzrbm2vuckrhrb7xrfsc-598933815767.europe-west2.run.app

echo TCDD Personel Yonetim Sistemi baslatiliyor...

:: Oncelikle Microsoft Edge App modu deneniyor
where msedge >nul 2>nul
if %errorlevel% equ 0 (
    start msedge.exe --app=%APP_URL% --window-size=1366,850
    exit
)

:: Alternatif Google Chrome App modu deneniyor
where chrome >nul 2>nul
if %errorlevel% equ 0 (
    start chrome.exe --app=%APP_URL% --window-size=1366,850
    exit
)

:: Varsayilan tarayici ile ac
start %APP_URL%
exit
