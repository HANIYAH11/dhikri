/* ============================================================================
   بيانات الأقسام (التصنيفات)
   ----------------------------------------------------------------------------
   الأقسام المتاحة فقط تظهر في التنقل والرئيسية. والأقسام المستقبلية مُسجّلة
   في FUTURE_SECTIONS كخطة نمو — لا تظهر للمستخدم حتى يُدخل محتواها الموثّق.
   ========================================================================== */

import type { CategoryId, CategoryMeta } from "./types";

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "morning",
    title: "أذكار الصباح",
    icon: "sun",
    tagline: "ابدأ يومك بذكر الله",
    intro:
      "ابدأ يومك بذكر الله، واقرأ الأذكار الواردة الصحيحة بتدبر وطمأنينة.",
    available: true,
  },
  {
    id: "evening",
    title: "أذكار المساء",
    icon: "moon",
    tagline: "اختم يومك بذكر الله",
    intro:
      "اختم يومك بذكر الله، واقرأ الأذكار الواردة الصحيحة بتدبر وطمأنينة.",
    available: true,
  },
];

/** أقسام مخطَّطة — لا تظهر للمستخدم قبل إدخال محتواها الموثّق */
export const FUTURE_SECTIONS = [
  "أذكار بعد الصلاة",
  "أذكار النوم",
  "أذكار الاستيقاظ",
  "أذكار السفر",
  "أذكار الطعام",
  "أدعية صحيحة",
] as const;

export const AVAILABLE_CATEGORIES = CATEGORIES.filter((c) => c.available);

export function getCategory(id: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.id === id && c.available);
}

export function categoryTitle(id: CategoryId): string {
  return getCategory(id)?.title ?? "";
}
