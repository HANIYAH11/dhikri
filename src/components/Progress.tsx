/* ============================================================================
   شريط التقدّم أعلى صفحة الأذكار + شاشة إكمال الورد
   ========================================================================== */

import { Link } from "react-router-dom";
import { useProgress } from "../state/progress";
import type { CategoryId } from "../data/types";
import { IconLeaf, IconReset } from "./icons";

export function ProgressBar({ category }: { category: CategoryId }) {
  const { completedCount, totalCount, resetSectionProgress } = useProgress();
  const done = completedCount(category);
  const total = totalCount(category);
  const percent = total ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done >= total;

  return (
    <section
      aria-label="تقدّمك اليوم"
      className="card mb-6 p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-700 dark:text-sand-200">
            تقدّمك اليوم
          </h2>
          <p className="mt-0.5 text-xs font-bold text-slate-600 dark:text-sand-300">
            {allDone ? "أتممت جميع أذكار هذا القسم" : "أكمل الأذكار بالترتيب"}
          </p>
        </div>
        <span className="rounded-full bg-brand-700 px-3.5 py-1.5 text-sm font-extrabold text-white tabular-nums">
          {done} / {total}
        </span>
      </div>

      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-sand-200 dark:bg-night-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label={`أتممت ${done} من ${total} ذكرًا`}
      >
        <div
          className="progress-fill h-full rounded-full bg-gradient-to-l from-brand-600 to-gold-400"
          style={{ width: `${percent}%` }}
        />
      </div>

      {allDone && (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-brand-50 p-4 text-center dark:bg-night-850">
          <span className="text-3xl" aria-hidden="true">
            🌿
          </span>
          <div>
            <p className="text-base font-extrabold text-brand-800 dark:text-gold-300">
              أحسنت! أتممت وردك بنجاح.
            </p>
            <p className="mt-1 text-xs font-bold text-slate-600 dark:text-sand-300">
              بارك الله في وقتك وذكرك.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/" className="btn-ghost">
              العودة للرئيسية
            </Link>
            <button
              type="button"
              className="btn-primary"
              onClick={() => resetSectionProgress(category)}
            >
              <IconReset className="h-4 w-4" />
              إعادة الورد
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/** الشاشة الهادئة عند الإكمال الكامل — تُعرض أسفل القائمة */
export function CompletionPanel({ category }: { category: CategoryId }) {
  const { completedCount, totalCount, resetSectionProgress } = useProgress();
  const done = completedCount(category);
  const total = totalCount(category);
  if (total === 0 || done < total) return null;

  return (
    <section className="card mt-8 animate-card-in p-8 text-center">
      <span className="text-5xl" aria-hidden="true">
        🌿
      </span>
      <h2 className="mt-3 text-xl font-extrabold text-brand-800 dark:text-gold-300">
        تم إكمال وردك
      </h2>
      <p className="mt-2 text-sm font-bold text-slate-600 dark:text-sand-300">
        بارك الله في وقتك وذكرك.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          العودة للرئيسية
        </Link>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => resetSectionProgress(category)}
        >
          <IconReset className="h-4 w-4" />
          إعادة الورد
        </button>
      </div>
      <div className="mt-6 flex items-center justify-center gap-2 text-brand-700 dark:text-gold-300">
        <IconLeaf className="h-5 w-5" />
        <span className="text-xs font-bold">
          {done} من {total} ذكرًا — أتممت الورد
        </span>
      </div>
    </section>
  );
}
