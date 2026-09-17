import { Personel } from '../types';

export interface GitHubSyncConfig {
  enabled: boolean;
  token: string;
  repo: string; // Örn: 'ilyasilmk/tcdd-personel-db'
  branch: string; // 'main'
  filePath: string; // 'personel_veritabani.json'
  autoSyncOnStart: boolean;
  autoPushOnChange: boolean;
  lastSyncTime?: string;
  lastSha?: string;
}

const STORAGE_KEY_GITHUB = 'tcdd_github_sync_config_v1';

const DEFAULT_CONFIG: GitHubSyncConfig = {
  enabled: false,
  token: '',
  repo: '',
  branch: 'main',
  filePath: 'personel_veritabani.json',
  autoSyncOnStart: true,
  autoPushOnChange: true,
};

export function utf8ToBase64(str: string): string {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch (err) {
    console.error('Base64 dönüştürme hatası:', err);
    return btoa(unescape(encodeURIComponent(str)));
  }
}

export function base64ToUtf8(str: string): string {
  try {
    const clean = str.replace(/\s+/g, '');
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (err) {
    console.error('Base64 çözümleme hatası:', err);
    return decodeURIComponent(escape(atob(str.replace(/\s+/g, ''))));
  }
}

export function getGitHubConfig(): GitHubSyncConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GITHUB);
    if (!raw) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveGitHubConfig(updates: Partial<GitHubSyncConfig>): GitHubSyncConfig {
  const current = getGitHubConfig();
  const next: GitHubSyncConfig = { ...current, ...updates };
  try {
    localStorage.setItem(STORAGE_KEY_GITHUB, JSON.stringify(next));
  } catch (err) {
    console.error('GitHub ayarları kaydedilemedi:', err);
  }
  return next;
}

export function isGitHubConfigured(cfg?: GitHubSyncConfig): boolean {
  const c = cfg || getGitHubConfig();
  return Boolean(c.enabled && c.token?.trim() && c.repo?.trim());
}

/**
 * Kullanıcı adı ve repo adını ayrıştırır. (Örn: "kullanici/repo" -> { owner: "kullanici", repo: "repo" })
 */
function parseRepoString(repoStr: string): { owner: string; repo: string } | null {
  const cleaned = repoStr.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
  const parts = cleaned.split('/').filter(Boolean);
  if (parts.length >= 2) {
    return { owner: parts[0], repo: parts[1] };
  }
  return null;
}

/**
 * GitHub Bağlantı Testi
 */
export async function testGitHubConnection(cfg?: GitHubSyncConfig): Promise<{
  success: boolean;
  message: string;
  repoDetails?: { isPrivate: boolean; defaultBranch: string; fullName: string };
}> {
  const config = cfg || getGitHubConfig();
  if (!config.token?.trim()) {
    return { success: false, message: 'GitHub Erişim Belirteci (Token) girilmelidir.' };
  }
  const parsed = parseRepoString(config.repo);
  if (!parsed) {
    return { success: false, message: 'Depo adı "kullanici_adi/repo_adi" formatında olmalıdır.' };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers: {
        Authorization: `Bearer ${config.token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.status === 401) {
      return { success: false, message: 'Yetkilendirme hatası (401): Token geçersiz veya süresi dolmuş.' };
    }
    if (res.status === 404) {
      return { success: false, message: `Depo bulunamadı (404): "${parsed.owner}/${parsed.repo}" reposuna erişilemiyor. Reponun adını ve token izinlerini kontrol edin.` };
    }
    if (!res.ok) {
      return { success: false, message: `GitHub API Hatası: HTTP ${res.status}` };
    }

    const data = await res.json();
    const defaultBranch = data.default_branch || 'main';

    // Otomatik olarak reponun asıl varsayılan dalını (main/master) kaydet
    saveGitHubConfig({ branch: defaultBranch });

    return {
      success: true,
      message: `Bağlantı başarılı! Depo: ${data.full_name} (${data.private ? 'Özel / Private' : 'Açık / Public'}) - Dal: ${defaultBranch}`,
      repoDetails: {
        isPrivate: data.private,
        defaultBranch,
        fullName: data.full_name,
      },
    };
  } catch (err: any) {
    return { success: false, message: `Bağlantı kurulamadı: ${err?.message || 'İnternet bağlantınızı kontrol edin'}` };
  }
}

/**
 * GitHub'dan En Güncel Veritabanı Dosyasını İndirir
 */
export async function fetchFromGitHub(cfg?: GitHubSyncConfig): Promise<{
  success: boolean;
  personeller?: Personel[];
  lastUpdated?: string;
  sha?: string;
  message?: string;
  isEmpty?: boolean;
}> {
  const config = cfg || getGitHubConfig();
  if (!isGitHubConfigured(config)) {
    return { success: false, message: 'GitHub ayarları yapılmamış veya devre dışı.' };
  }
  const parsed = parseRepoString(config.repo);
  if (!parsed) {
    return { success: false, message: 'Geçersiz repo formatı.' };
  }

  const filePath = config.filePath || 'personel_veritabani.json';
  const branch = config.branch;

  try {
    const branchParam = branch ? `?ref=${encodeURIComponent(branch)}` : '';
    let url = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${filePath}${branchParam}`;
    let res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    // Eğer belirtilen dalda 404 alındıysa, varsayılan dal ile bir kez daha dene
    if (res.status === 404 && branchParam) {
      const fallbackUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${filePath}`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: {
          Authorization: `Bearer ${config.token.trim()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (fallbackRes.ok || fallbackRes.status === 404) {
        res = fallbackRes;
      }
    }

    if (res.status === 404) {
      return {
        success: true,
        isEmpty: true,
        message: 'Depoda henüz veritabanı dosyası yok. "GitHub\'a Şimdi Gönder (Push)" butonuna basarak ilk verinizi yükleyebilirsiniz.',
      };
    }
    if (!res.ok) {
      const errObj = await res.json().catch(() => ({}));
      return { success: false, message: `GitHub indirme hatası: HTTP ${res.status} (${errObj?.message || 'Bilinmeyen hata'})` };
    }

    const fileData = await res.json();

    if (Array.isArray(fileData)) {
      return { success: false, message: 'Belirtilen dosya yolu bir dizin (klasör) olarak görünüyor.' };
    }

    let contentUtf8 = '';

    // 1. Base64 içerik kontrolü
    if (fileData.content && typeof fileData.content === 'string') {
      contentUtf8 = base64ToUtf8(fileData.content);
    } else if (fileData.download_url) {
      // 1MB üzeri dosyalarda veya içerik boş döndüğünde download_url'den ham metin çek
      try {
        const rawRes = await fetch(fileData.download_url, {
          headers: {
            Authorization: `Bearer ${config.token.trim()}`,
          },
        });
        if (rawRes.ok) {
          contentUtf8 = await rawRes.text();
        }
      } catch (dlErr) {
        console.warn('download_url indirme uyarısı:', dlErr);
      }
    }

    // Dosya boyutu 0 ise veya içerik tamamen boşsa (Unexpected end of JSON hatasını engelle)
    if (!contentUtf8 || contentUtf8.trim() === '') {
      if (fileData.sha) {
        saveGitHubConfig({ lastSha: fileData.sha });
      }
      return {
        success: true,
        isEmpty: true,
        sha: fileData.sha,
        message: 'GitHub deposundaki veritabanı dosyası henüz boş. "GitHub\'a Şimdi Gönder (Push)" butonuna basarak mevcut listenizi yükleyebilirsiniz.',
      };
    }

    // JSON ayrıştırmayı güvenli blok içine al
    let parsedJson: any;
    try {
      parsedJson = JSON.parse(contentUtf8);
    } catch (parseErr: any) {
      if (fileData.sha) {
        saveGitHubConfig({ lastSha: fileData.sha });
      }
      return {
        success: false,
        sha: fileData.sha,
        message: `Depodaki dosya boş veya geçersiz JSON içeriyor (${parseErr?.message || 'Biçim hatası'}). "GitHub'a Şimdi Gönder (Push)" butonuna basarak güncel veritabanınızı depoya kaydedebilirsiniz.`,
      };
    }

    let personeller: Personel[] = [];
    if (Array.isArray(parsedJson)) {
      personeller = parsedJson;
    } else if (parsedJson && Array.isArray(parsedJson.personeller)) {
      personeller = parsedJson.personeller;
    }

    // SHA ve Son Güncelleme Zamanını kaydet
    saveGitHubConfig({
      lastSha: fileData.sha,
      lastSyncTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });

    return {
      success: true,
      personeller,
      lastUpdated: parsedJson.lastUpdated,
      sha: fileData.sha,
      message: `GitHub'dan ${personeller.length} personel kaydı başarıyla alındı.`,
    };
  } catch (err: any) {
    return { success: false, message: `GitHub senkronizasyon hatası: ${err?.message || 'Bilinmeyen hata'}` };
  }
}

/**
 * GitHub'a Veritabanını Kaydeder (Commit & Push)
 */
export async function pushToGitHub(
  personeller: Personel[],
  commitMessage?: string,
  cfg?: GitHubSyncConfig
): Promise<{ success: boolean; sha?: string; message?: string }> {
  const config = cfg || getGitHubConfig();
  if (!isGitHubConfigured(config)) {
    return { success: false, message: 'GitHub ayarları yapılmamış veya devre dışı.' };
  }
  const parsed = parseRepoString(config.repo);
  if (!parsed) {
    return { success: false, message: 'Geçersiz repo formatı.' };
  }

  const filePath = config.filePath || 'personel_veritabani.json';
  const branch = config.branch;

  try {
    // 1. Dosyanın güncel SHA'sını GitHub'dan anlık sorgula
    let currentSha = config.lastSha;
    try {
      const branchParam = branch ? `?ref=${encodeURIComponent(branch)}` : '';
      const checkRes = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${filePath}${branchParam}`,
        {
          headers: {
            Authorization: `Bearer ${config.token.trim()}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData && checkData.sha) {
          currentSha = checkData.sha;
        }
      }
    } catch {
      // Dosya yoksa veya kontrol başarısızsa devam et
    }

    // 2. JSON içeriğini oluştur ve UTF-8 Base64 yap
    const payloadObject = {
      lastUpdated: new Date().toISOString(),
      version: 2,
      savedBy: 'TCDD Personel Takip Sistemi (Web/Desktop)',
      toplamPersonel: personeller.length,
      personeller,
    };
    const contentBase64 = utf8ToBase64(JSON.stringify(payloadObject, null, 2));

    const body: Record<string, any> = {
      message: commitMessage || `TCDD Personel Veritabanı Güncelleme (${personeller.length} Personel) - ${new Date().toLocaleString('tr-TR')}`,
      content: contentBase64,
    };
    if (branch) {
      body.branch = branch;
    }
    if (currentSha) {
      body.sha = currentSha;
    }

    let putRes = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${config.token.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    // Eğer dal belirtilmişse ve "Reference does not exist" veya 404/422 döndüyse, dal belirtmeden (varsayılan dalda) tekrar dene
    if (!putRes.ok && body.branch) {
      const errClone = await putRes.clone().json().catch(() => ({}));
      if (
        putRes.status === 422 ||
        putRes.status === 404 ||
        errClone?.message?.includes('Reference does not exist') ||
        errClone?.message?.includes('Branch not found')
      ) {
        const retryBody = { ...body };
        delete retryBody.branch;
        const retryRes = await fetch(
          `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${filePath}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${config.token.trim()}`,
              Accept: 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(retryBody),
          }
        );
        if (retryRes.ok) {
          putRes = retryRes;
        }
      }
    }

    // 409 Conflict (SHA uyuşmazlığı): GitHub'daki en taze SHA'yı alıp tekrar dene
    if (putRes.status === 409) {
      try {
        const refetchRes = await fetch(
          `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${filePath}`,
          {
            headers: {
              Authorization: `Bearer ${config.token.trim()}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );
        if (refetchRes.ok) {
          const freshData = await refetchRes.json();
          if (freshData?.sha) {
            body.sha = freshData.sha;
            putRes = await fetch(
              `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${filePath}`,
              {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${config.token.trim()}`,
                  Accept: 'application/vnd.github.v3+json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
              }
            );
          }
        }
      } catch {}
    }

    if (!putRes.ok) {
      const errJson = await putRes.json().catch(() => ({}));
      return {
        success: false,
        message: `GitHub kaydetme hatası (HTTP ${putRes.status}): ${errJson?.message || 'Yazma izni eksik veya çakışma oluştu'}`,
      };
    }

    const resData = await putRes.json();
    const newSha = resData.content?.sha;

    saveGitHubConfig({
      lastSha: newSha,
      lastSyncTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });

    return {
      success: true,
      sha: newSha,
      message: `GitHub'a başarıyla kaydedildi (${personeller.length} personel).`,
    };
  } catch (err: any) {
    return { success: false, message: `GitHub'a kaydedilemedi: ${err?.message || 'Bilinmeyen hata'}` };
  }
}

/**
 * 5 Bilgisayar İçin Tek Tıkla Kurulum Kodu Üretir
 * (1. bilgisayarda ayarlanır, kopyalanan kod diğer 4 bilgisayara yapıştırılır)
 */
export function generateSetupCode(cfg?: GitHubSyncConfig): string {
  const config = cfg || getGitHubConfig();
  const exportPayload = {
    v: 1,
    token: config.token,
    repo: config.repo,
    branch: config.branch || 'main',
    filePath: config.filePath || 'personel_veritabani.json',
    autoSyncOnStart: config.autoSyncOnStart ?? true,
    autoPushOnChange: config.autoPushOnChange ?? true,
    enabled: true,
  };
  return 'TCDD-GH-' + utf8ToBase64(JSON.stringify(exportPayload));
}

/**
 * Tek Tıkla Kurulum Kodunu Çözüp Ayarları Yükler
 */
export function applySetupCode(setupCode: string): { success: boolean; message: string; config?: GitHubSyncConfig } {
  try {
    const trimmed = setupCode.trim();
    if (!trimmed.startsWith('TCDD-GH-')) {
      return { success: false, message: 'Geçersiz kurulum kodu! Kod "TCDD-GH-" ile başlamalıdır.' };
    }
    const b64 = trimmed.substring(8);
    const jsonStr = base64ToUtf8(b64);
    const data = JSON.parse(jsonStr);

    if (!data.token || !data.repo) {
      return { success: false, message: 'Kurulum kodu eksik token veya depo bilgisi içeriyor.' };
    }

    const newConfig: GitHubSyncConfig = {
      enabled: true,
      token: data.token,
      repo: data.repo,
      branch: data.branch || 'main',
      filePath: data.filePath || 'personel_veritabani.json',
      autoSyncOnStart: data.autoSyncOnStart ?? true,
      autoPushOnChange: data.autoPushOnChange ?? true,
    };

    saveGitHubConfig(newConfig);
    return { success: true, message: 'GitHub ayarları kurulum kodundan başarıyla yüklendi!', config: newConfig };
  } catch (err: any) {
    return { success: false, message: `Kurulum kodu uygulanamadı: ${err?.message || 'Geçersiz format'}` };
  }
}
