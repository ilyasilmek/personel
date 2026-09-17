// 31. Dönem TİS (Toplu İş Sözleşmesi) Birleştirilmiş İş İsimleri (Sanat Dalları) - Alfabetik Sıralı
export const TIS_31_BIRLESTIRILMIS_IS_ISIMLERI = [
  'Akümülatör ve Batarya Bakımcısı',
  'Ambar / Depo Malzeme Takip İşçisi',
  'Beden İşçisi / Genel Temizlik İşçisi',
  'Boyacı (Kumlama / Endüstriyel / Oto)',
  'Büro İşçisi / Veri Hazırlama',
  'Demiryolu Hattı Bakım Onarımcısı',
  'Dökümcü ve Modelci',
  'Döşemeci ve Terzi',
  'Elektrifikasyon Tesisleri Bakım Onarımcısı',
  'Elektronik Bakım Onarımcısı',
  'Haberleşme ve Tesisler Bakım Onarımcısı',
  'Hidrolik - Pnömatik Bakımcısı',
  'İşçi Makinist',
  'Kaynakçı (Ray Kaynakçısı / Elektrik Ark)',
  'Koruma ve Güvenlik Görevlisi',
  'Lokomotif Bakım Onarımcısı (Elektrik)',
  'Lokomotif Bakım Onarımcısı (Mekanik)',
  'Lokomotif Revizörü',
  'Makinist',
  'Marangoz / Ağaç İşleri Ustası',
  'Mekanik Vasıta Operatörü (Drezin / Vinç)',
  'Motor ve Dizel Motor Bakımcısı',
  'Santralist / Danışma Görevlisi',
  'Sıcak ve Soğuk Demirci',
  'Sinyalizasyon Bakım Onarımcısı',
  'Soğutma ve İklimlendirme (Klima) Bakımcısı',
  'Şoför (Ağır Vasıta / Hizmet Aracı)',
  'Torna-Tesviyeci (Çark Torna / Talaşlı İmalat)',
  'Tren Teşkil Görevlisi (TTG)',
  'Tren Teşkil İşçisi / Manevracı',
  'Vagon Bakım Onarımcısı',
  'Vagon İmal ve Tamirciliği',
  'Vagon Teknisyeni',
  'Vinç ve Kaldırma Araçları Operatörü / Bakımcısı',
  'YHT Makinisti',
  'Yol Bakım Onarım İşçisi',
  'Yol Çavuşu',
] as const;

/**
 * Telefon numarasını 10 hane ve "... ... .. .." (ör. 532 123 45 67) formatına dönüştürür.
 */
export function formatPhoneNumber(val?: string | null): string {
  if (!val) return '';
  let digits = val.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);

  let formatted = '';
  if (digits.length > 0) {
    formatted = digits.slice(0, 3);
  }
  if (digits.length > 3) {
    formatted += ' ' + digits.slice(3, 6);
  }
  if (digits.length > 6) {
    formatted += ' ' + digits.slice(6, 8);
  }
  if (digits.length > 8) {
    formatted += ' ' + digits.slice(8, 10);
  }
  return formatted;
}

/**
 * Tarih alanını dd.mm.yyyy formatına dönüştürür veya maskeler.
 */
export function formatDateInput(val?: string | null): string {
  if (!val) return '';
  // Eğer sadece rakam girildiyse (ör: 12042014) otomatik dd.mm.yyyy yap
  const clean = val.trim();
  const digits = clean.replace(/\D/g, '');
  if (digits.length === 8 && !clean.includes('.')) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
  }
  // Eğer yyyy-mm-dd formatındaysa
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split('-');
    return `${d}.${m}.${y}`;
  }
  return clean;
}

/**
 * Otomatik e-posta adresi üretici:
 * Kişinin adı ve soyadından Türkçe karakterleri temizleyip "adsoyad@tcddtasimacilik.gov.tr" üretir.
 */
export function generateTcddEmail(ad: string, soyad: string): string {
  const clean = (str: string) =>
    (str || '')
      .toLocaleLowerCase('tr-TR')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '');

  const cAd = clean(ad);
  const cSoyad = clean(soyad);
  if (!cAd && !cSoyad) return '';
  return `${cAd}${cSoyad}@tcddtasimacilik.gov.tr`;
}
