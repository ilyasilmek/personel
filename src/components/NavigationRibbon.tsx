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
    <div className="bg-[#ece9d8] border-b border-[#7f9db9] text-gray-800 select-none shadow-xs font-sans text-xs">
      {/* 1. TEK TAB: İŞÇİ / MEMUR KATEGORİSİ (Kullanıcı Talebi: İki adet tab'a gerek yok, bir tane yeter) */}
      <div className="bg-[#1f3a60] px-3 py-1.5 flex items-center justify-between border-b border-[#142844]">
        <div className="flex items-center space-x-2">
          <button
            id="single-tab-kategori"
            onClick={() => onGrupDegistir(aktifGrup === 'ISCI' ? 'MEMUR' : 'ISCI')}
            className="px-4 py-1.5 text-xs md:text-sm font-black rounded-md flex items-center space-x-2.5 bg-[#ece9d8] text-[#003366] hover:bg-white shadow-md cursor-pointer border-2 border-[#0055ea] transition-all group"
            title="Tıklayarak İŞÇİ ve MEMUR kadroları arasında geçiş yapabilirsiniz"
          >
            {aktifGrup === 'ISCI' ? (
              <Users className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            ) : (
              <Briefcase className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-[11px] text-gray-500 font-semibold">Kategori:</span>
            <span className="text-sm font-black tracking-wider text-blue-950">
              {aktifGrup === 'ISCI' ? 'İŞÇİ' : 'MEMUR'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-800 text-white">
              {aktifGrup === 'ISCI' ? `${isciSayisi} Kişi` : `${memurSayisi} Kişi`}
            </span>
            <span className="text-[11px] text-blue-700 underline font-normal ml-1 flex items-center gap-1 group-hover:text-blue-900">
              <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
              <span>({aktifGrup === 'ISCI' ? "Memur'a Geç" : "İşçi'ye Geç"})</span>
            </span>
          </button>
        </div>

        {/* Sağ: Genel Toplam */}
        <div className="hidden sm:flex items-center space-x-2 text-white/90 text-xs font-semibold pr-2">
          <span className="text-blue-200">Kayıtlı:</span>
          <span className="bg-blue-950 text-white px-2 py-0.5 rounded font-mono font-bold">
            {isciSayisi} İşçi + {memurSayisi} Memur (Toplam {isciSayisi + memurSayisi})
          </span>
        </div>
      </div>

      {/* 2. EKRAN GEZİNME BUTONLARI (Arama, Ekleme, Genel Liste, Form, Yedekleme) */}
      <div className="flex items-center px-2 pt-1 space-x-1 border-b border-[#d4d0c8] bg-[#e6e2d3]">
        {/* Arama Ekranı (Varsayılan Açılış Ekranı) */}
        <button
          id="nav-tab-arama"
          onClick={() => setActiveTab('arama')}
          className={`px-3 py-1.5 text-xs font-bold rounded-t-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'arama'
              ? 'bg-[#ece9d8] text-blue-900 border-t-2 border-t-blue-700 border-x border-[#7f9db9] -mb-[1px] shadow-xs'
              : 'text-gray-700 hover:text-black hover:bg-[#dfdbcb]'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-blue-700" />
          <span>Arama & Sorgulama</span>
        </button>

        {/* Personel Ekle (Boş Form Modu) */}
        <button
          id="nav-tab-personel-ekle"
          onClick={onYeniPersonelEkle}
          className="px-3 py-1.5 text-xs font-bold rounded-t-xs flex items-center space-x-1.5 transition-all cursor-pointer text-emerald-800 hover:text-emerald-950 hover:bg-[#d5eedf] border border-emerald-300 bg-[#e7f7ed]"
          title="Formu boş halde açarak yeni personel ekleyin"
        >
          <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
          <span>+ Personel Ekle</span>
        </button>

        {/* Genel Liste */}
        <button
          id="nav-tab-genel-liste"
          onClick={() => setActiveTab('genel_liste')}
          className={`px-3 py-1.5 text-xs font-bold rounded-t-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'genel_liste'
              ? 'bg-[#ece9d8] text-blue-900 border-t-2 border-t-blue-700 border-x border-[#7f9db9] -mb-[1px] shadow-xs'
              : 'text-gray-700 hover:text-black hover:bg-[#dfdbcb]'
          }`}
        >
          <Table className="w-3.5 h-3.5 text-indigo-700" />
          <span>Genel Liste (10 Sütun)</span>
        </button>

        {/* Personel Takip Formu */}
        <button
          id="nav-tab-tcdd-form"
          onClick={() => setActiveTab('tcdd_form')}
          className={`px-3 py-1.5 text-xs font-bold rounded-t-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'tcdd_form'
              ? 'bg-[#ece9d8] text-blue-900 border-t-2 border-t-blue-700 border-x border-[#7f9db9] -mb-[1px] shadow-xs'
              : 'text-gray-700 hover:text-black hover:bg-[#dfdbcb]'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5 text-blue-800" />
          <span>Personel Özlük Formu</span>
        </button>

        {/* Yedekle - Yükle */}
        <button
          id="nav-tab-yedekleme"
          onClick={() => setActiveTab('yedekleme')}
          className={`px-3 py-1.5 text-xs font-medium rounded-t-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'yedekleme'
              ? 'bg-[#ece9d8] text-blue-900 border-t-2 border-t-blue-700 border-x border-[#7f9db9] -mb-[1px] shadow-xs'
              : 'text-gray-700 hover:text-black hover:bg-[#dfdbcb]'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-purple-700" />
          <span>Yedekle - Yükle</span>
        </button>
      </div>

      {/* 3. TOOLBAR İŞLEM BUTONLARI */}
      <div className="bg-[#f5f4ef] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#d8d4c8]">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          {/* Resmi Yazdır / PDF Çıktısı (Türkçe Karakter Uyumlu) */}
          <button
            id="btn-resmi-yazdir"
            onClick={onResmiYazdir}
            title="Resmi TCDD Raporunu Görüntüle, Yazdır ve PDF Olarak Kaydet"
            className="px-2.5 py-1 rounded-xs text-[11px] font-bold flex items-center space-x-1.5 border border-[#7f9db9] bg-[#ece9d8] hover:bg-[#dfdbcb] text-blue-900 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-blue-700" />
            <span>Resmi Yazdır / PDF Dökümü</span>
          </button>

          {/* Dışa Aktarma Butonları */}
          <button
            id="btn-excel-aktar"
            onClick={onExcelExport}
            title="Personel Listesini Excel (.xlsx) Olarak İndir"
            className="px-2.5 py-1 rounded-xs text-[11px] font-medium flex items-center space-x-1.5 border border-[#7f9db9] bg-[#ece9d8] hover:bg-[#dfdbcb] text-emerald-900 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel'e Aktar (.xlsx)</span>
          </button>

          <button
            id="btn-pdf-aktar"
            onClick={onPdfExport}
            title="Personel Listesini Doğrudan PDF Olarak İndir"
            className="px-2.5 py-1 rounded-xs text-[11px] font-medium flex items-center space-x-1.5 border border-[#7f9db9] bg-[#ece9d8] hover:bg-[#dfdbcb] text-rose-900 cursor-pointer shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>PDF İndir</span>
          </button>

          <div className="h-4 w-px bg-gray-300 mx-1 hidden sm:block"></div>

          {/* Hızlı Yedek Al */}
          <button
            id="btn-hizli-yedek"
            onClick={() => {
              setActiveTab('yedekleme');
              onQuickBackup();
            }}
            title="Veritabanını Yedekle ve Yükle Paneli"
            className="px-2.5 py-1 rounded-xs text-[11px] font-medium flex items-center space-x-1.5 border border-[#7f9db9] bg-[#ece9d8] hover:bg-[#dfdbcb] text-amber-900 cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5 text-amber-600" />
            <span>Yedekle - Yükle (.tcddbak)</span>
          </button>
        </div>

        {/* Sağ: Yenileme */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-yenile"
            onClick={onRefresh}
            title="Verileri Merkezi Sunucu ile Yenile (F5)"
            className="p-1 rounded-xs text-gray-700 hover:text-black hover:bg-[#dfdbcb] border border-[#7f9db9] transition-all text-[11px] flex items-center gap-1 cursor-pointer bg-[#ece9d8] shadow-xs"
          >
            <RefreshCw className="w-3 h-3 text-gray-600" />
            <span>Yenile (F5)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
