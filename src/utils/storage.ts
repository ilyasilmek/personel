import { Personel, Kullanici, VeritabaniYedek, SqlSorguSonucu } from '../types';
import { BASLANGIC_PERSONELLER, BASLANGIC_KULLANICILAR, BASLANGIC_YEDEKLER } from '../data/initialData';

const STORAGE_KEY_PERSONEL = 'tcdd_personel_data_v5';
const STORAGE_KEY_KULLANICI = 'tcdd_kullanici_data_v5';
const STORAGE_KEY_YEDEK = 'tcdd_yedek_data_v5';
const STORAGE_KEY_CUSTOM_SERVER = 'tcdd_custom_server_url';

export function getCustomServerUrl(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_SERVER) || '';
  } catch {
    return '';
  }
}

export function setCustomServerUrl(url: string): void {
  try {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (!trimmed) {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_SERVER);
    } else {
      localStorage.setItem(STORAGE_KEY_CUSTOM_SERVER, trimmed);
    }
  } catch (err) {
    console.error('Sunucu adresi kaydedilemedi:', err);
  }
}

function getApiBaseUrl(): string {
  const custom = getCustomServerUrl();
  return custom ? custom : '';
}

export function loadPersoneller(): Personel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PERSONEL);
    if (!raw) {
      const initialized = BASLANGIC_PERSONELLER;
      localStorage.setItem(STORAGE_KEY_PERSONEL, JSON.stringify(initialized));
      return initialized;
    }
    const parsed: Personel[] = JSON.parse(raw);
    // Eğer memur verileri henüz gelmediyse başlangıç listesini yükle
    const hasNewMemur = parsed.some((p) => p.sicilNo === 'S051838' || p.id === 'memur-1');
    if (!hasNewMemur) {
      localStorage.setItem(STORAGE_KEY_PERSONEL, JSON.stringify(BASLANGIC_PERSONELLER));
      return BASLANGIC_PERSONELLER;
    }
    return parsed;
  } catch (err) {
    console.error('Veri yüklenirken hata:', err);
    return BASLANGIC_PERSONELLER;
  }
}

export function savePersoneller(list: Personel[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PERSONEL, JSON.stringify(list));
  } catch (err) {
    console.error('Veri kaydedilirken hata:', err);
  }
}

/**
 * Online Merkezi Senkronizasyon Fonksiyonları
 * Uygulama farklı bilgisayarlarda da açıldığında aynı listeyi sunucudan çeker ve güncellemeleri paylaşır.
 */
export async function fetchPersonellerOnline(): Promise<Personel[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/personeller`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const list: Personel[] | null = Array.isArray(data)
      ? data
      : (data && Array.isArray(data.personeller) ? data.personeller : null);

    if (list && list.length > 0) {
      savePersoneller(list);
      return list;
    }
  } catch (err) {
    console.warn('Online senkronizasyon uyarısı, yerel önbellek kullanılıyor:', err);
  }
  return loadPersoneller();
}

export async function savePersonellerOnline(list: Personel[]): Promise<void> {
  savePersoneller(list);
  try {
    const baseUrl = getApiBaseUrl();
    await fetch(`${baseUrl}/api/personeller`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    });
  } catch (err) {
    console.warn('Online sunucuya iletilemedi, yerel önbellekte saklandı:', err);
  }
}

export async function fetchServerStatus(): Promise<any> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/status`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export function loadKullanicilar(): Kullanici[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KULLANICI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_KULLANICI, JSON.stringify(BASLANGIC_KULLANICILAR));
      return BASLANGIC_KULLANICILAR;
    }
    return JSON.parse(raw);
  } catch {
    return BASLANGIC_KULLANICILAR;
  }
}

export function saveKullanicilar(list: Kullanici[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_KULLANICI, JSON.stringify(list));
  } catch (err) {
    console.error('Kullanıcılar kaydedilirken hata:', err);
  }
}

export function loadYedekler(): VeritabaniYedek[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_YEDEK);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_YEDEK, JSON.stringify(BASLANGIC_YEDEKLER));
      return BASLANGIC_YEDEKLER;
    }
    return JSON.parse(raw);
  } catch {
    return BASLANGIC_YEDEKLER;
  }
}

export function saveYedekler(list: VeritabaniYedek[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_YEDEK, JSON.stringify(list));
  } catch (err) {
    console.error('Yedekler kaydedilirken hata:', err);
  }
}

export function resetSystemData(): { personeller: Personel[]; kullanicilar: Kullanici[]; yedekler: VeritabaniYedek[] } {
  localStorage.setItem(STORAGE_KEY_PERSONEL, JSON.stringify(BASLANGIC_PERSONELLER));
  localStorage.setItem(STORAGE_KEY_KULLANICI, JSON.stringify(BASLANGIC_KULLANICILAR));
  localStorage.setItem(STORAGE_KEY_YEDEK, JSON.stringify(BASLANGIC_YEDEKLER));
  return {
    personeller: BASLANGIC_PERSONELLER,
    kullanicilar: BASLANGIC_KULLANICILAR,
    yedekler: BASLANGIC_YEDEKLER,
  };
}

/**
 * SQL Konsolu: SQL komutlarını çözümleyen ve MSSQL simülasyonu yapan motor
 */
export function executeSqlSimulation(sqlQuery: string, personeller: Personel[]): SqlSorguSonucu {
  const normalized = sqlQuery.trim();
  const upper = normalized.toUpperCase();
  const zaman = new Date().toLocaleTimeString('tr-TR');

  if (!normalized) {
    return {
      sorgu: sqlQuery,
      zaman,
      sutunlar: [],
      satirlar: [],
      mesaj: 'Boş SQL sorgusu gönderildi.',
      hata: 'Lütfen geçerli bir T-SQL sorgusu giriniz.',
    };
  }

  // SELECT * FROM Personeller
  if (upper.includes('SELECT') && upper.includes('FROM PERSONELLER')) {
    let filtered = [...personeller];

    if (upper.includes('WHERE')) {
      if (upper.includes('DURUM = \'AKTIF\'') || upper.includes('DURUM=\'AKTIF\'')) {
        filtered = filtered.filter(p => p.durum === 'Aktif');
      } else if (upper.includes('MAAS > 70000') || upper.includes('MAAS>70000')) {
        filtered = filtered.filter(p => p.maas > 70000);
      } else if (upper.includes('DEPARTMAN LIKE') || upper.includes('DEPARTMAN =')) {
        filtered = filtered.filter(p => p.departman.toLowerCase().includes('yazılım'));
      }
    }

    if (upper.includes('GROUP BY DEPARTMAN')) {
      const grouped: Record<string, { count: number; totalMaas: number }> = {};
      personeller.forEach(p => {
        if (!grouped[p.departman]) grouped[p.departman] = { count: 0, totalMaas: 0 };
        grouped[p.departman].count += 1;
        grouped[p.departman].totalMaas += p.maas;
      });

      const satirlar = Object.entries(grouped).map(([dept, val]) => ({
        Departman: dept,
        PersonelSayisi: val.count,
        OrtalamaMaas: Math.round(val.totalMaas / val.count),
        ToplamBordro: val.totalMaas,
      }));

      return {
        sorgu: sqlQuery,
        zaman,
        sutunlar: ['Departman', 'PersonelSayisi', 'OrtalamaMaas', 'ToplamBordro'],
        satirlar,
        mesaj: `(MSSQL Engine): ${satirlar.length} satır başarıyla gruplandı ve getirildi.`,
      };
    }

    if (upper.includes('ORDER BY MAAS DESC')) {
      filtered.sort((a, b) => b.maas - a.maas);
    } else if (upper.includes('ORDER BY AD')) {
      filtered.sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
    }

    const satirlar = filtered.map(p => ({
      Id: p.id,
      TcKimlik: p.tcKimlik,
      AdSoyad: `${p.ad} ${p.soyad}`,
      Departman: p.calistigiBirim || p.departman || 'Atölye',
      Pozisyon: p.postasi || p.pozisyon || 'Personel',
      Maas: `₺${(p.maas || 52000).toLocaleString('tr-TR')}`,
      Durum: p.durum || 'Aktif',
      IseGirisTarihi: p.iseGirisTarihi,
      Telefon: p.cepTelefonu || p.telefon || '-',
      Sehir: p.dogumYeri || p.sehir || 'Sivas',
    }));

    return {
      sorgu: sqlQuery,
      zaman,
      sutunlar: ['Id', 'TcKimlik', 'AdSoyad', 'Departman', 'Pozisyon', 'Maas', 'Durum', 'IseGirisTarihi', 'Telefon', 'Sehir'],
      satirlar,
      mesaj: `(MSSQL Engine): Sorgu 12ms içinde tamamlandı. ${satirlar.length} satır etkilendi.`,
    };
  }

  // Bilgi / Schema sorgusu
  if (upper.includes('SP_HELP') || upper.includes('INFORMATION_SCHEMA')) {
    const satirlar = [
      { SutunAdi: 'Id', VeriTipi: 'NVARCHAR(50)', BosGecilebilir: 'HAYIR', Varsayilan: 'GUID / NewId()' },
      { SutunAdi: 'TcKimlik', VeriTipi: 'NVARCHAR(11)', BosGecilebilir: 'HAYIR', Varsayilan: 'UNIQUE' },
      { SutunAdi: 'Ad', VeriTipi: 'NVARCHAR(100)', BosGecilebilir: 'HAYIR', Varsayilan: '-' },
      { SutunAdi: 'Soyad', VeriTipi: 'NVARCHAR(100)', BosGecilebilir: 'HAYIR', Varsayilan: '-' },
      { SutunAdi: 'Departman', VeriTipi: 'NVARCHAR(100)', BosGecilebilir: 'HAYIR', Varsayilan: 'INDEX IX_Departman' },
      { SutunAdi: 'Pozisyon', VeriTipi: 'NVARCHAR(150)', BosGecilebilir: 'HAYIR', Varsayilan: '-' },
      { SutunAdi: 'Maas', VeriTipi: 'DECIMAL(18,2)', BosGecilebilir: 'HAYIR', Varsayilan: '0.00' },
      { SutunAdi: 'IseGirisTarihi', VeriTipi: 'DATE', BosGecilebilir: 'HAYIR', Varsayilan: '-' },
      { SutunAdi: 'Durum', VeriTipi: 'NVARCHAR(20)', BosGecilebilir: 'HAYIR', Varsayilan: '\'Aktif\'' },
    ];
    return {
      sorgu: sqlQuery,
      zaman,
      sutunlar: ['SutunAdi', 'VeriTipi', 'BosGecilebilir', 'Varsayilan'],
      satirlar,
      mesaj: 'dbo.Personeller tablosu şema yapısı başarıyla listelendi.',
    };
  }

  return {
    sorgu: sqlQuery,
    zaman,
    sutunlar: ['KomutDurumu', 'Mesaj'],
    satirlar: [
      {
        KomutDurumu: 'Tamamlandı (200 OK)',
        Mesaj: `Komut MSSQL Server analizcisinde yürütüldü. (Örnek T-SQL komutları için hazır şablon butonlarını kullanabilirsiniz).`,
      },
    ],
    mesaj: 'T-SQL komutu başarıyla işlendi.',
  };
}
