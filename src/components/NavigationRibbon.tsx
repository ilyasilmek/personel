import React from 'react';
import {
  Database,
  FileSpreadsheet,
  FileText,
  Save,
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
  onExcelExport: () => void;
  onPdfExport: () => void;
  onResmiYazdir: () => void;
  onQuickBackup: () => void;
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

      {/* 2. EKRAN SEKMELERİ (Arama, Ekleme, Genel Liste, Form, Yedekleme) */}
      <div className="flex items-center px-4 pt-1.5 space-x-1.5 border-b border-slate-200 bg-slate-50">
        {/* Arama Ekranı */}
        <button
          id="nav-tab-arama"
          onClick={() => setActiveTab('arama')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-lg flex items-center space-x-1.5 transition-all cursor-pointer border-t-2 ${
            activeTab === 'arama'
              ? 'bg-white text-blue-700 border-t-blue-600 border-x border-slate-200 -mb-[1px] shadow-xs'
              : 'border-t-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-blue-600" />
          <span>Arama &amp; Sorgulama</span>
        </button>

        {/* Personel Ekle (Boş Form Modu) */}
        <button
          id="nav-tab-personel-ekle"
          onClick={onYeniPersonelEkle}
          className="px-3.5 py-2 text-xs font-bold rounded-t-lg flex items-center space-x-1.5 transition-all cursor-pointer text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/70 border border-emerald-300/80 bg-emerald-50 shadow-xs"
          title="Yeni personel eklemek için boş formu açın"
        >
          <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
          <span>+ Yeni Personel Ekle</span>
        </button>

        {/* Genel Liste */}
        <button
          id="nav-tab-genel-liste"
          onClick={() => setActiveTab('genel_liste')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-lg flex items-center space-x-1.5 transition-all cursor-pointer border-t-2 ${
            activeTab === 'genel_liste'
              ? 'bg-white text-blue-700 border-t-blue-600 border-x border-slate-200 -mb-[1px] shadow-xs'
              : 'border-t-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Table className="w-3.5 h-3.5 text-indigo-600" />
          <span>Genel Liste (10 Sütun)</span>
        </button>

        {/* Personel Takip Formu */}
        <button
          id="nav-tab-tcdd-form"
          onClick={() => setActiveTab('tcdd_form')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-lg flex items-center space-x-1.5 transition-all cursor-pointer border-t-2 ${
            activeTab === 'tcdd_form'
              ? 'bg-white text-blue-700 border-t-blue-600 border-x border-slate-200 -mb-[1px] shadow-xs'
              : 'border-t-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5 text-blue-700" />
          <span>Personel Özlük Formu</span>
        </button>

        {/* Yedekle - Yükle */}
        <button
          id="nav-tab-yedekleme"
          onClick={() => setActiveTab('yedekleme')}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-lg flex items-center space-x-1.5 transition-all cursor-pointer border-t-2 ${
            activeTab === 'yedekleme'
              ? 'bg-white text-blue-700 border-t-blue-600 border-x border-slate-200 -mb-[1px] shadow-xs'
              : 'border-t-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-purple-600" />
          <span>Yedekle - Yükle</span>
        </button>
      </div>

      {/* 3. MODERN İŞLEM TOOLBARI */}
      <div className="bg-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
          {/* Resmi Yazdır / PDF Çıktısı */}
          <button
            id="btn-resmi-yazdir"
            onClick={onResmiYazdir}
            title="Resmi TCDD Raporunu Görüntüle ve Yazdır"
            className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-700" />
            <span>Resmi Yazdır / Döküm</span>
          </button>

          {/* Dışa Aktarma Butonları */}
          <button
            id="btn-excel-aktar"
            onClick={onExcelExport}
            title={`${aktifGrup === 'ISCI' ? 'İŞÇİ LİSTE' : 'MEMUR LİSTE'} Excel (.xlsx) İndir`}
            className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel'e Aktar (.xlsx)</span>
          </button>

          <button
            id="btn-pdf-aktar"
            onClick={onPdfExport}
            title={`${aktifGrup === 'ISCI' ? 'İŞÇİ LİSTE' : 'MEMUR LİSTE'} PDF İndir`}
            className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 cursor-pointer shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>PDF İndir</span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* Hızlı Yedek Al */}
          <button
            id="btn-hizli-yedek"
            onClick={() => {
              setActiveTab('yedekleme');
              onQuickBackup();
            }}
            title="Veritabanı Yedekleme ve Geri Yükleme"
            className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-amber-600" />
            <span>Yedek Al / Yükle (.tcddbak)</span>
          </button>
        </div>

        {/* Sağ: Yenileme */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-yenile"
            onClick={onRefresh}
            title="Verileri Merkezi Sunucu ile Yenile (F5)"
            className="px-2.5 py-1.5 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 transition-colors text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>Yenile (F5)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
