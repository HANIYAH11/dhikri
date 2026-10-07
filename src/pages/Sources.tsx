/* ============================================================================
   صفحة المصادر والتوثيق
   ----------------------------------------------------------------------------
   تشرح منهج الموقع ثم تعرض لكل ذكر: المصدر، الكتاب، رقم الحديث، الحكم،
   والملاحظة عند الخلاف — من نفس البيانات المعروضة في البطاقات.
   ========================================================================== */

import { useState } from "react";
import { Link } from "react-router-dom";
import { EVENING, MORNING } from "../data/adhkar";
import { formatReference } from "../data/parseSource";
import type { CategoryId, Dhikr } from "../data/types";
import { IconBook, IconSearch } from "../components/icons";

type Tab = "all" | CategoryId;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "morning", label: "الصباح" },
  { id: "evening", label: "المساء" },
];

export default function Sources() {
  const [tab, setTab] = useState<Tab>("all");
  const [open, setOpen] = useState<string | null>(null);

  const rows: Dhikr[] =
    tab === "morning" ? MORNING : tab === "evening" ? EVENING : [...MORNING, ...EVENING];

  return (
    <div>
      <header className="mb-6 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-tap">
          <IconBook className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-sand-100">
            المصادر والتوثيق
          </h1>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-600 dark:text-sand-300">
            حرصنا في هذا الموقع على نسبة الأذكار إلى مصادرها الموثوقة، وعدم إضافة
            نصوص أو فضائل غير ثابتة.
          </p>
        </div>
      </header>

      {/* المنهج */}
      <section className="card mb-6 p-5 text-sm leading-7 text-slate-600 dark:text-sand-300 sm:p-6">
        <h2 className="mb-2 text-base font-extrabold text-slate-800 dark:text-sand-100">
          منهج التوثيق
        </h2>
        <ul className="list-inside list-disc space-y-1.5">
          <li>
            النصوص من <b>القرآن الكريم</b>، و<b>صحيح البخاري</b>، و<b>صحيح مسلم</b>
            ، و<b>سنن أبي داود</b>، و<b>الترمذي</b>، و<b>النسائي</b>، و<b>ابن ماجه</b>
            ، و<b>مسند أحمد</b>، وهو ما اعتمده «حصن المسلم».
          </li>
          <li>
            كل ذكر مرفق بعدد تكراره، ومصدره، ودرجة الحديث، وفضله إن ثبت، ورقم
            الحديث إن توفر.
          </li>
          <li>
            عند الخلاف في العدد أو التصحيح أو صيغة الذكر تُذكر الملاحظة صراحةً في
            بطاقة الذكر، دون تفضيل قول على آخر.
          </li>
          <li>
            لا يُعرض فضل غير ثابت، ولا يُنسب حديث إلى النبي ﷺ دون مصدر موثوق؛ وما
            لم يتوفر له توثيق يُترك فارغًا بدل اختلاقه.
          </li>
          <li>
            لم تُضَف تسجيلات صوتية لعدم توفّر مصادر صوتية موثوقة مُتحقَّق منها.
          </li>
        </ul>
        <p className="mt-3 rounded-xl bg-sand-100 p-3 text-xs font-bold leading-6 dark:bg-night-850">
          تنبيه: هذا التطبيق للاستذكار والقصد، لا لاستنباط الأحكام؛ والرجوع إلى
          أهل العلم مفتاح الفهم.
        </p>
      </section>

      {/* التصفية */}
      <div className="seg mb-5" role="group" aria-label="تصفية حسب القسم">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="mb-3 text-xs font-bold text-slate-600 dark:text-sand-300">
        {rows.length} ذكرًا — اضغط لعرض التوثيق الكامل
      </p>

      {/* قائمة المصادر */}
      <ul className="flex flex-col gap-2.5">
        {rows.map((d) => {
          const isOpen = open === d.id;
          return (
            <li key={d.id}>
              <div className="card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : d.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 p-4 text-right"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sand-100 text-xs font-extrabold text-brand-800 tabular-nums dark:bg-night-800 dark:text-gold-300">
                    {d.category === "morning" ? "ص" : "م"}
                    {String(d.order).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold text-slate-800 dark:text-sand-100">
                      {d.title}
                    </span>
                    <span className="block truncate text-[11px] font-bold text-slate-600 dark:text-sand-300">
                      {d.source}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-slate-600 transition-transform dark:text-sand-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  >
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div className="animate-card-in border-t border-sand-200 p-4 text-sm leading-7 dark:border-night-800">
                    <dl className="space-y-2.5">
                      <div className="flex gap-2">
                        <dt className="shrink-0 rounded-lg bg-sand-100 px-2 py-0.5 text-xs font-extrabold dark:bg-night-800">
                          المصدر
                        </dt>
                        <dd className="font-bold text-slate-700 dark:text-sand-200">
                          {d.source}
                        </dd>
                      </div>

                      {d.references.map((r, i) => (
                        <div key={i} className="flex gap-2">
                          <dt className="shrink-0 rounded-lg bg-sand-100 px-2 py-0.5 text-xs font-extrabold dark:bg-night-800">
                            الكتاب
                          </dt>
                          <dd className="font-bold text-slate-700 dark:text-sand-200">
                            {formatReference(r)}
                          </dd>
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <dt className="shrink-0 rounded-lg bg-sand-100 px-2 py-0.5 text-xs font-extrabold dark:bg-night-800">
                          التكرار
                        </dt>
                        <dd className="font-bold text-slate-700 dark:text-sand-200">
                          {d.count === 1 ? "مرة واحدة" : `${d.count} مرات`}
                        </dd>
                      </div>

                      <div className="flex gap-2">
                        <dt className="shrink-0 rounded-lg bg-sand-100 px-2 py-0.5 text-xs font-extrabold dark:bg-night-800">
                          الدرجة
                        </dt>
                        <dd className="font-bold text-slate-700 dark:text-sand-200">
                          {d.authenticity ?? (
                            <span className="text-slate-600">غير متوفر</span>
                          )}
                        </dd>
                      </div>

                      {d.note && (
                        <div className="flex gap-2">
                          <dt className="shrink-0 rounded-lg bg-sand-100 px-2 py-0.5 text-xs font-extrabold dark:bg-night-800">
                            ملاحظة
                          </dt>
                          <dd className="text-slate-600 dark:text-sand-300">
                            {d.note}
                          </dd>
                        </div>
                      )}
                    </dl>

                    <div className="mt-3 flex gap-2">
                      <Link
                        to={`/${d.category}#dhikr-${d.id}`}
                        className="btn-ghost !py-2 text-xs"
                      >
                        فتح الذكر في قسمه
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs font-bold text-slate-600 dark:text-sand-300/80">
        <IconSearch className="h-4 w-4" />
        ابحث في النصوص مباشرة من صفحة
        <Link to="/search" className="text-brand-700 underline dark:text-gold-300">
          البحث
        </Link>
      </p>
    </div>
  );
}
