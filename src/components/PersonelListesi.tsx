import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  Eye,
  FileText,
  UserCheck,
  CheckCircle2,
  Clock,
  UserX,
  LayoutGrid,
  Table as TableIcon,
  Phone,
  Mail,
  MapPin,
  Building,
  CheckSquare,
  Square,
  Lock,
} from 'lucide-react';
import { Personel, DepartmanTuru, DurumTuru, RolYetkileri } from '../types';

interface PersonelListesiProps {
  personeller: Personel[];
  yetkiler: RolYetkileri;
  onPersonelSec: (p: Personel) => void;
  onPersonelDuzenle: (p: Personel) => void;
  onPersonelSil: (id: string, adSoyad: string) => void;
  onTekilPdf: (p: Personel) => void;
  aramaMetni: string;
  setAramaMetni: (val: string) => void;
}

type SiralamaAlani = 'ad' | 'maas' | 'iseGirisTarihi' | 'departman' | 'tcKimlik';

export const PersonelListesi: React.FC<PersonelListesiProps> = ({
  personeller,
  yetkiler,
  onPersonelSec,
  onPersonelDuzenle,
  onPersonelSil,
  onTekilPdf,
  aramaMetni,
  setAramaMetni,
}) => {
  const [secilenDepartman, setSecilenDepartman] = useState<string>('TÜMÜ');
  const [secilenDurum, setSecilenDurum] = useState<string>('TÜMÜ');
  const [siralamaAlani, setSiralamaAlani] = useState<SiralamaAlani>('ad');
  const [siralamaYonu, setSiralamaYonu] = useState<'asc' | 'desc'>('asc');
  const [gorunumModu, setGorunumModu] = useState<'tablo' | 'kart'>('tablo');
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);

  // Departman listesi
  const departmanlar: DepartmanTuru[] = [
    'Yazılım & Bilişim',
    'İnsan Kaynakları',
    'Muhasebe & Finans',
    'Pazarlama & Satış',
    'Operasyon & Lojistik',
    'Müşteri İlişkileri',
    'Hukuk & Uyum',
  ];

  // Filtreleme ve Sıralama
  const filtrelenmisPersoneller = useMemo(() => {
    let result = [...personeller];

    // Metin araması
    if (aramaMetni.trim()) {
      const q = aramaMetni.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.ad.toLowerCase().includes(q) ||
          p.soyad.toLowerCase().includes(q) ||
          p.tcKimlik.includes(q) ||
          p.pozisyon.toLowerCase().includes(q) ||
          p.departman.toLowerCase().includes(q) ||
          p.telefon.includes(q) ||
          p.sehir.toLowerCase().includes(q)
      );
    }

    // Departman filtresi
    if (secilenDepartman !== 'TÜMÜ') {
      result = result.filter((p) => p.departman === secilenDepartman);
    }

    // Durum filtresi
    if (secilenDurum !== 'TÜMÜ') {
      result = result.filter((p) => p.durum === secilenDurum);
    }

    // Sıralama
    result.sort((a, b) => {
      let cmp = 0;
      if (siralamaAlani === 'ad') {
        cmp = `${a.ad} ${a.soyad}`.localeCompare(`${b.ad} ${b.soyad}`, 'tr');
      } else if (siralamaAlani === 'maas') {
        cmp = a.maas - b.maas;
      } else if (siralamaAlani === 'iseGirisTarihi') {
        cmp = a.iseGirisTarihi.localeCompare(b.iseGirisTarihi);
      } else if (siralamaAlani === 'departman') {
        cmp = a.departman.localeCompare(b.departman, 'tr');
      } else if (siralamaAlani === 'tcKimlik') {
        cmp = a.tcKimlik.localeCompare(b.tcKimlik);
      }
      return siralamaYonu === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [personeller, aramaMetni, secilenDepartman, secilenDurum, siralamaAlani, siralamaYonu]);

  // Sıralama başlığı tıklama
  const handleSort = (field: SiralamaAlani) => {
    if (siralamaAlani === field) {
      setSiralamaYonu(siralamaYonu === 'asc' ? 'desc' : 'asc');
    } else {
      setSiralamaAlani(field);
      setSiralamaYonu('asc');
    }
  };

  // Toplu seçim
  const handleSelectAll = () => {
    if (seciliIdler.length === filtrelenmisPersoneller.length) {
      setSeciliIdler([]);
    } else {
      setSeciliIdler(filtrelenmisPersoneller.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSeciliIdler((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Durum rozeti oluşturucu
  const renderDurumBadge = (durum: DurumTuru) => {
    if (durum === 'Aktif') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
          Aktif
        </span>
      );
    }
    if (durum === 'İzinli') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 mr-1 text-amber-600" />
          İzinli
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-200 text-slate-700 border border-slate-300">
        <UserX className="w-3 h-3 mr-1 text-slate-500" />
        Ayrıldı
      </span>
    );
  };

  return (
    <div className="p-4 space-y-3">
      {/* Filtreleme ve Kontrol Barı */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Departman Filtresi */}
          <div className="flex items-center space-x-1">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="filter-department-select"
              value={secilenDepartman}
              onChange={(e) => setSecilenDepartman(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-700 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="TÜMÜ">Tüm Departmanlar ({personeller.length})</option>
              {departmanlar.map((d) => (
                <option key={d} value={d}>
                  {d} ({personeller.filter((p) => p.departman === d).length})
                </option>
              ))}
            </select>
          </div>

          {/* Durum Filtresi */}
          <div className="flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="filter-status-select"
              value={secilenDurum}
              onChange={(e) => setSecilenDurum(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-700 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="TÜMÜ">Tüm Durumlar</option>
              <option value="Aktif">Yalnızca Aktif</option>
              <option value="İzinli">Yıllık / Raporlu İzinli</option>
              <option value="Ayrıldı">Ayrılan Personel</option>
            </select>
          </div>

          {/* Filtreleri Temizle */}
          {(secilenDepartman !== 'TÜMÜ' || secilenDurum !== 'TÜMÜ' || aramaMetni) && (
            <button
              onClick={() => {
                setSecilenDepartman('TÜMÜ');
                setSecilenDurum('TÜMÜ');
                setAramaMetni('');
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline px-1.5 py-0.5"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>

        {/* Sağ: Görünüm Modu ve Kayıt Bilgisi */}
        <div className="flex items-center space-x-3">
          <span className="text-slate-500 font-medium hidden sm:inline">
            Listelenen: <strong className="text-slate-800">{filtrelenmisPersoneller.length}</strong> / {personeller.length}
          </span>

          <div className="flex items-center border border-slate-300 rounded overflow-hidden bg-slate-100">
            <button
              id="btn-view-table"
              onClick={() => setGorunumModu('tablo')}
              title="Tablo Görünümü (DataGrid)"
              className={`p-1.5 transition-colors ${
                gorunumModu === 'tablo' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-view-grid"
              onClick={() => setGorunumModu('kart')}
              title="Kart Görünümü"
              className={`p-1.5 transition-colors ${
                gorunumModu === 'kart' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Ana Veri Tablosu / Kart Listesi */}
      {filtrelenmisPersoneller.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Eşleşen Personel Bulunamadı</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Arama kriterlerinize veya filtrelerinize uygun personel kaydı bulunamadı. Filtreleri temizleyerek tekrar deneyebilirsiniz.
          </p>
        </div>
      ) : gorunumModu === 'tablo' ? (
        /* Windows DataGrid Tablosu */
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-600 font-semibold select-none">
                  <th className="py-2.5 px-3 w-10 text-center">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      {seciliIdler.length === filtrelenmisPersoneller.length && filtrelenmisPersoneller.length > 0 ? (
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </th>
                  <th
                    onClick={() => handleSort('tcKimlik')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>T.C. Kimlik</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('ad')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Ad Soyad</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('departman')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Departman & Görev</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('maas')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Maaş (Aylık)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3">Durum</th>
                  <th
                    onClick={() => handleSort('iseGirisTarihi')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors hidden md:table-cell"
                  >
                    <div className="flex items-center space-x-1">
                      <span>İşe Giriş</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 hidden lg:table-cell">İletişim</th>
                  <th className="py-2.5 px-3 hidden xl:table-cell">Şehir / Kan</th>
                  <th className="py-2.5 px-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtrelenmisPersoneller.map((p) => {
                  const isChecked = seciliIdler.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        isChecked ? 'bg-blue-50/80' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(p.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600 font-medium">
                        {p.tcKimlik}
                      </td>
                      <td className="py-2 px-3">
                        <div
                          onClick={() => onPersonelSec(p)}
                          className="flex items-center space-x-2 cursor-pointer group"
                        >
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {p.ad.charAt(0)}
                            {p.soyad.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {p.ad} <span className="uppercase">{p.soyad?.toLocaleUpperCase('tr-TR')}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 block sm:hidden">
                              {p.pozisyon}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-slate-800 font-medium">{p.departman}</div>
                        <div className="text-slate-500 text-[11px]">{p.pozisyon}</div>
                      </td>
                      <td className="py-2 px-3 font-mono font-medium">
                        {yetkiler.maasGoruntule ? (
                          <span className="text-slate-800">
                            ₺{p.maas.toLocaleString('tr-TR')}
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center space-x-1" title="Maaş görüntüleme yetkiniz yok">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>•••••• TL</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">{renderDurumBadge(p.durum)}</td>
                      <td className="py-2 px-3 text-slate-600 hidden md:table-cell font-mono">
                        {p.iseGirisTarihi}
                      </td>
                      <td className="py-2 px-3 text-slate-600 hidden lg:table-cell">
                        <div className="flex items-center space-x-1 text-slate-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{p.telefon}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {p.email}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-600 hidden xl:table-cell">
                        <div>{p.sehir}</div>
                        <span className="inline-block px-1.5 py-0.2 bg-slate-100 border border-slate-300 rounded text-[10px] text-slate-600">
                          {p.kanGrubu}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Detay Kartı */}
                          <button
                            onClick={() => onPersonelSec(p)}
                            title="Personel Detay Kartını Görüntüle"
                            className="p-1 rounded text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* PDF Kimlik Kartı */}
                          <button
                            onClick={() => onTekilPdf(p)}
                            title="Resmi Özlük Kartı PDF İndir"
                            className="p-1 rounded text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Düzenle */}
                          {yetkiler.personelDuzenle && (
                            <button
                              onClick={() => onPersonelDuzenle(p)}
                              title="Personel Bilgilerini Güncelle"
                              className="p-1 rounded text-slate-600 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Sil */}
                          {yetkiler.personelSil && (
                            <button
                              onClick={() => onPersonelSil(p.id, `${p.ad} ${p.soyad}`)}
                              title="Personel Kaydını Sil"
                              className="p-1 rounded text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Windows Fluent Kart Görünümü */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtrelenmisPersoneller.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-lg border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {p.ad.charAt(0)}
                      {p.soyad.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm leading-tight">
                        {p.ad} <span className="uppercase">{p.soyad?.toLocaleUpperCase('tr-TR')}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">TC: {p.tcKimlik}</p>
                    </div>
                  </div>
                  {renderDurumBadge(p.durum)}
                </div>

                <div className="space-y-1 text-xs mt-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Departman:</span>
                    <span className="font-medium text-slate-800">{p.departman}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Pozisyon:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[150px]">{p.pozisyon}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Maaş:</span>
                    <span className="font-mono font-semibold text-emerald-700">
                      {yetkiler.maasGoruntule ? `₺${p.maas.toLocaleString('tr-TR')}` : '•••••• TL'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Şehir:</span>
                    <span className="text-slate-700">{p.sehir}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onPersonelSec(p)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detay Kartı</span>
                </button>

                <div className="flex items-center space-x-1">
                  {yetkiler.personelDuzenle && (
                    <button
                      onClick={() => onPersonelDuzenle(p)}
                      title="Düzenle"
                      className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-amber-600"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {yetkiler.personelSil && (
                    <button
                      onClick={() => onPersonelSil(p.id, `${p.ad} ${p.soyad}`)}
                      title="Sil"
                      className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
