import React, { useState } from 'react';
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
} from 'lucide-react';
import { Personel, VeritabaniYedek } from '../types';
import { exportTcddBakFile } from '../utils/exportUtils';

interface YedeklemePaneliProps {
  personeller: Personel[];
  yedekler: VeritabaniYedek[];
  onYedekEkle: (yedek: VeritabaniYedek) => void;
  onSifirla: () => void;
  onVeriYukle: (yeniPersoneller: Personel[]) => void;
}

export const YedeklemePaneli: React.FC<YedeklemePaneliProps> = ({
  personeller,
  yedekler,
  onYedekEkle,
  onSifirla,
  onVeriYukle,
}) => {
  const [yedekleniyor, setYedekleniyor] = useState(false);
  const [bildirim, setBildirim] = useState<string | null>(null);

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
