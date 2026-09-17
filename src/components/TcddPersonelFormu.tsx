import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Personel,
  PersonelTuru,
  EgitimKurs,
  PersonelEvrak,
  RolYetkileri,
} from '../types';
import {
  Save,
  Check,
  Trash2,
  Edit3,
  UserPlus,
  FolderOpen,
  Camera,
  XCircle,
  Search,
  RotateCw,
  Calendar,
  FileText,
  Upload,
  Plus,
  Printer,
  Download,
  FileSpreadsheet,
  Database,
  Code2,
  ShieldCheck,
  CheckCircle2,
  Info,
  Table,
  ArrowLeft,
  X,
  Lock,
  Unlock,
  Maximize2,
} from 'lucide-react';
import {
  EGITIM_SEVIYELERI,
  EgitimSeviyesi,
  getBolumListesi,
  getEgitimSeviyesi,
} from '../data/educationData';
import { exportSinglePersonnelPdf, exportPersonnelToExcel, exportPersonnelToPdf } from '../utils/exportUtils';
import { searchMatches } from '../utils/textUtils';
import {
  TIS_31_BIRLESTIRILMIS_IS_ISIMLERI,
  formatPhoneNumber,
  formatDateInput,
  generateTcddEmail,
} from '../data/sanatKodlariData';

interface TcddPersonelFormuProps {
  personeller: Personel[];
  onPersonelKaydet: (personel: Personel, isNew: boolean) => void;
  onPersonelSil: (id: string) => void;
  showToast: (msg: string) => void;
  onOpenYedekleme: () => void;
  onResmiYazdir?: (personel?: Personel) => void;
  seciliPersonelId?: string;
  onSeciliPersonelChange?: (id: string) => void;
  isBosFormMode?: boolean;
  aktifGrup?: PersonelTuru;
  onAramaEkraninaDon?: () => void;
  onGenelListeAc?: () => void;
}

export function createEmptyPersonel(tur: PersonelTuru = 'ISCI'): Personel {
  return {
    id: `tcdd-${Date.now()}`,
    personelTuru: tur,
    tcKimlik: '',
    personelNo: '',
    sicilNo: '',
    ad: '',
    soyad: '',
    cinsiyet: 'Erkek',
    dogumYeri: '',
    dogumTarihi: '',
    medeniHal: 'Bekar',
    bitirdigiOkul: '',
    bolumu: '',
    kanGrubu: '',
    iseGirisTarihi: '',
    sanatKodu: '',
    unvan: '',
    postasi: '',
    calistigiBirim: 'Vagon Bakım Onarım Atelye Müdürlüğü',
    cepTelefonu: '',
    adres: '',
    fotografUrl: '',
    egitimlerVeKurslar: [],
    evraklar: [],
    olusturmaTarihi: new Date().toISOString(),
  };
}

export function TcddPersonelFormu({
  personeller,
  onPersonelKaydet,
  onPersonelSil,
  showToast,
  onOpenYedekleme,
  onResmiYazdir,
  seciliPersonelId,
  onSeciliPersonelChange,
  isBosFormMode = false,
  aktifGrup = 'ISCI',
  onAramaEkraninaDon,
  onGenelListeAc,
}: TcddPersonelFormuProps) {
  // Seçili personel ID
  const [seciliId, setSeciliId] = useState<string>(() => {
    if (isBosFormMode) return '';
    if (seciliPersonelId) return seciliPersonelId;
    const gruptakiler = personeller.filter(p => (p.personelTuru || 'ISCI') === aktifGrup);
    return gruptakiler[0]?.id || personeller[0]?.id || '';
  });

  // Düzenleme modu: Form açıldığında varsayılan olarak Pasiftir (salt okunur).
  // Sadece "Düzenle" butonuna basılınca veya "Yeni Ekle" denince düzenlenebilir olur.
  const [duzenlemeModu, setDuzenlemeModu] = useState<boolean>(isBosFormMode);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(isBosFormMode);
  const oncekiPersonelRef = useRef<Personel | null>(null);

  // Form Verisi
  const [formData, setFormData] = useState<Personel>(() => {
    if (isBosFormMode) {
      return createEmptyPersonel(aktifGrup);
    }
    const targetId = seciliPersonelId || seciliId;
    const p = personeller.find(x => x.id === targetId) || personeller.find(x => (x.personelTuru || 'ISCI') === aktifGrup) || personeller[0] || createEmptyPersonel(aktifGrup);
    return {
      ...p,
      personelTuru: p.personelTuru || aktifGrup,
      evraklar: p.evraklar || [],
      egitimlerVeKurslar: p.egitimlerVeKurslar || [],
    };
  });

  // Dışarıdan veya listeden personel seçildiğinde doğrudan pasif modda form güncellemesi
  const handlePersonelSecimi = (target: Personel) => {
    setIsNewRecord(false);
    setDuzenlemeModu(false); // Yeni kayıt seçildiğinde form daima pasif olarak açılır
    setSeciliId(target.id);
    setFormData({
      ...target,
      personelTuru: target.personelTuru || aktifGrup,
      evraklar: target.evraklar || [],
      egitimlerVeKurslar: target.egitimlerVeKurslar || [],
    });
    setManuelBolumGirisi(false);
    if (onSeciliPersonelChange) {
      onSeciliPersonelChange(target.id);
    }
  };

  // Dışarıdan seciliPersonelId prop'u değiştiğinde (örneğin Arama sayfasından tıklandığında) senkronize et
  const sonSenkronIdRef = useRef<string | undefined>(seciliPersonelId);

  useEffect(() => {
    if (isBosFormMode) {
      setFormData(createEmptyPersonel(aktifGrup));
      setIsNewRecord(true);
      setDuzenlemeModu(true);
      setSeciliId('');
      sonSenkronIdRef.current = undefined;
      return;
    }

    if (seciliPersonelId && seciliPersonelId !== sonSenkronIdRef.current) {
      sonSenkronIdRef.current = seciliPersonelId;
      const target = personeller.find(p => p.id === seciliPersonelId);
      if (target) {
        setSeciliId(target.id);
        setFormData({
          ...target,
          personelTuru: target.personelTuru || aktifGrup,
          evraklar: target.evraklar || [],
          egitimlerVeKurslar: target.egitimlerVeKurslar || [],
        });
        setIsNewRecord(false);
        setDuzenlemeModu(false); // Arama veya listeden seçildiğinde form pasif başlar
        setManuelBolumGirisi(false);
      }
    }
  }, [seciliPersonelId, isBosFormMode, aktifGrup, personeller]);

  // Arama ve filtre
  const [aramaMetni, setAramaMetni] = useState('');
  const [aramaTuru, setAramaTuru] = useState<'tcKimlik' | 'ad' | 'soyad'>('tcKimlik');
  const [manuelBolumGirisi, setManuelBolumGirisi] = useState(false);

  // Modallar
  const [evrakModalOpen, setEvrakModalOpen] = useState(false);
  const [fotoModalOpen, setFotoModalOpen] = useState(false);
  const [fotoBuyutModalOpen, setFotoBuyutModalOpen] = useState(false);
  const [yeniEvrakAdi, setYeniEvrakAdi] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // Aktif gruptaki personeller ve filtrelenmiş liste
  const gruptakiPersoneller = personeller.filter(p => (p.personelTuru || 'ISCI') === aktifGrup);

  const filtrelenmisPersoneller = gruptakiPersoneller.filter(p => {
    if (!aramaMetni.trim()) return true;
    if (aramaTuru === 'tcKimlik') return searchMatches(p.tcKimlik, aramaMetni) || searchMatches(p.sicilNo, aramaMetni);
    if (aramaTuru === 'ad') return searchMatches(p.ad, aramaMetni);
    if (aramaTuru === 'soyad') return searchMatches(p.soyad, aramaMetni);
    return searchMatches(`${p.ad} ${p.soyad}`, aramaMetni) || searchMatches(p.sicilNo, aramaMetni);
  });

  // Kayıt Gezintisi (Navigation)
  const currentIdx = filtrelenmisPersoneller.findIndex(p => p.id === seciliId);
  const totalCount = filtrelenmisPersoneller.length;

  const handleIlk = () => {
    if (filtrelenmisPersoneller.length > 0) {
      handlePersonelSecimi(filtrelenmisPersoneller[0]);
    }
  };
  const handleOnceki = () => {
    if (filtrelenmisPersoneller.length > 0) {
      const idx = currentIdx > 0 ? currentIdx - 1 : 0;
      handlePersonelSecimi(filtrelenmisPersoneller[idx]);
    }
  };
  const handleSonraki = () => {
    if (filtrelenmisPersoneller.length > 0) {
      const idx = currentIdx < filtrelenmisPersoneller.length - 1 ? currentIdx + 1 : filtrelenmisPersoneller.length - 1;
      handlePersonelSecimi(filtrelenmisPersoneller[idx]);
    }
  };
  const handleSon = () => {
    if (filtrelenmisPersoneller.length > 0) {
      handlePersonelSecimi(filtrelenmisPersoneller[filtrelenmisPersoneller.length - 1]);
    }
  };

  // Form Alanı Değişikliği
  const handleInputChange = (field: keyof Personel, value: any) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value,
      };
      if (field === 'sanatKodu') {
        updated.unvan = value;
      }
      if (field === 'unvan') {
        updated.sanatKodu = value;
      }
      return updated;
    });
  };

  // Okul Seviyesi ve Bölüm Mantığı (Harf Sırasına Göre Düzenlendi - Madde 4)
  const seciliOkulSeviyesi = getEgitimSeviyesi(formData.bitirdigiOkul);
  const bolumSecenekleri = useMemo(() => {
    return getBolumListesi(seciliOkulSeviyesi)
      .slice()
      .sort((a, b) => a.localeCompare(b, 'tr'));
  }, [seciliOkulSeviyesi]);
  const isIlkOrOrta = seciliOkulSeviyesi === 'İlkokul' || seciliOkulSeviyesi === 'Ortaokul';

  const handleOkulSeviyeDegistir = (yeniSeviye: string) => {
    const seviye = yeniSeviye as EgitimSeviyesi;
    setFormData(prev => {
      let yeniBolum = prev.bolumu;
      if (seviye === 'İlkokul' || seviye === 'Ortaokul') {
        yeniBolum = '';
      } else {
        const liste = getBolumListesi(seviye).slice().sort((a, b) => a.localeCompare(b, 'tr'));
        if (liste.length > 0 && (!prev.bolumu || !liste.includes(prev.bolumu))) {
          yeniBolum = liste[0];
        }
      }
      return {
        ...prev,
        bitirdigiOkul: yeniSeviye,
        bolumu: yeniBolum,
      };
    });
    setManuelBolumGirisi(false);
  };

  // Düzenleme Modunu Aç
  const handleDuzenle = () => {
    setDuzenlemeModu(true);
    showToast(`${formData.ad} ${formData.soyad} personeli için form düzenlemeye açıldı.`);
  };

  // Düzenlemeden Vazgeç (Orijinal Veriye Dön ve Pasif Yap)
  const handleDuzenleIptal = () => {
    const original = personeller.find(p => p.id === formData.id);
    if (original) {
      setFormData({
        ...original,
        personelTuru: original.personelTuru || aktifGrup,
        evraklar: original.evraklar || [],
        egitimlerVeKurslar: original.egitimlerVeKurslar || [],
      });
    }
    setDuzenlemeModu(false);
    showToast('Düzenleme iptal edildi, form korumalı (pasif) moda alındı.');
  };

  // Yeni Ekle
  const handleYeniEkle = () => {
    oncekiPersonelRef.current = { ...formData };
    const yeni = createEmptyPersonel(formData?.personelTuru || aktifGrup);
    setFormData(yeni);
    setIsNewRecord(true);
    setDuzenlemeModu(true);
    setSeciliId('');
    showToast(`Yeni ${yeni.personelTuru === 'MEMUR' ? 'Memur' : 'İşçi'} personel formu açıldı. Bilgileri girip [Kaydet] butonuna basınız veya vazgeçmek için [İptal Et] butonunu kullanınız.`);
  };

  // İptal Et (Yeni personel eklemeden vazgeçme)
  const handleIptalEt = () => {
    setIsNewRecord(false);
    setDuzenlemeModu(false);
    if (oncekiPersonelRef.current && oncekiPersonelRef.current.id) {
      setFormData({ ...oncekiPersonelRef.current });
      setSeciliId(oncekiPersonelRef.current.id);
    } else if (gruptakiPersoneller.length > 0) {
      setFormData({ ...gruptakiPersoneller[0] });
      setSeciliId(gruptakiPersoneller[0].id);
    }
    showToast('Yeni personel ekleme işlemi iptal edildi.');
  };

  // Kaydet / Güncelle
  const handleKaydetVeGuncelle = () => {
    if (!formData.tcKimlik || !formData.ad || !formData.soyad) {
      showToast('Lütfen zorunlu alanları (TC Kimlik, Ad, Soyad) doldurunuz!');
      return;
    }

    // E-posta kontrol ve otomatik oluşturma (Madde 6)
    let finalEmail = formData.email?.trim() || '';
    if (!finalEmail || finalEmail === '@tcddtasimacilik.gov.tr') {
      finalEmail = generateTcddEmail(formData.ad, formData.soyad);
    } else if (!finalEmail.includes('@')) {
      finalEmail = `${finalEmail}@tcddtasimacilik.gov.tr`;
    }

    // Personel No (1100 ön eki kaldırıldı - Madde 2)
    const finalPersonelNo = formData.personelNo?.trim() || '';

    const dataToSave: Personel = {
      ...formData,
      soyad: formData.soyad ? formData.soyad.trim().toLocaleUpperCase('tr-TR') : '',
      email: finalEmail,
      personelNo: finalPersonelNo,
      cepTelefonu: formatPhoneNumber(formData.cepTelefonu),
      dogumTarihi: formatDateInput(formData.dogumTarihi),
      iseGirisTarihi: formatDateInput(formData.iseGirisTarihi),
    };

    setFormData(dataToSave);
    onPersonelKaydet(dataToSave, isNewRecord);
    setIsNewRecord(false);
    setDuzenlemeModu(false); // Kayıttan sonra form otomatik olarak pasif moda döner
    setSeciliId(dataToSave.id);
    showToast(`${dataToSave.ad} ${dataToSave.soyad} (${dataToSave.sicilNo || dataToSave.personelNo}) başarıyla kaydedildi.`);
  };

  // Sil
  const handleSil = () => {
    if (confirm(`"${formData.ad} ${formData.soyad}" isimli personeli sistemden silmek istediğinize emin misiniz?`)) {
      onPersonelSil(formData.id);
      showToast(`${formData.ad} ${formData.soyad} kaydı silindi.`);
      const kalanlar = personeller.filter(p => p.id !== formData.id);
      if (kalanlar.length > 0) {
        setSeciliId(kalanlar[0].id);
        setDuzenlemeModu(false);
      }
    }
  };

  // Bilgileri Getir butonu
  const handleBilgileriGetir = () => {
    if (filtrelenmisPersoneller.length > 0) {
      const ilk = filtrelenmisPersoneller[0];
      setSeciliId(ilk.id);
      setFormData({ ...ilk });
      setIsNewRecord(false);
      showToast(`Sicil No: ${ilk.sicilNo} (${ilk.ad} ${ilk.soyad}) bilgileri ekrana getirildi.`);
    } else {
      showToast('Aranan kriterde personel bulunamadı.');
    }
  };

  // Fotoğraf Yükleme
  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, fotografUrl: base64 }));
        setFotoModalOpen(false);
        showToast('Personel fotoğrafı güncellendi. Kaydetmek için Güncelle butonuna basınız.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Fotoğrafı Sil
  const handleFotoSil = () => {
    setFormData(prev => ({ ...prev, fotografUrl: '' }));
    showToast('Fotoğraf kaldırıldı.');
  };

  // Evrak Yükleme
  const handleEvrakUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const docItem: PersonelEvrak = {
        id: `doc-${Date.now()}`,
        ad: yeniEvrakAdi.trim() || file.name,
        tarih: new Date().toLocaleDateString('tr-TR'),
        dosyaTuru:
          file?.name && typeof file.name === 'string' && file.name.toLowerCase().endsWith('.pdf')
            ? 'PDF'
            : 'BELGE',
        boyut: `${(file.size / 1024).toFixed(0)} KB`,
      };
      const guncelEvraklar = [...(formData.evraklar || []), docItem];
      setFormData(prev => ({ ...prev, evraklar: guncelEvraklar }));
      setYeniEvrakAdi('');
      showToast(`"${docItem.ad}" evrak listesine eklendi.`);
    }
  };

  return (
    <div className="flex flex-col h-full select-none bg-[#ece9d8] text-black font-sans text-xs overflow-hidden">
      {/* 2. PERSONEL BİLGİ & DURUM BARI (Hızlı Personel Arama / Seçme ve Gezinme) */}
      <div className="px-3 py-2 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200 bg-white shadow-2xs">
        {/* Sol: Seçili Personel Özeti & Kadro Rozeti */}
        <div className="flex items-center gap-2.5 min-w-[220px]">
          <div
            onClick={() => {
              if (formData.fotografUrl) setFotoBuyutModalOpen(true);
            }}
            className={`w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs ${
              formData.fotografUrl ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''
            }`}
            title={formData.fotografUrl ? 'Fotoğrafı büyütmek için tıklayınız' : undefined}
          >
            {formData.fotografUrl ? (
              <img src={formData.fotografUrl} alt={formData.ad} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-slate-600 font-mono">
                {(formData.ad?.[0] || 'P') + (formData.soyad?.[0] || '')}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                {formData.ad || formData.soyad ? (
                  <>
                    <span>{formData.ad}</span>{' '}
                    <span className="uppercase">{formData.soyad?.toLocaleUpperCase('tr-TR')}</span>
                  </>
                ) : (
                  'Yeni Personel Kaydı'
                )}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${
                  aktifGrup === 'MEMUR'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-blue-50 text-blue-800 border-blue-300'
                }`}
              >
                {aktifGrup === 'MEMUR' ? 'Memur' : 'İşçi'}
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                {formData.durum || 'Aktif'}
              </span>

              {/* FORM KORUMA (PASİF / AKTİF) DURUM ROZETİ */}
              <span
                className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold border flex items-center gap-1 ${
                  duzenlemeModu
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
                title={duzenlemeModu ? 'Form şu an düzenlenebilir durumdadır.' : 'Form korumalı (salt okunur) durumdadır. Değiştirmek için Düzenle butonuna basınız.'}
              >
                {duzenlemeModu ? (
                  <>
                    <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Düzenleme Açık</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-2.5 h-2.5 text-amber-600" />
                    <span>Form Pasif</span>
                  </>
                )}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>Sicil: <b className="text-slate-800 font-mono">{formData.sicilNo || '-'}</b></span>
              <span>•</span>
              <span>Sanat: <span className="text-slate-700 font-medium truncate max-w-[140px]">{formData.sanatKodu || '-'}</span></span>
            </div>
          </div>
        </div>

        {/* ORTA: PERSONEL ARAMA VE AÇILIR LİSTE SEÇİM KUTUSU (Madde 1) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-300 shadow-inner">
          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-1.5 py-0.5 shadow-2xs">
            <Search className="w-3 h-3 text-blue-600 shrink-0" />
            <input
              type="text"
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              placeholder="İsim veya Sicil Ara..."
              className="text-[11px] bg-transparent focus:outline-none w-24 sm:w-32 text-slate-900 placeholder:text-slate-400"
            />
            {aramaMetni && (
              <button
                onClick={() => setAramaMetni('')}
                className="text-slate-400 hover:text-slate-600 text-[10px] px-0.5 font-bold cursor-pointer"
                title="Aramayı temizle"
              >
                ✕
              </button>
            )}
          </div>

          {/* Açılır Personel Seçim Listesi (Dropdown) */}
          <select
            id="select-personel-secim"
            value={seciliId || ''}
            onChange={(e) => {
              const p = personeller.find(item => item.id === e.target.value);
              if (p) handlePersonelSecimi(p);
            }}
            className="bg-white border border-slate-300 text-[11px] font-semibold rounded px-2 py-0.5 text-slate-800 focus:outline-none focus:border-blue-600 max-w-[180px] sm:max-w-[210px] truncate shadow-2xs cursor-pointer"
          >
            <option value="">
              {filtrelenmisPersoneller.length === 0 ? 'Kayıt bulunamadı' : `-- Personel Seç (${filtrelenmisPersoneller.length}) --`}
            </option>
            {filtrelenmisPersoneller
              .slice()
              .sort((a, b) => (a.ad + ' ' + a.soyad).localeCompare(b.ad + ' ' + b.soyad, 'tr'))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sicilNo ? `${p.sicilNo} - ` : ''}{p.ad} {p.soyad?.toLocaleUpperCase('tr-TR')}
                </option>
              ))}
          </select>

          {/* Hızlı Önceki / Sonraki Butonları */}
          <div className="flex items-center border border-slate-300 rounded overflow-hidden shadow-2xs">
            <button
              onClick={handleOnceki}
              disabled={filtrelenmisPersoneller.length <= 1}
              title="Önceki Personel"
              className="px-1.5 py-0.5 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-[10px] font-bold border-r border-slate-300 cursor-pointer"
            >
              ◀
            </button>
            <span className="px-1.5 py-0.5 bg-slate-50 text-[10px] font-mono font-bold text-slate-600 select-none">
              {currentIdx >= 0 ? `${currentIdx + 1}/${totalCount}` : `-/${totalCount}`}
            </span>
            <button
              onClick={handleSonraki}
              disabled={filtrelenmisPersoneller.length <= 1}
              title="Sonraki Personel"
              className="px-1.5 py-0.5 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-[10px] font-bold cursor-pointer"
            >
              ▶
            </button>
          </div>
        </div>

        {/* SAĞ: PERSONEL NO VE SİCİL NO (1100 Sabiti Kaldırıldı - Madde 2) */}
        <div className="flex items-center gap-2">
          {/* Personel No */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-300 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">Personel No</span>
            <input
              id="input-personel-no"
              type="text"
              disabled={!duzenlemeModu}
              value={formData.personelNo || ''}
              onChange={(e) => handleInputChange('personelNo', e.target.value)}
              placeholder="Örn: 10452"
              className={`border rounded px-1.5 py-0.5 text-xs font-bold w-[80px] text-center font-mono ${
                duzenlemeModu
                  ? 'bg-white border-slate-300 focus:border-blue-600 text-purple-900'
                  : 'bg-[#f0ede1] border-[#c0bdb2] text-purple-950 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Sicil No */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-300 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">Sicil No</span>
            <input
              id="input-sicil-no"
              type="text"
              disabled={!duzenlemeModu}
              value={formData.sicilNo || ''}
              onChange={(e) => handleInputChange('sicilNo', e.target.value)}
              placeholder="4315073"
              className={`border rounded px-1.5 py-0.5 text-xs font-black tracking-wider w-[85px] text-center font-mono ${
                duzenlemeModu
                  ? 'bg-white border-slate-300 focus:border-blue-600 text-blue-900'
                  : 'bg-[#f0ede1] border-[#c0bdb2] text-blue-950 cursor-not-allowed'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 3. MAIN BODY CONTAINER - Sığdırılmış, Yatay Kaydırma Çubuğu Olmayan Düzen */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-2.5 flex flex-col lg:flex-row gap-2 min-h-0 bg-slate-100 w-full">

        {/* MIDDLE COLUMN: FORM FIELDS */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {/* GROUP 1: PERSONEL GENEL BILGILERI */}
          <fieldset className="border border-[#7f9db9] p-2 bg-[#fbfaf6] shadow-xs">
            <legend className="px-1 text-[11px] font-bold text-gray-700">
              Personel Genel Bilgileri
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 mt-0.5">
              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  TC Kimlik No <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  maxLength={11}
                  disabled={!duzenlemeModu}
                  value={formData.tcKimlik}
                  onChange={(e) => handleInputChange('tcKimlik', e.target.value)}
                  className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Cinsiyeti
                </label>
                <select
                  disabled={!duzenlemeModu}
                  value={formData.cinsiyet || 'Erkek'}
                  onChange={(e) => handleInputChange('cinsiyet', e.target.value)}
                  className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                >
                  <option value="Erkek">Erkek</option>
                  <option value="Kadın">Kadın</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Adı <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  disabled={!duzenlemeModu}
                  value={formData.ad}
                  onChange={(e) => handleInputChange('ad', e.target.value)}
                  className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Doğum Yeri
                </label>
                <input
                  type="text"
                  disabled={!duzenlemeModu}
                  value={formData.dogumYeri}
                  onChange={(e) => handleInputChange('dogumYeri', e.target.value)}
                  className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Soyadı <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  disabled={!duzenlemeModu}
                  value={formData.soyad}
                  onChange={(e) => handleInputChange('soyad', e.target.value.toLocaleUpperCase('tr-TR'))}
                  className={`flex-1 border px-2 py-0.5 text-xs text-black uppercase font-medium ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Doğum Tarihi
                </label>
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    disabled={!duzenlemeModu}
                    placeholder="dd.mm.yyyy"
                    value={formData.dogumTarihi || ''}
                    onChange={(e) => handleInputChange('dogumTarihi', formatDateInput(e.target.value))}
                    className={`w-full border px-2 py-0.5 text-xs text-black pr-6 ${
                      duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                    }`}
                  />
                  <Calendar className="w-3.5 h-3.5 text-gray-500 absolute right-1.5 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="text-[10px] text-gray-500 italic mt-1">
              * işaretli alanlar doldurulması zorunlu bilgilerdir.
            </div>
          </fieldset>

          {/* GROUP 2: PERSONEL AİLE VE EĞİTİM BİLGİLERİ */}
          <fieldset className="border border-[#7f9db9] p-2 bg-[#fbfaf6] shadow-xs">
            <legend className="px-1 text-[11px] font-bold text-gray-700">
              Personel Aile ve Eğitim Bilgileri
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 mt-0.5">
              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Medeni Hali
                </label>
                <select
                  disabled={!duzenlemeModu}
                  value={formData.medeniHal || 'Bekar'}
                  onChange={(e) => handleInputChange('medeniHal', e.target.value)}
                  className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                >
                  <option value="Bekar">Bekar</option>
                  <option value="Evli">Evli</option>
                  <option value="Dul">Dul</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Kan Grubu
                </label>
                <input
                  type="text"
                  disabled={!duzenlemeModu}
                  value={formData.kanGrubu}
                  onChange={(e) => handleInputChange('kanGrubu', e.target.value)}
                  placeholder="Örn: B RH ( + )"
                  className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                />
              </div>

              {/* Bitirdiği Okul - Açılır Seçim Listesi */}
              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Bitirdiği Okul
                </label>
                <select
                  id="select-bitirdigi-okul"
                  disabled={!duzenlemeModu}
                  value={seciliOkulSeviyesi || formData.bitirdigiOkul || ''}
                  onChange={(e) => handleOkulSeviyeDegistir(e.target.value)}
                  className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                >
                  <option value="">-- Okul Seçiniz --</option>
                  {EGITIM_SEVIYELERI.map((okul) => (
                    <option key={okul} value={okul}>
                      {okul}
                    </option>
                  ))}
                  {formData.bitirdigiOkul && !EGITIM_SEVIYELERI.includes(formData.bitirdigiOkul as any) && (
                    <option value={formData.bitirdigiOkul}>{formData.bitirdigiOkul}</option>
                  )}
                </select>
              </div>

              {/* Bölümü - Dinamik Müfredat Seçimi / İlköğretimde Pasif (Harf Sırasına Göre - Madde 4) */}
              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Bölümü
                </label>
                {isIlkOrOrta ? (
                  <input
                    type="text"
                    disabled={true}
                    value=""
                    placeholder="— Bölüm Yok (Pasif) —"
                    className="flex-1 border px-2 py-0.5 text-xs text-gray-400 bg-[#e8e5dc] border-[#c0bdb2] italic cursor-not-allowed"
                    title="İlkokul ve Ortaokul mezuniyeti için bölüm alanı bulunmamaktadır"
                  />
                ) : manuelBolumGirisi ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      type="text"
                      disabled={!duzenlemeModu}
                      value={formData.bolumu}
                      onChange={(e) => handleInputChange('bolumu', e.target.value)}
                      placeholder="Bölüm adını yazınız..."
                      className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                        duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                      }`}
                    />
                    {duzenlemeModu && (
                      <button
                        type="button"
                        onClick={() => setManuelBolumGirisi(false)}
                        className="px-1.5 py-0.5 text-[10px] bg-gray-200 hover:bg-gray-300 border border-gray-400 text-gray-700 cursor-pointer"
                        title="Hazır listeye dön"
                      >
                        Liste
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-1">
                    <select
                      id="select-bolumu"
                      disabled={!duzenlemeModu || !seciliOkulSeviyesi}
                      value={formData.bolumu || ''}
                      onChange={(e) => {
                        if (e.target.value === '__MANUEL__') {
                          setManuelBolumGirisi(true);
                        } else {
                          handleInputChange('bolumu', e.target.value);
                        }
                      }}
                      className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                        duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                      }`}
                    >
                      <option value="">
                        {seciliOkulSeviyesi ? '-- Bölüm Seçiniz --' : '-- Önce Okul Seçiniz --'}
                      </option>
                      {formData.bolumu && !bolumSecenekleri.includes(formData.bolumu) && (
                        <option value={formData.bolumu}>{formData.bolumu} (Kayıtlı)</option>
                      )}
                      {bolumSecenekleri.map((bolum) => (
                        <option key={bolum} value={bolum}>
                          {bolum}
                        </option>
                      ))}
                      {duzenlemeModu && (
                        <option value="__MANUEL__">✏️ Diğer (Kendiniz Yazın)...</option>
                      )}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </fieldset>

          {/* GROUP 3: PERSONEL İŞ BİLGİLERİ */}
          <fieldset className="border border-[#7f9db9] p-2 bg-[#fbfaf6] shadow-xs">
            <legend className="px-1 text-[11px] font-bold text-gray-700">
              Personel İş Bilgileri
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 mt-0.5">
              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  İşe Giriş Tarihi
                </label>
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    disabled={!duzenlemeModu}
                    placeholder="dd.mm.yyyy"
                    value={formData.iseGirisTarihi || ''}
                    onChange={(e) => handleInputChange('iseGirisTarihi', formatDateInput(e.target.value))}
                    className={`w-full border px-2 py-0.5 text-xs text-black pr-6 ${
                      duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                    }`}
                  />
                  <Calendar className="w-3.5 h-3.5 text-gray-500 absolute right-1.5 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Çalıştığı Birim
                </label>
                <input
                  type="text"
                  disabled={!duzenlemeModu}
                  value={formData.calistigiBirim}
                  onChange={(e) => handleInputChange('calistigiBirim', e.target.value)}
                  className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                />
              </div>

              {/* 31. DÖNEM TİS BİRLEŞTİRİLMİŞ İŞ İSMİ AÇILIR LİSTESİ (Harf Sırasına Göre - Madde 4) */}
              <div className="flex items-center col-span-1 sm:col-span-2">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Sanat Kodu / İş İsmi
                </label>
                <select
                  disabled={!duzenlemeModu}
                  value={formData.sanatKodu || ''}
                  onChange={(e) => handleInputChange('sanatKodu', e.target.value)}
                  className={`flex-1 border px-2 py-1 text-xs text-black ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9] font-medium' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                >
                  <option value="">-- 31. Dönem TİS Birleştirilmiş İş İsmi Seçiniz --</option>
                  {formData.sanatKodu && !TIS_31_BIRLESTIRILMIS_IS_ISIMLERI.includes(formData.sanatKodu as any) && (
                    <option value={formData.sanatKodu}>{formData.sanatKodu} (Mevcut)</option>
                  )}
                  {TIS_31_BIRLESTIRILMIS_IS_ISIMLERI.map((isIsmi) => (
                    <option key={isIsmi} value={isIsmi}>
                      {isIsmi}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* GROUP 4: PERSONEL İLETİŞİM & ADRES BİLGİLERİ (İş Bilgilerinin Altına Taşındı) */}
          <fieldset className="border border-[#7f9db9] p-2 bg-[#fbfaf6] shadow-xs">
            <legend className="px-1 text-[11px] font-bold text-gray-700">
              Personel İletişim ve Adres Bilgileri
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 mt-0.5">
              {/* TELEFON: 10 HANE, ... ... .. .. FORMATINDA */}
              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Cep Telefonu
                </label>
                <input
                  type="text"
                  maxLength={13}
                  disabled={!duzenlemeModu}
                  value={formData.cepTelefonu || ''}
                  onChange={(e) => handleInputChange('cepTelefonu', formatPhoneNumber(e.target.value))}
                  placeholder="5XX XXX XX XX"
                  className={`flex-1 border px-2 py-0.5 text-xs text-black font-mono ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                />
              </div>

              {/* Şehir / İlçe */}
              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Şehir / İlçe
                </label>
                <input
                  type="text"
                  disabled={!duzenlemeModu}
                  value={formData.sehir || ''}
                  onChange={(e) => handleInputChange('sehir', e.target.value)}
                  placeholder="İstanbul / Pendik"
                  className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                />
              </div>

              {/* E-POSTA: @tcddtasimacilik.gov.tr SABİT, BOŞSA OTOMATİK İSİMSOYİSİM */}
              <div className="flex items-center col-span-1 sm:col-span-2">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  E-Posta
                </label>
                <div className="flex-1 flex items-center">
                  <input
                    type="text"
                    disabled={!duzenlemeModu}
                    value={
                      formData.email?.endsWith('@tcddtasimacilik.gov.tr')
                        ? formData.email.replace('@tcddtasimacilik.gov.tr', '')
                        : (formData.email || '')
                    }
                    onChange={(e) => {
                      const prefix = e.target.value.replace(/@.*$/, '').trim();
                      handleInputChange('email', prefix ? `${prefix}@tcddtasimacilik.gov.tr` : '');
                    }}
                    placeholder="isimsoyisim (otomatik)"
                    className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                      duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                    }`}
                  />
                  <span className="bg-slate-100 border-y border-r border-slate-300 px-2 py-0.5 text-xs font-semibold text-slate-700 select-none whitespace-nowrap">
                    @tcddtasimacilik.gov.tr
                  </span>
                </div>
              </div>

              {/* İKAMET ADRESİ */}
              <div className="flex items-start col-span-1 sm:col-span-2">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0 pt-0.5">
                  İkamet Adresi
                </label>
                <textarea
                  rows={2}
                  disabled={!duzenlemeModu}
                  value={formData.adres}
                  onChange={(e) => handleInputChange('adres', e.target.value)}
                  placeholder="Açık ikametgah adresi..."
                  className={`flex-1 border px-2 py-0.5 text-xs text-black resize-none ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                />
              </div>
            </div>
          </fieldset>
        </div>

        {/* RIGHT COLUMN: SADECE FOTOĞRAF VE EVRAK BÖLÜMÜ */}
        <div className="w-full lg:w-[260px] xl:w-[280px] shrink-0 flex flex-col gap-2">
          <fieldset className="border border-[#7f9db9] p-3 bg-[#fbfaf6] shadow-xs flex flex-col items-center">
            <legend className="px-1 text-[11px] font-bold text-gray-700">
              Personel Fotoğrafı
            </legend>

            {/* FOTO KUTUSU - TAM KARE (SQUARE) */}
            <div
              onClick={() => {
                if (formData.fotografUrl) setFotoBuyutModalOpen(true);
              }}
              title={formData.fotografUrl ? 'Fotoğrafı büyütmek için tıklayınız' : undefined}
              className={`w-36 h-36 sm:w-44 sm:h-44 aspect-square bg-white border-2 border-[#7f9db9] rounded shadow-xs relative flex items-center justify-center overflow-hidden my-1 ${
                formData.fotografUrl ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 group' : ''
              }`}
            >
              {formData.fotografUrl ? (
                <>
                  <img
                    src={formData.fotografUrl}
                    alt={`${formData.ad} ${formData.soyad}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Maximize2 className="w-6 h-6 text-white drop-shadow" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center select-none">
                  <Camera className="w-10 h-10 text-gray-300 mb-1" />
                  <span className="text-xs font-medium">Fotoğraf Yok</span>
                </div>
              )}
            </div>

            {/* FOTOĞRAF VE EVRAK BUTONLARI */}
            <div className="w-full flex flex-col gap-1.5 mt-2">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  disabled={!duzenlemeModu}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border px-2 py-1.5 text-xs font-semibold shadow-2xs flex items-center justify-center gap-1.5 rounded ${
                    duzenlemeModu
                      ? 'bg-[#ece9d8] hover:bg-[#dfdbcb] active:bg-[#cfcbba] border-[#7f9db9] text-gray-900 cursor-pointer'
                      : 'bg-[#f0ede1] border-[#c0bdb2] text-gray-400 cursor-not-allowed opacity-60'
                  }`}
                  title={duzenlemeModu ? 'Fotoğraf yükle' : 'Fotoğraf eklemek için önce Düzenle butonuna basınız'}
                >
                  <Camera className={`w-3.5 h-3.5 shrink-0 ${duzenlemeModu ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span>Fotoğraf Ekle</span>
                </button>

                <button
                  disabled={!duzenlemeModu || !formData.fotografUrl}
                  onClick={handleFotoSil}
                  className={`border px-2 py-1.5 text-xs font-semibold shadow-2xs flex items-center justify-center gap-1.5 rounded ${
                    duzenlemeModu && formData.fotografUrl
                      ? 'bg-[#ece9d8] hover:bg-[#dfdbcb] active:bg-[#cfcbba] border-[#7f9db9] text-gray-900 cursor-pointer'
                      : 'bg-[#f0ede1] border-[#c0bdb2] text-gray-400 cursor-not-allowed opacity-60'
                  }`}
                  title={duzenlemeModu ? 'Fotoğrafı sil' : 'Fotoğraf silmek için önce Düzenle butonuna basınız'}
                >
                  <XCircle className={`w-3.5 h-3.5 shrink-0 ${duzenlemeModu && formData.fotografUrl ? 'text-red-600' : 'text-gray-400'}`} />
                  <span>Fotoğrafı Sil</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFotoUpload}
                className="hidden"
              />

              <button
                onClick={() => setEvrakModalOpen(true)}
                className="w-full bg-[#ece9d8] hover:bg-[#dfdbcb] active:bg-[#cfcbba] border border-[#7f9db9] px-2 py-1.5 text-xs font-semibold text-gray-900 shadow-2xs flex items-center justify-center gap-1.5 rounded cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Evraklar ve Belgeler ({formData.evraklar?.length || 0})</span>
              </button>
            </div>

            {/* Evrak Özet Kutusu */}
            <div className="w-full mt-2.5 pt-2 border-t border-[#d4d0c8] flex items-center justify-between text-[11px] text-gray-600">
              <div className="flex items-center gap-1">
                <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Yüklü Evrak: <b>{formData.evraklar?.length || 0} adet</b></span>
              </div>
              <button
                onClick={() => setEvrakModalOpen(true)}
                className="text-blue-700 hover:text-blue-900 font-semibold underline cursor-pointer"
              >
                Yönet
              </button>
            </div>
          </fieldset>
        </div>
      </div>

      {/* 4. BOTTOM ACTION TOOLBAR (RESMİ YAZDIR, DÜZENLE, GÜNCELLE, VAZGEÇ, YENİ EKLE, SİL) */}
      <div className="bg-white border-t border-slate-300 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        {/* SOL: RESMİ RAPOR & FORM KİLİT BİLGİSİ */}
        <div className="flex items-center gap-2">
          {onResmiYazdir && (
            <button
              onClick={() => onResmiYazdir(formData)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Resmi Rapor Yazdır / PDF</span>
            </button>
          )}

          {/* Form Kilit / Düzenleme Bilgi İpucu */}
          {!isNewRecord && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
              {duzenlemeModu ? (
                <>
                  <Unlock className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-800 font-semibold">Düzenleme Modu Açık</span>
                  <span className="text-slate-400">• Değişiklikleri [Güncelle] ile kaydedin</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span className="text-slate-700 font-medium">Form Korumalı (Pasif)</span>
                  <span className="text-slate-400">• Değiştirmek için <b>[Düzenle]</b> butonuna basınız</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* SAĞ: İŞLEM BUTONLARI */}
        <div className="flex items-center gap-2">
          {isNewRecord ? (
            <>
              {/* KAYDET (Yeni Kayıt) */}
              <button
                id="btn-yeni-kaydet"
                onClick={handleKaydetVeGuncelle}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-xs cursor-pointer transition-colors"
                title="Yeni personeli kaydet"
              >
                <Save className="w-4 h-4" />
                <span>Kaydet</span>
              </button>

              {/* İPTAL ET (Yeni Eklemeden Vazgeçme) */}
              <button
                id="btn-iptal-et"
                onClick={handleIptalEt}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded text-xs font-bold shadow-xs cursor-pointer transition-colors"
                title="Yeni personel ekleme işlemini iptal et ve önceki kayda dön"
              >
                <X className="w-4 h-4" />
                <span>İptal Et</span>
              </button>
            </>
          ) : (
            <>
              {/* PASİF MODDAYKEN: DÜZENLE BUTONU GÖRÜNÜR */}
              {!duzenlemeModu ? (
                <button
                  id="btn-duzenle"
                  onClick={handleDuzenle}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  title="Form alanlarını düzenlemeye aç"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Düzenle</span>
                </button>
              ) : (
                /* AKTİF MODDAYKEN: GÜNCELLE VE VAZGEÇ BUTONLARI GÖRÜNÜR */
                <>
                  <button
                    id="btn-guncelle"
                    onClick={handleKaydetVeGuncelle}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    title="Değişiklikleri kaydet / güncelle"
                  >
                    <Check className="w-4 h-4" />
                    <span>Güncelle</span>
                  </button>

                  <button
                    id="btn-vazgec"
                    onClick={handleDuzenleIptal}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    title="Değişikliklerden vazgeç ve formu tekrar pasif (korumalı) yap"
                  >
                    <X className="w-4 h-4" />
                    <span>Vazgeç</span>
                  </button>
                </>
              )}

              {/* YENİ PERSONEL EKLE */}
              <button
                id="btn-yeni-ekle"
                onClick={handleYeniEkle}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-bold shadow-xs cursor-pointer transition-colors"
                title="Yeni personel ekleme formu aç"
              >
                <UserPlus className="w-4 h-4" />
                <span>Yeni Ekle</span>
              </button>

              {/* SİL */}
              <button
                id="btn-sil"
                onClick={handleSil}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold shadow-xs cursor-pointer transition-colors"
                title="Seçili personeli sil"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sil</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* EVRAK VE BELGELER MODAL */}
      {evrakModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#ece9d8] border-2 border-outset border-[#7f9db9] shadow-2xl w-full max-w-lg flex flex-col font-sans">
            <div className="bg-[#0055ea] text-white px-3 py-1 flex items-center justify-between font-bold text-xs">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-yellow-300" />
                <span>Personel Evrak ve Dosyaları - {formData.ad} {formData.soyad}</span>
              </div>
              <button onClick={() => setEvrakModalOpen(false)} className="hover:bg-red-600 px-1.5 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#f7f5ed] flex flex-col gap-3">
              <div className="text-[11px] text-gray-700">
                Seçili personele ait taranmış resmi evrak ve arşiv belgeleri:
              </div>

              <div className="bg-white border border-[#7f9db9] max-h-56 overflow-auto divide-y divide-gray-100">
                {formData.evraklar && formData.evraklar.length > 0 ? (
                  formData.evraklar.map((doc) => (
                    <div key={doc.id} className="p-2 flex items-center justify-between hover:bg-blue-50 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-600 shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-900">{doc.ad}</div>
                          <div className="text-[10px] text-gray-500">
                            {doc.dosyaTuru} • {doc.boyut} • Yüklenme: {doc.tarih}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            showToast(`"${doc.ad}" belgesi indiriliyor...`);
                            // Simulated download
                            const blob = new Blob([`TCDD Vagon Atelye Md. Evrak: ${doc.ad}\nPersonel: ${formData.ad} ${formData.soyad} (${formData.sicilNo})`], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${doc.ad}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] border border-blue-300 rounded-xs flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> İndir
                        </button>
                        <button
                          onClick={() => {
                            const kalan = formData.evraklar.filter(x => x.id !== doc.id);
                            setFormData(prev => ({ ...prev, evraklar: kalan }));
                            showToast(`"${doc.ad}" kaldırıldı.`);
                          }}
                          className="px-1.5 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 text-[10px] border border-red-300 rounded-xs"
                          title="Evrakı Sil"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-400 italic text-xs">
                    Bu personele ait yüklenmiş evrak bulunmuyor.
                  </div>
                )}
              </div>

              {/* YENİ EVRAK YÜKLE ALANI */}
              <div className="border-t border-[#d4d0c8] pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Evrak adı (örn: Ağır Sanayi Sağlık Raporu)"
                  value={yeniEvrakAdi}
                  onChange={(e) => setYeniEvrakAdi(e.target.value)}
                  className="flex-1 bg-white border border-[#7f9db9] px-2 py-1 text-xs"
                />
                <button
                  onClick={() => docFileInputRef.current?.click()}
                  className="bg-[#e1dfd6] hover:bg-[#d5d2c6] border border-[#7f9db9] px-3 py-1 text-xs font-semibold text-gray-900 shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-700" />
                  <span>Dosya Seç &amp; Yükle</span>
                </button>
                <input
                  ref={docFileInputRef}
                  type="file"
                  onChange={handleEvrakUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="bg-[#ebe7d7] border-t border-[#d4d0c8] p-2 flex justify-end">
              <button
                onClick={() => setEvrakModalOpen(false)}
                className="bg-[#ece9d8] hover:bg-[#dfdbcb] border border-[#7f9db9] px-4 py-1 text-xs font-bold text-gray-900 shadow-xs cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOTOĞRAF BÜYÜTME MODALI (Madde 12) */}
      {fotoBuyutModalOpen && formData.fotografUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setFotoBuyutModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-lg w-full border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between">
              <div className="font-bold text-sm">
                {formData.ad} {formData.soyad} — Personel Fotoğrafı
              </div>
              <button
                onClick={() => setFotoBuyutModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-950">
              <img
                src={formData.fotografUrl}
                alt={`${formData.ad} ${formData.soyad}`}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain rounded shadow"
              />
            </div>
            <div className="bg-slate-100 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
              <span>Sicil No: <b className="text-slate-900 font-mono">{formData.sicilNo || '-'}</b></span>
              <button
                onClick={() => setFotoBuyutModalOpen(false)}
                className="px-4 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded font-medium cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
