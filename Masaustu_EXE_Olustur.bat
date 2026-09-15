@echo off
chcp 65001 > nul
title TCDD Personel Yönetim Sistemi - EXE Derleyici
color 0b
echo ========================================================
echo   TCDD PERSONEL YÖNETİM SİSTEMİ - WINDOWS .EXE OLUŞTURUCU
echo ========================================================
echo.
echo Bu betik uygulamanızı bağımsız bir Windows .EXE programına dönüştürür.
echo.

:: 1. Bağımlılıkları Yükle ve Projeyi Derle
echo [1/3] Web uygulaması derleniyor...
call npm install
call npm run build

:: 2. EXE Paketleme Aracı Kontrolü ve Derleme
echo.
echo [2/3] Windows Masaüstü .EXE dosyası oluşturuluyor...
call npx --yes electron-packager . "TCDD_Personel_Yonetim" --platform=win32 --arch=x64 --out=dist_exe --overwrite --prune=true

echo.
echo [3/3] İŞLEM TAMAMLANDI!
echo.
echo Oluşturulan EXE dosyanız: "dist_exe\TCDD_Personel_Yonetim-win32-x64\TCDD_Personel_Yonetim.exe"
echo.
pause
