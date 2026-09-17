import React from 'react';
import {
  X,
  FileText,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Briefcase,
  AlertTriangle,
  Award,
  HeartHandshake,
  Lock,
} from 'lucide-react';
import { Personel, RolYetkileri } from '../types';

interface PersonelDetayModalProps {
  personel: Personel | null;
  onClose: () => void;
  onDuzenle: (p: Personel) => void;
  onPdfIndir: (p: Personel) => void;
  yetkiler: RolYetkileri;
}

export const PersonelDetayModal: React.FC<PersonelDetayModalProps> = ({
  personel,
  onClose,
  onDuzenle,
  onPdfIndir,
  yetkiler,
}) => {
  if (!personel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl border border-slate-300 overflow-hidden text-xs">
        {/* Windows Dialog Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
              ID
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">
                Personel Özlük ve Kimlik Dosyası
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Sicil / Kayıt ID: {personel.id}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPdfIndir(personel)}
              title="Resmi Özlük Kartı PDF İndir"
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center space-x-1 border border-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>PDF İndir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Personel Başlık Kartı */}
        <div className="p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md border-2 border-white">
            {personel.ad.charAt(0)}
            {personel.soyad.charAt(0)}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {personel.ad} <span className="uppercase">{personel.soyad?.toLocaleUpperCase('tr-TR')}</span>
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  personel.durum === 'Aktif'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : personel.durum === 'İzinli'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                {personel.durum}
              </span>
            </div>
            <p className="text-blue-700 font-medium text-xs mt-0.5">
              {personel.pozisyon} &bull; {personel.departman}
            </p>
            <p className="text-slate-500 text-[11px] font-mono mt-0.5">
              T.C. No: {personel.tcKimlik}
            </p>
          </div>

          {yetkiler.personelDuzenle && (
            <button
              onClick={() => {
                onClose();
                onDuzenle(personel);
              }}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded font-medium shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-blue-600" />
              <span>Bilgileri Güncelle</span>
            </button>
          )}
        </div>

        {/* Bilgi Grid Alanları */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Grup 1: Kurumsal ve Pozisyon Bilgileri */}
          <div className="bg-slate-50/80 rounded-lg border border-slate-200 p-3.5 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs text-blue-800">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Kurumsal ve İstihdam Bilgileri</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-600 pt-1">
              <div>
                <span className="text-slate-400 block text-[10px]">Departman:</span>
                <span className="font-semibold text-slate-800">{personel.departman}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Unvan / Pozisyon:</span>
                <span className="font-semibold text-slate-800">{personel.pozisyon}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">İşe Başlama Tarihi:</span>
                <span className="font-mono font-medium text-slate-800">{personel.iseGirisTarihi}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Aylık Net Maaş:</span>
                {yetkiler.maasGoruntule ? (
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    ₺{personel.maas.toLocaleString('tr-TR')}
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>•••••• TL (Yetki Kısıtlı)</span>
                  </span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Eğitim Durumu:</span>
                <span className="font-medium text-slate-800">{personel.egitimDurumu}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Sistem Kayıt Tarihi:</span>
                <span className="font-mono text-slate-600 text-[11px]">
                  {personel.olusturmaTarihi.slice(0, 10)}
                </span>
              </div>
            </div>
          </div>

          {/* Grup 2: Kişisel ve Kimlik Bilgileri */}
          <div className="bg-slate-50/80 rounded-lg border border-slate-200 p-3.5 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs text-blue-800">
              <Award className="w-3.5 h-3.5" />
              <span>Kişisel Bilgiler ve Sağlık</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600 pt-1">
              <div>
                <span className="text-slate-400 block text-[10px]">T.C. Kimlik:</span>
                <span className="font-mono font-semibold text-slate-800">{personel.tcKimlik}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Doğum Tarihi:</span>
                <span className="font-mono text-slate-800">{personel.dogumTarihi}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Cinsiyet:</span>
                <span className="font-medium text-slate-800">{personel.cinsiyet}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Kan Grubu:</span>
                <span className="inline-block px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 font-bold rounded">
                  {personel.kanGrubu}
                </span>
              </div>
            </div>
          </div>

          {/* Grup 3: İletişim ve Acil Durum Bilgileri */}
          <div className="bg-slate-50/80 rounded-lg border border-slate-200 p-3.5 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs text-blue-800">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>İletişim ve Acil Durum İrtibatı</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 pt-1">
              <div className="flex items-start space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Telefon:</span>
                  <span className="font-medium text-slate-800">{personel.telefon}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">E-posta:</span>
                  <span className="font-medium text-slate-800">{personel.email}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">İkamet Adresi:</span>
                  <span className="text-slate-800">
                    {personel.sehir} &bull; {personel.adres || 'Adres detayı belirtilmemiş'}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:col-span-2 p-2 bg-amber-50/70 border border-amber-200 rounded">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-amber-800 font-semibold block text-[10px]">
                    Acil Durumda İrtibat Kurulacak Kişi:
                  </span>
                  <span className="text-slate-800">
                    {personel.acilKisi ? `${personel.acilKisi} - Tel: ${personel.acilTelefon}` : 'Kayıt bulunmuyor'}
                  </span>
                </div>
              </div>

              {personel.notlar && (
                <div className="sm:col-span-2 bg-slate-100 p-2 rounded text-slate-700">
                  <span className="text-slate-500 font-semibold block text-[10px]">Özlük Notu:</span>
                  <p className="mt-0.5 italic text-[11px]">{personel.notlar}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alt Kapatma Çubuğu */}
        <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded font-medium transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
