import React, { useState, useEffect } from 'react';
import { X, Save, User, Briefcase, DollarSign, Phone, AlertCircle } from 'lucide-react';
import { Personel, DepartmanTuru, DurumTuru, KanGrubuTuru } from '../types';

interface PersonelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKaydet: (personel: Omit<Personel, 'id' | 'olusturmaTarihi'>, id?: string) => void;
  duzenlenecekPersonel?: Personel | null;
}

type ModalTab = 'kimlik' | 'is' | 'bordro' | 'iletisim';

export const PersonelModal: React.FC<PersonelModalProps> = ({
  isOpen,
  onClose,
  onKaydet,
  duzenlenecekPersonel,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('kimlik');
  const [hatalar, setHatalar] = useState<Record<string, string>>({});

  // Form State
  const [tcKimlik, setTcKimlik] = useState('');
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [departman, setDepartman] = useState<DepartmanTuru>('Yazılım & Bilişim');
  const [pozisyon, setPozisyon] = useState('');
  const [maas, setMaas] = useState<number>(55000);
  const [iseGirisTarihi, setIseGirisTarihi] = useState(new Date().toISOString().slice(0, 10));
  const [dogumTarihi, setDogumTarihi] = useState('1992-05-15');
  const [kanGrubu, setKanGrubu] = useState<KanGrubuTuru>('A+');
  const [durum, setDurum] = useState<DurumTuru>('Aktif');
  const [cinsiyet, setCinsiyet] = useState<'Erkek' | 'Kadın'>('Erkek');
  const [egitimDurumu, setEgitimDurumu] = useState<Personel['egitimDurumu']>('Lisans');
  const [adres, setAdres] = useState('');
  const [sehir, setSehir] = useState('İstanbul');
  const [acilKisi, setAcilKisi] = useState('');
  const [acilTelefon, setAcilTelefon] = useState('');
  const [notlar, setNotlar] = useState('');

  // Düzenleme modunda verileri doldur
  useEffect(() => {
    if (duzenlenecekPersonel) {
      setTcKimlik(duzenlenecekPersonel.tcKimlik);
      setAd(duzenlenecekPersonel.ad);
      setSoyad(duzenlenecekPersonel.soyad);
      setEmail(duzenlenecekPersonel.email);
      setTelefon(duzenlenecekPersonel.telefon);
      setDepartman(duzenlenecekPersonel.departman);
      setPozisyon(duzenlenecekPersonel.pozisyon);
      setMaas(duzenlenecekPersonel.maas);
      setIseGirisTarihi(duzenlenecekPersonel.iseGirisTarihi);
      setDogumTarihi(duzenlenecekPersonel.dogumTarihi);
      setKanGrubu(duzenlenecekPersonel.kanGrubu);
      setDurum(duzenlenecekPersonel.durum);
      setCinsiyet(duzenlenecekPersonel.cinsiyet);
      setEgitimDurumu(duzenlenecekPersonel.egitimDurumu);
      setAdres(duzenlenecekPersonel.adres || '');
      setSehir(duzenlenecekPersonel.sehir || 'İstanbul');
      setAcilKisi(duzenlenecekPersonel.acilKisi || '');
      setAcilTelefon(duzenlenecekPersonel.acilTelefon || '');
      setNotlar(duzenlenecekPersonel.notlar || '');
    } else {
      // Varsayılan form sıfırlama
      setTcKimlik('');
      setAd('');
      setSoyad('');
      setEmail('');
      setTelefon('');
      setDepartman('Yazılım & Bilişim');
      setPozisyon('');
      setMaas(55000);
      setIseGirisTarihi(new Date().toISOString().slice(0, 10));
      setDogumTarihi('1994-04-12');
      setKanGrubu('A+');
      setDurum('Aktif');
      setCinsiyet('Erkek');
      setEgitimDurumu('Lisans');
      setAdres('');
      setSehir('İstanbul');
      setAcilKisi('');
      setAcilTelefon('');
      setNotlar('');
    }
    setHatalar({});
    setActiveTab('kimlik');
  }, [duzenlenecekPersonel, isOpen]);

  if (!isOpen) return null;

  // Doğrulama kontrolü
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!tcKimlik.trim()) {
      errs.tcKimlik = 'T.C. Kimlik No zorunludur.';
    } else if (!/^\d{11}$/.test(tcKimlik.trim())) {
      errs.tcKimlik = 'T.C. Kimlik No 11 haneli rakamlardan oluşmalıdır.';
    }

    if (!ad.trim()) errs.ad = 'Ad alanı zorunludur.';
    if (!soyad.trim()) errs.soyad = 'Soyad alanı zorunludur.';

    if (!pozisyon.trim()) errs.pozisyon = 'Pozisyon / Unvan alanı zorunludur.';

    if (maas <= 0 || isNaN(maas)) {
      errs.maas = 'Geçerli bir aylık net maaş giriniz.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Geçerli bir e-posta adresi yazınız.';
    }

    setHatalar(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onKaydet(
      {
        tcKimlik: tcKimlik.trim(),
        ad: ad.trim(),
        soyad: soyad.trim(),
        email: email.trim() || `${ad.toLowerCase()}.${soyad.toLowerCase()}@kurum.com.tr`,
        telefon: telefon.trim() || '0555 000 00 00',
        departman,
        pozisyon: pozisyon.trim(),
        maas: Number(maas),
        iseGirisTarihi,
        dogumTarihi,
        kanGrubu,
        durum,
        cinsiyet,
        egitimDurumu,
        adres: adres.trim(),
        sehir: sehir.trim(),
        acilKisi: acilKisi.trim(),
        acilTelefon: acilTelefon.trim(),
        notlar: notlar.trim(),
      },
      duzenlenecekPersonel ? duzenlenecekPersonel.id : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl border border-slate-300 overflow-hidden text-xs">
        {/* Windows Dialog Başlık Çubuğu */}
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center text-[9px] font-bold">
              {duzenlenecekPersonel ? '✎' : '+'}
            </div>
            <span className="font-semibold text-sm">
              {duzenlenecekPersonel ? 'Personel Kartını Güncelle' : 'Yeni Personel Tanımla'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal İçi Sekmeler */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2 space-x-1">
          <button
            type="button"
            onClick={() => setActiveTab('kimlik')}
            className={`px-3 py-1.5 font-medium rounded-t border-t-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'kimlik'
                ? 'bg-white text-blue-600 border-t-blue-600 border-x border-slate-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900 border-t-transparent'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Kimlik & Temel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('is')}
            className={`px-3 py-1.5 font-medium rounded-t border-t-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'is'
                ? 'bg-white text-blue-600 border-t-blue-600 border-x border-slate-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900 border-t-transparent'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>İş & Görev</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bordro')}
            className={`px-3 py-1.5 font-medium rounded-t border-t-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'bordro'
                ? 'bg-white text-blue-600 border-t-blue-600 border-x border-slate-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900 border-t-transparent'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Bordro & Maaş</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('iletisim')}
            className={`px-3 py-1.5 font-medium rounded-t border-t-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'iletisim'
                ? 'bg-white text-blue-600 border-t-blue-600 border-x border-slate-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900 border-t-transparent'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>İletişim & Adres</span>
          </button>
        </div>

        {/* Form Alanı */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* TAB 1: KİMLİK */}
          {activeTab === 'kimlik' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  T.C. Kimlik No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={tcKimlik}
                  onChange={(e) => setTcKimlik(e.target.value.replace(/\D/g, ''))}
                  placeholder="11 haneli T.C. kimlik numarası"
                  className={`w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-1 ${
                    hatalar.tcKimlik
                      ? 'border-red-500 focus:ring-red-400 bg-red-50/30'
                      : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {hatalar.tcKimlik && (
                  <p className="text-red-500 text-[10px] mt-0.5">{hatalar.tcKimlik}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Cinsiyet
                </label>
                <select
                  value={cinsiyet}
                  onChange={(e) => setCinsiyet(e.target.value as 'Erkek' | 'Kadın')}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Erkek">Erkek</option>
                  <option value="Kadın">Kadın</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Ad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ad}
                  onChange={(e) => setAd(e.target.value)}
                  placeholder="Personel adı"
                  className={`w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-1 ${
                    hatalar.ad ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {hatalar.ad && <p className="text-red-500 text-[10px] mt-0.5">{hatalar.ad}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={soyad}
                  onChange={(e) => setSoyad(e.target.value)}
                  placeholder="Personel soyadı"
                  className={`w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-1 ${
                    hatalar.soyad ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {hatalar.soyad && <p className="text-red-500 text-[10px] mt-0.5">{hatalar.soyad}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Doğum Tarihi</label>
                <input
                  type="date"
                  value={dogumTarihi}
                  onChange={(e) => setDogumTarihi(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Kan Grubu</label>
                <select
                  value={kanGrubu}
                  onChange={(e) => setKanGrubu(e.target.value as KanGrubuTuru)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="A+">A Rh(+)</option>
                  <option value="A-">A Rh(-)</option>
                  <option value="B+">B Rh(+)</option>
                  <option value="B-">B Rh(-)</option>
                  <option value="AB+">AB Rh(+)</option>
                  <option value="AB-">AB Rh(-)</option>
                  <option value="0+">0 Rh(+)</option>
                  <option value="0-">0 Rh(-)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">Eğitim Durumu</label>
                <select
                  value={egitimDurumu}
                  onChange={(e) => setEgitimDurumu(e.target.value as Personel['egitimDurumu'])}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Lise">Lise / Dengi Okul</option>
                  <option value="Ön Lisans">Ön Lisans (Meslek Yüksekokulu)</option>
                  <option value="Lisans">Lisans (Üniversite)</option>
                  <option value="Yüksek Lisans">Yüksek Lisans (Master)</option>
                  <option value="Doktora">Doktora (PhD)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: İŞ & GÖREV */}
          {activeTab === 'is' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Departman</label>
                <select
                  value={departman}
                  onChange={(e) => setDepartman(e.target.value as DepartmanTuru)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
                >
                  <option value="Yazılım & Bilişim">Yazılım & Bilişim</option>
                  <option value="İnsan Kaynakları">İnsan Kaynakları</option>
                  <option value="Muhasebe & Finans">Muhasebe & Finans</option>
                  <option value="Pazarlama & Satış">Pazarlama & Satış</option>
                  <option value="Operasyon & Lojistik">Operasyon & Lojistik</option>
                  <option value="Müşteri İlişkileri">Müşteri İlişkileri</option>
                  <option value="Hukuk & Uyum">Hukuk & Uyum</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Pozisyon / Unvan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={pozisyon}
                  onChange={(e) => setPozisyon(e.target.value)}
                  placeholder="Örn: Kıdemli Yazılım Mimarı"
                  className={`w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-1 ${
                    hatalar.pozisyon ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {hatalar.pozisyon && (
                  <p className="text-red-500 text-[10px] mt-0.5">{hatalar.pozisyon}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">İşe Başlama Tarihi</label>
                <input
                  type="date"
                  value={iseGirisTarihi}
                  onChange={(e) => setIseGirisTarihi(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">İstihdam Durumu</label>
                <select
                  value={durum}
                  onChange={(e) => setDurum(e.target.value as DurumTuru)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
                >
                  <option value="Aktif">Aktif Çalışan</option>
                  <option value="İzinli">Yıllık / Sağlık İzinli</option>
                  <option value="Ayrıldı">Ayrıldı (Eski Personel)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: BORDRO & MAAŞ */}
          {activeTab === 'bordro' && (
            <div className="space-y-3.5">
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-900">
                <div className="font-semibold mb-0.5">Maaş Bilgisi Gizliliği</div>
                <p className="text-[11px] text-blue-700">
                  Maaş bilgileri sistemdeki rol yetkilerine (Yetkilendirme Paneli) göre kısıtlanır. Yalnızca Admin, İK Yöneticisi ve Muhasebe kullanıcıları bu veriyi görüntüleyebilir.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Aylık Net Maaş (TL) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                      ₺
                    </span>
                    <input
                      type="number"
                      step={500}
                      min={0}
                      value={maas}
                      onChange={(e) => setMaas(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-medium text-slate-800"
                    />
                  </div>
                  {hatalar.maas && <p className="text-red-500 text-[10px] mt-0.5">{hatalar.maas}</p>}
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Özlük / Bordro Notu</label>
                  <input
                    type="text"
                    value={notlar}
                    onChange={(e) => setNotlar(e.target.value)}
                    placeholder="Örn: 2026 yılı performans primi dahil"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: İLETİŞİM & ADRES */}
          {activeTab === 'iletisim' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Telefon Numarası</label>
                <input
                  type="text"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="0532 123 45 67"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Kurumsal E-posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ad.soyad@kurum.com.tr"
                  className={`w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-1 ${
                    hatalar.email ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {hatalar.email && <p className="text-red-500 text-[10px] mt-0.5">{hatalar.email}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">İkamet Şehri</label>
                <input
                  type="text"
                  value={sehir}
                  onChange={(e) => setSehir(e.target.value)}
                  placeholder="İstanbul, Ankara vb."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Acil Durum İrtibat Kişisi</label>
                <input
                  type="text"
                  value={acilKisi}
                  onChange={(e) => setAcilKisi(e.target.value)}
                  placeholder="Örn: Ayşe Öztürk (Eşi)"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Acil Durum Telefonu</label>
                <input
                  type="text"
                  value={acilTelefon}
                  onChange={(e) => setAcilTelefon(e.target.value)}
                  placeholder="0533 000 00 00"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">İkamet Adresi</label>
                <textarea
                  rows={2}
                  value={adres}
                  onChange={(e) => setAdres(e.target.value)}
                  placeholder="Açık adres bilgisi..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>
          )}

          {/* Alt Butonlar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-4">
            <div className="text-[11px] text-slate-500 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>Kırmızı (*) işaretli alanlar zorunludur.</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors font-medium cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{duzenlenecekPersonel ? 'Değişiklikleri Kaydet' : 'Personeli Ekle'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
