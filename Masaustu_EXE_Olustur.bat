@echo off
title TCDD Personel Yonetim Sistemi - EXE Derleyici
color 0b

echo ========================================================
echo   TCDD PERSONEL YONETIM SISTEMI - WINDOWS EXE DERLEYICI
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo [HATA] Node.js bilgisayarinizda kurulu bulunamadi!
    echo.
    echo EXE olusturabilmek icin Node.js gereklidir.
    echo Lutfen https://nodejs.org adresinden ucretsiz indirip kurunuz.
    echo Kurulum bittikten sonra bu dosyayi tekrar calistiriniz.
    echo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo [HATA] npm komutu bulunamadi!
    echo Lutfen Node.js kurulumunun tamamlandigindan emin olunuz.
    echo.
    pause
    exit /b 1
)

echo [1/3] Bagimliliklar yukleniyor...
call npm install
if %errorlevel% neq 0 (
    color 0c
    echo [HATA] npm install basarisiz oldu!
    pause
    exit /b 1
)

echo.
echo [2/3] Web uygulamasi derleniyor (vite build)...
call npm run build
if %errorlevel% neq 0 (
    color 0c
    echo [HATA] Proje derleme hatasi!
    pause
    exit /b 1
)

echo.
echo [3/3] Windows Masaustu .EXE dosyasi olusturuluyor...
echo Lutfen bekleyiniz, bu islem birkac dakika surebilir...
call npx --yes electron-packager . "TCDD_Personel_Yonetim" --platform=win32 --arch=x64 --out=dist_exe --overwrite --prune=true

if %errorlevel% neq 0 (
    color 0c
    echo [HATA] EXE paketleme sirasinda bir hata olustu.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   ISLEM TAMAMLANDI!
echo ========================================================
echo.
echo Olusturulan EXE programiniz:
echo "dist_exe\TCDD_Personel_Yonetim-win32-x64\TCDD_Personel_Yonetim.exe"
echo.
echo Bu dosyaya cift tiklayarak programi masaustunde calistirabilirsiniz.
echo.
pause

