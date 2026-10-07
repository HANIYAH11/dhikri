import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// تطبيق مسبق للثيم قبل أول رسم (يمنع وميض الخلفية)
(() => {
  try {
    const raw = localStorage.getItem("dhikri:settings");
    const s = raw ? JSON.parse(raw) : null;
    const theme = s?.theme ?? "auto";
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme === "auto" ? prefersDark : theme === "dark";
    root.dataset.theme = isDark ? "dark" : "light";
    root.classList.toggle("dark", isDark);
    if (s?.fontScale != null) {
      const vars = ["0.88", "1", "1.15", "1.32"];
      root.style.setProperty("--dhikr-scale", vars[s.fontScale] ?? "1");
    }
    if (s?.fontFamily) {
      const f = s.fontFamily === "naskh" ? "Amiri" : "Noto Kufi Arabic";
      root.style.setProperty("--font-dhikr", f);
      root.style.setProperty("--font-body", f);
    }
  } catch {
    /* تجاهل */
  }
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// تسجيل عامل الخدمة (للعمل دون اتصال) في النسخة المنشورة فقط
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => undefined);
  });
}
