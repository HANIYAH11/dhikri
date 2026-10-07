/* ============================================================================
   طبقة التخزين المحلي (LocalStorage) — آمنة عند تعطّل التخزين
   ========================================================================== */

const PREFIX = "dhikri:";

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

/** يحمّل القيمة كما هي (للمصفوفات مثل المفضلة) */
export function loadRaw<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* التخزين ممتلئ أو محظور — نتجاهل بهدوء ولا نُسقط التطبيق */
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

/** تاريخ اليوم بصيغة YYYY-MM-DD بتوقيت الجهاز المحلي */
export function todayKey(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
