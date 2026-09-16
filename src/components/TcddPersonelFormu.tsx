import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import {
  EGITIM_SEVIYELERI,
  EgitimSeviyesi,
  getBolumListesi,
  getEgitimSeviyesi,
} from '../data/educationData';
import { PWAInstallButton } from './PWAInstallButton';
import { exportSinglePersonnelPdf, exportPersonnelToExcel, exportPersonnelToPdf } from '../utils/exportUtils';
import { searchMatches } from '../utils/textUtils';

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

  // Okul Seviyesi ve Bölüm Mantığı
  const seciliOkulSeviyesi = getEgitimSeviyesi(formData.bitirdigiOkul);
  const bolumSecenekleri = getBolumListesi(seciliOkulSeviyesi);
  const isIlkOrOrta = seciliOkulSeviyesi === 'İlkokul' || seciliOkulSeviyesi === 'Ortaokul';

  const handleOkulSeviyeDegistir = (yeniSeviye: string) => {
    const seviye = yeniSeviye as EgitimSeviyesi;
    setFormData(prev => {
      let yeniBolum = prev.bolumu;
      if (seviye === 'İlkokul' || seviye === 'Ortaokul') {
        yeniBolum = '';
      } else {
        const liste = getBolumListesi(seviye);
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

    onPersonelKaydet(formData, isNewRecord);
    setIsNewRecord(false);
    setDuzenlemeModu(false); // Kayıttan sonra form otomatik olarak pasif moda döner
    setSeciliId(formData.id);
    showToast(`${formData.ad} ${formData.soyad} (${formData.sicilNo}) başarıyla kaydedildi.`);
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
    <div className="flex flex-col h-full select-none bg-[#ece9d8] text-black font-sans text-xs">
      {/* 1. CLASSIC WINDOWS MENU BAR */}
      <div className="bg-[#f0f0f0] border-b border-[#d4d0c8] px-2 py-0.5 flex items-center gap-1 text-[11px] text-gray-800">
        <div className="relative group">
          <button className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white rounded-none cursor-pointer">
            Dosya
          </button>
          <div className="hidden group-hover:flex flex-col absolute top-full left-0 bg-white border border-gray-400 shadow-lg z-50 min-w-[200px] py-1 text-black">
            <button onClick={handleYeniEkle} className="px-3 py-1 text-left hover:bg-[#316ac5] hover:text-white flex items-center justify-between">
              <span>Yeni Personel Kaydı</span> <span className="text-[10px] text-gray-400">Ctrl+N</span>
            </button>
            <button onClick={handleKaydetVeGuncelle} className="px-3 py-1 text-left hover:bg-[#316ac5] hover:text-white flex items-center justify-between">
              <span>Kaydet / Güncelle</span> <span className="text-[10px] text-gray-400">Ctrl+S</span>
            </button>
            <hr className="my-1 border-gray-200" />
            <button onClick={() => exportSinglePersonnelPdf(formData)} className="px-3 py-1 text-left hover:bg-[#316ac5] hover:text-white flex items-center gap-2">
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Personel Özlük Kartı Yazdır (PDF)</span>
            </button>
            <button onClick={() => exportPersonnelToPdf(personeller)} className="px-3 py-1 text-left hover:bg-[#316ac5] hover:text-white flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-red-600" />
              <span>Tüm Personel Listesi (PDF)</span>
            </button>
            <button onClick={() => exportPersonnelToExcel(personeller)} className="px-3 py-1 text-left hover:bg-[#316ac5] hover:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
              <span>Excel'e Aktar (.xlsx)</span>
            </button>
          </div>
        </div>

        <div className="relative group">
          <button className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white rounded-none cursor-pointer">
            Düzen
          </button>
          <div className="hidden group-hover:flex flex-col absolute top-full left-0 bg-white border border-gray-400 shadow-lg z-50 min-w-[190px] py-1 text-black">
            {!duzenlemeModu ? (
              <button onClick={handleDuzenle} className="px-3 py-1 text-left hover:bg-[#316ac5] hover:text-white flex items-center justify-between">
                <span>Kaydı Düzenle</span> <span className="text-[10px] text-gray-400">Ctrl+E</span>
              </button>
            ) : (
              <button onClick={handleDuzenleIptal} className="px-3 py-1 text-left hover:bg-[#316ac5] hover:text-white flex items-center justify-between">
                <span>Düzenlemeden Vazgeç</span> <span className="text-[10px] text-gray-400">Esc</span>
              </button>
            )}
            <hr className="my-1 border-gray-200" />
            <button onClick={handleSil} className="px-3 py-1 text-left hover:bg-[#316ac5] hover:text-white text-red-700 flex items-center justify-between">
              <span>Personel Kaydını Sil</span> <span className="text-[10px] text-gray-400">Del</span>
            </button>
          </div>
        </div>

        <div className="relative group">
          <button className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white rounded-none cursor-pointer">
            Araçlar
          </button>
          <div className="hidden group-hover:flex flex-col absolute top-full left-0 bg-white border border-gray-400 shadow-lg z-50 min-w-[180px] py-1 text-black">
            <button onClick={onOpenYedekleme} className="px-3 py-1 text-left hover:bg-[#316ac5] hover:text-white flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Yedekle - Yükle (.tcddbak)</span>
            </button>
            {onResmiYazdir && (
              <button onClick={() => onResmiYazdir(formData)} className="px-3 py-1 text-left hover:bg-[#316ac5] hover:text-white flex items-center gap-2">
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                <span>Resmi Rapor Yazdır / PDF</span>
              </button>
            )}
          </div>
        </div>

        <div className="relative group">
          <button onClick={() => alert('GEBZE VAGON BAKIM ATÖLYE MÜDÜRLÜĞÜ\nPersonel Takip Programı\nMerkezi Online Veritabanı ve Senkronizasyon')} className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white rounded-none cursor-pointer">
            Yardım
          </button>
        </div>

        {/* Hızlı Ekran Geçiş Butonları */}
        {onAramaEkraninaDon && (
          <button
            onClick={onAramaEkraninaDon}
            className="ml-2 px-2.5 py-0.5 bg-[#0055ea] hover:bg-blue-700 text-white font-bold rounded-xs cursor-pointer flex items-center gap-1 shadow-xs text-[11px]"
            title="Arama Ekranına Geri Dön"
          >
            <ArrowLeft className="w-3 h-3 text-white" />
            <span>Arama Ekranı</span>
          </button>
        )}

        {onGenelListeAc && (
          <button
            onClick={onGenelListeAc}
            className="px-2.5 py-0.5 bg-[#334155] hover:bg-[#1e293b] text-white font-bold rounded-xs cursor-pointer flex items-center gap-1 shadow-xs text-[11px]"
            title="Genel Personel Listesini Aç"
          >
            <Table className="w-3 h-3 text-white" />
            <span>Genel Liste</span>
          </button>
        )}

        {/* PWA Masaüstüne Kur / Çevrimdışı Desteği */}
        <div className="ml-1">
          <PWAInstallButton />
        </div>

        <div className="ml-auto flex items-center gap-2 text-[11px] text-gray-600 pr-2">
          <span>Veritabanı: <b className="text-blue-900">Merkezi Sunucu (Online)</b></span>
          <span>•</span>
          <span className="text-emerald-700 font-semibold">● Çevrimiçi</span>
        </div>
      </div>

      {/* 2. MODERN PERSONEL BİLGİ & GEZİNTİ BARI (TEKRARLANAN BAŞLIK KALDIRILDI) */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white shadow-2xs">
        {/* Seçili Personel Özeti & Kadro Rozeti */}
        <div className="flex items-center gap-3 min-w-[260px]">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
            {formData.fotografUrl ? (
              <img src={formData.fotografUrl} alt={formData.ad} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-slate-600 font-mono">
                {(formData.ad?.[0] || 'P') + (formData.soyad?.[0] || '')}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                {formData.ad || formData.soyad ? `${formData.ad} ${formData.soyad}` : 'Yeni Personel Kaydı'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  aktifGrup === 'MEMUR'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-blue-50 text-blue-800 border-blue-300'
                }`}
              >
                {aktifGrup === 'MEMUR' ? 'Memur Kadrosu' : 'İşçi Kadrosu'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                {formData.durum || 'Aktif'}
              </span>

              {/* FORM KORUMA (PASİF / AKTİF) DURUM ROZETİ */}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                  duzenlemeModu
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
                title={duzenlemeModu ? 'Form şu an düzenlenebilir durumdadır.' : 'Form korumalı (salt okunur) durumdadır. Değiştirmek için Düzenle butonuna basınız.'}
              >
                {duzenlemeModu ? (
                  <>
                    <Unlock className="w-3 h-3 text-emerald-600" />
                    <span>Düzenleme Açık</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Form Pasif</span>
                  </>
                )}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Sicil: <b className="text-slate-800 font-mono">{formData.sicilNo || '-'}</b></span>
              <span>•</span>
              <span>Ünvan: <span className="text-slate-700 font-medium">{formData.unvan || formData.sanatKodu || '-'}</span></span>
            </div>
          </div>
        </div>

        {/* Kayıt Gezinti Butonları (İlk, Önceki, [Kayıt 1 / 106], Sonraki, Son) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-300 shadow-2xs">
          <button
            onClick={handleIlk}
            disabled={currentIdx <= 0 || totalCount === 0}
            className="px-2 py-1 text-xs font-semibold rounded bg-white hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 border border-slate-300 cursor-pointer shadow-2xs"
            title="İlk Kayıt"
          >
            ⏮ İlk
          </button>
          <button
            onClick={handleOnceki}
            disabled={currentIdx <= 0 || totalCount === 0}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-white hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 border border-slate-300 cursor-pointer shadow-2xs"
            title="Önceki Kayıt"
          >
            ◀ Önceki
          </button>
          <div className="px-3 py-1 text-xs font-bold text-slate-800 bg-white rounded border border-slate-300 min-w-[90px] text-center font-mono">
            {totalCount > 0 && currentIdx >= 0 ? `${currentIdx + 1} / ${totalCount}` : totalCount > 0 ? `1 / ${totalCount}` : '0 / 0'}
          </div>
          <button
            onClick={handleSonraki}
            disabled={currentIdx >= totalCount - 1 || totalCount === 0}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-white hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 border border-slate-300 cursor-pointer shadow-2xs"
            title="Sonraki Kayıt"
          >
            Sonraki ▶
          </button>
          <button
            onClick={handleSon}
            disabled={currentIdx >= totalCount - 1 || totalCount === 0}
            className="px-2 py-1 text-xs font-semibold rounded bg-white hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 border border-slate-300 cursor-pointer shadow-2xs"
            title="Son Kayıt"
          >
            Son ⏭
          </button>
        </div>

        {/* BÜYÜK PERSONEL NO VE SICIL NO KARTLARI */}
        <div className="flex items-center gap-2.5">
          {/* Personel No */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-300 shadow-2xs">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Personel No</span>
            <input
              id="input-personel-no"
              type="text"
              disabled={!duzenlemeModu}
              value={formData.personelNo || ''}
              onChange={(e) => handleInputChange('personelNo', e.target.value)}
              placeholder="P-1001"
              className={`border rounded px-2 py-0.5 text-base font-black tracking-wider w-[110px] text-center font-mono ${
                duzenlemeModu
                  ? 'bg-white border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-purple-900'
                  : 'bg-[#f0ede1] border-[#c0bdb2] text-purple-950 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Sicil No */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-300 shadow-2xs">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Sicil No</span>
            <input
              id="input-sicil-no"
              type="text"
              disabled={!duzenlemeModu}
              value={formData.sicilNo || ''}
              onChange={(e) => handleInputChange('sicilNo', e.target.value)}
              placeholder="4315073"
              className={`border rounded px-2 py-0.5 text-base font-black tracking-wider w-[115px] text-center font-mono ${
                duzenlemeModu
                  ? 'bg-white border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-blue-900'
                  : 'bg-[#f0ede1] border-[#c0bdb2] text-blue-950 cursor-not-allowed'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 3. MAIN BODY CONTAINER */}
      <div className="flex-1 overflow-auto p-3 flex gap-3 min-h-0 bg-slate-100">
        {/* LEFT COLUMN: KAYITLI PERSONEL LISTESİ */}
        <div className="w-[320px] shrink-0 flex flex-col bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs">
              {aktifGrup === 'MEMUR' ? 'Memur Personel Listesi' : 'İşçi Personel Listesi'}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
              {gruptakiPersoneller.length} Kişi
            </span>
          </div>

          {/* HIZLI ARAMA */}
          <div className="p-2 border-b border-slate-200 bg-white flex items-center gap-1.5">
            <input
              type="text"
              placeholder="İsim veya Sicil No ile filtrele..."
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-blue-600 rounded px-2 py-1 text-xs"
            />
            {aramaMetni && (
              <button
                onClick={() => setAramaMetni('')}
                className="text-xs text-slate-400 hover:text-slate-700 px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* DATAGRID TABLE */}
          <div className="flex-1 overflow-auto bg-white min-h-[220px]">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-100 sticky top-0 border-b border-slate-200 shadow-2xs">
                <tr>
                  <th className="w-6 p-1 text-center font-bold text-slate-600 border-r border-slate-200">#</th>
                  <th className="p-1.5 font-bold border-r border-slate-200 text-slate-700">Sicil</th>
                  <th className="p-1.5 font-bold text-slate-700">Adı Soyadı</th>
                </tr>
              </thead>
              <tbody>
                {filtrelenmisPersoneller.map((p, idx) => {
                  const isSelected = p.id === seciliId;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => handlePersonelSecimi(p)}
                      className={`cursor-pointer border-b border-slate-100 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white font-medium shadow-inner'
                          : 'hover:bg-blue-50 text-slate-900 even:bg-slate-50/60'
                      }`}
                    >
                      <td className={`w-6 text-center p-1 border-r text-[10px] font-mono ${isSelected ? 'border-blue-500 text-blue-100' : 'border-slate-200 text-slate-500'}`}>
                        {idx + 1}
                      </td>
                      <td className={`p-1.5 border-r whitespace-nowrap font-mono text-xs font-semibold ${isSelected ? 'border-blue-500 text-white' : 'border-slate-200 text-slate-800'}`}>
                        {p.sicilNo || '-'}
                      </td>
                      <td className="p-1.5 whitespace-nowrap">
                        <span className={isSelected ? 'text-white font-medium' : 'text-slate-900 font-medium'}>{p.ad}</span>{' '}
                        <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>{p.soyad}</span>
                      </td>
                    </tr>
                  );
                })}
                {filtrelenmisPersoneller.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-slate-400 italic">
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="mt-2 pt-2 border-t border-[#d4d0c8] flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">Personel Ara:</span>
              <input
                type="text"
                value={aramaMetni}
                onChange={(e) => setAramaMetni(e.target.value)}
                placeholder="Arama..."
                className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 text-xs text-black focus:outline-none focus:border-blue-700"
              />
              <button
                onClick={handleBilgileriGetir}
                title="Ara"
                className="bg-[#e1dfd6] hover:bg-[#d5d2c6] active:bg-[#c8c5b8] border border-[#7f9db9] px-2 py-0.5 text-[11px] font-medium text-gray-900 shadow-xs cursor-pointer"
              >
                Ara
              </button>
              <button
                onClick={() => setAramaMetni('')}
                title="Yenile / Temizle"
                className="bg-[#e1dfd6] hover:bg-[#d5d2c6] active:bg-[#c8c5b8] border border-[#7f9db9] px-2 py-0.5 text-[11px] font-medium text-gray-900 shadow-xs cursor-pointer flex items-center gap-0.5"
              >
                <RotateCw className="w-3 h-3 text-gray-700" />
                <span>Yenile</span>
              </button>
            </div>

            {/* RADIO BUTTONS */}
            <div className="flex items-center justify-between text-[10.5px] text-gray-800 pt-0.5">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="aramaKriteri"
                  checked={aramaTuru === 'tcKimlik'}
                  onChange={() => setAramaTuru('tcKimlik')}
                  className="cursor-pointer"
                />
                <span>TC Kimlik No</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="aramaKriteri"
                  checked={aramaTuru === 'ad'}
                  onChange={() => setAramaTuru('ad')}
                  className="cursor-pointer"
                />
                <span>Ad</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="aramaKriteri"
                  checked={aramaTuru === 'soyad'}
                  onChange={() => setAramaTuru('soyad')}
                  className="cursor-pointer"
                />
                <span>Soyad</span>
              </label>
            </div>

            {/* BILGILERI GETIR BUTTON */}
            <button
              onClick={handleBilgileriGetir}
              className="mt-1 bg-[#ece9d8] hover:bg-[#e0ded3] active:bg-[#d0cebf] border-2 border-outset border-[#7f9db9] py-1 px-3 text-[11px] font-bold text-gray-900 flex items-center justify-center gap-1 shadow-xs cursor-pointer"
            >
              <span>Bilgileri Getir</span>
              <span className="text-black font-extrabold">▶</span>
            </button>
          </div>
        </div>

        {/* MIDDLE COLUMN: FORM FIELDS */}
        <div className="flex-1 flex flex-col gap-3 overflow-auto">
          {/* GROUP 1: PERSONEL GENEL BILGILERI */}
          <fieldset className="border border-[#7f9db9] p-2.5 bg-[#fbfaf6] shadow-xs">
            <legend className="px-1 text-[11px] font-bold text-gray-700">
              Personel Genel Bilgileri
            </legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
              <div className="flex items-center">
                <label className="w-28 text-[11px] text-gray-800 font-medium shrink-0">
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
                <label className="w-28 text-[11px] text-gray-800 font-medium shrink-0">
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
                <label className="w-28 text-[11px] text-gray-800 font-medium shrink-0">
                  Soyadı <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  disabled={!duzenlemeModu}
                  value={formData.soyad}
                  onChange={(e) => handleInputChange('soyad', e.target.value)}
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
                    value={formData.dogumTarihi}
                    onChange={(e) => handleInputChange('dogumTarihi', e.target.value)}
                    className={`w-full border px-2 py-0.5 text-xs text-black pr-6 ${
                      duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                    }`}
                  />
                  <Calendar className="w-3.5 h-3.5 text-gray-500 absolute right-1.5 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="text-[10px] text-gray-500 italic mt-1.5">
              * işaretli alanlar doldurulması zorunlu bilgilerdir.
            </div>
          </fieldset>

          {/* GROUP 2: PERSONEL AİLE VE EĞİTİM BİLGİLERİ */}
          <fieldset className="border border-[#7f9db9] p-2.5 bg-[#fbfaf6] shadow-xs">
            <legend className="px-1 text-[11px] font-bold text-gray-700">
              Personel Aile ve Eğitim Bilgileri
            </legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
              <div className="flex items-center">
                <label className="w-28 text-[11px] text-gray-800 font-medium shrink-0">
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
                <label className="w-28 text-[11px] text-gray-800 font-medium shrink-0">
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

              {/* Bölümü - Dinamik Müfredat Seçimi / İlköğretimde Pasif */}
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
          <fieldset className="border border-[#7f9db9] p-2.5 bg-[#fbfaf6] shadow-xs">
            <legend className="px-1 text-[11px] font-bold text-gray-700">
              Personel İş Bilgileri
            </legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
              <div className="flex items-center">
                <label className="w-28 text-[11px] text-gray-800 font-medium shrink-0">
                  İşe Giriş Tarihi
                </label>
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    disabled={!duzenlemeModu}
                    value={formData.iseGirisTarihi}
                    onChange={(e) => handleInputChange('iseGirisTarihi', e.target.value)}
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

              <div className="flex items-center">
                <label className="w-28 text-[11px] text-gray-800 font-medium shrink-0">
                  Sanat Kodu
                </label>
                <input
                  type="text"
                  disabled={!duzenlemeModu}
                  value={formData.sanatKodu}
                  onChange={(e) => handleInputChange('sanatKodu', e.target.value)}
                  className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Unvanı / Görev
                </label>
                <input
                  type="text"
                  disabled={!duzenlemeModu}
                  value={formData.unvan || ''}
                  onChange={(e) => handleInputChange('unvan', e.target.value)}
                  className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                />
              </div>
            </div>
          </fieldset>
        </div>

        {/* RIGHT COLUMN: FOTO, İLETİŞİM, EĞİTİM & KURSLAR */}
        <div className="w-[340px] shrink-0 flex flex-col gap-2.5">
          {/* TOP RIGHT: FOTOĞRAF VE BUTONLAR */}
          <div className="flex gap-2.5 items-start">
            {/* FOTO KUTUSU */}
            <div className="w-[120px] h-[135px] shrink-0 bg-white border-2 border-[#7f9db9] shadow-inner relative flex items-center justify-center overflow-hidden">
              {formData.fotografUrl ? (
                <img
                  src={formData.fotografUrl}
                  alt={`${formData.ad} ${formData.soyad}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                  <Camera className="w-8 h-8 text-gray-300 mb-1" />
                  <span className="text-[10px]">Fotoğraf Yok</span>
                </div>
              )}
            </div>

            {/* YAN BUTONLAR */}
            <div className="flex-1 flex flex-col gap-1.5 pt-0.5">
              <button
                onClick={() => setEvrakModalOpen(true)}
                className="bg-[#ece9d8] hover:bg-[#dfdbcb] active:bg-[#cfcbba] border border-[#7f9db9] px-2 py-1.5 text-[11px] font-semibold text-gray-900 shadow-xs flex items-center gap-1.5 cursor-pointer text-left"
              >
                <FolderOpen className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="leading-tight">Evrak ve Belgeler ({formData.evraklar?.length || 0})</span>
              </button>

              <button
                disabled={!duzenlemeModu}
                onClick={() => fileInputRef.current?.click()}
                className={`border px-2 py-1.5 text-[11px] font-semibold shadow-xs flex items-center gap-1.5 text-left ${
                  duzenlemeModu
                    ? 'bg-[#ece9d8] hover:bg-[#dfdbcb] active:bg-[#cfcbba] border-[#7f9db9] text-gray-900 cursor-pointer'
                    : 'bg-[#f0ede1] border-[#c0bdb2] text-gray-400 cursor-not-allowed opacity-60'
                }`}
                title={duzenlemeModu ? 'Fotoğraf yükle' : 'Fotoğraf eklemek için önce Düzenle butonuna basınız'}
              >
                <Camera className={`w-4 h-4 shrink-0 ${duzenlemeModu ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="leading-tight">Fotoğraf Ekle</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFotoUpload}
                className="hidden"
              />

              <button
                disabled={!duzenlemeModu || !formData.fotografUrl}
                onClick={handleFotoSil}
                className={`border px-2 py-1.5 text-[11px] font-semibold shadow-xs flex items-center gap-1.5 text-left ${
                  duzenlemeModu && formData.fotografUrl
                    ? 'bg-[#ece9d8] hover:bg-[#dfdbcb] active:bg-[#cfcbba] border-[#7f9db9] text-gray-900 cursor-pointer'
                    : 'bg-[#f0ede1] border-[#c0bdb2] text-gray-400 cursor-not-allowed opacity-60'
                }`}
                title={duzenlemeModu ? 'Fotoğrafı sil' : 'Fotoğraf silmek için önce Düzenle butonuna basınız'}
              >
                <XCircle className={`w-4 h-4 shrink-0 ${duzenlemeModu && formData.fotografUrl ? 'text-red-600' : 'text-gray-400'}`} />
                <span className="leading-tight">Fotoğrafı Sil</span>
              </button>
            </div>
          </div>

          {/* MIDDLE & BOTTOM RIGHT: İLETİŞİM VE İKAMETGAH BİLGİLERİ */}
          <fieldset className="flex-1 border border-[#7f9db9] p-2.5 bg-[#fbfaf6] shadow-xs flex flex-col justify-between">
            <legend className="px-1 text-[11px] font-bold text-gray-700">
              Personel İletişim &amp; Adres Bilgileri
            </legend>
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  Cep Telefonu
                </label>
                <input
                  type="text"
                  disabled={!duzenlemeModu}
                  value={formData.cepTelefonu}
                  onChange={(e) => handleInputChange('cepTelefonu', e.target.value)}
                  placeholder="(5XX) XXX XX XX"
                  className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0">
                  E-Posta
                </label>
                <input
                  type="text"
                  disabled={!duzenlemeModu}
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="ornek@tcdd.gov.tr"
                  className={`flex-1 border px-2 py-0.5 text-xs text-black ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                />
              </div>

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

              <div className="flex items-start">
                <label className="w-24 text-[11px] text-gray-800 font-medium shrink-0 pt-1">
                  İkamet Adresi
                </label>
                <textarea
                  rows={4}
                  disabled={!duzenlemeModu}
                  value={formData.adres}
                  onChange={(e) => handleInputChange('adres', e.target.value)}
                  placeholder="Açık ikametgah adresi..."
                  className={`flex-1 border px-2 py-1 text-xs text-black resize-none ${
                    duzenlemeModu ? 'bg-white border-[#7f9db9]' : 'bg-[#f0ede1] border-[#c0bdb2]'
                  }`}
                />
              </div>
            </div>

            {/* Evrak Özet Kutusu */}
            <div className="mt-3 pt-2 border-t border-[#d4d0c8] bg-[#f5f3ec] p-2 border border-[#d8d4c8] flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-gray-700">
                <FolderOpen className="w-4 h-4 text-amber-600" />
                <span>Yüklü Evrak Sayısı: <b>{formData.evraklar?.length || 0} adet</b></span>
              </div>
              <button
                onClick={() => setEvrakModalOpen(true)}
                className="text-blue-700 hover:text-blue-900 font-semibold underline cursor-pointer"
              >
                Görüntüle / Yönet
              </button>
            </div>
          </fieldset>
        </div>
      </div>

      {/* 4. BOTTOM ACTION TOOLBAR (RESMİ YAZDIR, DÜZENLE, GÜNCELLE, VAZGEÇ, YENİ EKLE, SİL) */}
      <div className="bg-white border-t border-slate-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* SOL: RESMİ RAPOR & FORM KİLİT BİLGİSİ */}
        <div className="flex items-center gap-3">
          {onResmiYazdir && (
            <button
              onClick={() => onResmiYazdir(formData)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Resmi Rapor Yazdır / PDF</span>
            </button>
          )}

          {/* Form Kilit / Düzenleme Bilgi İpucu */}
          {!isNewRecord && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
              {duzenlemeModu ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-800 font-semibold">Düzenleme Modu Açık</span>
                  <span className="text-slate-400">• Değişiklikleri [Güncelle] ile kaydedin</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
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
    </div>
  );
}
