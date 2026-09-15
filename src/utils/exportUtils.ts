import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Personel, VeritabaniYedek } from '../types';

/**
 * jsPDF helvetica fontu için güvenli Türkçe harf dönüştürücü
 */
export function turkishSafePdfText(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return '-';
  const str = String(text);
  return str
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Ş/g, 'S')
    .replace(/ş/g, 's')
    .replace(/Ğ/g, 'G')
    .replace(/ğ/g, 'g')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c')
    .replace(/Ö/g, 'O')
    .replace(/ö/g, 'o')
    .replace(/Ü/g, 'U')
    .replace(/ü/g, 'u');
}

/**
 * Excel (.xlsx) formatında çıktı - Kullanıcının istediği bire bir aynı format
 */
export function exportPersonnelToExcel(
  personeller: Personel[],
  dosyaAdi = 'ISCI_PERSONEL_LISTESI'
): void {
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
    { wch: 28 }, // ÜNVANI
    { wch: 18 }, // TELEFONU
    { wch: 16 }, // TC KİMLİK NO
    { wch: 15 }, // DOĞUM TARİHİ
    { wch: 60 }, // ADRESİ
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'İŞÇİ PERSONEL');

  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${dosyaAdi}_${timestamp}.xlsx`);
}

/**
 * Resmi PDF çıktısı - Kullanıcının istediği 'İŞÇİ PERSONEL' formatında
 */
export function exportPersonnelToPdf(
  personeller: Personel[],
  baslik = 'ISCI PERSONEL'
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();
  const tarihStr = `${now.toLocaleDateString('tr-TR')}`;

  // Başlık Kutusu: İŞÇİ PERSONEL
  doc.setFillColor(240, 240, 240);
  doc.rect(14, 12, 269, 10, 'FD');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(turkishSafePdfText(baslik), 148.5, 18.5, { align: 'center' });

  const tableData = personeller.map((p, index) => [
    (index + 1).toString(),
    p.sicilNo || '-',
    p.personelNo || '-',
    turkishSafePdfText(p.ad),
    turkishSafePdfText(p.soyad),
    turkishSafePdfText(p.unvan || p.sanatKodu),
    p.cepTelefonu || '-',
    p.tcKimlik || '-',
    p.dogumTarihi || '-',
    turkishSafePdfText(p.adres),
  ]);

  autoTable(doc, {
    startY: 23,
    head: [[
      'SIRA NO',
      'SICILI',
      'PERSONEL NO',
      'ADI',
      'SOYADI',
      'UNVANI',
      'TELEFONU',
      'TC KIMLIK NO',
      'DOGUM TARIHI',
      'ADRESI'
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 14 },
      1: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 20 },
      3: { cellWidth: 26 },
      4: { cellWidth: 24, fontStyle: 'bold' },
      5: { cellWidth: 38 },
      6: { halign: 'center', cellWidth: 26 },
      7: { halign: 'center', cellWidth: 24 },
      8: { halign: 'center', cellWidth: 20 },
      9: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Sayfa ${data.pageNumber} | Tarih: ${tarihStr} | Toplam: ${personeller.length} Personel`,
        14,
        202
      );
    },
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`ISCI_PERSONEL_${timestamp}.pdf`);
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

  // Başlık
  doc.setFillColor(240, 240, 240);
  doc.rect(14, 12, 182, 12, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TCDD ISCI PERSONEL BILGI KARTI', 105, 19.5, { align: 'center' });

  autoTable(doc, {
    startY: 28,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, textColor: [0, 0, 0] },
    headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold' },
    body: [
      ['SICILI', p.sicilNo || '-'],
      ['PERSONEL NO', p.personelNo || '-'],
      ['ADI', turkishSafePdfText(p.ad)],
      ['SOYADI', turkishSafePdfText(p.soyad)],
      ['UNVANI', turkishSafePdfText(p.unvan || p.sanatKodu)],
      ['TELEFONU', p.cepTelefonu || '-'],
      ['TC KIMLIK NO', p.tcKimlik || '-'],
      ['DOGUM TARIHI', p.dogumTarihi || '-'],
      ['DOGUM YERI', turkishSafePdfText(p.dogumYeri)],
      ['KAN GRUBU', turkishSafePdfText(p.kanGrubu)],
      ['ISE GIRIS TARIHI', p.iseGirisTarihi || '-'],
      ['BITIRDIGI OKUL', turkishSafePdfText(p.bitirdigiOkul)],
      ['BOLUMU', turkishSafePdfText(p.bolumu)],
      ['ADRESI', turkishSafePdfText(p.adres)],
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
