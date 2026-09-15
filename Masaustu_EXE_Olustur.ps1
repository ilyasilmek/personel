# TCDD Personel Yonetim Sistemi - EXE Derleyici (PowerShell)
$Host.UI.RawUI.WindowTitle = "TCDD Personel Yonetim Sistemi - EXE Derleyici"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  TCDD PERSONEL YONETIM SISTEMI - WINDOWS EXE DERLEYICI" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Node.js kontrolu
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[HATA] Node.js bilgisayarinizda kurulu bulunamadi!" -ForegroundColor Red
    Write-Host "Lutfen https://nodejs.org adresinden Node.js indirip kurunuz." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Devam etmek icin Enter tusuna basiniz..."
    exit 1
}

Write-Host "[1/3] Bagimliliklar yukleniyor (npm install)..." -ForegroundColor Green
npm install

Write-Host ""
Write-Host "[2/3] Web uygulamasi derleniyor (npm run build)..." -ForegroundColor Green
npm run build

Write-Host ""
Write-Host "[3/3] Windows Masaustu .EXE dosyasi olusturuluyor..." -ForegroundColor Green
npx --yes @electron/packager . "TCDD_Personel_Yonetim" --platform=win32 --arch=x64 --out=dist_exe --overwrite --prune=true --electron-version=34.0.0

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  ISLEM BASARIYLA TAMAMLANDI!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Olusturulan EXE programiniz:"
Write-Host "dist_exe\TCDD_Personel_Yonetim-win32-x64\TCDD_Personel_Yonetim.exe" -ForegroundColor Yellow
Write-Host ""
Read-Host "Kapatmak icin Enter tusuna basiniz..."
