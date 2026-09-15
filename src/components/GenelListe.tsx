import React, { useState, useMemo } from 'react';
import { Personel, PersonelTuru } from '../types';
import {
  Search,
  FileSpreadsheet,
  Edit3,
  Printer,
  ArrowUpDown,
  ArrowLeft,
  UserPlus,
} from 'lucide-react';
import { exportPersonnelToExcel } from '../utils/exportUtils';
import { searchMatches } from '../utils/textUtils';

interface GenelListeProps {
  personeller: Personel[];
  aktifGrup?: PersonelTuru;
  onPersonelSecVeDuzenle: (personelId: string) => void;
  onPersonelSil: (id: string) => void;
  showToast: (msg: string) => void;
  onResmiYazdir?: (personeller?: Personel[], tekPersonel?: Personel) => void;
  onAramaEkraninaDon?: () => void;
  onYeniPersonelEkle?: () => void;
}

type SortField = 'siraNo' | 'sicilNo' | 'personelNo' | 'ad' | 'soyad' | 'unvan' | 'cepTelefonu' | 'tcKimlik' | 'dogumTarihi' | 'adres';
type SortOrder = 'asc' | 'desc';

export const GenelListe: React.FC<GenelListeProps> = ({
  personeller,
  aktifGrup = 'ISCI',
  onPersonelSecVeDuzenle,
  showToast,
  onResmiYazdir,
  onAramaEkraninaDon,
  onYeniPersonelEkle,
}) => {
  const [aramaMetni, setAramaMetni] = useState('');
  const [sortField, setSortField] = useState<SortField>('sicilNo');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [seciliId, setSeciliId] = useState<string>(personeller[0]?.id || '');

  // Sadece aktif gruptaki (İŞÇİ veya MEMUR) personelleri filtrele
  const gruptakiPersoneller = useMemo(() => {
    return personeller.filter((p) => {
      const tur = p.personelTuru || 'ISCI';
      return tur === aktifGrup;
    });
  }, [personeller, aktifGrup]);

  // Arama filtresi (Türkçe büyük/küçük harf duyarsız)
  const filtrelenmisPersoneller = useMemo(() => {
    let sonuc = gruptakiPersoneller.filter(p => {
      if (!aramaMetni.trim()) return true;
      return (
        searchMatches(p.sicilNo, aramaMetni) ||
        searchMatches(p.personelNo, aramaMetni) ||
        searchMatches(p.ad, aramaMetni) ||
        searchMatches(p.soyad, aramaMetni) ||
        searchMatches(`${p.ad} ${p.soyad}`, aramaMetni) ||
        searchMatches(p.unvan || p.sanatKodu, aramaMetni) ||
        searchMatches(p.cepTelefonu, aramaMetni) ||
        searchMatches(p.tcKimlik, aramaMetni) ||
        searchMatches(p.dogumTarihi, aramaMetni) ||
        searchMatches(p.adres, aramaMetni)
      );
    });

    // Sıralama
    if (sortField) {
      sonuc.sort((a, b) => {
        let valA = '';
        let valB = '';
        if (sortField === 'unvan') {
          valA = a.unvan || a.sanatKodu || '';
          valB = b.unvan || b.sanatKodu || '';
        } else {
          valA = (a[sortField] || '').toString();
          valB = (b[sortField] || '').toString();
        }
        const comp = valA.localeCompare(valB, 'tr-TR', { numeric: true, sensitivity: 'base' });
        return sortOrder === 'asc' ? comp : -comp;
      });
    }

    return sonuc;
  }, [gruptakiPersoneller, aramaMetni, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const seciliPersonel = personeller.find(p => p.id === seciliId);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] text-black font-sans text-xs select-none overflow-hidden">
      {/* ÜST İŞLEM VE ARAMA ÇUBUĞU */}
      <div className="bg-[#e4e7eb] border-b border-[#bdc3c7] px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Arama Kutusu */}
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              placeholder="Listede ara (Ad, Soyad, Sicil, Ünvan, Telefon, T.C., Adres)..."
              className="w-full bg-white border border-[#95a5a6] rounded-xs pl-8 pr-7 py-1 text-xs text-black placeholder:text-gray-400 focus:outline-none focus:border-blue-700 shadow-inner"
            />
            {aramaMetni && (
              <button
                onClick={() => setAramaMetni('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black font-bold text-xs"
              >
                ×
              </button>
            )}
          </div>
          <span className="text-[11px] text-gray-600 whitespace-nowrap">
            (<b>{filtrelenmisPersoneller.length}</b> kayıt)
          </span>
        </div>

        {/* Eylem Butonları */}
        <div className="flex items-center space-x-2">
          {onAramaEkraninaDon && (
            <button
              onClick={onAramaEkraninaDon}
              className="px-3 py-1.5 bg-[#f8fafc] hover:bg-gray-200 text-gray-800 font-bold rounded-xs border border-[#95a5a6] shadow-xs flex items-center space-x-1 cursor-pointer text-xs"
              title="Arama ekranına geri dön"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-700" />
              <span>Arama Ekranı</span>
            </button>
          )}

          {onYeniPersonelEkle && (
            <button
              onClick={onYeniPersonelEkle}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xs border border-emerald-800 shadow-xs flex items-center space-x-1 cursor-pointer text-xs"
              title="Yeni personel ekleme formunu boş aç"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Personel Ekle</span>
            </button>
          )}

          {seciliPersonel && (
            <button
              onClick={() => onPersonelSecVeDuzenle(seciliPersonel.id)}
              className="px-3 py-1.5 bg-[#316ac5] hover:bg-[#25549d] text-white font-semibold rounded-xs border border-blue-900 shadow-xs flex items-center space-x-1 cursor-pointer text-xs"
              title="Seçili personeli Personel Takip Ekranında düzenle"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Formda Düzenle ({seciliPersonel.ad} {seciliPersonel.soyad})</span>
            </button>
          )}

          {onResmiYazdir && (
            <button
              onClick={() => onResmiYazdir(filtrelenmisPersoneller)}
              className="px-3 py-1.5 bg-[#0055ea] hover:bg-[#0044bb] text-white font-bold rounded-xs border border-blue-900 shadow-xs flex items-center space-x-1 cursor-pointer text-xs"
              title="Bu formatta resmi çıktı al veya PDF olarak kaydet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Çıktı Al / Yazdır (PDF)</span>
            </button>
          )}

          <button
            onClick={() => {
              exportPersonnelToExcel(
                filtrelenmisPersoneller,
                aktifGrup === 'MEMUR' ? 'MEMUR_PERSONEL_LISTESI' : 'ISCI_PERSONEL_LISTESI'
              );
              showToast('Personel listesi Excel olarak indirildi.');
            }}
            className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 font-semibold rounded-xs border border-[#95a5a6] shadow-xs flex items-center space-x-1 cursor-pointer text-xs"
            title="Mevcut listeyi Excel formatında indir"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel'e Aktar</span>
          </button>
        </div>
      </div>

      {/* BELGE GÖRÜNÜMÜ ÇERÇEVESİ */}
      <div className="flex-1 overflow-auto p-3 bg-white">
        <div className="w-full">
          {/* TABLO BAŞLIĞI - SCREENSHOT İLE BİRE BİR AYNI */}
          <div className="bg-[#f2f4f7] border border-gray-400 border-b-0 py-2 text-center">
            <h2 className="text-sm font-black tracking-widest text-black uppercase">
              {aktifGrup === 'MEMUR' ? 'MEMUR PERSONEL' : 'İŞÇİ PERSONEL'}
            </h2>
          </div>

          {/* TABLO GÖVDESİ - SCREENSHOT İLE BİRE BİR AYNI SÜTUNLAR */}
          <div className="overflow-x-auto border border-gray-400">
            <table className="w-full text-left border-collapse text-[11px] font-sans">
              <thead className="bg-[#e9ecef] sticky top-0 select-none z-10">
                <tr className="border-b border-gray-400 font-bold text-black text-center">
                  <th
                    onClick={() => handleSort('siraNo')}
                    className="p-1.5 border-r border-gray-400 w-14 cursor-pointer hover:bg-gray-300"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>SIRA NO</span>
                      <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('sicilNo')}
                    className="p-1.5 border-r border-gray-400 w-20 cursor-pointer hover:bg-gray-300"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>SİCİLİ</span>
                      <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('personelNo')}
                    className="p-1.5 border-r border-gray-400 w-24 cursor-pointer hover:bg-gray-300"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>PERSONEL NO</span>
                      <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('ad')}
                    className="p-1.5 border-r border-gray-400 text-left w-36 px-2 cursor-pointer hover:bg-gray-300"
                  >
                    <div className="flex items-center justify-between">
                      <span>ADI</span>
                      <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('soyad')}
                    className="p-1.5 border-r border-gray-400 text-left w-32 px-2 cursor-pointer hover:bg-gray-300"
                  >
                    <div className="flex items-center justify-between">
                      <span>SOYADI</span>
                      <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('unvan')}
                    className="p-1.5 border-r border-gray-400 text-left w-48 px-2 cursor-pointer hover:bg-gray-300"
                  >
                    <div className="flex items-center justify-between">
                      <span>ÜNVANI</span>
                      <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('cepTelefonu')}
                    className="p-1.5 border-r border-gray-400 w-32 cursor-pointer hover:bg-gray-300"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>TELEFONU</span>
                      <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('tcKimlik')}
                    className="p-1.5 border-r border-gray-400 w-28 cursor-pointer hover:bg-gray-300"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>TC KİMLİK NO</span>
                      <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('dogumTarihi')}
                    className="p-1.5 border-r border-gray-400 w-24 cursor-pointer hover:bg-gray-300"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>DOĞUM TARİHİ</span>
                      <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('adres')}
                    className="p-1.5 text-left px-2 cursor-pointer hover:bg-gray-300 min-w-[240px]"
                  >
                    <div className="flex items-center justify-between">
                      <span>ADRESİ</span>
                      <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrelenmisPersoneller.map((p, idx) => {
                  const isSelected = p.id === seciliId;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSeciliId(p.id)}
                      onDoubleClick={() => onPersonelSecVeDuzenle(p.id)}
                      className={`border-b border-gray-300 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#316ac5] text-white font-medium'
                          : idx % 2 === 0
                          ? 'bg-white hover:bg-blue-50 text-gray-900'
                          : 'bg-[#fafafa] hover:bg-blue-50 text-gray-900'
                      }`}
                      title="Düzenlemek için çift tıklayınız"
                    >
                      {/* SIRA NO */}
                      <td className={`p-1.5 border-r text-center ${isSelected ? 'border-blue-400 text-yellow-200 font-bold' : 'border-gray-300 text-gray-600'}`}>
                        {idx + 1}
                      </td>

                      {/* SİCİLİ */}
                      <td className={`p-1.5 border-r text-center font-bold font-mono ${isSelected ? 'border-blue-400 text-white' : 'border-gray-300 text-black'}`}>
                        {p.sicilNo}
                      </td>

                      {/* PERSONEL NO */}
                      <td className={`p-1.5 border-r text-center font-mono ${isSelected ? 'border-blue-400 text-white' : 'border-gray-300 text-gray-800'}`}>
                        {p.personelNo}
                      </td>

                      {/* ADI */}
                      <td className={`p-1.5 border-r px-2 ${isSelected ? 'border-blue-400 text-white font-semibold' : 'border-gray-300 text-gray-900'}`}>
                        {p.ad}
                      </td>

                      {/* SOYADI */}
                      <td className={`p-1.5 border-r px-2 font-bold ${isSelected ? 'border-blue-400 text-white' : 'border-gray-300 text-gray-900'}`}>
                        {p.soyad}
                      </td>

                      {/* ÜNVANI */}
                      <td className={`p-1.5 border-r px-2 ${isSelected ? 'border-blue-400 text-blue-100' : 'border-gray-300 text-gray-800'}`}>
                        {p.unvan || p.sanatKodu}
                      </td>

                      {/* TELEFONU */}
                      <td className={`p-1.5 border-r text-center font-mono text-[10.5px] ${isSelected ? 'border-blue-400 text-white' : 'border-gray-300 text-gray-800'}`}>
                        {p.cepTelefonu}
                      </td>

                      {/* TC KİMLİK NO */}
                      <td className={`p-1.5 border-r text-center font-mono text-[10.5px] ${isSelected ? 'border-blue-400 text-white' : 'border-gray-300 text-gray-800'}`}>
                        {p.tcKimlik}
                      </td>

                      {/* DOĞUM TARİHİ */}
                      <td className={`p-1.5 border-r text-center font-mono text-[10.5px] ${isSelected ? 'border-blue-400 text-white' : 'border-gray-300 text-gray-800'}`}>
                        {p.dogumTarihi}
                      </td>

                      {/* ADRESİ */}
                      <td className={`p-1.5 px-2 text-[10.5px] ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {p.adres}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtrelenmisPersoneller.length === 0 && (
              <div className="py-12 text-center text-gray-500 bg-white">
                <p className="text-sm font-semibold">Aranan kriterde personel bulunamadı.</p>
                <p className="text-xs mt-1 text-gray-400">Arama metnini temizleyerek tüm listeyi görebilirsiniz.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ALT BİLGİ VE KISAYOL BİLGİLENDİRMESİ */}
      <div className="bg-[#e4e7eb] border-t border-[#bdc3c7] px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-gray-700 shadow-xs">
        <div className="flex items-center space-x-2">
          {seciliPersonel ? (
            <div className="flex items-center space-x-2">
              <span className="font-bold text-blue-900">Seçili Personel:</span>
              <span className="font-mono bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded-xs font-bold">
                [{seciliPersonel.sicilNo}] {seciliPersonel.ad} {seciliPersonel.soyad}
              </span>
              <span className="text-gray-600">• {seciliPersonel.unvan || seciliPersonel.sanatKodu}</span>
            </div>
          ) : (
            <span>Bir personel satırına tıklayarak seçim yapabilirsiniz.</span>
          )}
        </div>

        <div className="text-gray-500 italic">
          İpucu: Bir personele <b>çift tıklayarak</b> formda düzenleyebilirsiniz.
        </div>
      </div>
    </div>
  );
};
