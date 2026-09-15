// TCDD Personel Eğitim ve Okul Müfredat Bölümleri Verisi

export const EGITIM_SEVIYELERI = [
  'İlkokul',
  'Ortaokul',
  'Genel Lise',
  'Meslek Lisesi',
  'Ön Lisans',
  'Lisans',
  'Yüksek Lisans',
  'Doktora',
] as const;

export type EgitimSeviyesi = (typeof EGITIM_SEVIYELERI)[number];

// Güncel MEB Mesleki ve Teknik Ortaöğretim Bölümleri
export const MESLEK_LISESI_BOLUMLERI = [
  'Raylı Sistemler Teknolojisi',
  'Makine ve Tasarım Teknolojisi',
  'Elektrik-Elektronik Teknolojisi',
  'Motorlu Araçlar Teknolojisi',
  'Metal Teknolojisi',
  'Bilişim Teknolojileri',
  'Endüstriyel Otomasyon Teknolojileri',
  'Tesisat Teknolojisi ve İklimlendirme',
  'Ulaştırma Hizmetleri (Lojistik)',
  'Harita-Tapu-Kadastro',
  'İnşaat Teknolojisi',
  'Kimya Teknolojisi',
  'Büro Yönetimi ve Yönetici Asistanlığı',
  'Muhasebe ve Finansman',
  'Torna Tesviye (Klasik)',
  'Metal İşleri (Klasik)',
  'Demiryolu Hareket ve Tesisler',
  'Döküm Teknolojisi',
  'Diğer Meslek Lisesi Alanı',
];

// Güncel YÖK Meslek Yüksekokulları (Ön Lisans) Bölümleri
export const ON_LISANS_BOLUMLERI = [
  'Raylı Sistemler Makine Teknolojisi',
  'Raylı Sistemler Elektrik ve Elektronik Teknolojisi',
  'Raylı Sistemler Yol Teknolojisi',
  'Raylı Sistemler İşletmeciliği',
  'Raylı Sistemler Makinistlik',
  'Makine',
  'Elektrik',
  'Elektronik Teknolojisi',
  'Mekatronik',
  'Otomotiv Teknolojisi',
  'Kaynak Teknolojisi',
  'Bilgisayar Programcılığı',
  'Bilişim Güvenliği Teknolojisi',
  'Lojistik',
  'İş Sağlığı ve Güvenliği',
  'Harita ve Kadastro',
  'Büro Yönetimi ve Yönetici Asistanlığı',
  'Muhasebe ve Vergi Uygulamaları',
  'İnsan Kaynakları Yönetimi',
  'Adalet',
  'Dış Ticaret',
  'Diğer Ön Lisans Programı',
];

// Güncel YÖK Lisans (4 Yıllık Fakülte) Bölümleri
export const LISANS_BOLUMLERI = [
  'Makine Mühendisliği',
  'Elektrik-Elektronik Mühendisliği',
  'Raylı Sistemler Mühendisliği',
  'İnşaat Mühendisliği',
  'Endüstri Mühendisliği',
  'Bilgisayar Mühendisliği',
  'Mekatronik Mühendisliği',
  'Metalurji ve Malzeme Mühendisliği',
  'Harita / Geomatik Mühendisliği',
  'Çevre Mühendisliği',
  'Ulaştırma Mühendisliği',
  'Otomotiv Mühendisliği',
  'İktisat',
  'İşletme',
  'Kamu Yönetimi / Siyaset Bilimi',
  'Maliye',
  'Çalışma Ekonomisi ve Endüstri İlişkileri',
  'Lojistik Yönetimi',
  'Uluslararası Ticaret ve Lojistik',
  'Hukuk',
  'İletişim / Halkla İlişkiler',
  'Diğer Lisans Programı',
];

// Genel Lise Bölüm / Alanları
export const GENEL_LISE_BOLUMLERI = [
  'Fen Bilimleri',
  'Türkçe - Matematik (Eşit Ağırlık)',
  'Sosyal Bilimler',
  'Yabancı Dil',
  'Genel / Alan Yok',
];

// Lisansüstü Bölüm / Alanları
export const LISANSUSTU_BOLUMLERI = [
  'Fen Bilimleri Enstitüsü (Mühendislik / Teknoloji)',
  'Sosyal Bilimler Enstitüsü (İşletme / İktisat / Yönetim)',
  'Raylı Sistemler ve Ulaştırma Anabilim Dalı',
  'İş Sağlığı ve Güvenliği Anabilim Dalı',
  'Diğer Enstitü / Anabilim Dalı',
];

/**
 * Mevcut personel string'inden eğitim seviyesini tespit eder
 */
export function getEgitimSeviyesi(okulStr?: string): EgitimSeviyesi | '' {
  if (!okulStr || !okulStr.trim()) return '';
  const clean = okulStr.trim().toLocaleLowerCase('tr-TR');

  if (clean.includes('ilkokul') || clean.includes('ilköğretim') || clean === 'ilk') return 'İlkokul';
  if (clean.includes('ortaokul') || clean === 'orta') return 'Ortaokul';
  if (clean.includes('meslek') || clean.includes('teknik') || clean.includes('endüstri') || clean.includes('eml') || clean.includes('çpl')) {
    return 'Meslek Lisesi';
  }
  if (clean.includes('ön lisans') || clean.includes('on lisans') || clean.includes('myo') || clean.includes('yüksekokul')) {
    return 'Ön Lisans';
  }
  if (clean.includes('yüksek lisans') || clean.includes('yuksek lisans') || clean.includes('master')) {
    return 'Yüksek Lisans';
  }
  if (clean.includes('doktora') || clean.includes('phd')) return 'Doktora';
  if (clean.includes('lisans') || clean.includes('fakülte') || clean.includes('fakulte') || clean.includes('üniversite') || clean.includes('universite')) {
    return 'Lisans';
  }
  if (clean.includes('lise')) return 'Genel Lise';

  // Doğrudan eşleşme kontrolü
  const match = EGITIM_SEVIYELERI.find((s) => s.toLocaleLowerCase('tr-TR') === clean);
  if (match) return match;

  return 'Genel Lise';
}

/**
 * Seçilen eğitim seviyesine göre bölüm listesini döndürür
 */
export function getBolumListesi(seviye: EgitimSeviyesi | ''): string[] {
  switch (seviye) {
    case 'İlkokul':
    case 'Ortaokul':
      return [];
    case 'Meslek Lisesi':
      return MESLEK_LISESI_BOLUMLERI;
    case 'Ön Lisans':
      return ON_LISANS_BOLUMLERI;
    case 'Lisans':
      return LISANS_BOLUMLERI;
    case 'Genel Lise':
      return GENEL_LISE_BOLUMLERI;
    case 'Yüksek Lisans':
    case 'Doktora':
      return LISANSUSTU_BOLUMLERI;
    default:
      return [];
  }
}
