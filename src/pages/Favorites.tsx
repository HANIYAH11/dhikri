/* ============================================================================
   صفحة المفضلة — تعرض الأذكار المحفوظة في بطاقاتها الكاملة
   ========================================================================== */

import { Link } from "react-router-dom";
import { useProgress } from "../state/progress";
import { getDhikrById } from "../data/adhkar";
import DhikrCard from "../components/DhikrCard";
import { IconHeart } from "../components/icons";

export default function Favorites() {
  const { favorites, favoritesCount } = useProgress();
  const items = favorites
    .map((id: string) => getDhikrById(id))
    .filter((d): d is NonNullable<ReturnType<typeof getDhikrById>> => Boolean(d));

  return (
    <div>
      <header className="mb-6 flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-600 dark:text-gold-300">
          <IconHeart className="h-7 w-7" filled={favoritesCount > 0} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-sand-100">
            أذكاري المفضّلة
          </h1>
          <p className="mt-1 text-sm font-bold text-slate-600 dark:text-sand-300">
            {favoritesCount > 0
              ? `حفظت ${favoritesCount} ذكرًا للرجوع السريع`
              : "اضغط ♡ على أيّ ذكر لحفظه هنا"}
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="card p-10 text-center">
          <IconHeart className="mx-auto h-10 w-10 text-slate-300 dark:text-sand-300/50" />
          <p className="mt-4 text-sm font-bold text-slate-600 dark:text-sand-300">
            لا توجد أذكار محفوظة بعد.
          </p>
          <Link to="/morning" className="btn-primary mt-5 inline-flex">
            تصفّح أذكار الصباح
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {items.map((d) => (
            <DhikrCard key={d.id} dhikr={d} />
          ))}
        </div>
      )}
    </div>
  );
}
