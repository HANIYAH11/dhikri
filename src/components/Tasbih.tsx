/* ============================================================================
   المسبحة الإلكترونية — زر دائري كبير مع حلقة تقدّم
   ----------------------------------------------------------------------------
   - الضغط يزيد العدّاد حتى العدد المطلوب ثم يكتمل.
   - أزرار: طرح (تصحيح الخطأ)، إعادة العد.
   - الوصول إلى الاكتمال: علامة ✓ + رسالة تشجيع + زر «التالي».
   ========================================================================== */

import { useEffect, useRef } from "react";
import { IconCheck, IconReset } from "./icons";
import { useSettings } from "../state/settings";
import { playDone, playTick } from "../lib/sound";

interface Props {
  current: number;
  target: number;
  onComplete?: () => void;
  onNext?: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  dhikrId: string;
}

const RADIUS = 76;
const CIRC = 2 * Math.PI * RADIUS;

export default function Tasbih({
  current,
  target,
  onComplete,
  onNext,
  onIncrement,
  onDecrement,
  onReset,
  dhikrId,
}: Props) {
  const done = current >= target;
  const prev = useRef(current);
  const { settings } = useSettings();

  const tap = () => {
    if (settings.sound) playTick();
  };

  useEffect(() => {
    if (current >= target && prev.current < target) {
      onComplete?.();
      if (settings.sound) playDone();
      if (navigator.vibrate) navigator.vibrate([18, 60, 18]);
    }
    prev.current = current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const progress = target > 0 ? Math.min(current / target, 1) : 0;

  return (
    <div className="mt-6 flex flex-col items-center" data-tasbih={dhikrId}>
      {/* التقدم النصّي */}
      <div className="mb-3 flex items-center gap-3" aria-live="polite">
        <span className="text-sm font-bold text-slate-600 dark:text-sand-300">
          التقدّم
        </span>
        <span
          className={`rounded-full px-3 py-1 text-sm font-extrabold tabular-nums ${
            done
              ? "bg-brand-700 text-white"
              : "bg-sand-100 text-brand-800 dark:bg-night-800 dark:text-gold-300"
          }`}
        >
          {current} / {target}
        </span>
      </div>

      <div className="relative">
        <svg
          width="176"
          height="176"
          viewBox="0 0 176 176"
          className="block"
          aria-hidden="true"
        >
          <circle
            cx="88"
            cy="88"
            r={RADIUS}
            fill="none"
            strokeWidth="9"
            className="stroke-sand-200 dark:stroke-night-800"
          />
          <circle
            cx="88"
            cy="88"
            r={RADIUS}
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            transform="rotate(-90 88 88)"
            className={`tasbih-ring ${
              done ? "stroke-gold-400" : "stroke-brand-600"
            }`}
          />
        </svg>

        <button
          type="button"
          onClick={() => {
            tap();
            onIncrement();
          }}
          disabled={done}
          aria-label={
            done
              ? "تمّ الذكر — اكتمل العدّ"
              : `اذكر الله — اضغط للعدّ (الرقم ${current + 1} من ${target})`
          }
          className={`tasbih-btn absolute inset-0 m-auto flex h-[152px] w-[152px] flex-col items-center justify-center rounded-full text-center ${
            done
              ? "cursor-default bg-gold-500 text-night-950 shadow-[0_10px_30px_-10px_rgba(201,162,39,0.7)]"
              : "bg-brand-700 text-white shadow-tap hover:bg-brand-800 active:bg-brand-900"
          }`}
        >
          {done ? (
            <span className="tasbih-done flex flex-col items-center gap-1">
              <IconCheck className="h-12 w-12" />
              <span className="text-sm font-extrabold">تمّ الذكر</span>
            </span>
          ) : (
            <>
              <span className="text-2xl font-extrabold">اذكر الله</span>
              <span className="mt-1 text-sm font-bold opacity-80 tabular-nums">
                اضغط للعدّ
              </span>
            </>
          )}
        </button>
      </div>

      {done ? (
        <div className="mt-4 flex flex-col items-center gap-3">
          <p
            className="text-center text-sm font-bold text-brand-700 dark:text-gold-300"
            role="status"
          >
            أحسنت، أتممت الذكر.
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" onClick={onReset}>
              <IconReset className="h-4 w-4" />
              إعادة العد
            </button>
            {onNext && (
              <button type="button" className="btn-primary" onClick={onNext}>
                التالي ←
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={onDecrement}
            disabled={current === 0}
            className="btn-ghost !px-3 !py-2 text-xs disabled:opacity-40"
            aria-label="− طرح — إنقاص العدّاد بواحد"
          >
            − طرح
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={current === 0}
            className="btn-ghost !px-3 !py-2 text-xs disabled:opacity-40"
          >
            <IconReset className="h-4 w-4" />
            إعادة العد
          </button>
        </div>
      )}
    </div>
  );
}
