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

// Güncel MEB Mesleki ve Teknik Ortaöğretim Bölümleri (Alfabetik Sıralı)
export const MESLEK_LISESI_BOLUMLERI = [
  'Bilişim Teknolojileri',
  'Büro Yönetimi ve Yönetici Asistanlığı',
  'Demiryolu Hareket ve Tesisler',
  'Döküm Teknolojisi',
  'Elektrik-Elektronik Teknolojisi',
  'Endüstriyel Otomasyon Teknolojileri',
  'Harita-Tapu-Kadastro',
  'İnşaat Teknolojisi',
  'Kimya Teknolojisi',
  'Makine ve Tasarım Teknolojisi',
  'Metal İşleri (Klasik)',
  'Metal Teknolojisi',
  'Motorlu Araçlar Teknolojisi',
  'Muhasebe ve Finansman',
  'Raylı Sistemler Teknolojisi',
  'Tesisat Teknolojisi ve İklimlendirme',
  'Torna Tesviye (Klasik)',
  'Ulaştırma Hizmetleri (Lojistik)',
  'Diğer Meslek Lisesi Alanı',
];

// Güncel YÖK Meslek Yüksekokulları (Ön Lisans) Bölümleri (Alfabetik Sıralı)
export const ON_LISANS_BOLUMLERI = [
  'Adalet',
  'Bilgisayar Programcılığı',
  'Bilişim Güvenliği Teknolojisi',
  'Büro Yönetimi ve Yönetici Asistanlığı',
  'Dış Ticaret',
  'Elektrik',
  'Elektronik Teknolojisi',
  'Harita ve Kadastro',
  'İnsan Kaynakları Yönetimi',
  'İş Sağlığı ve Güvenliği',
  'Kaynak Teknolojisi',
  'Lojistik',
  'Makine',
  'Mekatronik',
  'Muhasebe ve Vergi Uygulamaları',
  'Otomotiv Teknolojisi',
  'Raylı Sistemler Elektrik ve Elektronik Teknolojisi',
  'Raylı Sistemler İşletmeciliği',
  'Raylı Sistemler Makine Teknolojisi',
  'Raylı Sistemler Makinistlik',
  'Raylı Sistemler Yol Teknolojisi',
  'Diğer Ön Lisans Programı',
];

// Güncel YÖK Lisans (4 Yıllık Fakülte) Bölümleri (Alfabetik Sıralı)
export const LISANS_BOLUMLERI = [
  'Bilgisayar Mühendisliği',
  'Çalışma Ekonomisi ve Endüstri İlişkileri',
  'Çevre Mühendisliği',
  'Elektrik-Elektronik Mühendisliği',
  'Endüstri Mühendisliği',
  'Harita / Geomatik Mühendisliği',
  'Hukuk',
  'İktisat',
  'İletişim / Halkla İlişkiler',
  'İnşaat Mühendisliği',
  'İşletme',
  'Kamu Yönetimi / Siyaset Bilimi',
  'Lojistik Yönetimi',
  'Makine Mühendisliği',
  'Maliye',
  'Mekatronik Mühendisliği',
  'Metalurji ve Malzeme Mühendisliği',
  'Otomotiv Mühendisliği',
  'Raylı Sistemler Mühendisliği',
  'Ulaştırma Mühendisliği',
  'Uluslararası Ticaret ve Lojistik',
  'Diğer Lisans Programı',
];

// Genel Lise Bölüm / Alanları (Alfabetik Sıralı)
export const GENEL_LISE_BOLUMLERI = [
  'Fen Bilimleri',
  'Genel / Alan Yok',
  'Sosyal Bilimler',
  'Türkçe - Matematik (Eşit Ağırlık)',
  'Yabancı Dil',
];

// Lisansüstü Bölüm / Alanları (Alfabetik Sıralı)
export const LISANSUSTU_BOLUMLERI = [
  'Fen Bilimleri Enstitüsü (Mühendislik / Teknoloji)',
  'İş Sağlığı ve Güvenliği Anabilim Dalı',
  'Raylı Sistemler ve Ulaştırma Anabilim Dalı',
  'Sosyal Bilimler Enstitüsü (İşletme / İktisat / Yönetim)',
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
