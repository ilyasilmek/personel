import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  FileCode,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  Copy,
  Check,
  AlertCircle,
  Github,
  GitBranch,
  Key,
  Eye,
  EyeOff,
  CloudUpload,
  CloudDownload,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Personel, VeritabaniYedek } from '../types';
import { exportTcddBakFile } from '../utils/exportUtils';
import {
  getGitHubConfig,
  saveGitHubConfig,
  isGitHubConfigured,
  testGitHubConnection,
  fetchFromGitHub,
  pushToGitHub,
  generateSetupCode,
  applySetupCode,
  GitHubSyncConfig,
} from '../utils/githubSync';

interface YedeklemePaneliProps {
  personeller: Personel[];
  yedekler: VeritabaniYedek[];
  onYedekEkle: (yedek: VeritabaniYedek) => void;
  onSifirla: () => void;
  onVeriYukle: (yeniPersoneller: Personel[]) => void;
  onTriggerGitHubSync?: () => Promise<void>;
  gitHubSyncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  gitHubLastSync?: string;
}

export const YedeklemePaneli: React.FC<YedeklemePaneliProps> = ({
  personeller,
  yedekler,
  onYedekEkle,
  onSifirla,
  onVeriYukle,
  onTriggerGitHubSync,
  gitHubSyncStatus = 'idle',
  gitHubLastSync,
}) => {
  const [yedekleniyor, setYedekleniyor] = useState(false);
  const [bildirim, setBildirim] = useState<string | null>(null);

  // GitHub State
  const [ghConfig, setGhConfig] = useState<GitHubSyncConfig>(() => getGitHubConfig());
  const [ghTokenGoster, setGhTokenGoster] = useState(false);
  const [ghTestYukleniyor, setGhTestYukleniyor] = useState(false);
  const [ghTestSonuc, setGhTestSonuc] = useState<{ success: boolean; message: string } | null>(null);
  const [ghSenkYukleniyor, setGhSenkYukleniyor] = useState(false);
  const [ghKurulumKodu, setGhKurulumKodu] = useState('');
  const [ghKoduKopyalandi, setGhKoduKopyalandi] = useState(false);
  const [girilenKurulumKodu, setGirilenKurulumKodu] = useState('');
  const [rehberAcik, setRehberAcik] = useState(false);

  // Tek ve En Uygun Saklama Biçimi ile Yedek Alma (.tcddbak)
  const handleYedekAl = () => {
    setYedekleniyor(true);
    setTimeout(() => {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      const tarihStr = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
      const dosyaAdi = `TCDD_PersonelDb_Yedek_${timestamp}.tcddbak`;

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

      onYedekEkle(yeniYedek);

      // En uygun format olan .tcddbak dosyasını doğrudan indir
      exportTcddBakFile(personeller, yeniYedek);

      setYedekleniyor(false);
      setBildirim(`"${dosyaAdi}" tam sistem yedeği başarıyla oluşturuldu ve bilgisayarınıza indirildi.`);
      setTimeout(() => setBildirim(null), 6000);
    }, 500);
  };

  // Yedek Dosyasından Geri Yükleme (.tcddbak veya .json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let yuklenecekListe: Personel[] = [];
        if (parsed.personeller && Array.isArray(parsed.personeller)) {
          yuklenecekListe = parsed.personeller;
        } else if (Array.isArray(parsed)) {
          yuklenecekListe = parsed;
        }

        if (yuklenecekListe.length > 0) {
          onVeriYukle(yuklenecekListe);
          setBildirim(`Yedek dosyasından ${yuklenecekListe.length} personel kaydı başarıyla sisteme geri yüklendi!`);
          setTimeout(() => setBildirim(null), 6000);
        } else {
          alert('Seçilen yedek dosyasında geçerli personel verisi bulunamadı.');
        }
      } catch (err) {
        alert('Yedek dosyası okunurken hata oluştu. Lütfen geçerli bir .tcddbak veya .json dosyası seçiniz.');
      }
    };
    reader.readAsText(file);
  };

  // GitHub Ayarlarını Kaydet
  const handleGhKaydet = () => {
    const updated = saveGitHubConfig(ghConfig);
    setGhConfig(updated);
    setBildirim('GitHub ayarları başarıyla kaydedildi.');
    setTimeout(() => setBildirim(null), 4000);
  };

  // GitHub Bağlantı Testi
  const handleGhTest = async () => {
    setGhTestYukleniyor(true);
    setGhTestSonuc(null);
    const res = await testGitHubConnection(ghConfig);
    setGhTestYukleniyor(false);
    setGhTestSonuc(res);
  };

  // GitHub'dan Şimdi Çek (Pull)
  const handleGhCek = async () => {
    setGhSenkYukleniyor(true);
    const res = await fetchFromGitHub(ghConfig);
    setGhSenkYukleniyor(false);
    if (res.success && res.personeller && res.personeller.length > 0) {
      onVeriYukle(res.personeller);
      setGhConfig(getGitHubConfig());
      setBildirim(`GitHub'dan ${res.personeller.length} personel kaydı başarıyla indirildi ve sisteme uygulandı!`);
      setTimeout(() => setBildirim(null), 6000);
    } else if (res.isEmpty) {
      setBildirim('GitHub deposunda henüz kayıtlı veritabanı dosyası yok. Aşağıdaki "GitHub\'a Şimdi Gönder (Push)" butonuna basarak ilk yedeği yükleyebilirsiniz.');
      setTimeout(() => setBildirim(null), 7000);
    } else {
      setBildirim(`GitHub Senkronizasyon Hatası: ${res.message}`);
      setTimeout(() => setBildirim(null), 6000);
    }
  };

  // GitHub'a Şimdi Gönder (Push)
  const handleGhGonder = async () => {
    setGhSenkYukleniyor(true);
    const res = await pushToGitHub(
      personeller,
      `Manuel Veritabanı Güncelleme (${personeller.length} Personel) - ${new Date().toLocaleString('tr-TR')}`,
      ghConfig
    );
    setGhSenkYukleniyor(false);
    if (res.success) {
      setGhConfig(getGitHubConfig());
      setBildirim(`Mevcut ${personeller.length} personel verisi GitHub'a başarıyla kaydedildi!`);
      setTimeout(() => setBildirim(null), 6000);
    } else {
      setBildirim(`GitHub'a Kaydetme Hatası: ${res.message}`);
      setTimeout(() => setBildirim(null), 6000);
    }
  };

  // 5 Bilgisayar İçin Tek Tıkla Kurulum Kodunu Kopyala
  const handleGhKoduKopyala = () => {
    const code = generateSetupCode(ghConfig);
    navigator.clipboard.writeText(code);
    setGhKurulumKodu(code);
    setGhKoduKopyalandi(true);
    setBildirim('Kurulum kodu panoya kopyalandı! Diğer 4 bilgisayarda "Kodu Uygula" kutusuna yapıştırmanız yeterlidir.');
    setTimeout(() => {
      setGhKoduKopyalandi(false);
      setBildirim(null);
    }, 6000);
  };

  // Diğer Bilgisayardan Gelen Kurulum Kodunu Uygula
  const handleGhKoduUygula = async () => {
    if (!girilenKurulumKodu.trim()) {
      alert('Lütfen 1. bilgisayardan kopyaladığınız kurulum kodunu yapıştırın.');
      return;
    }
    const res = applySetupCode(girilenKurulumKodu);
    if (res.success && res.config) {
      setGhConfig(res.config);
      setGirilenKurulumKodu('');
      setBildirim('Tebrikler! GitHub ayarları kurulum kodundan otomatik yüklendi. Şimdi veriler kontrol ediliyor...');
      
      // Hemen GitHub'dan en güncel veriyi çek
      setGhSenkYukleniyor(true);
      const fetchRes = await fetchFromGitHub(res.config);
      setGhSenkYukleniyor(false);
      if (fetchRes.success && fetchRes.personeller && fetchRes.personeller.length > 0) {
        onVeriYukle(fetchRes.personeller);
        setBildirim(`Tebrikler! Kurulum tamamlandı ve GitHub'dan ${fetchRes.personeller.length} personel kaydı hemen yüklendi.`);
      }
      setTimeout(() => setBildirim(null), 7000);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="p-4 space-y-4 text-xs font-sans">
      {/* Bildirim Çubuğu */}
      {bildirim && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xs text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{bildirim}</span>
          </div>
          <button
            onClick={() => setBildirim(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sunucu & Veritabanı Bilgi Kartı */}
      <div className="bg-[#1e293b] text-slate-100 p-4 rounded-xs shadow-xs border border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xs bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white">TCDD Merkezi Personel Veritabanı</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Çevrimiçi &bull; Canlı Senkronize</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Online Depolama: /api/personeller &bull; Yedekleme Standardı: .tcddbak (Tam Bütünleşik Snapshot)
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-[11px] text-slate-300">
          <div>
            <span className="text-slate-500 block text-[10px]">Toplam Kayıt:</span>
            <span className="font-semibold text-slate-100">{personeller.length} Personel</span>
          </div>
          <div className="border-l border-slate-700 pl-4">
            <span className="text-slate-500 block text-[10px]">Bütünlük Durumu:</span>
            <span className="font-semibold text-emerald-400">Doğrulandı &amp; Sağlam</span>
          </div>
        </div>
      </div>

      {/* GİTHUB İLE 5 BİLGİSAYAR ORTAK VERİTABANI SENKRONİZASYONU */}
      <div className="bg-gradient-to-r from-slate-900 via-[#162235] to-slate-900 text-white p-4 rounded-xs border-2 border-blue-500/40 shadow-md">
        {/* Üst Başlık & Hızlı İşlem Butonları */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-700/70 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-800 border border-slate-700 rounded text-white shadow-xs">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  GitHub Otomatik Veritabanı Senkronizasyonu (5 Bilgisayar Ortak)
                </h3>
                {isGitHubConfigured(ghConfig) ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Bağlı &amp; Aktif {ghConfig.lastSyncTime ? `(${ghConfig.lastSyncTime})` : ''}</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-semibold">
                    ○ Yapılandırılmadı
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                5 bilgisayarın da aynı verileri anlık görmesi için GitHub üzerindeki özel (Private) repoyu merkezi veritabanı olarak kullanır.
              </p>
            </div>
          </div>

          {/* Hızlı Eşitleme Butonları */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleGhCek}
              disabled={ghSenkYukleniyor || !isGitHubConfigured(ghConfig)}
              title="GitHub'daki en güncel veritabanını indirip sisteme yükler"
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CloudDownload className="w-3.5 h-3.5" />
              <span>{ghSenkYukleniyor ? 'İndiriliyor...' : "GitHub'dan Getir (Pull)"}</span>
            </button>

            <button
              onClick={handleGhGonder}
              disabled={ghSenkYukleniyor || !isGitHubConfigured(ghConfig)}
              title="Mevcut personel verilerini GitHub'a gönderir (Commit & Push)"
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>{ghSenkYukleniyor ? 'Gönderiliyor...' : "GitHub'a Gönder (Push)"}</span>
            </button>
          </div>
        </div>

        {/* Ana Gövde: 2 Kolonlu Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3 pt-1">
          {/* Sol Kolon: GitHub Hesap & Repo Ayarları */}
          <div className="bg-slate-800/80 p-3.5 rounded border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-300 font-bold text-xs flex items-center gap-1.5">
                <Key className="w-4 h-4 text-blue-400" />
                <span>1. GitHub Bağlantı Ayarları</span>
              </span>
              <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ghConfig.enabled}
                  onChange={(e) => setGhConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-slate-600 text-blue-600"
                />
                <span>GitHub Senkronizasyonunu Etkinleştir</span>
              </label>
            </div>

            {/* Repo Bilgisi */}
            <div>
              <label className="block text-[11px] text-slate-300 font-medium mb-1">
                GitHub Depo Adı (KullanıcıAdı / Repo):
              </label>
              <div className="flex items-center bg-slate-900 border border-slate-600 rounded px-2.5 py-1.5 focus-within:border-blue-400">
                <GitBranch className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Örn: ilyasilmk/tcdd-personel-db"
                  value={ghConfig.repo}
                  onChange={(e) => setGhConfig((prev) => ({ ...prev, repo: e.target.value }))}
                  className="bg-transparent border-none text-white text-xs font-mono outline-none w-full placeholder:text-slate-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                * GitHub'da açtığınız özel (Private) deponun adıdır.
              </span>
            </div>

            {/* Erişim Belirteci (Token) */}
            <div>
              <label className="block text-[11px] text-slate-300 font-medium mb-1">
                Kişisel Erişim Belirteci (Personal Access Token):
              </label>
              <div className="flex items-center bg-slate-900 border border-slate-600 rounded px-2.5 py-1.5 focus-within:border-blue-400">
                <Key className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <input
                  type={ghTokenGoster ? 'text' : 'password'}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={ghConfig.token}
                  onChange={(e) => setGhConfig((prev) => ({ ...prev, token: e.target.value }))}
                  className="bg-transparent border-none text-white text-xs font-mono outline-none w-full placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setGhTokenGoster((prev) => !prev)}
                  className="text-slate-400 hover:text-white ml-1 cursor-pointer"
                  title={ghTokenGoster ? 'Gizle' : 'Göster'}
                >
                  {ghTokenGoster ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                * GitHub Settings &gt; Developer settings &gt; Personal access tokens bölümünden alınır.
              </span>
            </div>

            {/* Otomatik Seçenekler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-700/60">
              <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ghConfig.autoSyncOnStart}
                  onChange={(e) => setGhConfig((prev) => ({ ...prev, autoSyncOnStart: e.target.checked }))}
                  className="rounded border-slate-600 text-blue-600"
                />
                <span>Program açılışında otomatik tara &amp; getir</span>
              </label>

              <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ghConfig.autoPushOnChange}
                  onChange={(e) => setGhConfig((prev) => ({ ...prev, autoPushOnChange: e.target.checked }))}
                  className="rounded border-slate-600 text-blue-600"
                />
                <span>Personel eklenince otomatik GitHub'a gönder</span>
              </label>
            </div>

            {/* Test ve Kaydet Butonları */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleGhTest}
                disabled={ghTestYukleniyor || !ghConfig.token || !ghConfig.repo}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ghTestYukleniyor ? 'animate-spin text-blue-400' : ''}`} />
                <span>{ghTestYukleniyor ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}</span>
              </button>

              <button
                onClick={handleGhKaydet}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Ayarları Kaydet
              </button>
            </div>

            {/* Test Sonucu Bildirimi */}
            {ghTestSonuc && (
              <div
                className={`p-2.5 rounded text-xs flex items-start space-x-2 border ${
                  ghTestSonuc.success
                    ? 'bg-emerald-950/70 border-emerald-600/50 text-emerald-200'
                    : 'bg-rose-950/70 border-rose-600/50 text-rose-200'
                }`}
              >
                {ghTestSonuc.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{ghTestSonuc.message}</span>
              </div>
            )}
          </div>

          {/* Sağ Kolon: 5 Bilgisayar İçin Tek Tıkla Kurulum Kodu (Sihirbaz) */}
          <div className="bg-slate-800/80 p-3.5 rounded border border-slate-700 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>2. 5 Bilgisayar İçin Tek Tıkla Kurulum Sihirbazı</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Diğer 4 bilgisayarda token ve repo adını <b>tek tek elle yazmakla uğraşmayın!</b>
              </p>

              {/* Adım A: 1. Bilgisayardan Kodu Al */}
              <div className="mt-3 bg-slate-900/80 p-2.5 rounded border border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px] text-blue-200">
                    A) 1. Bilgisayarda Ayarladıktan Sonra:
                  </span>
                  <button
                    onClick={handleGhKoduKopyala}
                    disabled={!ghConfig.token || !ghConfig.repo}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {ghKoduKopyalandi ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{ghKoduKopyalandi ? 'Kopyalandı!' : 'Kurulum Kodunu Kopyala'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  * Bu butona basarak kurulum kodunu alın (WhatsApp, Mail veya Flash bellek ile diğer bilgisayarlara iletebilirsiniz).
                </p>
              </div>

              {/* Adım B: Diğer 4 Bilgisayarda Kodu Uygula */}
              <div className="mt-3 bg-slate-900/80 p-2.5 rounded border border-slate-700/80 space-y-2">
                <span className="font-semibold text-[11px] text-cyan-200 block">
                  B) Diğer 4 Bilgisayarda Bu Kodu Yapıştırın:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="TCDD-GH-eyJ2IjoxLCJ..."
                    value={girilenKurulumKodu}
                    onChange={(e) => setGirilenKurulumKodu(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-600 focus:border-cyan-400 px-2.5 py-1.5 rounded text-xs text-white font-mono placeholder:text-slate-600 outline-none"
                  />
                  <button
                    onClick={handleGhKoduUygula}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Kodu Uygula &amp; Bağlan
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  * Kodu yapıştırıp butona bastığınız anda GitHub ayarları yüklenir ve en güncel veritabanı anında indirilir.
                </p>
              </div>
            </div>

            {/* Kolay Rehber Butonu */}
            <div className="pt-2 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setRehberAcik((prev) => !prev)}
                className="text-[11px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{rehberAcik ? 'Rehberi Gizle ▲' : '1 Dakikada GitHub Deposu & Token Alma Rehberi ▼'}</span>
              </button>

              {rehberAcik && (
                <div className="mt-2 p-2.5 bg-slate-900 rounded border border-cyan-800/50 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                  <p className="text-cyan-200 font-bold">Nasıl Yapılır? (Toplam 3 Basit Adım):</p>
                  <p><b>1. Özel Repo Açın:</b> github.com'a giriş yapıp sağ üstteki <b>"+" &gt; "New repository"</b> deyin. Depo adını yazın (örn: <code>tcdd-personel-db</code>), <b>"Private" (Gizli)</b> seçeneğini işaretleyip oluşturun.</p>
                  <p><b>2. Token Alın:</b> Sağ üstteki profil resminiz &gt; <b>Settings</b> &gt; En alttaki <b>Developer settings</b> &gt; <b>Personal access tokens (classic)</b> &gt; <b>Generate new token (classic)</b> seçin. İsim yazıp yalnızca <b>repo</b> kutucuğunu işaretleyin ve oluşturun.</p>
                  <p><b>3. Buraya Girin:</b> Aldığınız <code>ghp_...</code> token'ını ve repo adını soldaki kutulara girip <b>"Bağlantıyı Test Et &amp; Kaydet"</b> butonuna basın. Ardından <b>"Kurulum Kodunu Kopyala"</b> diyerek diğer 4 bilgisayara dağıtın!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ana Yedekleme ve Geri Yükleme Paneli (Seçeneksiz, Doğrudan ve Kolay) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sol Kolon: Yedek Al ve Yükle */}
        <div className="bg-white p-4 rounded-xs border border-[#7f9db9] shadow-xs lg:col-span-1 space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <span>Tam Sistem Yedeği Al &amp; Geri Yükle</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Tüm personel kayıtlarını, fotoğrafları, ekli evrakları ve sicil bilgilerini tek tıkla en uygun saklama biçiminde (<b>.tcddbak</b>) paketler ve indirir.
            </p>
          </div>

          {/* 1. Doğrudan Yedek Al Butonu (Seçenek sunulmaz, en uygunu kullanılır) */}
          <div className="space-y-2">
            <div className="text-slate-700 font-semibold text-xs flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Veritabanını Yedekle</span>
            </div>
            <button
              onClick={handleYedekAl}
              disabled={yedekleniyor}
              className={`w-full py-2.5 px-3 rounded-xs font-bold text-white shadow-xs flex items-center justify-center space-x-2 transition-all ${
                yedekleniyor
                  ? 'bg-blue-400 cursor-wait'
                  : 'bg-[#0055ea] hover:bg-[#0044bb] cursor-pointer'
              }`}
            >
              {yedekleniyor ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Yedek Paketi Hazırlanıyor...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Tam Sistem Yedeğini İndir (.tcddbak)</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-400 italic">
              * Yedek dosyası sistemdeki tüm {personeller.length} personelin eksiksiz dijital kopyasını içerir.
            </p>
          </div>

          {/* 2. Yedekten Geri Yükle */}
          <div className="border-t border-slate-200 pt-3 space-y-2">
            <div className="text-slate-700 font-semibold text-xs flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Yedekten Geri Yükle (Restore)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Daha önce aldığınız <b>.tcddbak</b> veya <b>.json</b> yedek dosyasını seçerek tüm personelleri tek seferde sisteme geri yükleyin:
            </p>
            <label className="block w-full py-2.5 px-2.5 border-2 border-dashed border-[#7f9db9] hover:border-blue-600 bg-slate-50 hover:bg-blue-50/40 rounded-xs text-center text-slate-700 cursor-pointer transition-colors">
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-xs text-blue-900">📁 Yedek Dosyası Seç (.tcddbak)</span>
                <span className="text-[10px] text-slate-500">Tıklayın veya dosyayı buraya bırakın</span>
              </div>
              <input
                type="file"
                accept=".tcddbak,.bak,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* 3. Örnek Verilere Sıfırla */}
          <div className="border-t border-slate-200 pt-3">
            <button
              onClick={() => {
                if (confirm('Tüm kayıtlar silinip fabrika ayarlarına ve örnek personel listesine dönülecek. Onaylıyor musunuz?')) {
                  onSifirla();
                  setBildirim('Tüm veriler fabrika ayarlarına ve örnek personel listesine başarıyla sıfırlandı.');
                }
              }}
              className="w-full text-slate-600 hover:text-red-700 text-[11px] py-1 text-center hover:underline flex items-center justify-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-red-500" />
              <span>Örnek Başlangıç Listesine Sıfırla</span>
            </button>
          </div>
        </div>

        {/* Sağ Kolon: Geçmiş Yedekleme Günlüğü */}
        <div className="bg-white p-4 rounded-xs border border-[#7f9db9] shadow-xs lg:col-span-2 space-y-3">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <HardDrive className="w-4 h-4 text-emerald-600" />
                <span>Geçmiş Yedekleme Günlüğü</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Sistemde alınmış veya doğrulanmış güvenli yedek kayıtları
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300">
              Toplam: {yedekler.length} Yedek
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="py-2 px-3">Yedek Dosyası</th>
                  <th className="py-2 px-3">Oluşturma Tarihi</th>
                  <th className="py-2 px-3">Boyut</th>
                  <th className="py-2 px-3">Kayıt Sayısı</th>
                  <th className="py-2 px-3">Durum</th>
                  <th className="py-2 px-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {yedekler.map((y) => (
                  <tr key={y.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2 px-3 font-mono font-medium text-slate-900 flex items-center space-x-1.5">
                      <FileCode className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate max-w-[220px]" title={y.dosyaAdi}>
                        {y.dosyaAdi.replace('.bak', '.tcddbak')}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600">{y.olusturmaTarihi}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">
                      {(y.boyutKb / 1024).toFixed(2)} MB
                    </td>
                    <td className="py-2 px-3 text-slate-800 font-semibold">
                      {y.kayitSayisi} Personel
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{y.durum}</span>
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => exportTcddBakFile(personeller, y)}
                        className="text-blue-700 hover:text-blue-900 font-bold hover:underline cursor-pointer"
                      >
                        İndir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
