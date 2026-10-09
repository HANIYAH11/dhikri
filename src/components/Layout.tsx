/* ============================================================================
   الهيكل العام: شريط علوي + ملاحة سفلية (هاتف) / علوية (كمبيوتر)
   ========================================================================== */

import { NavLink, Link } from "react-router-dom";
import { useSettings } from "../state/settings";
import { useProgress } from "../state/progress";
import {
  IconGear,
  IconHeart,
  IconHome,
  IconMoon,
  IconSearch,
  IconSun,
} from "./icons";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "الرئيسية", icon: IconHome, end: true },
  { to: "/morning", label: "الصباح", icon: IconSun, end: false },
  { to: "/evening", label: "المساء", icon: IconMoon, end: false },
  { to: "/favorites", label: "المفضلة", icon: IconHeart, end: false },
  { to: "/settings", label: "الإعدادات", icon: IconGear, end: false },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { settings, update, fontDown, fontUp } = useSettings();
  const { favoritesCount } = useProgress();

  const nextTheme =
    settings.theme === "light" ? "dark" : settings.theme === "dark" ? "auto" : "light";
  const themeIcon =
    settings.theme === "light" ? (
      <IconSun className="h-5 w-5" />
    ) : settings.theme === "dark" ? (
      <IconMoon className="h-5 w-5" />
    ) : (
      <span className="text-xs font-extrabold">تلقائي</span>
    );
  const themeLabel =
    settings.theme === "light"
      ? "المظهر الحالي: فاتح — اضغط للداكن"
      : settings.theme === "dark"
        ? "المظهر الحالي: داكن — اضغط للتلقائي"
        : "المظهر الحالي: تلقائي — اضغط للفاتح";

  return (
    <div className="flex min-h-screen flex-col">
      {/* تخطّي إلى المحتوى — أول عنصر تركيزي في الصفحة */}
      <a
        href="#main"
        onClick={(e) => {
          // نمنع تغيير الـ hash (الذي يقود توجيه HashRouter) وننقل التركيز يدويًّا
          e.preventDefault();
          const m = document.getElementById("main");
          m?.focus();
          m?.scrollIntoView({ block: "start" });
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:right-2 focus:top-2 focus:z-50 focus:rounded-xl focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        تخطَّ إلى المحتوى
      </a>

      {/* ── الشريط العلوي ── */}
      <header className="sticky top-0 z-30 border-b border-sand-200 bg-white/85 backdrop-blur-md dark:border-night-800 dark:bg-night-900/85">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-xl font-extrabold tracking-tight text-brand-800 dark:text-gold-300">
              ذِكري
            </span>
            <span className="hidden text-xs font-bold text-slate-600 dark:text-sand-300 sm:inline">
              أذكار الصباح والمساء
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="التنقّل الرئيسي">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `relative rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-brand-50 text-brand-800 dark:bg-night-800 dark:text-gold-300"
                      : "text-slate-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-night-800"
                  }`
                }
              >
                {n.label}
                {n.to === "/favorites" && favoritesCount > 0 && (
                  <span className="mr-1 rounded-full bg-gold-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white tabular-nums">
                    {favoritesCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              to="/search"
              aria-label="البحث في الأذكار"
              className="rounded-xl p-2.5 text-slate-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-night-800"
            >
              <IconSearch className="h-5 w-5" />
            </Link>

            {/* حجم الخط: A− A A+ */}
            <div
              className="hidden items-center gap-0.5 rounded-xl border border-sand-300 px-1 py-0.5 dark:border-night-800 sm:flex"
              role="group"
              aria-label="حجم الخط"
            >
              <button
                type="button"
                onClick={fontDown}
                aria-label="تصغير الخط (A−)"
                className="px-2 py-1 text-sm font-extrabold text-slate-600 hover:text-brand-700 dark:text-sand-300"
              >
                A−
              </button>
              <Link
                to="/settings"
                aria-label="فتح إعدادات حجم الخط (A)"
                className="px-1.5 py-1 text-sm font-extrabold text-slate-600 hover:text-brand-700 dark:text-sand-300"
              >
                A
              </Link>
              <button
                type="button"
                onClick={fontUp}
                aria-label="تكبير الخط (A+)"
                className="px-2 py-1 text-sm font-extrabold text-slate-600 hover:text-brand-700 dark:text-sand-300"
              >
                A+
              </button>
            </div>

            <button
              type="button"
              onClick={() => update({ theme: nextTheme })}
              aria-label={themeLabel}
              title={themeLabel}
              className="flex min-h-[40px] min-w-[40px] items-center justify-center gap-1 rounded-xl border border-sand-300 px-2 text-slate-600 hover:bg-sand-100 dark:border-night-800 dark:text-sand-300 dark:hover:bg-night-800"
            >
              {themeIcon}
            </button>
          </div>
        </div>
      </header>

      {/* ── المحتوى ── */}
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-4 pb-32 pt-6 sm:pb-16 focus:outline-none">
        {children}
      </main>

      {/* ── التذييل ── */}
      <footer className="border-t border-sand-200 bg-white/70 px-4 py-8 text-center dark:border-night-800 dark:bg-night-950/60">
        <p className="text-sm font-extrabold text-brand-800 dark:text-gold-300">
          ذِكري — أذكار موثّقة وتجربة هادئة للذكر
        </p>
        <nav
          className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-bold text-slate-600 dark:text-sand-300"
          aria-label="روابط التذييل"
        >
          <Link to="/morning">الأذكار</Link>
          <Link to="/sources">المصادر</Link>
          <Link to="/favorites">المفضلة</Link>
          <Link to="/settings">الإعدادات</Link>
        </nav>
        <p className="mt-4 text-[11px] leading-6 text-slate-600 dark:text-sand-300/70">
          جميع النصوص منقولة عن القرآن الكريم وصحيح البخاري وصحيح مسلم والسنن
          المعتبرة، ومعها مواضع الخلاف. تنبيه: التطبيق للاستذكار والقصد، والرجوع
          لأهل العلم مفتاح الفهم.
        </p>
        <p className="mt-2 text-[11px] text-slate-600 dark:text-sand-300/70">
          © <span id="year">{new Date().getFullYear()}</span> ذِكري
        </p>
      </footer>

      {/* ── الملاحة السفلية (هاتف) ── */}
      <nav
        aria-label="التنقّل السفلي"
        className="bottom-safe fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-white/95 backdrop-blur-md dark:border-night-800 dark:bg-night-900/95 md:hidden"
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-around">
          {NAV.map((n) => (
            <li key={n.to} className="flex-1">
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-bold transition-colors ${
                    isActive
                      ? "text-brand-700 dark:text-gold-300"
                      : "text-slate-600 dark:text-sand-300"
                  }`
                }
              >
                <span className="relative">
                  <n.icon className="h-6 w-6" />
                  {n.to === "/favorites" && favoritesCount > 0 && (
                    <span className="absolute -top-1.5 -left-2 rounded-full bg-gold-500 px-1 text-[9px] font-extrabold text-white tabular-nums">
                      {favoritesCount}
                    </span>
                  )}
                </span>
                {n.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
