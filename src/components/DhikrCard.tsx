/* ============================================================================
   بطاقة الذكر
   ----------------------------------------------------------------------------
   الترتيب: رقم الذكر ← نص الذكر ← عدد التكرار ← المصدر ← رقم الحديث ←
             درجة الحديث ← المسبحة (أو زر «تم القراءة») ← أزرار خدمية
   ========================================================================== */

import { useEffect, useRef, useState } from "react";
import type { Dhikr } from "../data/types";
import { useProgress } from "../state/progress";
import Tasbih from "./Tasbih";
import { IconCheck, IconCopy, IconHeart, IconShare } from "./icons";

interface Props {
  dhikr: Dhikr;
  /** الانتقال للذكر التالي عند الاكتمال */
  onNext?: () => void;
  /** تمرير البطاقة إلى آخر ذكر تفاعل معه المستخدم */
  active?: boolean;
  /** إشعار الصفحة الأمّ بالإكتمال (يُبقي البطاقة ظاهرة للتعقيب في تصفية «المتبقّي») */
  onCompleted?: () => void;
}

export default function DhikrCard({ dhikr, onNext, active, onCompleted }: Props) {
  const {
    counterOf,
    increment,
    decrement,
    resetCounter,
    isCompleted,
    markCompleted,
    unmarkCompleted,
    isFavorite,
    toggleFavorite,
  } = useProgress();

  const [justDone, setJustDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const ref = useRef<HTMLElement | null>(null);

  const count = counterOf(dhikr.id);
  const done = isCompleted(dhikr.id);
  const fav = isFavorite(dhikr.id);
  const single = dhikr.count === 1;

  // عند تفعيل «البطاقة النشطة» نمرّرها للنظر
  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [active]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleComplete = () => {
    setJustDone(true);
    showToast("أحسنت، أتممت الذكر.");
    if (navigator.vibrate) navigator.vibrate([18, 60, 18]);
    onCompleted?.();
  };

  /** نص المشاركة: النص + المصدر + عدد التكرار فقط (لا شيء غير موثّق) */
  const shareText = () => {
    const lines = [
      dhikr.text,
      "",
      `عدد التكرار: ${dhikr.count === 1 ? "مرة واحدة" : `${dhikr.count} مرات`}`,
      `المصدر: ${dhikr.source}`,
      dhikr.authenticity ? `الحكم: ${dhikr.authenticity}` : "",
      "",
      "ذِكري — وردك اليومي",
    ].filter(Boolean);
    return lines.join("\n");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText());
      showToast("تم نسخ الذكر ومصدره");
    } catch {
      showToast("تعذّر النسخ في هذا المتصفّح");
    }
  };

  const share = async () => {
    const text = shareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: dhikr.title, text });
        return;
      } catch {
        /* ألغى المستخدم المشاركة */
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast("نُسخ الذكر — يمكنك مشاركته");
    } catch {
      showToast("تعذّرت المشاركة في هذا المتصفّح");
    }
  };

  const pad = String(dhikr.order).padStart(2, "0");

  return (
    <article
      ref={ref}
      id={`dhikr-${dhikr.id}`}
      aria-labelledby={`title-${dhikr.id}`}
      className="card animate-card-in scroll-mt-28 p-5 sm:p-7"
    >
      {/* ترويسة: رقم الذكر + حالة الإنجاز */}
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold tabular-nums ${
              done
                ? "bg-brand-700 text-white"
                : "bg-sand-100 text-brand-800 dark:bg-night-800 dark:text-gold-300"
            }`}
            aria-hidden="true"
          >
            {pad}
          </span>
          <h2
            id={`title-${dhikr.id}`}
            className="dhikr-title-h font-extrabold text-slate-700 dark:text-sand-200"
          >
            {dhikr.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            toggleFavorite(dhikr.id);
            showToast(fav ? "أُزيلت من المفضلة" : "♥ تمت الإضافة للمفضلة");
          }}
          aria-pressed={fav}
          aria-label={fav ? "في المفضلة — اضغط للإزالة" : "أضف للمفضلة"}
          className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-colors ${
            fav
              ? "bg-gold-500/15 text-gold-700 dark:text-gold-300"
              : "text-slate-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-night-800"
          }`}
        >
          <IconHeart className="h-5 w-5" filled={fav} />
          <span className="hidden sm:inline">
            {fav ? "في المفضلة" : "أضف للمفضلة"}
          </span>
        </button>
      </header>

      {/* نص الذكر */}
      <div className="rounded-2xl bg-sand-50 px-4 py-6 dark:bg-night-850 sm:px-6">
        <p className="dhikr-text text-slate-800 dark:text-sand-100">
          {dhikr.text}
        </p>
      </div>

      {/* البيانات الشرعية */}
      <dl className="mt-5 grid gap-2.5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <dt className="rounded-lg bg-brand-50 px-2 py-1 font-bold text-brand-800 dark:bg-night-800 dark:text-brand-300">
            التكرار
          </dt>
          <dd className="font-bold text-slate-700 dark:text-sand-200">
            {single ? "مرة واحدة" : `${dhikr.count} مرات`}
          </dd>
        </div>

        <div className="flex flex-wrap items-start gap-2">
          <dt className="rounded-lg bg-brand-50 px-2 py-1 font-bold text-brand-800 dark:bg-night-800 dark:text-brand-300">
            المصدر
          </dt>
          <dd className="font-bold text-slate-700 dark:text-sand-200">
            {dhikr.source}
          </dd>
        </div>

        {dhikr.references
          .filter((r) => r.hadithNumbers.length > 0)
          .map((r, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <dt className="rounded-lg bg-sand-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-night-800 dark:text-sand-300">
                {/* المرجع القرآني آية، لا حديث — لا يُخلط بينهما */}
                {r.book.startsWith("سورة ")
                  ? `رقم الآية — ${r.book}`
                  : `رقم الحديث — ${r.book}`}
              </dt>
              <dd className="font-bold tabular-nums text-slate-700 dark:text-sand-200">
                {r.hadithNumbers.join("، ")}
              </dd>
            </div>
          ))}

        {dhikr.authenticity && (
          <div className="flex flex-wrap items-center gap-2">
            <dt className="sr-only">درجة الحديث</dt>
            <dd>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-800 dark:border-brand-800 dark:bg-night-800 dark:text-brand-300">
                <IconCheck className="h-3.5 w-3.5" />
                {dhikr.authenticity}
              </span>
            </dd>
          </div>
        )}
      </dl>

      {/* الفضل والملاحظة */}
      {dhikr.benefit && (
        <p className="mt-4 rounded-2xl border-r-4 border-gold-400 bg-gold-500/8 p-3.5 text-sm leading-7 text-slate-700 dark:bg-night-850 dark:text-sand-200">
          <span className="font-extrabold text-gold-700 dark:text-gold-300">
            الفضل:{" "}
          </span>
          {dhikr.benefit}
        </p>
      )}

      {dhikr.note && (
        <details className="mt-3 rounded-2xl bg-sand-100 p-3.5 text-sm leading-7 text-slate-600 dark:bg-night-850 dark:text-sand-300">
          <summary className="cursor-pointer font-extrabold text-brand-700 dark:text-gold-300">
            ملاحظة توثيق
          </summary>
          <p className="mt-2">{dhikr.note}</p>
        </details>
      )}

      {/* المسبحة أو زر «تم القراءة» */}
      {single ? (
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (done) {
                unmarkCompleted(dhikr.id);
                setJustDone(false);
              } else {
                markCompleted(dhikr.id);
                handleComplete();
              }
            }}
            aria-pressed={done}
            className={`flex h-16 w-full max-w-xs items-center justify-center gap-2 rounded-full text-base font-extrabold transition-colors ${
              done
                ? "bg-gold-500 text-night-950"
                : "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900"
            }`}
          >
            <IconCheck className="h-6 w-6" />
            {done ? "تمّت القراءة" : "تم القراءة"}
          </button>
          {done && (
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold text-brand-700 dark:text-gold-300">
                تم إكمال الذكر
              </p>
              {onNext && (
                <button type="button" className="btn-primary" onClick={onNext}>
                  التالي ←
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <Tasbih
          dhikrId={dhikr.id}
          current={count}
          target={dhikr.count}
          onIncrement={() => increment(dhikr.id, dhikr.count)}
          onDecrement={() => decrement(dhikr.id)}
          onReset={() => resetCounter(dhikr.id)}
          onComplete={handleComplete}
          onNext={onNext}
        />
      )}

      {/* أزرار خدمية */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-sand-200 pt-4 dark:border-night-800">
        <button type="button" className="btn-ghost !py-2 text-xs" onClick={copy}>
          <IconCopy className="h-4 w-4" />
          نسخ الذكر
        </button>
        <button type="button" className="btn-ghost !py-2 text-xs" onClick={share}>
          <IconShare className="h-4 w-4" />
          مشاركة
        </button>
      </div>

      {/* إشعار مؤقت داخل البطاقة (aria-live) */}
      <div aria-live="polite" className="sr-only">
        {toast}
      </div>
      {toast && (
        <p className="mt-3 text-center text-xs font-bold text-brand-700 dark:text-gold-300">
          {toast}
        </p>
      )}

      {justDone && !single && done && (
        <p className="mt-1 text-center text-xs font-bold text-brand-700 dark:text-gold-300">
          تم إكمال الذكر ✓
        </p>
      )}
    </article>
  );
}
