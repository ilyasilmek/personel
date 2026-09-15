/**
 * Türkçe ve İngilizce büyük/küçük harf duyarsız arama kontrolü.
 * İsimler büyük harfle başlasa veya tamamen büyük olsa bile
 * küçük harfle arandığında ("ilyas" -> "İLYAS" / "İlyas") sorunsuz eşleşir.
 * Ayrıca klavye farklılıkları için (i / ı, ş / s, ğ / g, vb.) esnek eşleşme sağlar.
 */
export function normalizeTurkishText(str: string = ''): string {
  if (!str) return '';
  return str
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

export function searchMatches(target: string | number | undefined | null, query: string = ''): boolean {
  if (!query || !query.trim()) return true;
  if (target === undefined || target === null) return false;

  const targetStr = String(target).trim();
  const queryStr = query.trim();

  // 1. Türkçe kurallarına göre küçük harf kontrolü (İ -> i, I -> ı)
  const trTarget = targetStr.toLocaleLowerCase('tr-TR');
  const trQuery = queryStr.toLocaleLowerCase('tr-TR');
  if (trTarget.includes(trQuery)) return true;

  // 2. Standart küçük harf kontrolü
  const enTarget = targetStr.toLowerCase();
  const enQuery = queryStr.toLowerCase();
  if (enTarget.includes(enQuery)) return true;

  // 3. Normalize edilmiş esnek kontrol (i / ı, s / ş, c / ç, o / ö vb.)
  const normTarget = normalizeTurkishText(targetStr);
  const normQuery = normalizeTurkishText(queryStr);
  if (normTarget.includes(normQuery)) return true;

  return false;
}
