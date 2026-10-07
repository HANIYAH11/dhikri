/* ============================================================================
   أنواع البيانات المركزية
   ========================================================================== */

export type CategoryId = "morning" | "evening";

/** مرجع مُهيكل للكتاب ورقم الحديث — يُشتق من حقل source النصّي */
export interface Reference {
  /** اسم الكتاب كما ورد في المصدر: «صحيح البخاري»، «سورة البقرة»... */
  book: string;
  /** أرقام الأحاديث/الآيات إن وُجدت: ["6306"] أو ["255"] */
  hadithNumbers: string[];
}

export interface Dhikr {
  /** معرّف فريد ثابت: s-01 للصباح، e-01 للمساء */
  id: string;
  category: CategoryId;
  /** رقم الذكر داخل قسمه (يبدأ من 1) */
  order: number;
  /** عنوان مختصر لتمييز الذكر (لا يُقرأ عادةً بدل النص) */
  title: string;
  /** نص الذكر كاملًا دون اختصار */
  text: string;
  /** عدد التكرار — 1 يعني: زر «تم القراءة» بدل المسبحة */
  count: number;
  /** حقل المصدر كما يُعرض للمستخدم (نصّي كما في المصدر الأصلي) */
  source: string;
  /** المراجع المُهيكلة المُشتقّة من source — لصفحة المصادر */
  references: Reference[];
  /** درجة الحديث/حكمه إن كانت ذات صلة */
  authenticity: string | null;
  /** الفضل الثابت إن وُجد في المصدر */
  benefit: string | null;
  /** ملاحظة توثيق عند الخلاف في العدد أو التصحيح أو الصيغة */
  note: string | null;
  /** تسجيل صوتي موثّق — null حتى توفّر مصادر صوتية موثوقة */
  audio: string | null;
}

export interface CategoryMeta {
  id: CategoryId;
  title: string;
  icon: string;
  tagline: string;
  intro: string;
  /** متاح للمستخدم فقط إذا اكتمل محتواه الموثّق */
  available: boolean;
}

/** إعدادات المستخدم — تُحفظ في localStorage */
export interface Settings {
  theme: "light" | "dark" | "auto";
  /** 4 مستويات: 0 صغير، 1 متوسط، 2 كبير، 3 كبير جدًا */
  fontScale: 0 | 1 | 2 | 3;
  fontFamily: "kufi" | "naskh";
  sound: boolean;
  /** فتح قسم الوقت المناسب تلقائيًا عند الزيارة */
  autoOpen: boolean;
  /** الاحتفاظ بعدّ المسبحة عند تغيّر اليوم */
  keepCounters: boolean;
  reminders: {
    morning: { enabled: boolean; time: string };
    evening: { enabled: boolean; time: string };
  };
}

/** تقدّم قسم واحد في يوم معيّن */
export interface SectionProgress {
  /** معرّفات الأذكار المُنجَزة */
  completed: string[];
  /** عدّاد المسبحة لكل ذكر: { "s-11": 4 } */
  counters: Record<string, number>;
  /** آخر ذكر تفاعل معه المستخدم */
  lastDhikrId: string | null;
}

/** الحالة المحفوظة للمستخدم */
export interface ProgressState {
  /** اليوم بصيغة YYYY-MM-DD — تُصفَّر الحالة عند تغيّره ما لم يُفعَّل keepCounters */
  date: string;
  morning: SectionProgress;
  evening: SectionProgress;
  favorites: string[];
  /** آخر قسم زاره المستخدم */
  lastSection: CategoryId | null;
}

export const emptySection = (): SectionProgress => ({
  completed: [],
  counters: {},
  lastDhikrId: null,
});

export const defaultSettings = (): Settings => ({
  theme: "auto",
  fontScale: 1,
  fontFamily: "kufi",
  sound: false,
  autoOpen: true,
  keepCounters: false,
  reminders: {
    morning: { enabled: false, time: "06:30" },
    evening: { enabled: false, time: "18:00" },
  },
});
