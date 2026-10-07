/* ============================================================================
   المسارات + مزوّدو الحالة
   ========================================================================== */

import { HashRouter, Route, Routes, useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SettingsProvider } from "./state/settings";
import { ProgressProvider } from "./state/progress";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import Favorites from "./pages/Favorites";
import Search from "./pages/Search";
import Sources from "./pages/Sources";
import SettingsPage from "./pages/Settings";

/** يمرّر إلى مُرساة #dhikr-... عند التنقّل بين الصفحات */
function ScrollHandler() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      // عنصر الوجهة قد يُرسم لاحقًا — نُجرّب فورًا وبعد إطار
      const go = () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      };
      go();
      const t = window.setTimeout(go, 300);
      return () => window.clearTimeout(t);
    }
    if (pathname !== "/") window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

function NotFound() {
  return (
    <div className="card p-10 text-center">
      <p className="text-4xl" aria-hidden="true">
        🌿
      </p>
      <h1 className="mt-3 text-xl font-extrabold text-slate-800 dark:text-sand-100">
        الصفحة غير موجودة
      </h1>
      <Link to="/" className="btn-primary mt-5 inline-flex">
        العودة للرئيسية
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ProgressProvider>
        <HashRouter>
          <ScrollHandler />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/morning" element={<CategoryPage category="morning" />} />
              <Route path="/evening" element={<CategoryPage category="evening" />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/search" element={<Search />} />
              <Route path="/sources" element={<Sources />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </HashRouter>
      </ProgressProvider>
    </SettingsProvider>
  );
}
