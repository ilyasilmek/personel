import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Personel, VeritabaniYedek } from '../types';
import { registerTurkishFont } from './turkishPdfFont';

/**
 * jsPDF helvetica fontu için güvenli Türkçe harf dönüştürücü (gerekirse geriye dönük uyumluluk)
 */
export function turkishSafePdfText(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return '-';
  return String(text);
}

/**
 * Excel (.xlsx) formatında çıktı - Kullanıcının istediği:
 * İşçi bölümündeyse -> ISCI_LISTE.xlsx (Sayfa: İŞÇİ LİSTE)
 * Memur bölümündeyse -> MEMUR_LISTE.xlsx (Sayfa: MEMUR LİSTE)
 */
export function exportPersonnelToExcel(
  personeller: Personel[],
  grupVeyaDosyaAdi: string = 'ISCI'
): void {
  const isMemur =
    grupVeyaDosyaAdi === 'MEMUR' ||
    grupVeyaDosyaAdi.toUpperCase().includes('MEMUR');

  const dosyaAdi = isMemur ? 'MEMUR LİSTE' : 'İŞÇİ LİSTE';
  const sayfaAdi = isMemur ? 'MEMUR LİSTE' : 'İŞÇİ LİSTE';

  const data = personeller.map((p, index) => ({
    'SIRA NO': index + 1,
    'SİCİLİ': p.sicilNo || '-',
    'PERSONEL NO': p.personelNo || '-',
    'ADI': p.ad || '-',
    'SOYADI': p.soyad || '-',
    'ÜNVANI': p.unvan || p.sanatKodu || '-',
    'TELEFONU': p.cepTelefonu || '-',
    'TC KİMLİK NO': p.tcKimlik || '-',
    'DOĞUM TARİHİ': p.dogumTarihi || '-',
    'ADRESİ': p.adres || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 10 }, // SIRA NO
    { wch: 12 }, // SİCİLİ
    { wch: 16 }, // PERSONEL NO
    { wch: 20 }, // ADI
    { wch: 18 }, // SOYADI
    { wch: 32 }, // ÜNVANI
    { wch: 18 }, // TELEFONU
    { wch: 16 }, // TC KİMLİK NO
    { wch: 15 }, // DOĞUM TARİHİ
    { wch: 60 }, // ADRESİ
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sayfaAdi);

  XLSX.writeFile(workbook, `${dosyaAdi}.xlsx`);
}

/**
 * Resmi PDF çıktısı - Kullanıcının istediği:
 * İşçi bölümündeyse -> ISCI_LISTE.pdf (Başlık: İŞÇİ LİSTE)
 * Memur bölümündeyse -> MEMUR_LISTE.pdf (Başlık: MEMUR LİSTE)
 */
export function exportPersonnelToPdf(
  personeller: Personel[],
  grupVeyaBaslik: string = 'ISCI'
): void {
  const isMemur =
    grupVeyaBaslik === 'MEMUR' ||
    grupVeyaBaslik.toUpperCase().includes('MEMUR');

  const dosyaAdi = isMemur ? 'MEMUR LİSTE' : 'İŞÇİ LİSTE';
  const baslikText = isMemur ? 'MEMUR LİSTE' : 'İŞÇİ LİSTE';

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Türkçe font kaydı (İlyas İLMEK, Şakir, Çağlar gibi harfleri eksiksiz destekler)
  registerTurkishFont(doc);

  const now = new Date();
  const tarihStr = `${now.toLocaleDateString('tr-TR')}`;

  // Başlık Kutusu
  doc.setFillColor(240, 244, 248);
  doc.rect(12, 10, 273, 9, 'FD');

  doc.setTextColor(15, 43, 72);
  doc.setFontSize(13);
  doc.setFont('LiberationSans', 'bold');
  doc.text(baslikText, 148.5, 16.5, { align: 'center' });

  // Tek sayfaya net ve okunaklı sığdırma ölçeklendirmesi (25+ satır için optimize)
  const count = personeller.length;
  const dynamicFontSize = count > 28 ? 6.5 : count > 20 ? 7.1 : 7.6;
  const dynamicPadding = count > 28 ? 0.8 : count > 20 ? 1.05 : 1.5;

  const tableData = personeller.map((p, index) => [
    (index + 1).toString(),
    p.sicilNo || '-',
    p.personelNo || '-',
    p.ad || '-',
    p.soyad || '-',
    p.unvan || p.sanatKodu || '-',
    p.cepTelefonu || '-',
    p.tcKimlik || '-',
    p.dogumTarihi || '-',
    p.adres || '-',
  ]);

  autoTable(doc, {
    startY: 21,
    head: [[
      'SIRA NO',
      'SİCİLİ',
      'PERSONEL NO',
      'ADI',
      'SOYADI',
      'ÜNVANI',
      'TELEFONU',
      'TC KİMLİK NO',
      'DOĞUM TARİHİ',
      'ADRESİ'
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'LiberationSans',
      fontSize: dynamicFontSize,
      cellPadding: dynamicPadding,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.1,
      overflow: 'ellipsize',
    },
    headStyles: {
      fillColor: [15, 43, 72],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      font: 'LiberationSans',
      halign: 'center',
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 13 },
      1: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25, fontStyle: 'bold' },
      5: { cellWidth: 36 },
      6: { halign: 'center', cellWidth: 24 },
      7: { halign: 'center', cellWidth: 24 },
      8: { halign: 'center', cellWidth: 19 },
      9: { cellWidth: 'auto' },
    },
    margin: { left: 12, right: 12, bottom: 10 },
    didDrawPage: (data) => {
      doc.setFont('LiberationSans', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Gebze Vagon Bakım Atölye Müdürlüğü Personel Takip | Sayfa ${data.pageNumber} | Tarih: ${tarihStr} | Toplam: ${personeller.length} Personel`,
        12,
        204
      );
    },
  });

  doc.save(`${dosyaAdi}.pdf`);
}

/**
 * Tek bir personelin özlük kartını PDF olarak yazdırır
 */
export function exportSinglePersonnelPdf(p: Personel): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Türkçe font kaydı
  registerTurkishFont(doc);

  // Başlık
  doc.setFillColor(240, 244, 248);
  doc.rect(14, 12, 182, 12, 'FD');
  doc.setTextColor(15, 43, 72);
  doc.setFontSize(12);
  doc.setFont('LiberationSans', 'bold');
  doc.text('GEBZE VAGON BAKIM ATÖLYE MÜDÜRLÜĞÜ — PERSONEL BİLGİ KARTI', 105, 19.5, { align: 'center' });

  autoTable(doc, {
    startY: 28,
    theme: 'grid',
    styles: { font: 'LiberationSans', fontSize: 9, cellPadding: 2, textColor: [15, 23, 42] },
    headStyles: { font: 'LiberationSans', fillColor: [15, 43, 72], textColor: [255, 255, 255], fontStyle: 'bold' },
    body: [
      ['SİCİLİ', p.sicilNo || '-'],
      ['PERSONEL NO', p.personelNo || '-'],
      ['ADI', p.ad || '-'],
      ['SOYADI', p.soyad || '-'],
      ['ÜNVANI', p.unvan || p.sanatKodu || '-'],
      ['TELEFONU', p.cepTelefonu || '-'],
      ['TC KİMLİK NO', p.tcKimlik || '-'],
      ['DOĞUM TARİHİ', p.dogumTarihi || '-'],
      ['DOĞUM YERİ', p.dogumYeri || '-'],
      ['KAN GRUBU', p.kanGrubu || '-'],
      ['İŞE GİRİŞ TARİHİ', p.iseGirisTarihi || '-'],
      ['BİTİRDİĞİ OKUL', p.bitirdigiOkul || '-'],
      ['BÖLÜMÜ', p.bolumu || '-'],
      ['ADRESİ', p.adres || '-'],
    ],
    margin: { left: 14, right: 14 },
  });

  doc.save(`Personel_${p.sicilNo || 'karti'}.pdf`);
}

/**
 * TCDD SQL/Veritabanı Yedek Dosyası İndirme
 */
export function exportTcddBakFile(
  param1?: Personel[] | VeritabaniYedek,
  param2?: Personel[] | VeritabaniYedek
): void {
  let personeller: Personel[] = [];
  let yedek: VeritabaniYedek | undefined;

  if (Array.isArray(param1)) {
    personeller = param1;
    if (param2 && !Array.isArray(param2)) {
      yedek = param2;
    }
  } else if (param1 && typeof param1 === 'object') {
    yedek = param1;
    if (Array.isArray(param2)) {
      personeller = param2;
    }
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const fallbackDosyaAdi = `TCDD_PersonelDb_Yedek_${timestamp}.tcddbak`;

  const dosyaAdi =
    yedek && typeof yedek.dosyaAdi === 'string' && yedek.dosyaAdi.trim()
      ? yedek.dosyaAdi.trim()
      : fallbackDosyaAdi;

  const content = JSON.stringify(
    {
      baslik: 'TCDD PERSONEL VERITABANI YEDEK DOSYASI',
      yedekBilgisi: yedek || {
        id: `bak-${timestamp}`,
        dosyaAdi,
        olusturmaTarihi: now.toLocaleString('tr-TR'),
        format: 'MSSQL_BAK',
        kayitSayisi: personeller.length,
      },
      olusturulma: now.toISOString(),
      toplamKayit: personeller.length,
      personeller,
    },
    null,
    2
  );

  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  const isKnownExt =
    typeof dosyaAdi === 'string' &&
    (dosyaAdi.endsWith('.json') ||
      dosyaAdi.endsWith('.bak') ||
      dosyaAdi.endsWith('.tcddbak'));

  a.download = isKnownExt ? dosyaAdi : `${dosyaAdi}.tcddbak`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
