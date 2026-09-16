import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Personel,
  PersonelTuru,
  VeritabaniYedek,
} from './types';
import {
  loadPersoneller,
  savePersoneller,
  loadYedekler,
  saveYedekler,
  resetSystemData,
  fetchPersonellerOnline,
  savePersonellerOnline,
} from './utils/storage';
import {
  exportPersonnelToExcel,
  exportPersonnelToPdf,
  exportTcddBakFile,
} from './utils/exportUtils';
import { WindowsTitleBar } from './components/WindowsTitleBar';
import { NavigationRibbon, ActiveTab } from './components/NavigationRibbon';
import { PersonelAramaEkrani } from './components/PersonelAramaEkrani';
import { TcddPersonelFormu } from './components/TcddPersonelFormu';
import { GenelListe } from './components/GenelListe';
import { YedeklemePaneli } from './components/YedeklemePaneli';
import { WindowsStatusBar } from './components/WindowsStatusBar';
import { PrintableReportModal } from './components/PrintableReportModal';

export default function App() {
  // Veri Durumları (State)
  const [personeller, setPersoneller] = useState<Personel[]>(() => loadPersoneller());
  const [yedekler, setYedekler] = useState<VeritabaniYedek[]>(() => loadYedekler());
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [sonSenkronizasyon, setSonSenkronizasyon] = useState<string>('');

  // UI Durumları
  // 1. Program açılışta sadece arama bölümü olsun (Varsayılan ekran: 'arama')
  const [activeTab, setActiveTab] = useState<ActiveTab>('arama');

  // 2. Büyükçe iki tane tab olsun: BİRİNDE İŞÇİ DİĞERİNDE MEMUR
  const [aktifGrup, setAktifGrup] = useState<PersonelTuru>('ISCI');

  // 3. Formun boş halde açılması modu (Personel Ekle basıldığında)
  const [isBosFormMode, setIsBosFormMode] = useState<boolean>(false);
  const [seciliPersonelId, setSeciliPersonelId] = useState<string | undefined>();
  const [isMaximized, setIsMaximized] = useState(true);
  const [toastMesaj, setToastMesaj] = useState<string | null>(null);
  const [bildirimlerAktif, setBildirimlerAktif] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tcdd_bildirimler_aktif') !== 'false';
    } catch {
      return true;
    }
  });

  const handleToggleBildirimler = () => {
    setBildirimlerAktif((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tcdd_bildirimler_aktif', String(next));
      } catch {}
      if (!next) {
        setToastMesaj(null);
      }
      return next;
    });
  };

  // Yazdırılabilir Resmi Rapor Modalı (Türkçe Karakter Uyumlu)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'liste' | 'kart'>('liste');
  const [reportPersonnel, setReportPersonnel] = useState<Personel | undefined>();

  const showToast = (mesaj: string) => {
    if (!bildirimlerAktif) return;
    setToastMesaj(mesaj);
    setTimeout(() => {
      setToastMesaj((prev) => (prev === mesaj ? null : prev));
    }, 3500);
  };

  // İŞÇİ ve MEMUR sayıları
  const isciSayisi = useMemo(
    () => personeller.filter((p) => (p.personelTuru || 'ISCI') === 'ISCI').length,
    [personeller]
  );
  const memurSayisi = useMemo(
    () => personeller.filter((p) => p.personelTuru === 'MEMUR').length,
    [personeller]
  );

  // 1. Merkezi Sunucu ile Senkronizasyon (Online Sync)
  const syncFromServer = useCallback(async (isSilent = false) => {
    try {
      const serverData = await fetchPersonellerOnline();
      if (serverData && Array.isArray(serverData) && serverData.length > 0) {
        setPersoneller((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(serverData)) {
            return prev;
          }
          savePersoneller(serverData);
          return serverData;
        });
        setIsOnline(true);
        const now = new Date();
        setSonSenkronizasyon(
          now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
        if (!isSilent) {
          showToast(`Merkezi sunucudan ${serverData.length} personel kaydı senkronize edildi.`);
        }
      }
    } catch (err) {
      console.warn('Sunucu senkronizasyon uyarısı, yerel veriler korunuyor:', err);
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    syncFromServer(true);
    const interval = setInterval(() => {
      syncFromServer(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [syncFromServer]);

  const persistPersoneller = async (newList: Personel[]) => {
    setPersoneller(newList);
    savePersoneller(newList);
    try {
      await savePersonellerOnline(newList);
      setIsOnline(true);
      const now = new Date();
      setSonSenkronizasyon(
        now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err) {
      console.error('Merkezi sunucuya kaydetme hatası:', err);
      setIsOnline(false);
    }
  };

  useEffect(() => {
    saveYedekler(yedekler);
  }, [yedekler]);

  // CRUD: Personel Kaydet (Ekleme veya Güncelleme)
  const handlePersonelKaydet = (kaydedilecek: Personel, isNew: boolean) => {
    // Personel türünü formdan gelen seçime göre belirle (varsayılan aktifGrup)
    const secilenTur = kaydedilecek.personelTuru || aktifGrup;
    const kayit: Personel = {
      ...kaydedilecek,
      personelTuru: secilenTur,
    };

    let guncelListe: Personel[];
    if (isNew) {
      guncelListe = [kayit, ...personeller];
      showToast(
        `${kayit.ad} ${kayit.soyad} (${kayit.sicilNo}) ${
          secilenTur === 'MEMUR' ? 'Memur' : 'İşçi'
        } kadrosuna yeni personel olarak kaydedildi.`
      );
    } else {
      guncelListe = personeller.map((p) => (p.id === kayit.id ? { ...p, ...kayit } : p));
      showToast(
        `${kayit.ad} ${kayit.soyad} (${kayit.sicilNo}) bilgileri güncellendi (${
          secilenTur === 'MEMUR' ? 'Memur' : 'İşçi'
        } kadrosu).`
      );
    }

    // Eğer personel türü mevcut aktif kategoriden farklıysa, kategori sekmesini de otomatik senkronize et
    if (secilenTur !== aktifGrup) {
      setAktifGrup(secilenTur);
    }

    persistPersoneller(guncelListe);
    setIsBosFormMode(false);
    setSeciliPersonelId(kayit.id);
  };

  // CRUD: Personel Silme
  const handlePersonelSil = (id: string) => {
    const kalanlar = personeller.filter((p) => p.id !== id);
    persistPersoneller(kalanlar);
  };

  // Navigasyon: Personel Ekle (Formlar Boş Halde)
  const handleYeniPersonelEkle = () => {
    setIsBosFormMode(true);
    setSeciliPersonelId(undefined);
    setActiveTab('tcdd_form');
    showToast(`Yeni ${aktifGrup === 'ISCI' ? 'İşçi' : 'Memur'} personel ekleme formu boş halde açıldı.`);
  };

  // Navigasyon: Aratınca o kişinin bilgilerini formda aç
  const handlePersonelSecVeFormAc = (personelId: string) => {
    setIsBosFormMode(false);
    setSeciliPersonelId(personelId);
    setActiveTab('tcdd_form');
    showToast('Seçilen personelin bilgileri form ekranına yüklendi.');
  };

  // Navigasyon: Genel Liste seçeneği (Tüm liste gelsin)
  const handleGenelListeAc = () => {
    setActiveTab('genel_liste');
  };

  // Navigasyon: İŞÇİ / MEMUR Tab Değiştirme
  const handleGrupDegistir = (yeniGrup: PersonelTuru) => {
    setAktifGrup(yeniGrup);
    showToast(`${yeniGrup === 'ISCI' ? 'İŞÇİ' : 'MEMUR'} personeller görüntülendi.`);
  };

  // Excel Dışa Aktarma
  const handleExcelExport = () => {
    const aktifListe = personeller.filter((p) => (p.personelTuru || 'ISCI') === aktifGrup);
    exportPersonnelToExcel(aktifListe, aktifGrup);
    showToast(`${aktifGrup === 'ISCI' ? 'İŞÇİ LİSTE' : 'MEMUR LİSTE'} Excel (.xlsx) olarak indirildi.`);
  };

  // PDF Dışa Aktarma
  const handlePdfExport = () => {
    const aktifListe = personeller.filter((p) => (p.personelTuru || 'ISCI') === aktifGrup);
    exportPersonnelToPdf(aktifListe, aktifGrup);
    showToast(`${aktifGrup === 'ISCI' ? 'İŞÇİ LİSTE' : 'MEMUR LİSTE'} PDF olarak indirildi.`);
  };

  // Resmi Yazdır Modalı
  const handleResmiYazdirModalAc = (liste?: Personel[], tekPersonel?: Personel) => {
    if (tekPersonel) {
      setReportPersonnel(tekPersonel);
      setReportType('kart');
    } else {
      setReportType('liste');
    }
    setIsReportModalOpen(true);
  };

  // Hızlı Yedek Alma
  const handleQuickBackup = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const tarihStr = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    const dosyaAdi = `TCDD_PersonelDb_${timestamp}.tcddbak`;

    const yeniYedek: VeritabaniYedek = {
      id: `bak-${timestamp}`,
      dosyaAdi,
      boyutKb: Math.round(1800 + personeller.length * 15),
      olusturmaTarihi: tarihStr,
      olusturan: 'Sistem Yöneticisi',
      format: 'MSSQL_BAK',
      durum: 'Doğrulandı',
      kayitSayisi: personeller.length,
    };

    setYedekler((prev) => [yeniYedek, ...prev]);
    exportTcddBakFile(personeller, yeniYedek);
    showToast(`Tam sistem yedeği (${dosyaAdi}) başarıyla oluşturuldu ve indirildi.`);
  };

  // Sıfırlama
  const handleReset = () => {
    const data = resetSystemData();
    persistPersoneller(data.personeller);
    setYedekler(data.yedekler);
    showToast('Veritabanı orijinal verilere sıfırlandı.');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#ece9d8] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Uygulama Ana Ekranı */}
      <div
        id="windows-main-app-window"
        className="w-full h-full flex flex-col overflow-hidden bg-[#ece9d8]"
      >
        {/* Windows / Kurumsal Başlık Çubuğu */}
        <WindowsTitleBar
          isOnline={isOnline}
          bildirimlerAktif={bildirimlerAktif}
          onToggleBildirimler={handleToggleBildirimler}
        />

        {/* BÜYÜKÇE İKİ TANE TAB (İŞÇİ / MEMUR) VE NAVİGASYON ÇUBUĞU */}
        <NavigationRibbon
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          aktifGrup={aktifGrup}
          onGrupDegistir={handleGrupDegistir}
          onYeniPersonelEkle={handleYeniPersonelEkle}
          onExcelExport={handleExcelExport}
          onPdfExport={handlePdfExport}
          onResmiYazdir={() => handleResmiYazdirModalAc()}
          onQuickBackup={handleQuickBackup}
          onRefresh={() => syncFromServer(false)}
          isciSayisi={isciSayisi}
          memurSayisi={memurSayisi}
        />

        {/* Bilgilendirme Mesajı (Sol Alt Köşede - Sağ Alttaki Butonları Kesinlikle Engellemez) */}
        {toastMesaj && bildirimlerAktif && (
          <div
            id="app-toast-notification"
            className="fixed bottom-14 left-6 z-50 bg-slate-900/95 text-white px-3.5 py-2.5 rounded-md shadow-2xl border border-slate-700 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 backdrop-blur-xs max-w-md pointer-events-auto select-none"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-xs shadow-emerald-400/80"></span>
            <span className="font-medium text-slate-100 leading-snug">{toastMesaj}</span>
            <div className="flex items-center gap-1.5 ml-auto pl-2 border-l border-slate-700 shrink-0">
              <button
                onClick={() => {
                  handleToggleBildirimler();
                }}
                className="text-[10px] text-slate-400 hover:text-amber-300 transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-slate-800"
                title="Tüm bilgilendirme bildirimlerini kapat"
              >
                Mesajları Kapat
              </button>
              <button
                onClick={() => setToastMesaj(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-800 text-xs font-bold"
                title="Bu bildirimi kapat"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Ana İçerik Alanı (Sekmeler) */}
        <main className="flex-1 overflow-hidden bg-slate-100 flex flex-col">
          {/* 1. PROGRAM AÇILIŞINDA VARSAYILAN: ARAMA BÖLÜMÜ */}
          {activeTab === 'arama' && (
            <PersonelAramaEkrani
              personeller={personeller}
              aktifGrup={aktifGrup}
              onGrupDegistir={handleGrupDegistir}
              onPersonelSecVeFormAc={handlePersonelSecVeFormAc}
              onYeniPersonelEkle={handleYeniPersonelEkle}
              onGenelListeAc={handleGenelListeAc}
              onResmiYazdir={(filtrelenmis, tekP) => handleResmiYazdirModalAc(filtrelenmis, tekP)}
              onExcelExport={handleExcelExport}
            />
          )}

          {/* 2. PERSONEL TAKİP & ÖZLÜK FORMU (Boş halde veya seçili personelle) */}
          {activeTab === 'tcdd_form' && (
            <TcddPersonelFormu
              personeller={personeller}
              onPersonelKaydet={handlePersonelKaydet}
              onPersonelSil={handlePersonelSil}
              showToast={showToast}
              onOpenYedekleme={() => setActiveTab('yedekleme')}
              onResmiYazdir={(p) => handleResmiYazdirModalAc(personeller, p)}
              seciliPersonelId={seciliPersonelId}
              onSeciliPersonelChange={setSeciliPersonelId}
              isBosFormMode={isBosFormMode}
              aktifGrup={aktifGrup}
              onAramaEkraninaDon={() => setActiveTab('arama')}
              onGenelListeAc={handleGenelListeAc}
            />
          )}

          {/* 3. GENEL PERSONEL LİSTESİ (10 SÜTUNLU RESMİ LİSTE) */}
          {activeTab === 'genel_liste' && (
            <GenelListe
              personeller={personeller}
              aktifGrup={aktifGrup}
              onPersonelSecVeDuzenle={(id) => {
                handlePersonelSecVeFormAc(id);
              }}
              onPersonelSil={handlePersonelSil}
              showToast={showToast}
              onResmiYazdir={(filtrelenmis, tekPersonel) =>
                handleResmiYazdirModalAc(filtrelenmis || personeller, tekPersonel)
              }
              onAramaEkraninaDon={() => setActiveTab('arama')}
              onYeniPersonelEkle={handleYeniPersonelEkle}
            />
          )}

          {/* 4. YEDEKLE - YÜKLE */}
          {activeTab === 'yedekleme' && (
            <div className="flex-1 overflow-auto bg-slate-100">
              <YedeklemePaneli
                personeller={personeller}
                yedekler={yedekler}
                onYedekEkle={(yeniY) => {
                  setYedekler((prev) => [yeniY, ...prev]);
                }}
                onSifirla={handleReset}
                onVeriYukle={(yeniListe) => {
                  persistPersoneller(yeniListe);
                  showToast(`${yeniListe.length} personel kaydı başarıyla yüklendi ve senkronize edildi.`);
                }}
              />
            </div>
          )}
        </main>

        {/* Windows Alt Durum Çubuğu (Status Bar) */}
        <WindowsStatusBar
          personelSayisi={personeller.length}
          sonSenkronizasyon={sonSenkronizasyon}
          isOnline={isOnline}
        />
      </div>

      {/* Türkçe Karakter Destekli Resmi Raporlama & Yazdırma Modalı */}
      <PrintableReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        personeller={personeller.filter((p) => (p.personelTuru || 'ISCI') === aktifGrup)}
        seciliPersonel={reportPersonnel}
        aktifGrup={aktifGrup}
        raporTuru={reportType}
      />
    </div>
  );
}
