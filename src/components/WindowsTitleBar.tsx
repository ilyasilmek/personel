import React from 'react';
import { Minus, Square, X, Database, ShieldCheck, Bell, BellOff } from 'lucide-react';

interface WindowsTitleBarProps {
  isMaximized: boolean;
  onToggleMaximize: () => void;
  isOnline?: boolean;
  bildirimlerAktif?: boolean;
  onToggleBildirimler?: () => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  isMaximized,
  onToggleMaximize,
  isOnline = true,
  bildirimlerAktif = true,
  onToggleBildirimler,
}) => {
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

      {/* Sağ: Merkezi Veritabanı Durumu, Bildirim Ayarı & Pencere Kontrolleri */}
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

        {/* Windows Pencere Kontrol Butonları */}
        <div className="flex items-center -mr-1 space-x-0.5">
          <button
            title="Simge Durumuna Küçült"
            className="h-6 w-8 rounded flex items-center justify-center hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleMaximize}
            title={isMaximized ? 'Geri Getir' : 'Ekranı Kapla'}
            className="h-6 w-8 rounded flex items-center justify-center hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            title="Kapat"
            onClick={() => {}}
            className="h-6 w-8 rounded flex items-center justify-center hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
