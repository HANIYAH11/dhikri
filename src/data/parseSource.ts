/* ============================================================================
   معالجة حقل source النصّي واستخراج المراجع المُهيكلة منه
   ----------------------------------------------------------------------------
   الهدف: عدم تكرار إدخال المصادر يدويًّا، وعرض بيانات صفحة المصادر من نفس
   المصدر النصّي المعتمد — فلا يلزم مطابقة يدوية قد تُحدث خطأً.
   ========================================================================== */

import type { Reference } from "./types";

/** أسماء الكتب — الأطول أولًا حتى لا يُبتلع الاسم الأقصر داخل الأطول */
const BOOKS = [
  "صحيح الترغيب والترهيب",
  "صحيح سنن أبي داود",
  "مستدرك الحاكم",
  "مجمع الزوائد",
  "سنن أبي داود",
  "سنن الترمذي",
  "سنن النسائي",
  "سنن ابن ماجه",
  "الأدب المفرد",
  "معجم الأوسط",
  "حصن المسلم",
  "مسند أحمد",
  "صحيح البخاري",
  "صحيح مسلم",
  "ابن السني",
  "النسائي",
  "الترمذي",
  "ابن ماجه",
  "أبو داود",
  "الطبراني",
  "الحاكم",
  "البخاري",
  "مسلم",
];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * نمط: اسم كتاب + (نص اختياري بلا أقواس/فواصل) + أرقام بين قوسين اختياريًّا.
 * حظر الفاصلة "," بين الاسم والقوس يمنع إسناد رقم كتاب إلى كتاب لاحق.
 */
const pattern = new RegExp(
  `(${BOOKS.map(esc).join("|")})([^(),،]*(?:\\([^()]*\\))?)`,
  "g"
);

/** آيات القرآن: «سورة البقرة: 255» */
const QURAN_RE = /سورة\s+([^\s:：]+)\s*[:：]\s*(\d+)/g;

/** تنظيف محتوى القوس من فواصل و«و» والفراغات */
function splitNumbers(inside: string): string[] {
  return inside
    .split(/[،,]|\s+و\s+|\s+/)
    .map((s) => s.replace(/^[وـ\s]+|[)\s]+$/g, "").trim())
    .filter(Boolean);
}

export function parseReferences(source: string): Reference[] {
  const refs: Reference[] = [];
  const seen = new Set<string>();

  const push = (book: string, numbers: string[]) => {
    const key = `${book}|${numbers.join(",")}`;
    if (seen.has(key)) return;
    seen.add(key);
    refs.push({ book: book.trim(), hadithNumbers: numbers });
  };

  // القرآن أولًا
  for (const m of source.matchAll(QURAN_RE)) {
    push(`سورة ${m[1]}`, [m[2]]);
  }

  // الكتب
  pattern.lastIndex = 0;
  for (const m of source.matchAll(pattern)) {
    const book = m[1];
    const rest = m[2] ?? "";
    const paren = rest.match(/\(([^()]*)\)/);
    const numbers = paren ? splitNumbers(paren[1]) : [];
    // تجاهل «البخاري» إذا سبقها «صحيح» ضمن نفس التطابق (يُعالج تلقائيًّا بالترتيب)
    push(book, numbers);
  }

  return refs;
}

/** يبني نص مرجع قصيرًا لعرضه في بطاقات المصادر: «صحيح البخاري (6306)» */
export function formatReference(ref: Reference): string {
  if (ref.hadithNumbers.length === 0) return ref.book;
  return `${ref.book} (${ref.hadithNumbers.join("، ")})`;
}
