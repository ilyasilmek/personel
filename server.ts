import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// JSON gövde sınırı (fotoğraflar ve evraklar için 50mb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Veri depolama dizini ve dosya yolu
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'personel_veritabani.json');

// Dizin yoksa oluştur
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DbStructure {
  lastUpdated: string;
  version: number;
  personeller: any[];
}

// Dosyadan veritabanını oku
function readDatabase(): DbStructure {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Veritabanı okuma hatası:', err);
  }
  return {
    lastUpdated: new Date().toISOString(),
    version: 1,
    personeller: [],
  };
}

// Dosyaya veritabanını kaydet (Atomik yazma)
function writeDatabase(data: DbStructure): void {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Veritabanı yazma hatası:', err);
  }
}

// ======================= API ENDPOINT'LERİ =======================

// 1. Durum Kontrolü
app.get('/api/status', (req, res) => {
  const db = readDatabase();
  res.json({
    status: 'online',
    serverTime: new Date().toISOString(),
    kayitSayisi: db.personeller.length,
    lastUpdated: db.lastUpdated,
    version: db.version,
    depolamaTuru: 'Merkezi Sunucu Dosya Veritabanı (Online Senkronize)',
  });
});

// 2. Tüm Personelleri Getir (Online Senkronizasyon)
app.get('/api/personeller', (req, res) => {
  const db = readDatabase();
  res.json({
    success: true,
    lastUpdated: db.lastUpdated,
    personeller: db.personeller,
  });
});

// 3. Tek Personel Ekle/Güncelle veya Toplu Liste Kaydet
app.post('/api/personeller', (req, res) => {
  const body = req.body;
  if (Array.isArray(body)) {
    const db = readDatabase();
    db.personeller = body;
    writeDatabase(db);
    return res.json({
      success: true,
      lastUpdated: db.lastUpdated,
      kayitSayisi: db.personeller.length,
      personeller: db.personeller,
    });
  }

  const yeniPersonel = body;
  if (!yeniPersonel || !yeniPersonel.id) {
    return res.status(400).json({ success: false, error: 'Geçersiz personel verisi' });
  }

  const db = readDatabase();
  const index = db.personeller.findIndex((p: any) => p.id === yeniPersonel.id);
  if (index >= 0) {
    db.personeller[index] = { ...db.personeller[index], ...yeniPersonel };
  } else {
    db.personeller.unshift(yeniPersonel);
  }

  writeDatabase(db);
  res.json({
    success: true,
    lastUpdated: db.lastUpdated,
    kayitSayisi: db.personeller.length,
    personel: yeniPersonel,
  });
});

// 4. Personel Güncelle
app.put('/api/personeller/:id', (req, res) => {
  const { id } = req.params;
  const guncelVeri = req.body;

  const db = readDatabase();
  const index = db.personeller.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Personel bulunamadı' });
  }

  db.personeller[index] = { ...db.personeller[index], ...guncelVeri };
  writeDatabase(db);

  res.json({
    success: true,
    lastUpdated: db.lastUpdated,
    personel: db.personeller[index],
  });
});

// 5. Personel Sil
app.delete('/api/personeller/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const baslangicSayisi = db.personeller.length;
  db.personeller = db.personeller.filter((p: any) => p.id !== id);

  if (db.personeller.length === baslangicSayisi) {
    return res.status(404).json({ success: false, error: 'Personel bulunamadı' });
  }

  writeDatabase(db);
  res.json({
    success: true,
    lastUpdated: db.lastUpdated,
    kayitSayisi: db.personeller.length,
  });
});

// 6. Toplu Kayıt / Yedekten Geri Yükleme / İlk Başlangıç Tohumu
app.post('/api/personeller/bulk', (req, res) => {
  const { personeller } = req.body;
  if (!Array.isArray(personeller)) {
    return res.status(400).json({ success: false, error: 'personeller bir dizi olmalıdır' });
  }

  const db = readDatabase();
  db.personeller = personeller;
  writeDatabase(db);

  res.json({
    success: true,
    lastUpdated: db.lastUpdated,
    count: db.personeller.length,
  });
});

// ======================= VITE & STATIC SUNUCU =======================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TCDD Personel Takip Sunucusu port ${PORT} üzerinde hazır (0.0.0.0:${PORT})`);
  });
}

startServer();
