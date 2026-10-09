/* ============================================================================
   صفحة الإعدادات
   المظهر / حجم الخط / الخط / الصوت / التذكيرات / إعادة التقدّم / حول
   ========================================================================== */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSettings, FONT_SCALE_LABELS } from "../state/settings";
import { useProgress } from "../state/progress";
import type { Settings } from "../data/types";
import { IconBook, IconReset } from "../components/icons";

type Perm = "default" | "granted" | "denied" | "unsupported";

export default function SettingsPage() {
  const { settings, update, fontDown, fontUp, resetFont, fontLevel } = useSettings();
  const { resetAll, resetSectionProgress, completedCount, favoritesCount } =
    useProgress();

  const [perm, setPerm] = useState<Perm>("default");
  const [confirmReset, setConfirmReset] = useState(false);
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);

  useEffect(() => {
    setPerm(
      typeof Notification === "undefined" ? "unsupported" : Notification.permission
    );
  }, []);

  const toggleReminder = async (kind: "morning" | "evening", enabled: boolean) => {
    if (enabled) {
      if (typeof Notification === "undefined") {
        setReminderMsg(
          "هذا المتصفّح لا يدعم الإشعارات، لذا لن تعمل التذكيرات."
        );
        return;
      }
      const p = await Notification.requestPermission();
      setPerm(p);
      if (p !== "granted") {
        setReminderMsg(
          "لم يُسمح بالإشعارات. يمكنك السماح من إعدادات المتصفّح ثم إعادة التفعيل."
        );
        return;
      }
      setReminderMsg(
        "التذكير يعمل ما دام تبويب الموقع مفتوحًا — لا نعد بإشعار في الخلفية أو عند إغلاق المتصفّح."
      );
      // الجدولة نفسها في طبقة التطبيق (settings provider) فلا تضيع عند مغادرة الصفحة
    } else {
      setReminderMsg(null);
    }
    update({
      reminders: { ...settings.reminders, [kind]: { ...settings.reminders[kind], enabled } },
    });
  };

  const setReminderTime = (kind: "morning" | "evening", time: string) => {
    update({
      reminders: { ...settings.reminders, [kind]: { ...settings.reminders[kind], time } },
    });
    if (settings.reminders[kind].enabled) {
      update({
        reminders: { ...settings.reminders, [kind]: { time, enabled: false } },
      });
      setReminderMsg("غيّر الوقت — أعد التفعيل لتطبيقه.");
    }
  };

  const doResetAll = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetAll();
    setConfirmReset(false);
  };

  const themeOptions: { val: Settings["theme"]; label: string }[] = [
    { val: "light", label: "☀️ فاتح" },
    { val: "dark", label: "🌙 داكن" },
    { val: "auto", label: "تلقائي" },
  ];

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-sand-100">
          الإعدادات
        </h1>
        <p className="mt-1 text-sm font-bold text-slate-600 dark:text-sand-300">
          تُحفظ اختياراتك على هذا الجهاز
        </p>
      </header>

      {/* المظهر */}
      <section className="card mb-4 p-5">
        <h2 className="mb-3 text-base font-extrabold text-slate-800 dark:text-sand-100">
          المظهر
        </h2>
        <div className="seg" role="group" aria-label="اختيار المظهر">
          {themeOptions.map((t) => (
            <button
              key={t.val}
              type="button"
              aria-pressed={settings.theme === t.val}
              onClick={() => update({ theme: t.val })}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs font-bold text-slate-600 dark:text-sand-300">
          «تلقائي» يتبع مظهر نظام جهازك.
        </p>
      </section>

      {/* حجم الخط */}
      <section className="card mb-4 p-5">
        <h2 className="mb-3 text-base font-extrabold text-slate-800 dark:text-sand-100">
          حجم خط الأذكار
        </h2>

        <div className="mb-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={fontDown}
            aria-label="تصغير الخط (A−)"
            className="h-12 w-14 rounded-2xl border border-sand-300 bg-white text-lg font-extrabold text-slate-700 hover:bg-sand-100 dark:border-night-800 dark:bg-night-850 dark:text-sand-200"
          >
            A−
          </button>
          <button
            type="button"
            onClick={resetFont}
            aria-label="الحجم الافتراضي (A)"
            className="h-12 w-14 rounded-2xl border border-sand-300 bg-white text-lg font-extrabold text-slate-700 hover:bg-sand-100 dark:border-night-800 dark:bg-night-850 dark:text-sand-200"
          >
            A
          </button>
          <button
            type="button"
            onClick={fontUp}
            aria-label="تكبير الخط (A+)"
            className="h-12 w-14 rounded-2xl border border-sand-300 bg-white text-lg font-extrabold text-slate-700 hover:bg-sand-100 dark:border-night-800 dark:bg-night-850 dark:text-sand-200"
          >
            A+
          </button>
        </div>

        <div className="seg" role="group" aria-label="مستوى حجم الخط">
          {FONT_SCALE_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-pressed={fontLevel === i}
              onClick={() => {
                const diff = i - fontLevel;
                for (let k = 0; k < Math.abs(diff); k++)
                  diff > 0 ? fontUp() : fontDown();
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="preview-line mt-4 rounded-2xl bg-sand-50 p-4 text-center dark:bg-night-850">
          <span className="dhikr-text text-slate-800 dark:text-sand-100">
            سُبْحَانَ اللَّهِ وَبِحَمْدِهِ
          </span>
        </p>
        <p className="mt-2 text-center text-xs font-bold text-slate-600 dark:text-sand-300">
          يُطبَّق الحجم على نصوص الأذكار فقط، فلا يتغيّر تصميم الواجهة.
        </p>
      </section>

      {/* الخط */}
      <section className="card mb-4 p-5">
        <h2 className="mb-3 text-base font-extrabold text-slate-800 dark:text-sand-100">
          الخط
        </h2>
        <div className="seg" role="group" aria-label="اختيار الخط">
          <button
            type="button"
            aria-pressed={settings.fontFamily === "kufi"}
            onClick={() => update({ fontFamily: "kufi" })}
          >
            المثمّن (كوفي)
          </button>
          <button
            type="button"
            aria-pressed={settings.fontFamily === "naskh"}
            onClick={() => update({ fontFamily: "naskh" })}
          >
            نسخ (أميري)
          </button>
        </div>
        <p className="mt-2 text-xs font-bold leading-6 text-slate-600 dark:text-sand-300">
          الخط الافتراضي «المثمّن» بحروف هندسية مربّعة الزوايا، وخط النسخ
          (أميري) أنسب للنصوص الطويلة. كلاهما يدعم التشكيل.
        </p>
      </section>

      {/* الصوت */}
      <section className="card mb-4 p-5">
        <h2 className="mb-3 text-base font-extrabold text-slate-800 dark:text-sand-100">
          الصوت
        </h2>
        <label className="switch flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(e) => update({ sound: e.target.checked })}
            className="h-5 w-5 accent-brand-700"
          />
          <span className="text-sm font-bold text-slate-700 dark:text-sand-200">
            نقرة صوتية خفيفة عند ضغط المسبحة
          </span>
        </label>
        <p className="mt-2 text-xs font-bold leading-6 text-slate-600 dark:text-sand-300">
          لا يحتوي الموقع على تسجيلات أذكار صوتية؛ لم نُضِف تسجيلًا إلا من مصدر
          موثوق ومُتحقَّق منه. ولا يُشغَّل أيّ صوت تلقائيًّا عند فتح الصفحة.
        </p>
      </section>

      {/* التذكيرات */}
      <section className="card mb-4 p-5">
        <h2 className="mb-1 text-base font-extrabold text-slate-800 dark:text-sand-100">
          التذكيرات
        </h2>
        <p className="mb-3 text-xs font-bold leading-6 text-slate-600 dark:text-sand-300">
          اختياري: حدد وقتًا للتذكير بأذكار الصباح والمساء. تُرسل الإشعارات
          <b> ما دام تبويب الموقع مفتوحًا فقط</b> — لا نَعِد بإشعار أثناء إغلاق
          المتصفّح لأن تقنية المتصفّح لا تضمن ذلك.
        </p>

        {(["morning", "evening"] as const).map((kind) => (
          <div
            key={kind}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-sand-200 py-3 first:border-t-0 dark:border-night-800"
          >
            <span className="text-sm font-extrabold text-slate-700 dark:text-sand-200">
              {kind === "morning" ? "☀️ أذكار الصباح" : "🌙 أذكار المساء"}
            </span>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={settings.reminders[kind].time}
                onChange={(e) => setReminderTime(kind, e.target.value)}
                aria-label={kind === "morning" ? "وقت تذكير الصباح" : "وقت تذكير المساء"}
                className="rounded-xl border border-sand-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 dark:border-night-800 dark:bg-night-850 dark:text-sand-200"
              />
              <button
                type="button"
                role="switch"
                aria-checked={settings.reminders[kind].enabled}
                onClick={() =>
                  toggleReminder(kind, !settings.reminders[kind].enabled)
                }
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  settings.reminders[kind].enabled
                    ? "bg-brand-700"
                    : "bg-slate-300 dark:bg-night-800"
                }`}
                aria-label={
                  kind === "morning" ? "تشغيل تذكير الصباح" : "تشغيل تذكير المساء"
                }
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                    settings.reminders[kind].enabled ? "right-6" : "right-1"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}

        {reminderMsg && (
          <p className="mt-2 rounded-xl bg-sand-100 p-3 text-xs font-bold leading-6 text-slate-600 dark:bg-night-850 dark:text-sand-300">
            {reminderMsg}
            {perm === "denied" &&
              " (السماح مرفوض حاليًّا من إعدادات المتصفّح)"}
          </p>
        )}
      </section>

      {/* التقدّم */}
      <section className="card mb-4 p-5">
        <h2 className="mb-3 text-base font-extrabold text-slate-800 dark:text-sand-100">
          إعادة التقدّم
        </h2>

        <p className="mb-3 text-xs font-bold leading-6 text-slate-600 dark:text-sand-300">
          يُصفَّر ورد الصباح والمساء يوميًّا تلقائيًّا؛ ومن هنا يمكنك تصفير كل ما
          سجّلتُه (يشمل المفضّلة أيضًا).
        </p>

        <div className="mb-3 grid grid-cols-2 gap-2 text-center text-xs font-bold text-slate-600 dark:text-sand-300">
          <div className="rounded-xl bg-sand-100 p-3 dark:bg-night-850">
            الصباح: {completedCount("morning")}
          </div>
          <div className="rounded-xl bg-sand-100 p-3 dark:bg-night-850">
            المساء: {completedCount("evening")}
          </div>
          <div className="rounded-xl bg-sand-100 p-3 dark:bg-night-850">
            المفضّلة: {favoritesCount}
          </div>
          <div className="rounded-xl bg-sand-100 p-3 dark:bg-night-850">
            يُصفَّر الورد يوميًّا
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => resetSectionProgress("morning")}
          >
            <IconReset className="h-4 w-4" />
            إعادة أذكار الصباح
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => resetSectionProgress("evening")}
          >
            <IconReset className="h-4 w-4" />
            إعادة أذكار المساء
          </button>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={settings.keepCounters}
            onChange={(e) => update({ keepCounters: e.target.checked })}
            className="h-5 w-5 accent-brand-700"
          />
          <span className="text-sm font-bold text-slate-700 dark:text-sand-200">
            الاحتفاظ بعدّ المسبحة بين الأيام
          </span>
        </label>

        <button
          type="button"
          onClick={doResetAll}
          className={`btn mt-4 w-full ${
            confirmReset
              ? "bg-red-700 text-white hover:bg-red-800"
              : "border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          }`}
        >
          <IconReset className="h-4 w-4" />
          {confirmReset
            ? "اضغط مرة أخرى للتأكيد — سيُمسح التقدّم والمفضّلة"
            : "مسح كل التقدّم"}
        </button>
        {confirmReset && (
          <button
            type="button"
            className="btn-ghost mt-2 w-full"
            onClick={() => setConfirmReset(false)}
          >
            إلغاء
          </button>
        )}
      </section>

      {/* حول */}
      <section className="card p-5">
        <h2 className="mb-3 text-base font-extrabold text-slate-800 dark:text-sand-100">
          حول الموقع
        </h2>
        <p className="text-sm leading-7 text-slate-600 dark:text-sand-300">
          «ذِكري» تطبيق هادئ لأذكار الصباح والمساء، يعرض النصوص بمصادرها
          وأحكامها، مع مسبحة لكل ذكر متكرّر، وحفظ للتقدّم على جهازك دون تسجيل أو
          إنترنت.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/sources" className="btn-primary">
            <IconBook className="h-4 w-4" />
            المصادر والتوثيق
          </Link>
          <Link to="/search" className="btn-ghost">
            البحث في الأذكار
          </Link>
        </div>
      </section>
    </div>
  );
}
