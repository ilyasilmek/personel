import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  FileCode,
  Layers,
  Database,
  Download,
  Terminal,
  Cpu,
} from 'lucide-react';

export const CSharpMimariModal: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'model' | 'context' | 'repository' | 'export' | 'backup' | 'sql'>('model');
  const [kopyalandi, setKopyalandi] = useState(false);

  const kodlar = {
    model: `// ============================================================================
// Model: Personel.cs (C# 12 / .NET 8 / .NET 9)
// ============================================================================
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PersonelYonetimSistemi.Models
{
    [Table("Personeller")]
    public class Personel
    {
        [Key]
        [StringLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required(ErrorMessage = "T.C. Kimlik No zorunludur.")]
        [StringLength(11, MinimumLength = 11, ErrorMessage = "T.C. Kimlik 11 hane olmalıdır.")]
        public string TcKimlik { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Ad { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Soyad { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Telefon { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Departman { get; set; } = "Yazılım & Bilişim";

        [Required]
        [StringLength(150)]
        public string Pozisyon { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        [Range(0, 10000000, ErrorMessage = "Geçerli bir maaş giriniz.")]
        public decimal Maas { get; set; }

        public DateTime IseGirisTarihi { get; set; } = DateTime.Today;
        public DateTime DogumTarihi { get; set; }

        [StringLength(10)]
        public string KanGrubu { get; set; } = "A+";

        [StringLength(20)]
        public string Durum { get; set; } = "Aktif"; // Aktif, İzinli, Ayrıldı

        [StringLength(10)]
        public string Cinsiyet { get; set; } = "Erkek";

        [StringLength(50)]
        public string EgitimDurumu { get; set; } = "Lisans";

        public string? Adres { get; set; }

        [StringLength(100)]
        public string Sehir { get; set; } = "İstanbul";

        public string? AcilKisi { get; set; }
        public string? AcilTelefon { get; set; }
        public string? Notlar { get; set; }

        public DateTime OlusturmaTarihi { get; set; } = DateTime.UtcNow;

        [NotMapped]
        public string TamAd => $"{Ad} {Soyad}";
    }
}`,

    context: `// ============================================================================
// Data Access: PersonelDbContext.cs (Entity Framework Core)
// ============================================================================
using Microsoft.EntityFrameworkCore;
using PersonelYonetimSistemi.Models;

namespace PersonelYonetimSistemi.Data
{
    public class PersonelDbContext : DbContext
    {
        public PersonelDbContext(DbContextOptions<PersonelDbContext> options) 
            : base(options)
        {
        }

        public DbSet<Personel> Personeller { get; set; } = null!;
        public DbSet<Kullanici> Kullanicilar { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // T-SQL Yüksek Performanslı İndeks Yapılandırmaları
            modelBuilder.Entity<Personel>(entity =>
            {
                entity.HasIndex(e => e.TcKimlik).IsUnique();
                entity.HasIndex(e => e.Departman);
                entity.HasIndex(e => e.Durum);
                entity.HasIndex(e => e.IseGirisTarihi);

                entity.Property(e => e.Maas).HasPrecision(18, 2);
            });
        }
    }
}`,

    repository: `// ============================================================================
// Service / Repository: PersonelRepository.cs (Asenkron CRUD Mimarisi)
// ============================================================================
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PersonelYonetimSistemi.Data;
using PersonelYonetimSistemi.Models;

namespace PersonelYonetimSistemi.Services
{
    public interface IPersonelRepository
    {
        Task<List<Personel>> GetAllAsync(string? search = null, string? departman = null);
        Task<Personel?> GetByIdAsync(string id);
        Task<bool> AddAsync(Personel personel);
        Task<bool> UpdateAsync(Personel personel);
        Task<bool> DeleteAsync(string id);
        Task<Dictionary<string, int>> GetDepartmentDistributionAsync();
    }

    public class PersonelRepository : IPersonelRepository
    {
        private readonly PersonelDbContext _context;

        public PersonelRepository(PersonelDbContext context)
        {
            _context = context;
        }

        public async Task<List<Personel>> GetAllAsync(string? search = null, string? departman = null)
        {
            var query = _context.Personeller.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p => p.Ad.Contains(search) || 
                                         p.Soyad.Contains(search) || 
                                         p.TcKimlik.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(departman) && departman != "TÜMÜ")
            {
                query = query.Where(p => p.Departman == departman);
            }

            return await query.OrderBy(p => p.Ad).ToListAsync();
        }

        public async Task<Personel?> GetByIdAsync(string id)
        {
            return await _context.Personeller.FindAsync(id);
        }

        public async Task<bool> AddAsync(Personel personel)
        {
            await _context.Personeller.AddAsync(personel);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateAsync(Personel personel)
        {
            _context.Personeller.Update(personel);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var p = await _context.Personeller.FindAsync(id);
            if (p == null) return false;
            _context.Personeller.Remove(p);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Dictionary<string, int>> GetDepartmentDistributionAsync()
        {
            return await _context.Personeller
                .GroupBy(p => p.Departman)
                .Select(g => new { Departman = g.Key, Sayi = g.Count() })
                .ToDictionaryAsync(x => x.Departman, x => x.Sayi);
        }
    }
}`,

    export: `// ============================================================================
// Dışa Aktarma Servisi: ExportService.cs (EPPlus Excel & QuestPDF Desteği)
// ============================================================================
using System.IO;
using OfficeOpenXml;
using PersonelYonetimSistemi.Models;

namespace PersonelYonetimSistemi.Services
{
    public class ExportService
    {
        public static byte[] ExportToExcel(List<Personel> personeller)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using var package = new ExcelPackage();
            var ws = package.Workbook.Worksheets.Add("PersonelListesi");

            // Başlıklar
            string[] headers = { "Sıra", "T.C. Kimlik", "Ad Soyad", "Departman", "Pozisyon", "Maaş", "Durum", "Telefon" };
            for (int i = 0; i < headers.Length; i++)
            {
                ws.Cells[1, i + 1].Value = headers[i];
                ws.Cells[1, i + 1].Style.Font.Bold = true;
            }

            // Satırlar
            for (int row = 0; row < personeller.Count; row++)
            {
                var p = personeller[row];
                ws.Cells[row + 2, 1].Value = row + 1;
                ws.Cells[row + 2, 2].Value = p.TcKimlik;
                ws.Cells[row + 2, 3].Value = $"{p.Ad} {p.soyad}";
                ws.Cells[row + 2, 4].Value = p.Departman;
                ws.Cells[row + 2, 5].Value = p.Pozisyon;
                ws.Cells[row + 2, 6].Value = p.Maas;
                ws.Cells[row + 2, 6].Style.Numberformat.Format = "#,##0.00 TL";
                ws.Cells[row + 2, 7].Value = p.Durum;
                ws.Cells[row + 2, 8].Value = p.Telefon;
            }

            ws.Cells.AutoFitColumns();
            return package.GetAsByteArray();
        }
    }
}`,

    backup: `// ============================================================================
// Veritabanı Yedekleme Servisi: DatabaseBackupService.cs (MSSQL .BAK Desteği)
// ============================================================================
using System;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace PersonelYonetimSistemi.Services
{
    public class DatabaseBackupService
    {
        private readonly string _connectionString;

        public DatabaseBackupService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<string> TakeFullBackupAsync(string targetFolder)
        {
            string dbName = "PersonelDb";
            string fileName = $"PersonelDb_Full_{DateTime.Now:yyyyMMdd_HHmmss}.bak";
            string fullPath = System.IO.Path.Combine(targetFolder, fileName);

            string sql = $@"
                BACKUP DATABASE [{dbName}] 
                TO DISK = N'{fullPath}' 
                WITH NOFORMAT, NOINIT, 
                NAME = N'{dbName}-Full Database Backup', 
                SKIP, NOREWIND, NOUNLOAD, STATS = 10;";

            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(sql, conn);
            cmd.CommandTimeout = 120; // 2 dakika zaman aşımı

            await conn.OpenAsync();
            await cmd.ExecuteNonQueryAsync();

            return fullPath;
        }
    }
}`,

    sql: `-- ============================================================================
-- SQL DDL Tablo ve İndeks Şeması: DatabaseSchema.sql (MSSQL 2019 / 2022)
-- ============================================================================
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'PersonelDb')
BEGIN
    CREATE DATABASE [PersonelDb]
    COLLATE Turkish_CI_AS;
END;
GO

USE [PersonelDb];
GO

-- 1. Personeller Tablosu
IF OBJECT_ID(N'dbo.Personeller', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Personeller (
        Id NVARCHAR(50) NOT NULL PRIMARY KEY,
        TcKimlik NVARCHAR(11) NOT NULL UNIQUE,
        Ad NVARCHAR(100) NOT NULL,
        Soyad NVARCHAR(100) NOT NULL,
        Email NVARCHAR(150) NOT NULL,
        Telefon NVARCHAR(50) NOT NULL,
        Departman NVARCHAR(100) NOT NULL,
        Pozisyon NVARCHAR(150) NOT NULL,
        Maas DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        IseGirisTarihi DATE NOT NULL,
        DogumTarihi DATE NOT NULL,
        KanGrubu NVARCHAR(10) NOT NULL,
        Durum NVARCHAR(20) NOT NULL DEFAULT 'Aktif',
        Cinsiyet NVARCHAR(10) NOT NULL,
        EgitimDurumu NVARCHAR(50) NOT NULL,
        Adres NVARCHAR(MAX) NULL,
        Sehir NVARCHAR(100) NOT NULL,
        AcilKisi NVARCHAR(100) NULL,
        AcilTelefon NVARCHAR(50) NULL,
        Notlar NVARCHAR(MAX) NULL,
        OlusturmaTarihi DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    CREATE NONCLUSTERED INDEX IX_Personeller_Departman ON dbo.Personeller(Departman);
    CREATE NONCLUSTERED INDEX IX_Personeller_Durum ON dbo.Personeller(Durum);
    CREATE NONCLUSTERED INDEX IX_Personeller_TcKimlik ON dbo.Personeller(TcKimlik);
END;
GO

-- 2. Sistem Kullanıcıları ve Rol Tablosu
IF OBJECT_ID(N'dbo.Kullanicilar', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Kullanicilar (
        Id NVARCHAR(50) NOT NULL PRIMARY KEY,
        KullaniciAdi NVARCHAR(50) NOT NULL UNIQUE,
        AdSoyad NVARCHAR(100) NOT NULL,
        Email NVARCHAR(150) NOT NULL,
        Rol NVARCHAR(50) NOT NULL,
        Durum NVARCHAR(20) NOT NULL DEFAULT 'Aktif',
        SonGiris DATETIME2 NULL
    );
END;
GO`,
  };

  const handleKopyala = () => {
    navigator.clipboard.writeText(kodlar[activeCodeTab]);
    setKopyalandi(true);
    setTimeout(() => setKopyalandi(false), 2500);
  };

  return (
    <div className="p-4 space-y-4 text-xs">
      {/* Başlık Kartı */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span>C# & .NET + MS SQL Server Masaüstü Yazılım Mimarisi</span>
            </h2>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Visual Studio / Windows Forms / WPF / .NET MAUI projeleriniz için hazır, modüler ve kurumsal mimari kodları.
            </p>
          </div>
        </div>

        <button
          onClick={handleKopyala}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          {kopyalandi ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Panoya Kopyalandı!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Aktif Kodu Kopyala</span>
            </>
          )}
        </button>
      </div>

      {/* Kod Sekmeleri */}
      <div className="bg-slate-900 rounded-lg shadow-md border border-slate-800 overflow-hidden">
        <div className="flex items-center space-x-1 px-3 pt-2 bg-slate-950 border-b border-slate-800 overflow-x-auto text-[11px]">
          <button
            onClick={() => setActiveCodeTab('model')}
            className={`px-3 py-1.5 font-medium rounded-t transition-colors flex items-center space-x-1.5 ${
              activeCodeTab === 'model'
                ? 'bg-slate-900 text-blue-400 border-t-2 border-t-blue-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Personel.cs (Model)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('context')}
            className={`px-3 py-1.5 font-medium rounded-t transition-colors flex items-center space-x-1.5 ${
              activeCodeTab === 'context'
                ? 'bg-slate-900 text-blue-400 border-t-2 border-t-blue-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>PersonelDbContext.cs (EF Core)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('repository')}
            className={`px-3 py-1.5 font-medium rounded-t transition-colors flex items-center space-x-1.5 ${
              activeCodeTab === 'repository'
                ? 'bg-slate-900 text-blue-400 border-t-2 border-t-blue-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>PersonelRepository.cs (CRUD)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('export')}
            className={`px-3 py-1.5 font-medium rounded-t transition-colors flex items-center space-x-1.5 ${
              activeCodeTab === 'export'
                ? 'bg-slate-900 text-blue-400 border-t-2 border-t-blue-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>ExportService.cs (Excel)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('backup')}
            className={`px-3 py-1.5 font-medium rounded-t transition-colors flex items-center space-x-1.5 ${
              activeCodeTab === 'backup'
                ? 'bg-slate-900 text-blue-400 border-t-2 border-t-blue-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>BackupService.cs (.BAK)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('sql')}
            className={`px-3 py-1.5 font-medium rounded-t transition-colors flex items-center space-x-1.5 ${
              activeCodeTab === 'sql'
                ? 'bg-slate-900 text-blue-400 border-t-2 border-t-blue-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>DatabaseSchema.sql (MSSQL)</span>
          </button>
        </div>

        {/* Kod Görüntüleme Alanı */}
        <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px]">
          <pre className="leading-relaxed selection:bg-blue-600 selection:text-white">
            {kodlar[activeCodeTab]}
          </pre>
        </div>
      </div>
    </div>
  );
};
