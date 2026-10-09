/* ============================================================================
   سياق الإعدادات: الثيم + حجم الخط + الخط + الصوت + التذكيرات
   يُحفظ في localStorage ويُطبَّق فورًا على <html>
   ========================================================================== */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { defaultSettings, type Settings } from "../data/types";
import { load, save } from "../lib/storage";

interface SettingsCtx {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  /** دوال جاهزة لأزرار A− / A / A+ */
  fontDown: () => void;
  fontUp: () => void;
  resetFont: () => void;
  fontLevel: number;
}

const Ctx = createContext<SettingsCtx | null>(null);

export const FONT_SCALE_VARS: Record<number, string> = {
  0: "0.88",
  1: "1",
  2: "1.15",
  3: "1.32",
};

export const FONT_SCALE_LABELS = ["صغير", "متوسط", "كبير", "كبير جدًا"];

function applyTheme(theme: Settings["theme"]) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "auto" ? prefersDark : theme === "dark";
  root.dataset.theme = isDark ? "dark" : "light";
  // Tailwind يستعمل صنف dark على <html> — يجب مزامنته مع data-theme
  root.classList.toggle("dark", isDark);
}

function applyFont(s: Settings) {
  const root = document.documentElement;
  root.style.setProperty("--dhikr-scale", FONT_SCALE_VARS[s.fontScale] ?? "1");
  root.style.setProperty(
    "--font-dhikr",
    s.fontFamily === "naskh" ? "Amiri" : "Noto Kufi Arabic"
  );
  root.style.setProperty(
    "--font-body",
    s.fontFamily === "naskh" ? "Amiri" : "Noto Kufi Arabic"
  );
}

/** قراءة آمنة: تدمج المحفوظ مع الافتراضي بعمق وترفض قيمًا فاسدة */
function loadSettings(): Settings {
  const defaults = defaultSettings();
  const raw = load<Partial<Settings>>("settings", defaults);

  const theme =
    raw.theme === "light" || raw.theme === "dark" || raw.theme === "auto"
      ? raw.theme
      : defaults.theme;
  const fontScale =
    raw.fontScale === 0 ||
    raw.fontScale === 1 ||
    raw.fontScale === 2 ||
    raw.fontScale === 3
      ? raw.fontScale
      : defaults.fontScale;
  const fontFamily =
    raw.fontFamily === "kufi" || raw.fontFamily === "naskh"
      ? raw.fontFamily
      : defaults.fontFamily;

  const savedRem = (raw.reminders ?? {}) as Partial<Settings["reminders"]>;
  const safeRem = (kind: "morning" | "evening") => {
    const d = defaults.reminders[kind];
    const s = savedRem[kind];
    if (!s || typeof s !== "object") return d;
    return {
      enabled: typeof s.enabled === "boolean" ? s.enabled : d.enabled,
      time: typeof s.time === "string" && /^\d{2}:\d{2}$/.test(s.time) ? s.time : d.time,
    };
  };

  return {
    ...defaults,
    ...raw,
    theme,
    fontScale,
    fontFamily,
    sound: typeof raw.sound === "boolean" ? raw.sound : defaults.sound,
    autoOpen: typeof raw.autoOpen === "boolean" ? raw.autoOpen : defaults.autoOpen,
    keepCounters:
      typeof raw.keepCounters === "boolean"
        ? raw.keepCounters
        : defaults.keepCounters,
    reminders: {
      morning: safeRem("morning"),
      evening: safeRem("evening"),
    },
  };
}

/**
 * جدولة تذكيرات المفعّلة — هنا (طبقة التطبيق) لا في صفحة الإعدادات،
 * كي لا تُلغى الجدولة بمجرد التنقّل لصفحة أخرى.
 * تعمل ما دام تبويب الموقع مفتوحًا (تقييد تقني مذكور في الواجهة صراحةً).
 */
function useReminderAlarms(settings: Settings) {
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    const clearAll = () => {
      Object.values(timers.current).forEach((t) => window.clearTimeout(t));
      timers.current = {};
    };
    clearAll();

    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return clearAll;
    }

    const arm = (kind: "morning" | "evening") => {
      const r = settings.reminders[kind];
      if (!r?.enabled) return;
      const [h, m] = r.time.split(":").map(Number);
      if (!Number.isFinite(h) || !Number.isFinite(m)) return;

      const now = new Date();
      const when = new Date();
      when.setHours(h, m, 0, 0);
      if (when.getTime() <= now.getTime()) when.setDate(when.getDate() + 1);

      const id = window.setTimeout(
        () => {
          try {
            if (Notification.permission === "granted") {
              new Notification(
                kind === "morning" ? "☀️ أذكار الصباح" : "🌙 أذكار المساء",
                {
                  body:
                    kind === "morning"
                      ? "ابدأ يومك بذكر الله."
                      : "اختم يومك بذكر الله.",
                  lang: "ar",
                  dir: "rtl",
                },
              );
            }
          } catch {
            /* بعض المتصفّحات ترفض الإشعار رغم الإذن — لا نُسقط التطبيق */
          }
          arm(kind); // يُجدول تذكير الغد ما دام التبويب مفتوحًا
        },
        Math.min(when.getTime() - now.getTime(), 2 ** 31 - 1),
      );
      timers.current[kind] = id;
    };

    arm("morning");
    arm("evening");
    return clearAll;
  }, [settings.reminders]);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  // تذكيرات مجدولة على مستوى التطبيق — لا تُلغى بتنقّل المستخدم بين الصفحات
  useReminderAlarms(settings);

  // تطبيق أولي
  useEffect(() => {
    applyTheme(settings.theme);
    applyFont(settings);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (settings.theme === "auto") applyTheme("auto");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [settings]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      save("settings", next);
      return next;
    });
  }, []);

  const fontDown = useCallback(
    () =>
      setSettings((p) => {
        const next = { ...p, fontScale: Math.max(0, p.fontScale - 1) as Settings["fontScale"] };
        save("settings", next);
        return next;
      }),
    []
  );

  const fontUp = useCallback(
    () =>
      setSettings((p) => {
        const next = { ...p, fontScale: Math.min(3, p.fontScale + 1) as Settings["fontScale"] };
        save("settings", next);
        return next;
      }),
    []
  );

  const resetFont = useCallback(
    () =>
      setSettings((p) => {
        const next = { ...p, fontScale: 1 as const };
        save("settings", next);
        return next;
      }),
    []
  );

  const value = useMemo(
    () => ({
      settings,
      update,
      fontDown,
      fontUp,
      resetFont,
      fontLevel: settings.fontScale,
    }),
    [settings, update, fontDown, fontUp, resetFont]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings(): SettingsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSettings خارج SettingsProvider");
  return ctx;
}
