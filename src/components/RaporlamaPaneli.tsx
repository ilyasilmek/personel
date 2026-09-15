import React, { useMemo } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Award,
  FileSpreadsheet,
  FileText,
  Building,
  GraduationCap,
  Briefcase,
  AlertCircle,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Personel } from '../types';
import { Printer } from 'lucide-react';

interface RaporlamaPaneliProps {
  personeller: Personel[];
  onExcelExport: () => void;
  onPdfExport: () => void;
  onResmiYazdir?: () => void;
}

const COLORS = ['#2563eb', '#0d9488', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const RaporlamaPaneli: React.FC<RaporlamaPaneliProps> = ({
  personeller,
  onExcelExport,
  onPdfExport,
  onResmiYazdir,
}) => {
  // İstatistiksel Özet Hesaplamaları
  const istatistikler = useMemo(() => {
    const toplamSayi = personeller.length;
    const aktifler = personeller.filter((p) => (p.durum || 'Aktif') === 'Aktif');
    const izinliler = personeller.filter((p) => p.durum === 'İzinli');
    const ayrilanlar = personeller.filter((p) => p.durum === 'Ayrıldı');

    const toplamMaas = personeller.reduce((acc, p) => acc + (p.maas || 52000), 0);
    const ortalamaMaas = toplamSayi > 0 ? Math.round(toplamMaas / toplamSayi) : 0;
    const maxMaas = toplamSayi > 0 ? Math.max(...personeller.map((p) => p.maas || 52000)) : 0;
    const minMaas = toplamSayi > 0 ? Math.min(...personeller.map((p) => p.maas || 52000)) : 0;

    // Departman / Birim bazlı dağılım
    const deptMap: Record<string, { sayi: number; toplamMaas: number }> = {};
    personeller.forEach((p) => {
      const dept = p.calistigiBirim || p.departman || 'Atölye Müdürlüğü';
      const maas = p.maas || 52000;
      if (!deptMap[dept]) {
        deptMap[dept] = { sayi: 0, toplamMaas: 0 };
      }
      deptMap[dept].sayi += 1;
      deptMap[dept].toplamMaas += maas;
    });

    const departmanVerisi = Object.entries(deptMap).map(([name, data]) => ({
      name,
      personelSayisi: data.sayi,
      ortalamaMaas: Math.round(data.toplamMaas / data.sayi),
      toplamBordro: data.toplamMaas,
    }));

    // Eğitim durumu / Mezuniyet dağılımı
    const egitimMap: Record<string, number> = {};
    personeller.forEach((p) => {
      const egitim = p.bitirdigiOkul || 'Endüstri Meslek Lisesi';
      egitimMap[egitim] = (egitimMap[egitim] || 0) + 1;
    });
    const egitimVerisi = Object.entries(egitimMap).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      toplamSayi,
      aktifSayisi: aktifler.length,
      izinliSayisi: izinliler.length,
      ayrilanSayisi: ayrilanlar.length,
      toplamMaas,
      ortalamaMaas,
      maxMaas,
      minMaas,
      departmanVerisi,
      egitimVerisi,
    };
  }, [personeller]);

  return (
    <div className="p-4 space-y-4 text-xs">
      {/* Üst Raporlama Başlığı ve Hızlı Dışa Aktar Barı */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <PieChartIcon className="w-4 h-4 text-blue-600" />
            <span>Kurumsal Raporlama ve Analitik Yönetim Paneli</span>
          </h2>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Gerçek zamanlı SQL veri ambarı analizleri, departman bordro dökümleri ve istatistiki göstergeler.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onResmiYazdir && (
            <button
              onClick={onResmiYazdir}
              className="px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 border border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-900 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-blue-700" />
              <span>Resmi Yazdır / PDF Çıktısı</span>
            </button>
          )}

          <button
            onClick={onExcelExport}
            className="px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel Raporu Al (.xlsx)</span>
          </button>

          <button
            onClick={onPdfExport}
            className="px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>PDF İndir (.pdf)</span>
          </button>
        </div>
      </div>

      {/* KPI Kartları Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Kart 1: Toplam Personel */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-medium">Kayıtlı Personel</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-800">
            {istatistikler.toplamSayi} <span className="text-xs font-normal text-slate-500">kişi</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span className="text-emerald-600 font-semibold">{istatistikler.aktifSayisi} Aktif</span>
            <span className="text-amber-600 font-semibold">{istatistikler.izinliSayisi} İzinli</span>
            <span className="text-slate-500">{istatistikler.ayrilanSayisi} Ayrılan</span>
          </div>
        </div>

        {/* Kart 2: Toplam Bordro Gideri */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-medium">Aylık Net Bordro</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono">
            ₺{istatistikler.toplamMaas.toLocaleString('tr-TR')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 flex items-center justify-between">
            <span>Yıllık Tahmini:</span>
            <span className="font-mono font-medium text-slate-700">
              ₺{(istatistikler.toplamMaas * 12).toLocaleString('tr-TR')}
            </span>
          </div>
        </div>

        {/* Kart 3: Ortalama Maaş */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-medium">Ortalama Personel Maaşı</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-800 font-mono">
            ₺{istatistikler.ortalamaMaas.toLocaleString('tr-TR')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 flex items-center justify-between">
            <span>En Düşük / En Yüksek:</span>
            <span className="font-mono font-medium text-slate-700">
              ₺{istatistikler.minMaas.toLocaleString('tr-TR')} - ₺{istatistikler.maxMaas.toLocaleString('tr-TR')}
            </span>
          </div>
        </div>

        {/* Kart 4: Departman ve Çeşitlilik */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-medium">Faal Departman Sayısı</span>
            <Building className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-800">
            {istatistikler.departmanVerisi.length} <span className="text-xs font-normal text-slate-500">birim</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 flex items-center justify-between">
            <span>En Kalabalık:</span>
            <span className="font-semibold text-blue-700 truncate max-w-[140px]">
              {istatistikler.departmanVerisi.length > 0
                ? [...istatistikler.departmanVerisi].sort((a, b) => b.personelSayisi - a.personelSayisi)[0].name
                : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Grafikler Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grafik 1: Departmanlara Göre Personel Dağılımı */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Departmanlara Göre Personel Sayısı Dağılımı</span>
              </h3>
              <p className="text-[10px] text-slate-400">Her birimde görevli çalışan sayısı</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={istatistikler.departmanVerisi} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '6px', fontSize: '11px' }}
                  formatter={(val: number) => [`${val} Kişi`, 'Personel Sayısı']}
                />
                <Bar dataKey="personelSayisi" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 2: Departman Ortalama Maaş Karşılaştırması */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Departman Bazında Ortalama Maaş Seviyesi</span>
              </h3>
              <p className="text-[10px] text-slate-400">Birimlerin net ortalama aylık maaş skalası</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={istatistikler.departmanVerisi} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '6px', fontSize: '11px' }}
                  formatter={(val: number) => [`₺${val.toLocaleString('tr-TR')}`, 'Ortalama Maaş']}
                />
                <Bar dataKey="ortalamaMaas" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 3: Eğitim Durumu Pasta Grafiği */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Personel Eğitim ve Nitelik Dağılımı</span>
              </h3>
              <p className="text-[10px] text-slate-400">Akademik seviyelere göre çalışan yüzdeleri</p>
            </div>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={istatistikler.egitimVerisi}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name || ''}: %${((percent || 0) * 100).toFixed(0)}`
                  }
                  labelLine={false}
                >
                  {istatistikler.egitimVerisi.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} Personel`,
                    `Eğitim: ${name}`,
                  ]}
                />
                <Legend
                  formatter={(value: string) => <span className="text-slate-700 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
