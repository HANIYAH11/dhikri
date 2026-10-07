/* ============================================================================
   البحث الداخلي — يتجاهل التشكيل ويوحّد الهمزات
   يبحث في: نص الذكر + العنوان + المصدر + اسم القسم
   ========================================================================== */

import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ALL_DHIKR } from "../data/adhkar";
import { categoryTitle } from "../data/categories";
import { indexOfIgnoringDiacritics, normalize } from "../lib/search";
import { IconSearch } from "../components/icons";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  const results = useMemo(() => {
    const query = q.trim();
    if (!query) return [];
    const nq = normalize(query);

    return ALL_DHIKR.map((d) => {
      const title = normalize(d.title);
      const text = normalize(d.text);
      const source = normalize(d.source);
      const cat = normalize(categoryTitle(d.category));
      const grade = normalize(d.authenticity ?? "");

      let score = 0;
      if (title === nq) score += 100;
      if (title.includes(nq)) score += 40;
      if (text.includes(nq)) score += 25;
      if (source.includes(nq)) score += 20;
      if (grade.includes(nq)) score += 12;
      if (cat.includes(nq)) score += 8;
      if (score > 0 && text.startsWith(nq)) score += 5;
      return { d, score };
    })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.d);
  }, [q]);

  const onChange = (v: string) => {
    setQ(v);
    if (v) setParams({ q: v }, { replace: true });
    else setParams({}, { replace: true });
  };

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-sand-100">
          البحث في الأذكار
        </h1>
        <p className="mt-1 text-sm font-bold text-slate-600 dark:text-sand-300">
          ابحث بكلمة، أو جزء من الذكر، أو اسم المصدر
        </p>
      </header>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-600">
          <IconSearch className="h-5 w-5" />
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => onChange(e.target.value)}
          placeholder="🔎 ابحث في الأذكار..."
          aria-label="ابحث في الأذكار"
          autoFocus
          className="w-full rounded-2xl border border-sand-300 bg-white py-4 pr-12 pl-4 text-base font-bold text-slate-800 placeholder:text-slate-600 focus:border-brand-500 dark:border-night-800 dark:bg-night-850 dark:text-sand-100"
        />
      </div>

      {q.trim() && (
        <p className="mt-4 text-xs font-bold text-slate-600 dark:text-sand-300">
          {results.length === 0
            ? "لا توجد نتائج مطابقة"
            : `${results.length} نتيجة`}
        </p>
      )}

      <ul className="mt-4 flex flex-col gap-3" aria-live="polite">
        {results.map((d) => {
          const from = indexOfIgnoringDiacritics(d.text, q.split(" ")[0] ?? "");
          const start = Math.max(0, from - 70);
          const snippet =
            (start > 0 ? "…" : "") +
            d.text.slice(start, start + 170).trim() +
            (d.text.length > start + 170 ? "…" : "");

          return (
            <li key={d.id}>
              <Link
                to={`/${d.category}#dhikr-${d.id}`}
                className="card block p-5 transition-transform hover:-translate-y-0.5"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-brand-50 px-2 py-1 text-[11px] font-extrabold text-brand-800 dark:bg-night-800 dark:text-brand-300">
                    {categoryTitle(d.category)} — {String(d.order).padStart(2, "0")}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-sand-300/80">
                    {d.count === 1 ? "مرة واحدة" : `${d.count} مرات`}
                  </span>
                </div>
                <h2 className="font-extrabold text-slate-800 dark:text-sand-100">
                  {d.title}
                </h2>
                <p className="mt-1.5 line-clamp-2 text-sm leading-7 text-slate-600 dark:text-sand-300">
                  {snippet}
                </p>
                <p className="mt-2 text-[11px] font-bold text-brand-700 dark:text-gold-300">
                  المصدر: {d.source}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
