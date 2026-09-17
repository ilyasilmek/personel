import React from 'react';
import {
  Database,
  RefreshCw,
  Table,
  Printer,
  Search,
  UserPlus,
  Users,
  Briefcase,
  FolderOpen,
} from 'lucide-react';
import { PersonelTuru } from '../types';

export type ActiveTab = 'arama' | 'tcdd_form' | 'genel_liste' | 'yedekleme';

interface NavigationRibbonProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  aktifGrup: PersonelTuru;
  onGrupDegistir: (grup: PersonelTuru) => void;
  onYeniPersonelEkle: () => void;
  onExcelExport?: () => void;
  onPdfExport?: () => void;
  onResmiYazdir: () => void;
  onQuickBackup?: () => void;
  onRefresh: () => void;
  isciSayisi: number;
  memurSayisi: number;
}

export const NavigationRibbon: React.FC<NavigationRibbonProps> = ({
  activeTab,
  setActiveTab,
  aktifGrup,
  onGrupDegistir,
  onYeniPersonelEkle,
  onExcelExport,
  onPdfExport,
  onResmiYazdir,
  onQuickBackup,
  onRefresh,
  isciSayisi,
  memurSayisi,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 text-slate-800 select-none shadow-xs font-sans text-xs">
      {/* 1. KATEGORİ SEÇİCİ & KURUMSAL BİLGİ BARI */}
      <div className="bg-[#102a45] px-4 py-2 flex items-center justify-between text-white border-b border-slate-700/60 shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-semibold text-slate-300 hidden sm:inline uppercase tracking-wider">
            Kadro Grubu:
          </span>

          {/* İŞÇİ / MEMUR SEGMENTED PILL SWITCHER */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-700/80 shadow-inner">
            <button
              id="tab-isci-sec"
              onClick={() => onGrupDegistir('ISCI')}
              className={`px-3 py-1 text-xs font-bold rounded-md flex items-center space-x-1.5 transition-all cursor-pointer ${
                aktifGrup === 'ISCI'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>İŞÇİ PERSONEL</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-bold ml-1 ${
                aktifGrup === 'ISCI' ? 'bg-blue-900/80 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {isciSayisi}
              </span>
            </button>

            <button
              id="tab-memur-sec"
              onClick={() => onGrupDegistir('MEMUR')}
              className={`px-3 py-1 text-xs font-bold rounded-md flex items-center space-x-1.5 transition-all cursor-pointer ml-1 ${
                aktifGrup === 'MEMUR'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-cyan-300" />
              <span>MEMUR PERSONEL</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-bold ml-1 ${
                aktifGrup === 'MEMUR' ? 'bg-blue-900/80 text-cyan-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {memurSayisi}
              </span>
            </button>
          </div>
        </div>

        {/* Sağ: Toplam Kayıt Bilgisi */}
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-300 pr-1">
          <span className="hidden md:inline text-slate-400">Toplam Mevcut:</span>
          <span className="bg-slate-800/90 text-slate-200 border border-slate-700 px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px]">
            {isciSayisi + memurSayisi} Personel
          </span>
        </div>
      </div>

      {/* 2. EKRAN SEKMELERİ (Arama, Ekleme, LİSTE, Form, Resmi Yazdır, Yedekleme) */}
      <div className="flex items-center justify-between px-4 pt-2 border-b border-slate-200 bg-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* ARAMA */}
          <button
            id="nav-tab-arama"
            onClick={() => setActiveTab('arama')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-t-md flex items-center space-x-1.5 transition-all cursor-pointer border ${
              activeTab === 'arama'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border-blue-200'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ${activeTab === 'arama' ? 'text-white' : 'text-blue-600'}`} />
            <span>ARAMA</span>
          </button>

          {/* YENİ PERSONEL */}
          <button
            id="nav-tab-personel-ekle"
            onClick={onYeniPersonelEkle}
            className="px-3.5 py-1.5 text-xs font-bold rounded-t-md flex items-center space-x-1.5 transition-all cursor-pointer border bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border-emerald-300"
            title="Yeni personel eklemek için boş formu açın"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>YENİ PERSONEL</span>
          </button>

          {/* LİSTE */}
          <button
            id="nav-tab-genel-liste"
            onClick={() => setActiveTab('genel_liste')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-t-md flex items-center space-x-1.5 transition-all cursor-pointer border ${
              activeTab === 'genel_liste'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border-indigo-200'
            }`}
          >
            <Table className={`w-3.5 h-3.5 ${activeTab === 'genel_liste' ? 'text-white' : 'text-indigo-600'}`} />
            <span>LİSTE</span>
          </button>

          {/* PERSONEL ÖZLÜK */}
          <button
            id="nav-tab-tcdd-form"
            onClick={() => setActiveTab('tcdd_form')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-t-md flex items-center space-x-1.5 transition-all cursor-pointer border ${
              activeTab === 'tcdd_form'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200'
            }`}
          >
            <FolderOpen className={`w-3.5 h-3.5 ${activeTab === 'tcdd_form' ? 'text-white' : 'text-amber-700'}`} />
            <span>PERSONEL ÖZLÜK</span>
          </button>

          {/* RESMİ YAZDIR / DÖKÜM (Üst Tab'a Taşındı - Madde 3) */}
          <button
            id="nav-tab-resmi-yazdir"
            onClick={onResmiYazdir}
            className="px-3.5 py-1.5 text-xs font-bold rounded-t-md flex items-center space-x-1.5 transition-all cursor-pointer border bg-rose-50 text-rose-900 hover:bg-rose-100 border-rose-300 shadow-xs"
            title="Resmi TCDD Raporunu ve Personel Dökümünü Görüntüle / Yazdır"
          >
            <Printer className="w-3.5 h-3.5 text-rose-700" />
            <span>RESMİ YAZDIR / DÖKÜM</span>
          </button>

          {/* YEDEKLE - YÜKLE */}
          <button
            id="nav-tab-yedekleme"
            onClick={() => setActiveTab('yedekleme')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-t-md flex items-center space-x-1.5 transition-all cursor-pointer border ${
              activeTab === 'yedekleme'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border-purple-200'
            }`}
          >
            <Database className={`w-3.5 h-3.5 ${activeTab === 'yedekleme' ? 'text-white' : 'text-purple-600'}`} />
            <span>YEDEKLE - YÜKLE</span>
          </button>
        </div>

        {/* Sağ: Yenileme Butonu */}
        <div className="flex items-center pb-1.5">
          <button
            id="btn-yenile"
            onClick={onRefresh}
            title="Verileri Merkezi Sunucu ile Yenile (F5)"
            className="px-2.5 py-1 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-300 transition-colors text-[11px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs bg-white"
          >
            <RefreshCw className="w-3 h-3 text-slate-600" />
            <span>Yenile (F5)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
