export interface EgitimKurs {
  id: string;
  tarih: string;
  yil: string;
  egitimAdi: string;
}

export interface PersonelEvrak {
  id: string;
  ad: string;
  tarih: string;
  dosyaTuru: string;
  boyut: string;
}

export type RolTuru = 'Admin' | 'IK_Yoneticisi' | 'Muhasebe' | 'Operator' | 'Gozlemci';
export type DepartmanTuru = string;
export type DurumTuru = 'Aktif' | 'İzinli' | 'Ayrıldı' | 'Emekli' | 'Görevde' | 'Raporlu';
export type KanGrubuTuru = string;

export interface RolYetkileri {
  personelGoruntule: boolean;
  personelEkle: boolean;
  personelDuzenle: boolean;
  personelSil: boolean;
  maasGoruntule: boolean;
  disaAktar: boolean;
  raporGoruntule: boolean;
  yedekAl: boolean;
  kullaniciYonet: boolean;
}

export interface Kullanici {
  id: string;
  kullaniciAdi: string;
  adSoyad: string;
  email: string;
  rol: RolTuru;
  durum: 'Aktif' | 'Pasif';
  sonGiris: string;
}

export type PersonelTuru = 'ISCI' | 'MEMUR';

export interface Personel {
  id: string;
  personelTuru?: PersonelTuru;
  tcKimlik: string;
  sicilNo: string;
  personelNo?: string;
  ad: string;
  soyad: string;
  cinsiyet: 'Erkek' | 'Kadın';
  dogumYeri: string;
  dogumTarihi: string; // e.g. "14 Ekim 1983"
  medeniHal: 'Bekar' | 'Evli' | 'Dul';
  bitirdigiOkul: string;
  bolumu: string;
  kanGrubu: string; // e.g. "B RH ( + )"

  // İş Bilgileri
  iseGirisTarihi: string; // e.g. "30 Mayıs 2011"
  sanatKodu: string; // e.g. "Vagon İmal ve Tamirciliği"
  unvan?: string; // e.g. "SANATSIZ İŞÇİLİK", "TREN TEŞKİL İŞÇİLİĞİ"
  postasi?: string; // (Kaldırıldı - geriye dönük uyumluluk için opsiyonel)
  calistigiBirim: string; // e.g. "İdari Büro"

  // İletişim
  cepTelefonu: string;
  adres: string;

  // Fotoğraf & Belgeler
  fotografUrl?: string;
  egitimlerVeKurslar: EgitimKurs[];
  evraklar: PersonelEvrak[];

  // Ekstra Kurumsal / Bordro / Rapor
  maas?: number;
  departman?: string;
  pozisyon?: string;
  durum?: 'Aktif' | 'İzinli' | 'Ayrıldı';
  olusturmaTarihi: string;

  // Uyumluluk Alanları
  egitimDurumu?: string;
  telefon?: string;
  sehir?: string;
  email?: string;
}

export interface VeritabaniYedek {
  id: string;
  dosyaAdi: string;
  boyutKb: number;
  olusturmaTarihi: string;
  olusturan: string;
  format: 'MSSQL_BAK' | 'SQL_DUMP' | 'JSON_SNAPSHOT';
  durum: 'Doğrulandı' | 'Başarılı';
  kayitSayisi: number;
}

export interface SqlSorguSonucu {
  sorgu?: string;
  sutunlar: string[];
  satirlar: Record<string, any>[];
  mesaj: string;
  zaman: string;
  hata?: string;
}
