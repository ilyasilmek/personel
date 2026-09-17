import React, { useMemo } from 'react';
import { Printer, Download, FileSpreadsheet } from 'lucide-react';
import { Personel, PersonelTuru } from '../types';
import { exportPersonnelToExcel, exportPersonnelToPdf, sortPersonellerByName } from '../utils/exportUtils';

interface PrintableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  personeller: Personel[];
  aktifGrup?: PersonelTuru;
  seciliPersonel?: Personel;
  raporTuru?: 'liste' | 'kart';
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  isOpen,
  onClose,
  personeller,
  aktifGrup = 'ISCI',
}) => {
  if (!isOpen) return null;

  const grupAdi = aktifGrup === 'MEMUR' ? 'MEMUR PERSONEL' : 'İŞÇİ PERSONEL';

  // Döküm listesi her zaman isme (ve ardından soyisme) göre alfabetik sıralanır
  const siraliPersoneller = useMemo(() => {
    return sortPersonellerByName(personeller);
  }, [personeller]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 font-sans print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white border-2 border-slate-400 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full">
        {/* Modal Kontrol Başlığı (Yazdırma esnasında gizlenir) */}
        <div className="bg-[#0055ea] text-white px-3 py-2 flex items-center justify-between font-bold text-xs select-none print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            <span>{grupAdi} - Resmi Çıktı &amp; Yazdırma Önizleme (İsme Göre Sıralı)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-xs rounded-xs flex items-center gap-1.5 shadow-xs cursor-pointer font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF Olarak Kaydet (Ctrl+P)</span>
            </button>
            <button
              onClick={() => exportPersonnelToExcel(siraliPersoneller, aktifGrup)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white px-2.5 py-1 text-xs rounded-xs flex items-center gap-1 shadow-xs cursor-pointer"
              title="Excel İndir"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => exportPersonnelToPdf(siraliPersoneller, aktifGrup)}
              className="bg-blue-800 hover:bg-blue-900 text-white px-2.5 py-1 text-xs rounded-xs flex items-center gap-1 shadow-xs cursor-pointer"
              title="PDF İndir"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF İndir</span>
            </button>
            <button
              onClick={onClose}
              className="hover:bg-red-600 text-white px-2 py-0.5 text-sm cursor-pointer rounded-xs ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Belge Önizleme Alanı (Yazdırılabilir Alan) */}
        <div className="flex-1 overflow-auto p-4 bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
          <div
            id="printable-report-content"
            className="bg-white p-6 max-w-5xl mx-auto shadow-md border border-slate-300 print:border-none print:shadow-none print:p-0 text-black"
          >
            {/* TABLO BAŞLIĞI - SCREENSHOT İLE BİRE BİR AYNI */}
            <div className="border border-black border-b-0 py-2.5 text-center bg-[#f2f4f7] print:bg-gray-100">
              <h1 className="text-base font-black tracking-widest text-black uppercase">
                {grupAdi}
              </h1>
            </div>

            {/* TABLO - SCREENSHOT FORMATINDA */}
            <div className="overflow-x-auto border border-black">
              <table className="w-full text-left border-collapse text-[10.5px] font-sans border-collapse">
                <thead>
                  <tr className="bg-[#e9ecef] print:bg-gray-200 border-b border-black font-bold text-black text-center">
                    <th className="p-1.5 border-r border-black w-12">SIRA NO</th>
                    <th className="p-1.5 border-r border-black w-18">SİCİLİ</th>
                    <th className="p-1.5 border-r border-black w-24">PERSONEL NO</th>
                    <th className="p-1.5 border-r border-black text-left w-36 px-2">ADI</th>
                    <th className="p-1.5 border-r border-black text-left w-32 px-2">SOYADI</th>
                    <th className="p-1.5 border-r border-black text-left w-48 px-2">ÜNVANI</th>
                    <th className="p-1.5 border-r border-black w-32">TELEFONU</th>
                    <th className="p-1.5 border-r border-black w-28">TC KİMLİK NO</th>
                    <th className="p-1.5 border-r border-black w-24">DOĞUM TARİHİ</th>
                    <th className="p-1.5 text-left px-2">ADRESİ</th>
                  </tr>
                </thead>
                <tbody>
                  {siraliPersoneller.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`border-b border-black ${idx % 2 === 1 ? 'bg-gray-50 print:bg-gray-50' : 'bg-white'}`}
                    >
                      <td className="p-1.5 border-r border-black text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="p-1.5 border-r border-black text-center font-bold font-mono">
                        {p.sicilNo}
                      </td>
                      <td className="p-1.5 border-r border-black text-center font-mono">
                        {p.personelNo}
                      </td>
                      <td className="p-1.5 border-r border-black px-2 font-medium">
                        {p.ad}
                      </td>
                      <td className="p-1.5 border-r border-black px-2 font-bold uppercase">
                        {p.soyad ? p.soyad.toLocaleUpperCase('tr-TR') : ''}
                      </td>
                      <td className="p-1.5 border-r border-black px-2">
                        {p.unvan || p.sanatKodu}
                      </td>
                      <td className="p-1.5 border-r border-black text-center font-mono whitespace-nowrap">
                        {p.cepTelefonu}
                      </td>
                      <td className="p-1.5 border-r border-black text-center font-mono">
                        {p.tcKimlik}
                      </td>
                      <td className="p-1.5 border-r border-black text-center font-mono">
                        {p.dogumTarihi}
                      </td>
                      <td className="p-1.5 px-2 text-[10px]">
                        {p.adres}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Alt Bilgi */}
            <div className="mt-4 pt-2 text-[10px] text-gray-500 flex justify-between items-center print:text-black">
              <div>Toplam: <b>{siraliPersoneller.length}</b> Personel (A-Z Sıralı)</div>
              <div>Tarih: {new Date().toLocaleDateString('tr-TR')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
