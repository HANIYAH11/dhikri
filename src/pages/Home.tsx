/* ============================================================================
   الصفحة الرئيسية
   الترتيب: الشعار ← الترحيب ← بطاقتا الصباح والمساء ← وردي اليوم ←
            المفضلة ← المصادر ← (التذييل من الهيكل العام)
   ========================================================================== */

import { Link } from "react-router-dom";
import { useProgress } from "../state/progress";
import { AVAILABLE_CATEGORIES } from "../data/categories";
import { Logo, IconArrowStart, IconBook, IconHeart, IconMoon, IconSun } from "../components/icons";

export default function Home() {
  const {
    overallPercent,
    favoritesCount,
    completedCount,
    totalCount,
    lastSection,
  } = useProgress();

  const day = new Date().toLocaleDateString("ar", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="geo-pattern -mx-4 -mt-6 px-4 pt-6">
      {/* الهوية */}
      <section className="pt-4 text-center">
        <div className="mx-auto w-fit">
          <Logo className="h-20 w-20" />
        </div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-brand-800 dark:text-gold-300">
          ذِكري
        </h1>
        <p className="mt-1 text-sm font-bold text-slate-600 dark:text-sand-300">
          وردك اليومي
        </p>

        <blockquote className="mx-auto mt-6 max-w-xl rounded-3xl border-r-4 border-brand-600 bg-white/80 px-5 py-5 shadow-card dark:border-gold-400 dark:bg-night-850/80">
          <p className="dhikr-text !leading-[2.2] text-slate-800 dark:text-sand-100">
            ﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾
          </p>
          <footer className="mt-2 text-xs font-bold text-slate-600 dark:text-gold-300">
            سورة الرعد، الآية 28
          </footer>
        </blockquote>

        <p className="mt-5 text-xs font-bold text-slate-600 dark:text-sand-300/80">
          {day}
        </p>
      </section>

      {/* بطاقتا الوقت */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {AVAILABLE_CATEGORIES.map((c) => {
          const done = completedCount(c.id);
          const total = totalCount(c.id);
          const Icon = c.id === "morning" ? IconSun : IconMoon;
          return (
            <Link
              key={c.id}
              to={`/${c.id}`}
              className="card group flex flex-col items-start gap-3 p-6 transition-transform hover:-translate-y-0.5"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-night-800 dark:text-gold-300">
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-sand-100">
                  {c.title}
                </h2>
                <p className="mt-1 text-sm font-bold text-slate-600 dark:text-sand-300">
                  {c.tagline}
                </p>
              </div>
              <div className="mt-auto flex w-full items-center justify-between pt-3">
                <span className="text-xs font-extrabold tabular-nums text-brand-700 dark:text-gold-300">
                  {done} / {total}
                </span>
                <span className="flex items-center gap-1 text-sm font-extrabold text-brand-700 transition-all group-hover:gap-2 dark:text-gold-300">
                  ابدأ
                  <IconArrowStart className="h-4 w-4 rotate-180" />
                </span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-sand-200 dark:bg-night-800"
                aria-hidden="true"
              >
                <div
                  className="progress-fill h-full rounded-full bg-brand-600"
                  style={{ width: `${total ? (done / total) * 100 : 0}%` }}
                />
              </div>
            </Link>
          );
        })}
      </section>

      {/* وردي اليوم */}
      <section className="card mt-6 p-6" aria-labelledby="ward-title">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="ward-title" className="text-lg font-extrabold text-slate-800 dark:text-sand-100">
              وردي اليوم
            </h2>
            <p className="mt-1 text-sm font-bold text-slate-600 dark:text-sand-300">
              {overallPercent >= 100 ? (
                <span className="text-brand-700 dark:text-gold-300">
                  🌿 أتممت وردك اليوم بالكامل
                </span>
              ) : (
                <>
                  أكملت{" "}
                  <span className="text-brand-700 dark:text-gold-300 tabular-nums">
                    {overallPercent}%
                  </span>{" "}
                  من أذكارك اليوم
                </>
              )}
            </p>
          </div>
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-brand-600 text-sm font-extrabold text-brand-700 tabular-nums dark:border-gold-400 dark:text-gold-300"
            aria-hidden="true"
          >
            {overallPercent}%
          </span>
        </div>

        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-sand-200 dark:bg-night-800"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={overallPercent}
          aria-label={`أكملت ${overallPercent}% من أذكارك اليوم`}
        >
          <div
            className="progress-fill h-full rounded-full bg-gradient-to-l from-brand-700 to-gold-400"
            style={{ width: `${overallPercent}%` }}
          />
        </div>

        <p className="mt-3 text-xs font-bold text-slate-600 dark:text-sand-300/80">
          {lastSection === "evening"
            ? "آخر قسم زرته: أذكار المساء"
            : lastSection === "morning"
              ? "آخر قسم زرته: أذكار الصباح"
              : "لم تزر أيّ قسم بعد اليوم"}
        </p>

        {overallPercent > 0 && overallPercent < 100 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {AVAILABLE_CATEGORIES.map((c) => (
              <Link key={c.id} to={`/${c.id}`} className="btn-primary flex-1">
                متابعة {c.title}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* المفضلة + المصادر */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          to="/favorites"
          className="card flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-600 dark:text-gold-300">
            <IconHeart className="h-6 w-6" filled={favoritesCount > 0} />
          </span>
          <span>
            <span className="block font-extrabold text-slate-800 dark:text-sand-100">
              المفضلة
            </span>
            <span className="block text-xs font-bold text-slate-600 dark:text-sand-300">
              {favoritesCount > 0
                ? `حفظت ${favoritesCount} ذكرًا`
                : "لا توجد أذكار محفوظة بعد"}
            </span>
          </span>
        </Link>

        <Link
          to="/sources"
          className="card flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-night-800 dark:text-gold-300">
            <IconBook className="h-6 w-6" />
          </span>
          <span>
            <span className="block font-extrabold text-slate-800 dark:text-sand-100">
              المصادر والتوثيق
            </span>
            <span className="block text-xs font-bold text-slate-600 dark:text-sand-300">
              مرجع كل ذكر وحكمه
            </span>
          </span>
        </Link>
      </section>
    </div>
  );
}
