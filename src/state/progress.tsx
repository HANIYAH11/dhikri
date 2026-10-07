/* ============================================================================
   سياق التقدّم: عدّ المسبحة + الأذكار المُنجَزة + المفضلة + آخر قسم
   ----------------------------------------------------------------------------
   كل شيء يُحفظ في localStorage، ويُصفَّر تقدّم الورد تلقائيًّا بتغيّر اليوم
   (ما لم يُفعَّل خيار الاحتفاظ بعدّ المسبحة بين الأيام).
   التنفيذ يعتمد على مرجع متزامن (stateRef) حتى لا يضيع العدّ عند الضغط
   المتتابع السريع قبل إعادة الرسم.
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
import {
  emptySection,
  type CategoryId,
  type ProgressState,
  type SectionProgress,
} from "../data/types";
import { getCategoryDhikr } from "../data/adhkar";
import { load, save, todayKey } from "../lib/storage";
import { useSettings } from "./settings";

const KEY = "progress";

function completedFromCounters(
  category: CategoryId,
  sec: SectionProgress
): string[] {
  return getCategoryDhikr(category)
    .filter((d) => (sec.counters[d.id] ?? 0) >= d.count)
    .map((d) => d.id);
}

function initialProgress(keepCounters: boolean): ProgressState {
  const base: ProgressState = {
    date: todayKey(),
    morning: emptySection(),
    evening: emptySection(),
    favorites: [],
    lastSection: null,
  };
  const saved = load<ProgressState>(KEY, base);
  if (!saved || typeof saved !== "object" || !saved.date) return base;

  const sameDay = saved.date === todayKey();
  const next: ProgressState = {
    date: todayKey(),
    morning: { ...emptySection(), ...(saved.morning ?? {}) },
    evening: { ...emptySection(), ...(saved.evening ?? {}) },
    favorites: Array.isArray(saved.favorites) ? saved.favorites : [],
    lastSection: saved.lastSection ?? null,
  };
  if (!sameDay) {
    if (keepCounters) {
      next.morning.completed = completedFromCounters("morning", next.morning);
      next.evening.completed = completedFromCounters("evening", next.evening);
    } else {
      next.morning = emptySection();
      next.evening = emptySection();
    }
  }
  return next;
}

interface ProgressCtx {
  section: SectionProgress;
  completedCount: (category: CategoryId) => number;
  totalCount: (category: CategoryId) => number;
  /** نسبة الإنجاز اليومية لكلي القسمين (0-100) */
  overallPercent: number;
  /** معرّفات الأذكار المفضّلة */
  favorites: string[];
  favoritesCount: number;
  /** آخر قسم زاره المستخدم اليوم */
  lastSection: CategoryId | null;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  counterOf: (id: string) => number;
  /** يزيد العدّاد ولا يتجاوز المطلوب */
  increment: (id: string, max: number) => number;
  decrement: (id: string) => number;
  resetCounter: (id: string) => void;
  isCompleted: (id: string) => boolean;
  markCompleted: (id: string) => void;
  unmarkCompleted: (id: string) => void;
  setLastDhikr: (id: string | null) => void;
  visitSection: (category: CategoryId) => void;
  activeSection: CategoryId | null;
  resetSectionProgress: (category: CategoryId) => void;
  resetAll: () => void;
}

const Ctx = createContext<ProgressCtx | null>(null);

const sectionOf = (id: string): CategoryId =>
  id.startsWith("e-") ? "evening" : "morning";

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [state, setState] = useState<ProgressState>(() =>
    initialProgress(settings.keepCounters)
  );
  const [activeSection, setActiveSection] = useState<CategoryId | null>(null);

  // مرجع متزامن يعكس أحدث حالة فورًا (قبل إعادة الرسم)
  const ref = useRef(state);
  ref.current = state;

  const commit = useCallback((next: ProgressState) => {
    ref.current = next;
    setState(next);
    save(KEY, next);
  }, []);

  const patch = useCallback(
    (category: CategoryId, fn: (s: SectionProgress) => SectionProgress) => {
      const cur = ref.current;
      commit({ ...cur, [category]: fn(cur[category]) });
    },
    [commit]
  );

  // ── يوم جديد أثناء فتح التطبيق ──
  const lastDate = useRef(todayKey());
  useEffect(() => {
    const t = window.setInterval(() => {
      const today = todayKey();
      if (today === lastDate.current) return;
      lastDate.current = today;
      const cur = ref.current;
      if (settings.keepCounters) {
        commit({
          ...cur,
          date: today,
          morning: {
            ...cur.morning,
            completed: completedFromCounters("morning", cur.morning),
          },
          evening: {
            ...cur.evening,
            completed: completedFromCounters("evening", cur.evening),
          },
        });
      } else {
        commit({
          ...cur,
          date: today,
          morning: emptySection(),
          evening: emptySection(),
        });
      }
    }, 60_000);
    return () => window.clearInterval(t);
  }, [settings.keepCounters, commit]);

  const section: SectionProgress =
    (activeSection ? state[activeSection] : null) ?? state.morning;

  const totalCount = useCallback(
    (category: CategoryId) => getCategoryDhikr(category).length,
    []
  );

  const completedCount = useCallback(
    (category: CategoryId) => state[category].completed.length,
    [state]
  );

  const overallPercent = useMemo(() => {
    const total = totalCount("morning") + totalCount("evening");
    if (total === 0) return 0;
    const done = completedCount("morning") + completedCount("evening");
    return Math.round((done / total) * 100);
  }, [totalCount, completedCount, state]);

  const isFavorite = useCallback(
    (id: string) => state.favorites.includes(id),
    [state.favorites]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const cur = ref.current;
      commit({
        ...cur,
        favorites: cur.favorites.includes(id)
          ? cur.favorites.filter((f) => f !== id)
          : [...cur.favorites, id],
      });
    },
    [commit]
  );

  /** يقرأ العدّاد من القسمين (المعرّف فريد دائمًا) */
  const counterOf = useCallback((id: string) => {
    const cur = ref.current;
    const cat = sectionOf(id);
    return cur[cat].counters[id] ?? 0;
  }, []);

  const increment = useCallback(
    (id: string, max: number): number => {
      const cat = sectionOf(id);
      const cur = ref.current;
      const sec = cur[cat];
      const value = Math.min(sec.counters[id] ?? 0, max);
      if (value >= max) return value;
      const nextValue = value + 1;
      const completed =
        nextValue >= max && !sec.completed.includes(id)
          ? [...sec.completed, id]
          : sec.completed;
      commit({
        ...cur,
        [cat]: {
          ...sec,
          counters: { ...sec.counters, [id]: nextValue },
          completed,
          lastDhikrId: id,
        },
      });
      return nextValue;
    },
    [commit]
  );

  const decrement = useCallback(
    (id: string): number => {
      const cat = sectionOf(id);
      const cur = ref.current;
      const sec = cur[cat];
      const value = Math.max(0, (sec.counters[id] ?? 0) - 1);
      const needed =
        getCategoryDhikr(cat).find((d) => d.id === id)?.count ?? 1;
      const completed =
        value < needed ? sec.completed.filter((c) => c !== id) : sec.completed;
      commit({
        ...cur,
        [cat]: {
          ...sec,
          counters: { ...sec.counters, [id]: value },
          completed,
        },
      });
      return value;
    },
    [commit]
  );

  const resetCounter = useCallback(
    (id: string) => {
      const cat = sectionOf(id);
      patch(cat, (sec) => {
        const counters = { ...sec.counters };
        delete counters[id];
        return {
          ...sec,
          counters,
          completed: sec.completed.filter((c) => c !== id),
        };
      });
    },
    [patch]
  );

  const isCompleted = useCallback((id: string) => {
    const cat = sectionOf(id);
    return ref.current[cat].completed.includes(id);
  }, []);

  const markCompleted = useCallback(
    (id: string) => {
      const cat = sectionOf(id);
      patch(cat, (sec) =>
        sec.completed.includes(id)
          ? sec
          : { ...sec, completed: [...sec.completed, id], lastDhikrId: id }
      );
    },
    [patch]
  );

  const unmarkCompleted = useCallback(
    (id: string) => {
      const cat = sectionOf(id);
      patch(cat, (sec) => ({
        ...sec,
        completed: sec.completed.filter((c) => c !== id),
      }));
    },
    [patch]
  );

  const setLastDhikr = useCallback(
    (id: string | null) => {
      const cat = activeSection;
      if (!cat) return;
      patch(cat, (sec) => ({ ...sec, lastDhikrId: id }));
    },
    [activeSection, patch]
  );

  const visitSection = useCallback(
    (category: CategoryId) => {
      setActiveSection(category);
      const cur = ref.current;
      if (cur.lastSection !== category) {
        commit({ ...cur, lastSection: category });
      }
    },
    [commit]
  );

  const resetSectionProgress = useCallback(
    (category: CategoryId) => patch(category, () => emptySection()),
    [patch]
  );

  const resetAll = useCallback(() => {
    setActiveSection(null);
    commit({
      date: todayKey(),
      morning: emptySection(),
      evening: emptySection(),
      favorites: [],
      lastSection: null,
    });
  }, [commit]);

  const value = useMemo<ProgressCtx>(
    () => ({
      section,
      completedCount,
      totalCount,
      overallPercent,
      favorites: state.favorites,
      favoritesCount: state.favorites.length,
      lastSection: state.lastSection,
      isFavorite,
      toggleFavorite,
      counterOf,
      increment,
      decrement,
      resetCounter,
      isCompleted,
      markCompleted,
      unmarkCompleted,
      setLastDhikr,
      visitSection,
      activeSection,
      resetSectionProgress,
      resetAll,
    }),
    [
      section,
      completedCount,
      totalCount,
      overallPercent,
      state.favorites,
      state.favorites.length,
      state.lastSection,
      isFavorite,
      toggleFavorite,
      counterOf,
      increment,
      decrement,
      resetCounter,
      isCompleted,
      markCompleted,
      unmarkCompleted,
      setLastDhikr,
      visitSection,
      activeSection,
      resetSectionProgress,
      resetAll,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProgress خارج ProgressProvider");
  return ctx;
}
