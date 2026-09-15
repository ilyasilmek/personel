import React, { useState } from 'react';
import { Download, Monitor, Smartphone, Check, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopHelp, setShowDesktopHelp] = useState(false);

  // If already running as an installed PWA, show a subtle badge
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 border border-emerald-300 rounded-xs shadow-2xs">
        <Check className="w-3 h-3 text-emerald-700" />
        <span>Masaüstü Aktif</span>
      </div>
    );
  }

  // Chromium / Android / Edge Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 border border-blue-950 rounded-xs shadow-xs cursor-pointer transition-all active:translate-y-px"
        title="Uygulamayı bilgisayarınıza veya telefonunuza bağımsız program olarak yükleyin"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span>Masaüstüne Kur (PWA)</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-slate-800 bg-amber-100 hover:bg-amber-200 border border-amber-400 rounded-xs cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-700" />
          <span>Ana Ekrana Ekle</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-2xl border border-gray-300 text-left">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="text-sm font-bold text-gray-900">iPhone / iPad'e Yükleme</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-600 leading-relaxed">
                1. Safari alt menüsündeki <strong>Paylaş</strong> (kare içinde yukarı ok) butonuna dokunun.<br />
                2. Aşağı kaydırıp <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-1.5 text-xs font-semibold bg-blue-800 text-white rounded cursor-pointer hover:bg-blue-900"
              >
                Anladım
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic fallback button if browser hasn't fired beforeinstallprompt yet or user is on desktop
  return (
    <>
      <button
        type="button"
        onClick={() => setShowDesktopHelp(true)}
        className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-blue-900 bg-blue-100/90 hover:bg-blue-200/90 border border-blue-300 rounded-xs cursor-pointer"
        title="Uygulamayı masaüstü programı olarak çalıştırma rehberi"
      >
        <Monitor className="w-3 h-3 text-blue-700" />
        <span>Masaüstü Yap</span>
      </button>

      {showDesktopHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl border border-gray-300 text-left">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-blue-700" />
                <span>Masaüstü Uygulaması Olarak Kullanma</span>
              </h3>
              <button
                onClick={() => setShowDesktopHelp(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-700 space-y-2.5 leading-relaxed">
              <p>
                <strong>Yöntem 1 (PWA Kurulumu - En Kolay):</strong><br />
                Chrome veya Edge tarayıcınızın adres çubuğunun en sağındaki <strong>"Uygulama olarak yükle"</strong> (monitör üzerinde indirme oku) simgesine tıklayın. Program anında masaüstü simgesi olarak kaydedilir.
              </p>
              <p>
                <strong>Yöntem 2 (GitHub Actions ile Otomatik .EXE):</strong><br />
                Projeyi GitHub'a aktardığınızda, GitHub ücretsiz olarak sizin için Windows <strong>.EXE</strong> dosyasını derler ve Releases kısmından indirilebilir hale getirir.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDesktopHelp(false)}
              className="mt-4 w-full py-1.5 text-xs font-semibold bg-blue-800 text-white rounded cursor-pointer hover:bg-blue-900"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </>
  );
};
