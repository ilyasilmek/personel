import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Table,
  Printer,
  FileSpreadsheet,
  Phone,
  CreditCard,
  Building,
  Calendar,
  MapPin,
  ExternalLink,
  Users,
  Briefcase,
  Hash,
  Filter,
} from 'lucide-react';
import { Personel, PersonelTuru } from '../types';
import { searchMatches } from '../utils/textUtils';

interface PersonelAramaEkraniProps {
  personeller: Personel[];
  aktifGrup: PersonelTuru;
  onGrupDegistir: (grup: PersonelTuru) => void;
  onPersonelSecVeFormAc: (personelId: string) => void;
  onYeniPersonelEkle: () => void;
  onGenelListeAc: () => void;
  onResmiYazdir: (personeller?: Personel[], tekPersonel?: Personel) => void;
  onExcelExport: () => void;
}

type AramaKriteri =
  | 'hepsi'
  | 'adSoyad'
  | 'sicilNo'
  | 'personelNo'
  | 'tcKimlik'
  | 'unvan'
  | 'cepTelefonu'
  | 'adres';

export const PersonelAramaEkrani: React.FC<PersonelAramaEkraniProps> = ({
  personeller,
  aktifGrup,
  onGrupDegistir,
  onPersonelSecVeFormAc,
  onYeniPersonelEkle,
  onGenelListeAc,
  onResmiYazdir,
  onExcelExport,
}) => {
  const [aramaMetni, setAramaMetni] = useState('');
  const [aramaKriteri, setAramaKriteri] = useState<AramaKriteri>('hepsi');
  const [seciliPersonelId, setSeciliPersonelId] = useState<string | null>(null);

  // Aktif gruptaki personeller (İŞÇİ veya MEMUR)
  const gruptakiPersoneller = useMemo(() => {
    return personeller.filter((p) => {
      const tur = p.personelTuru || 'ISCI';
      return tur === aktifGrup;
    });
  }, [personeller, aktifGrup]);

  // Sayı sayımları
  const isciSayisi = useMemo(
    () => personeller.filter((p) => (p.personelTuru || 'ISCI') === 'ISCI').length,
    [personeller]
  );
  const memurSayisi = useMemo(
    () => personeller.filter((p) => p.personelTuru === 'MEMUR').length,
    [personeller]
  );

  // Arama filtresi (Kullanıcı Talebi: İlk açılışta liste boş gelsin!)
  const aramaSonuclari = useMemo(() => {
    const q = aramaMetni.trim();
    // Arama kutusuna bir şey yazılmadıkça sonuç listesi boş gelir
    if (!q) return [];

    return gruptakiPersoneller.filter((p) => {
      switch (aramaKriteri) {
        case 'adSoyad':
          return (
            searchMatches(p.ad, q) ||
            searchMatches(p.soyad, q) ||
            searchMatches(`${p.ad} ${p.soyad}`, q)
          );
        case 'sicilNo':
          return searchMatches(p.sicilNo, q);
        case 'personelNo':
          return searchMatches(p.personelNo, q);
        case 'tcKimlik':
          return searchMatches(p.tcKimlik, q);
        case 'unvan':
          return (
            searchMatches(p.unvan, q) ||
            searchMatches(p.sanatKodu, q) ||
            searchMatches(p.postasi, q)
          );
        case 'cepTelefonu':
          return searchMatches(p.cepTelefonu, q);
        case 'adres':
          return searchMatches(p.adres, q) || searchMatches(p.dogumYeri, q);
        case 'hepsi':
        default:
          return (
            searchMatches(p.ad, q) ||
            searchMatches(p.soyad, q) ||
            searchMatches(`${p.ad} ${p.soyad}`, q) ||
            searchMatches(p.sicilNo, q) ||
            searchMatches(p.personelNo, q) ||
            searchMatches(p.tcKimlik, q) ||
            searchMatches(p.unvan, q) ||
            searchMatches(p.sanatKodu, q) ||
            searchMatches(p.cepTelefonu, q) ||
            searchMatches(p.adres, q) ||
            searchMatches(p.dogumYeri, q) ||
            searchMatches(p.calistigiBirim, q)
          );
      }
    });
  }, [gruptakiPersoneller, aramaMetni, aramaKriteri]);

  // Seçili personel (aktif arama sonucundan ya da seçilen kayıttan)
  const seciliPersonel = useMemo(() => {
    if (seciliPersonelId) {
      const p = gruptakiPersoneller.find((x) => x.id === seciliPersonelId);
      if (p) return p;
    }
    return aramaSonuclari.length > 0 ? aramaSonuclari[0] : null;
  }, [seciliPersonelId, gruptakiPersoneller, aramaSonuclari]);

  // Enter'a basınca ilk sonucu doğrudan formda aç
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && seciliPersonel) {
      onPersonelSecVeFormAc(seciliPersonel.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 font-sans text-xs overflow-hidden select-none">
      {/* 1. MERKEZİ ARAMA BÖLÜMÜ VE EYLEMLER (Tekrarlanan başlık kaldırıldı) */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Arama Alanı ve Kriter Seçici */}
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Kriter Dropdown */}
            <div className="relative min-w-[180px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                id="select-arama-kriteri"
                value={aramaKriteri}
                onChange={(e) => setAramaKriteri(e.target.value as AramaKriteri)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
              >
                <option value="hepsi">🔍 Tüm Alanlarda Ara</option>
                <option value="adSoyad">👤 Ad veya Soyad</option>
                <option value="sicilNo">🔢 Sicil Numarası</option>
                <option value="personelNo">🏷️ Personel No</option>
                <option value="tcKimlik">🪪 T.C. Kimlik No</option>
                <option value="unvan">💼 Ünvan / Sanat Kodu</option>
                <option value="cepTelefonu">📱 Cep Telefonu</option>
                <option value="adres">📍 Adres / Şehir</option>
              </select>
            </div>

            {/* Arama Giriş Kutusu */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-arama-metni"
                type="text"
                autoFocus
                value={aramaMetni}
                onChange={(e) => setAramaMetni(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`${
                  aktifGrup === 'ISCI' ? 'İşçi' : 'Memur'
                } personel ara (Sicil no, isim, soyisim, TC no, unvan, telefon)...`}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
              />
              {aramaMetni && (
                <button
                  onClick={() => setAramaMetni('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-bold text-sm w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 cursor-pointer"
                  title="Aramayı Temizle"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* SAĞ EYLEMLER: PERSONEL EKLEME VE GENEL LİSTE SEÇENEKLERİ */}
          <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
            {/* Personel Ekleme Seçeneği (Formlar Boş Halde) */}
            <button
              id="btn-yeni-personel-ekle"
              onClick={onYeniPersonelEkle}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors active:scale-98"
              title="Yeni personel eklemek için boş form aç"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Personel Ekle</span>
            </button>

            {/* Genel Liste Seçeneği */}
            <button
              id="btn-genel-liste-ac"
              onClick={onGenelListeAc}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors active:scale-98"
              title="Tüm personel listesini aç"
            >
              <Table className="w-4 h-4" />
              <span>Genel Liste</span>
            </button>

            {/* Hızlı Çıktı / Excel */}
            <button
              onClick={() => onResmiYazdir(aramaSonuclari)}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 shadow-2xs cursor-pointer transition-colors"
              title="Mevcut arama sonuçlarını yazdır veya PDF olarak kaydet"
            >
              <Printer className="w-4 h-4 text-blue-600" />
            </button>

            <button
              onClick={onExcelExport}
              className="p-2 bg-slate-50 hover:bg-emerald-50 text-emerald-700 rounded-lg border border-slate-300 shadow-2xs cursor-pointer transition-colors"
              title="Excel formatında indir"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. ANA İÇERİK: ARAMA SONUÇ LİSTESİ VE SEÇİLİ PERSONEL BİLGİ DETAYI */}
      <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden p-2.5 sm:p-3 md:p-4 flex flex-col lg:flex-row gap-3 md:gap-4 max-w-7xl w-full mx-auto">
        {/* SOL: ARAMA SONUÇLARI LİSTESİ */}
        <div className="flex-1 min-h-[300px] lg:min-h-0 bg-white border border-[#cbd5e1] rounded-lg shadow-sm flex flex-col overflow-hidden">
          {/* Liste Başlığı */}
          <div className="bg-[#f1f5f9] px-4 py-2.5 border-b border-[#cbd5e1] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gray-800 text-xs uppercase tracking-wide">
                {aktifGrup === 'ISCI' ? 'İŞÇİ PERSONEL SONUÇLARI' : 'MEMUR PERSONEL SONUÇLARI'}
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                {aramaSonuclari.length} Kişi
              </span>
            </div>
            <span className="text-[11px] text-gray-500 hidden sm:inline">
              Kişiye tıklayarak önizleyin veya çift tıklayarak formda açın
            </span>
          </div>

          {/* Sonuç Tablosu / Listesi */}
          <div className="flex-1 overflow-y-auto">
            {aramaSonuclari.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#f8fafc] text-gray-600 font-semibold border-b border-gray-200 sticky top-0 z-10 select-none">
                  <tr>
                    <th className="p-2 pl-3 w-16 text-center">SİCİL</th>
                    <th className="p-2 w-24 text-center">PERS. NO</th>
                    <th className="p-2">AD SOYAD</th>
                    <th className="p-2">ÜNVAN / SANAT</th>
                    <th className="p-2 w-28 text-center">TELEFON</th>
                    <th className="p-2 w-24 text-center">İŞLEM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {aramaSonuclari.map((p) => {
                    const isSelected = seciliPersonel?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSeciliPersonelId(p.id)}
                        onDoubleClick={() => onPersonelSecVeFormAc(p.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white font-medium shadow-inner'
                            : 'hover:bg-blue-50 text-gray-800'
                        }`}
                      >
                        {/* Sicil */}
                        <td
                          className={`p-2 pl-3 text-center font-bold font-mono ${
                            isSelected ? 'text-yellow-300' : 'text-blue-900'
                          }`}
                        >
                          {p.sicilNo}
                        </td>

                        {/* Personel No */}
                        <td
                          className={`p-2 text-center font-mono ${
                            isSelected ? 'text-white' : 'text-gray-600'
                          }`}
                        >
                          {p.personelNo || '-'}
                        </td>

                        {/* Ad Soyad */}
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-[12.5px]">
                              {p.ad} {p.soyad}
                            </span>
                          </div>
                        </td>

                        {/* Ünvan */}
                        <td
                          className={`p-2 ${
                            isSelected ? 'text-blue-100' : 'text-gray-700 font-medium'
                          }`}
                        >
                          {p.unvan || p.sanatKodu}
                        </td>

                        {/* Telefon */}
                        <td
                          className={`p-2 text-center font-mono text-[11px] ${
                            isSelected ? 'text-white' : 'text-gray-600'
                          }`}
                        >
                          {p.cepTelefonu || '-'}
                        </td>

                        {/* İşlem Butonu */}
                        <td className="p-2 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPersonelSecVeFormAc(p.id);
                            }}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center justify-center space-x-1 mx-auto cursor-pointer ${
                              isSelected
                                ? 'bg-white text-blue-700 hover:bg-yellow-300 hover:text-blue-900'
                                : 'bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200'
                            }`}
                            title="Personelin tüm bilgilerini formda aç"
                          >
                            <span>Formda Aç</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : !aramaMetni.trim() ? (
              <div className="p-10 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <Search className="w-12 h-12 text-blue-400 mb-3" />
                <p className="text-sm font-bold text-gray-800">
                  {aktifGrup === 'ISCI' ? 'İşçi' : 'Memur'} Personel Arama & Sorgulama
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-md">
                  Personel aramak için yukarıdaki kutuya isim, sicil no, personel no, TC kimlik no veya unvan yazıp aratınız. Formu doldurmak veya personelleri görmek için aşağıdaki butonları kullanabilirsiniz.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                  <button
                    onClick={onGenelListeAc}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-md flex items-center space-x-2 text-xs shadow-xs cursor-pointer"
                    title="Tüm personel listesini resmi formatta açar"
                  >
                    <Table className="w-4 h-4" />
                    <span>Genel Liste ({gruptakiPersoneller.length} Kişi)</span>
                  </button>
                  <button
                    onClick={onYeniPersonelEkle}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md flex items-center space-x-2 text-xs shadow-xs cursor-pointer"
                    title="Boş form açarak yeni personel ekleyin"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Personel Ekle</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <Search className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-700">
                  "{aramaMetni}" kriterinde {aktifGrup === 'ISCI' ? 'işçi' : 'memur'} bulunamadı.
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                  Farklı bir isim, sicil numarası veya T.C. kimlik numarası ile aramayı
                  deneyebilir ya da doğrudan yeni personel ekleyebilirsiniz.
                </p>
                <button
                  onClick={onYeniPersonelEkle}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md flex items-center space-x-2 text-xs shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Yeni {aktifGrup === 'ISCI' ? 'İşçi' : 'Memur'} Personel Ekle</span>
                </button>
              </div>
            )}
          </div>

          {/* Alt Durum */}
          <div className="bg-[#f8fafc] px-4 py-2 border-t border-[#cbd5e1] flex items-center justify-between text-[11px] text-gray-500">
            <span>
              {aramaMetni.trim() ? (
                <>
                  Toplam <b>{gruptakiPersoneller.length}</b> kayıt arasından{' '}
                  <b>{aramaSonuclari.length}</b> kişi listelendi.
                </>
              ) : (
                <>
                  Arama yapılmadı (0 kayıt gösteriliyor). Toplam: <b>{gruptakiPersoneller.length}</b> {aktifGrup === 'ISCI' ? 'İşçi' : 'Memur'}
                </>
              )}
            </span>
            <button
              onClick={onGenelListeAc}
              className="text-blue-700 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>Genel Listeyi Aç ({gruptakiPersoneller.length})</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* SAĞ: SEÇİLİ PERSONEL BİLGİ KARTI VE HIZLI ERİŞİM */}
        <div className="w-full lg:w-80 xl:w-92 shrink-0 bg-white border border-[#cbd5e1] rounded-lg shadow-sm flex flex-col min-h-[380px] lg:min-h-0 overflow-hidden">
          {seciliPersonel ? (
            <div className="flex-1 min-h-0 flex flex-col h-full">
              {/* Kart Üst Başlık */}
              <div className="bg-[#003366] text-white p-3 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-18 bg-slate-200 border-2 border-white rounded shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                    {seciliPersonel.fotografUrl ? (
                      <img
                        src={seciliPersonel.fotografUrl}
                        alt="Personel"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-center font-bold text-[9px] p-1">
                        FOTOĞRAF YOK
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded-xs text-[9.5px] font-bold uppercase tracking-wide bg-amber-400 text-blue-950 mb-0.5">
                      {seciliPersonel.personelTuru || 'ISCI'} PERSONEL
                    </span>
                    <h3 className="text-sm font-black text-white truncate">
                      {seciliPersonel.ad} {seciliPersonel.soyad}
                    </h3>
                    <p className="text-blue-200 font-semibold text-xs truncate">
                      {seciliPersonel.unvan || seciliPersonel.sanatKodu}
                    </p>
                    <div className="flex items-center space-x-2 mt-0.5 text-[10.5px] font-mono text-yellow-300">
                      <span>Sicil: {seciliPersonel.sicilNo}</span>
                      <span>•</span>
                      <span>No: {seciliPersonel.personelNo || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detay Bilgi Alanları (Kaydırılabilir alan) */}
              <div className="flex-1 min-h-0 p-2.5 sm:p-3 overflow-y-auto space-y-2 bg-[#f8fafc] text-gray-800 text-xs">
                {/* T.C. Kimlik & Kan Grubu */}
                <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-md border border-gray-200 shadow-2xs">
                  <div>
                    <span className="text-[9.5px] text-gray-500 font-bold block flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-gray-400" /> TC KİMLİK NO
                    </span>
                    <span className="font-mono font-bold text-gray-900 text-xs">
                      {seciliPersonel.tcKimlik || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-gray-500 font-bold block">
                      KAN GRUBU
                    </span>
                    <span className="font-bold text-rose-700 text-xs">
                      {seciliPersonel.kanGrubu || '-'}
                    </span>
                  </div>
                </div>

                {/* İletişim Telefonu */}
                <div className="bg-white p-2 rounded-md border border-gray-200 shadow-2xs">
                  <span className="text-[9.5px] text-gray-500 font-bold block flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" /> TELEFON NUMARASI
                  </span>
                  <span className="font-mono font-bold text-emerald-800 text-xs sm:text-sm">
                    {seciliPersonel.cepTelefonu || '-'}
                  </span>
                </div>

                {/* Görev & Birim */}
                <div className="bg-white p-2 rounded-md border border-gray-200 shadow-2xs space-y-1">
                  <div>
                    <span className="text-[9.5px] text-gray-500 font-bold block flex items-center gap-1">
                      <Building className="w-3 h-3 text-blue-600" /> ÇALIŞTIĞI BİRİM / SERVİS
                    </span>
                    <span className="font-semibold text-gray-900 text-xs">
                      {seciliPersonel.calistigiBirim || 'Vagon Bakım Onarım Atelye Md.'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-gray-500 font-bold block">
                      POSTASI / GÖREVİ
                    </span>
                    <span className="text-gray-800 text-xs">
                      {seciliPersonel.postasi || '-'}
                    </span>
                  </div>
                </div>

                {/* Doğum & İşe Giriş */}
                <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-md border border-gray-200 shadow-2xs">
                  <div>
                    <span className="text-[9.5px] text-gray-500 font-bold block flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" /> DOĞUM TARİHİ
                    </span>
                    <span className="text-gray-800 font-medium text-xs">
                      {seciliPersonel.dogumTarihi || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-gray-500 font-bold block flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-gray-400" /> İŞE GİRİŞ
                    </span>
                    <span className="text-gray-800 font-medium text-xs">
                      {seciliPersonel.iseGirisTarihi || '-'}
                    </span>
                  </div>
                </div>

                {/* İkamet Adresi */}
                <div className="bg-white p-2 rounded-md border border-gray-200 shadow-2xs">
                  <span className="text-[9.5px] text-gray-500 font-bold block flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500" /> İKAMET ADRESİ
                  </span>
                  <span className="text-gray-700 text-xs leading-relaxed block mt-0.5 line-clamp-3">
                    {seciliPersonel.adres || '-'}
                  </span>
                </div>
              </div>

              {/* Kart Eylem Butonları (Her Zaman Sabit ve Görünür) */}
              <div className="shrink-0 p-2.5 bg-white border-t border-gray-200 flex flex-col gap-1.5 shadow-xs">
                <button
                  id="btn-kisi-formda-ac"
                  onClick={() => onPersonelSecVeFormAc(seciliPersonel.id)}
                  className="w-full py-2 bg-[#0055ea] hover:bg-[#0044bb] text-white font-bold rounded-md shadow-xs flex items-center justify-center space-x-1.5 text-xs cursor-pointer transition-all active:scale-98"
                  title="Personelin tüm bilgilerini formda aç"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Personel Özlük Formunu Aç</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onResmiYazdir(undefined, seciliPersonel)}
                    className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-md border border-gray-300 text-xs flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-700" />
                    <span>Özlük Kartı Yazdır</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
              <Users className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-xs font-semibold text-gray-600">Personel Seçilmedi</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Detayları ve hızlı bilgileri görmek için soldaki listeden bir personel seçin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
