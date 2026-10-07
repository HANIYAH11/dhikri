/* ============================================================================
   صفحة قسم الأذكار (الصباح / المساء)
   المسار المثالي: فتح ← ظهور أول ذكر ← قراءة ← مسبحة ← التالي
   ========================================================================== */

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getCategoryDhikr } from "../data/adhkar";
import { getCategory } from "../data/categories";
import { useProgress } from "../state/progress";
import DhikrCard from "../components/DhikrCard";
import { CompletionPanel, ProgressBar } from "../components/Progress";
import { IconMoon, IconSearch, IconSun } from "../components/icons";
import type { CategoryId } from "../data/types";

type Filter = "all" | "remaining" | "done";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "remaining", label: "المتبقّي" },
  { id: "done", label: "المنجَز" },
];

export default function CategoryPage({ category: explicit }: { category?: CategoryId }) {
  const { category: param } = useParams<{ category: string }>();
  const raw = explicit ?? param;
  const valid = raw === "morning" || raw === "evening";
  const catId = (valid ? raw : "morning") as CategoryId;

  const meta = getCategory(catId);
  const list = useMemo(() => getCategoryDhikr(catId), [catId]);

  const { visitSection, section, completedCount, isCompleted } = useProgress();
  const [filter, setFilter] = useState<Filter>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    visitSection(catId);
    setFilter("all");
    window.scrollTo({ top: 0 });
  }, [catId, visitSection]);

  // إعادة الزائر إلى آخر ذكر تفاعل معه (إن بقي في هذا القسم)
  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current) return;
    resumed.current = true;
    const last = section.lastDhikrId;
    if (!last) return;
    const el = document.getElementById(`dhikr-${last}`);
    if (el) {
      window.setTimeout(
        () => el.scrollIntoView({ behavior: "smooth", block: "center" }),
        250
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = list.filter((d) =>
    filter === "remaining"
      ? !isCompleted(d.id)
      : filter === "done"
        ? isCompleted(d.id)
        : true
  );

  const goNext = (id: string) => {
    const i = list.findIndex((d) => d.id === id);
    const next = list[i + 1];
    if (!next) {
      document
        .getElementById("completion")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setActiveId(next.id);
    const el = document.getElementById(`dhikr-${next.id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
  };

  const Icon = catId === "morning" ? IconSun : IconMoon;
  const done = completedCount(catId);

  return (
    <div>
      {/* ترويسة القسم */}
      <header className="mb-6 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-tap">
          <Icon className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-sand-100">
            {meta?.title}
          </h1>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-600 dark:text-sand-300">
            {meta?.intro}
          </p>
        </div>
      </header>

      <ProgressBar category={catId} />

      {/* أدوات: بحث + تصفية */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <a
          href="#/search"
          className="flex flex-1 items-center gap-2 rounded-2xl border border-sand-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:border-brand-400 dark:border-night-800 dark:bg-night-850 dark:text-sand-300"
        >
          <IconSearch className="h-4 w-4" />
          ابحث في الأذكار...
        </a>

        <div className="seg !w-auto" role="group" aria-label="تصفية الأذكار">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-xs font-bold text-slate-600 dark:text-sand-300/80">
        أتممت {done} من {list.length} ذكرًا
        {filter !== "all" && ` — تُعرض ${filtered.length} بطاقة`}
      </p>

      {/* قائمة الأذكار */}
      <div className="flex flex-col gap-5">
        {filtered.map((d) => (
          <DhikrCard
            key={d.id}
            dhikr={d}
            active={activeId === d.id}
            onNext={() => goNext(d.id)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-sm font-bold text-slate-600 dark:text-sand-300">
              {filter === "remaining"
                ? "لا يوجد متبقٍّ — أتممت جميع الأذكار."
                : filter === "done"
                  ? "لم تنجز أيّ ذكر بعد في هذا التصفّي."
                  : "لا توجد أذكار."}
            </p>
          </div>
        )}
      </div>

      <div id="completion">
        <CompletionPanel category={catId} />
      </div>
    </div>
  );
}
