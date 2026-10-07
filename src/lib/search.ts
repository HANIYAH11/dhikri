/* ============================================================================
   تطبيع النص العربي للبحث — يتجاهل التشكيل ويوحّد الهمزات
   ----------------------------------------------------------------------------
   لا يُغيّر نص الذكر المعروض، بل يُستخدم للبحث فقط.
   ========================================================================== */

/** يحذف التشكيل وعلامات الوقف والترقيم العربية */
export function stripDiacritics(s: string): string {
  return s
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "") // تشكيل + تطويل + ضبط
    .replace(/\u0622|\u0623|\u0625|\u0671/g, "\u0627") // آ أ إ ٱ → ا
    .replace(/\u0629/g, "\u0647") // ة → ه
    .replace(/\u0649/g, "\u064A") // ى → ي
    .replace(/\u0624/g, "\u0621") // ؤ → ء
    .replace(/\u0626/g, "\u0621") // ئ → ء
    .replace(/\u0651\u0621/g, "\u0621") // ءّ
    .replace(/[«»"'،.!؟:؛]/g, " ");
}

export function normalize(s: string): string {
  return stripDiacritics(s).toLowerCase().replace(/\s+/g, " ").trim();
}

export interface SearchHit {
  id: string;
  score: number;
  /** موضع أول تطابق في النص الأصلي (تقريبي) لعرض مقتطف */
  snippetFrom: number;
}

/** إبراز مقطع الطلب في نص النصّي غير المُطبَّع يحتاج مطابقة موضعية بسيطة */
export function buildSnippet(text: string, query: string, radius = 60): {
  before: string;
  hit: string;
  after: string;
} {
  const normText = stripDiacritics(text);
  const q = normalize(query);
  const idx = q ? normText.indexOf(q) : -1;
  if (idx < 0) {
    return { before: "", hit: text.slice(0, 0), after: "" };
  }
  // تقدير الموضع في النص الأصلي: غالبًا متساوي لأن التشكيل محذوف في kufi…
  // نستخدم نصًّا مُطبَّعًا للبحث ثم نعرض النص الأصلي بقصّ تقريبي حول الكلمة الأولى.
  const word = q.split(" ")[0];
  const rawIdx = indexOfIgnoringDiacritics(text, word);
  const at = rawIdx >= 0 ? rawIdx : 0;
  const start = Math.max(0, at - radius);
  const end = Math.min(text.length, at + word.length + radius);
  return {
    before: (start > 0 ? "…" : "") + text.slice(start, at),
    hit: text.slice(at, at + word.length + radius - (end - at < radius ? 0 : 0)),
    after: text.slice(at + word.length, end) + (end < text.length ? "…" : ""),
  };
}

/** البحث عن كلمة في نصّ مع تجاهل التشكيل */
export function indexOfIgnoringDiacritics(text: string, word: string): number {
  if (!word) return -1;
  // خريطة موضعية: لكل حرف في النص الأصلي موقعه بعد حذف التشكيل
  let stripped = "";
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const s = stripDiacritics(text[i]);
    for (const ch of s) {
      stripped += ch;
      map.push(i);
    }
  }
  const pos = normalize(stripped).indexOf(normalize(word));
  if (pos < 0) return -1;
  // تحويل موضع في المُطبَّع إلى موضع في الأصلي عبر الخريطة (تقريب كافٍ)
  return map[Math.min(pos, map.length - 1)] ?? -1;
}
