/* ============================================================================
   بناء النموذج المُهيكل لأذكار الصباح والمساء
   ----------------------------------------------------------------------------
   المصدر الأساسي: raw.ts (منقول حرفيًّا من قاعدة البيانات الموثّقة).
   هنا فقط: إضافة التصنيف والترتيب، واشتقاق المراجع المُهيكلة من حقل source.
   لا يُغيَّر أي حرف في نص الذكر أو مصدره.
   ========================================================================== */

import { RAW } from "./raw";
import { parseReferences } from "./parseSource";
import type { CategoryId, Dhikr } from "./types";

function build(category: CategoryId): Dhikr[] {
  return RAW[category].map((entry, i) => ({
    id: entry.id,
    category,
    order: i + 1,
    title: entry.title,
    text: entry.text,
    count: entry.count,
    source: entry.source,
    references: parseReferences(entry.source),
    authenticity: entry.grade ?? null,
    benefit: entry.virtue ?? null,
    note: entry.note ?? null,
    audio: null,
  }));
}

export const MORNING: Dhikr[] = build("morning");
export const EVENING: Dhikr[] = build("evening");

export const ALL_DHIKR: Dhikr[] = [...MORNING, ...EVENING];

const BY_ID = new Map<string, Dhikr>(ALL_DHIKR.map((d) => [d.id, d]));

export function getDhikrById(id: string): Dhikr | undefined {
  return BY_ID.get(id);
}

export function getCategoryDhikr(category: CategoryId): Dhikr[] {
  return category === "morning" ? MORNING : EVENING;
}
