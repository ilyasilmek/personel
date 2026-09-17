import React from 'react';
import { Database, CheckCircle2, Wifi, Clock, Github } from 'lucide-react';

interface WindowsStatusBarProps {
  personelSayisi: number;
  sonSenkronizasyon: string;
  isOnline: boolean;
  isGitHubActive?: boolean;
  gitHubLastSync?: string;
}

export const WindowsStatusBar: React.FC<WindowsStatusBarProps> = ({
  personelSayisi,
  sonSenkronizasyon,
  isOnline = true,
  isGitHubActive = false,
  gitHubLastSync,
}) => {
  return (
    <footer
      id="windows-statusbar"
      className="bg-[#ece9d8] border-t border-[#7f9db9] px-3 py-1 text-slate-700 text-[11px] flex flex-wrap items-center justify-between select-none font-sans"
    >
      <div className="flex items-center space-x-3 divide-x divide-slate-300">
        <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sistem Hazır</span>
        </div>

        <div className="pl-3 flex items-center space-x-1.5 text-blue-900 font-semibold">
          <Database className="w-3 h-3 text-blue-700" />
          <span>TCDD Merkezi Veritabanı (Online Senkronize)</span>
        </div>

        {isGitHubActive && (
          <div className="pl-3 flex items-center space-x-1.5 text-slate-800 font-semibold">
            <Github className="w-3 h-3 text-slate-700" />
            <span className="text-emerald-700 font-mono text-[10px]">GitHub: Bağlı</span>
          </div>
        )}

        <div className="pl-3 hidden sm:flex items-center space-x-1">
          <span>Toplam Kayıtlı Personel:</span>
          <strong className="text-slate-900">{personelSayisi}</strong>
        </div>

        <div className="pl-3 hidden md:flex items-center space-x-1 text-emerald-700 font-mono text-[10px]">
          <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" />
          <span>{isOnline ? 'Çevrimiçi & Canlı' : 'Yerel Önbellek'}</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 divide-x divide-slate-300">
        {isGitHubActive && gitHubLastSync && (
          <div className="flex items-center space-x-1 pl-3 text-slate-700 font-mono text-[10px]">
            <Github className="w-2.5 h-2.5 text-slate-500" />
            <span>Git Son: {gitHubLastSync}</span>
          </div>
        )}

        <div className="flex items-center space-x-1 pl-3 text-slate-600 font-mono text-[10.5px]">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Son Senk: {sonSenkronizasyon || 'Yeni'}</span>
        </div>

        <div className="pl-3 hidden lg:block text-slate-500 font-mono text-[10px]">
          UTF-8 (Türkçe Tam Uyumlu) &bull; %100
        </div>
      </div>
    </footer>
  );
};
