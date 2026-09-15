import React from 'react';
import { Minus, Square, X, Database, Wifi } from 'lucide-react';

interface WindowsTitleBarProps {
  isMaximized: boolean;
  onToggleMaximize: () => void;
  isOnline?: boolean;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  isMaximized,
  onToggleMaximize,
  isOnline = true,
}) => {
  return (
    <header
      id="windows-titlebar"
      className="bg-[#0055ea] text-white select-none flex items-center justify-between px-2 py-1 text-xs font-sans relative z-30 shadow-xs"
    >
      {/* Sol: Windows İkon ve Uygulama Başlığı */}
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 rounded-xs bg-white/20 flex items-center justify-center text-white font-bold text-[10px] border border-white/40">
          🚂
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="font-bold text-white tracking-wide text-xs">
            Personel Takip Programı
          </span>
          <span className="text-blue-100 text-[11px] hidden sm:inline opacity-85">
            — TCDD Vagon Bakım Onarım Atelye Müdürlüğü
          </span>
        </div>
      </div>

      {/* Sağ: Merkezi Veritabanı Durumu & Windows Kontrolleri */}
      <div className="flex items-center space-x-2">
        {/* Merkezi Online Durum Rozeti */}
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-blue-900/60 border border-blue-400/40 text-[11px] text-blue-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <Database className="w-3 h-3 text-blue-300" />
          <span className="font-medium">Merkezi Veritabanı: {isOnline ? 'Çevrimiçi' : 'Yerel'}</span>
        </div>

        {/* Windows Pencere Kontrol Butonları */}
        <div className="flex items-center -mr-1">
          <button
            title="Simge Durumuna Küçült"
            className="h-6 w-8 flex items-center justify-center hover:bg-blue-600 text-white transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleMaximize}
            title={isMaximized ? 'Geri Getir' : 'Ekranı Kapla'}
            className="h-6 w-8 flex items-center justify-center hover:bg-blue-600 text-white transition-colors cursor-pointer"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            title="Kapat"
            onClick={() => alert('TCDD Personel Takip Programı aktif olarak çalışmaktadır.')}
            className="h-6 w-9 flex items-center justify-center hover:bg-red-600 text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
