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

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() =>
    load<Settings>("settings", defaultSettings())
  );

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
