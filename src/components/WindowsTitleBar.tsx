import React, { useState, useEffect } from 'react';
import { Database, Bell, BellOff, Maximize, Minimize } from 'lucide-react';

interface WindowsTitleBarProps {
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  isOnline?: boolean;
  bildirimlerAktif?: boolean;
  onToggleBildirimler?: () => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  isOnline = true,
  bildirimlerAktif = true,
  onToggleBildirimler,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    return typeof document !== 'undefined' && !!document.fullscreenElement;
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Tam ekran geçişi desteklenmiyor veya engellendi:', err);
    }
  };

  return (
    <header
      id="windows-titlebar"
      className="bg-[#0b192c] text-white select-none flex items-center justify-between px-3 py-1.5 text-xs font-sans relative z-30 border-b border-slate-800 shadow-sm"
    >
      {/* Sol: TCDD İkon ve Uygulama Başlığı */}
      <div className="flex items-center space-x-2.5">
        <div className="w-5 h-5 rounded bg-blue-600/30 flex items-center justify-center text-white font-bold text-xs border border-blue-400/30 shadow-inner">
          🚂
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-white tracking-wide text-xs">
            Gebze Vagon Bakım Atölye Müdürlüğü Personel Takip
          </span>
        </div>
      </div>

      {/* Sağ: Bildirim Ayarı, Merkezi Veritabanı Durumu & Tam Ekran Butonu */}
      <div className="flex items-center space-x-2.5">
        {/* Bildirim Aç/Kapat Butonu */}
        {onToggleBildirimler && (
          <button
            onClick={onToggleBildirimler}
            title={bildirimlerAktif ? 'Bilgilendirme Mesajlarını Kapat (Sessize Al)' : 'Bilgilendirme Mesajlarını Aç'}
            className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] border transition-colors cursor-pointer ${
              bildirimlerAktif
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 border-amber-800'
            }`}
          >
            {bildirimlerAktif ? (
              <>
                <Bell className="w-3 h-3 text-emerald-400" />
                <span className="hidden md:inline">Mesajlar: Açık</span>
              </>
            ) : (
              <>
                <BellOff className="w-3 h-3 text-amber-400" />
                <span className="hidden md:inline">Mesajlar: Kapalı</span>
              </>
            )}
          </button>
        )}

        {/* Çevrimiçi / Yerel Durum */}
        <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50"></span>
          <Database className="w-3 h-3 text-blue-400" />
          <span className="font-medium">{isOnline ? 'Merkezi Veritabanı: Çevrimiçi' : 'Yerel Mod'}</span>
        </div>

        {/* Tam Ekran / Pencere Kontrol Butonu (Üstteki Windows çubuğunu gizler/gösterir) */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Tam Ekrandan Çık (Pencere Modu)' : 'Tam Ekran Yap (Üstteki Windows Çubuğunu Gizler - F11)'}
          className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px] font-medium"
        >
          {isFullscreen ? (
            <>
              <Minimize className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Pencereye Dön</span>
            </>
          ) : (
            <>
              <Maximize className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Tam Ekran</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
