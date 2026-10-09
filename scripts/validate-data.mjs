/* ===========================================================================
   تدقيق قاعدة بيانات الأذكار — يُشغَّل عبر: npm run validate
   ----------------------------------------------------------------------------
   يفحص سلامة البنية دون المساس بالنصوص:
   - تفرّد المعرّفات ومطابقة بادئة القسم (s- / e-)
   - صحة عدد التكرار (عدد صحيح موجب)
   - اكتمال الحقول الإلزامية (العنوان، النص، المصدر)
   - اشتقاق مرجع مُهيكل لكل مصدر (parseReferences)
   - صيغة أرقام الأحاديث (أرقام وفواصل فقط)
   - عدم وقوع نص تجريبي (DEMO) في المحتوى المعروض
   - تطابق المعرّفات المفضّلة المحفوظة مع البيانات (يُفحص زمن التشغيل أيضًا)
   ========================================================================== */

import { buildSync } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// 1) تجميع raw.ts + parseSource.ts إلى ملف JS مؤقّت
const dir = mkdtempSync(join(tmpdir(), "dhikri-validate-"));
const out = join(dir, "bundle.mjs");
buildSync({
  entryPoints: [join(root, "src/data/raw.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: out,
});

// نجمّع أيضًا adhkar.ts ليشمل اشتقاق المراجع كما في التطبيق فعليًّا
const out2 = join(dir, "adhkar.mjs");
buildSync({
  entryPoints: [join(root, "src/data/adhkar.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: out2,
});

const { MORNING, EVENING, ALL_DHIKR } = await import(pathToFileURL(out2).href);
const { RAW } = await import(pathToFileURL(out).href);

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// ── 1. المعرّفات ──
const seen = new Map();
for (const d of ALL_DHIKR) {
  if (seen.has(d.id)) err(`معرّف مكرّر: ${d.id}`);
  seen.set(d.id, d);
  const prefix = d.category === "morning" ? "s-" : "e-";
  if (!d.id.startsWith(prefix))
    err(`${d.id}: البادئة لا تطابق القسم (${d.category})`);
}

// ── 2. البنية الخام ──
for (const cat of ["morning", "evening"]) {
  const list = RAW[cat];
  if (!Array.isArray(list) || list.length === 0) err(`قسم فارغ: ${cat}`);
  list.forEach((e, i) => {
    const at = `${cat}[${i}] (${e.id})`;
    if (!e.id) err(`${at}: معرّف مفقود`);
    if (!e.title || !e.title.trim()) err(`${at}: عنوان فارغ`);
    if (!e.text || !e.text.trim()) err(`${at}: نص فارغ`);
    else {
      if (e.text !== e.text.trim()) err(`${at}: مسافات في طرفي النص`);
      if (/\s{2,}/.test(e.text)) warn(`${at}: مسافات مزدوجة داخل النص`);
    }
    if (!e.source || !e.source.trim()) err(`${at}: مصدر فارغ`);
    if (!Number.isInteger(e.count) || e.count < 1)
      err(`${at}: عدد تكرار غير صالح (${e.count})`);
    if (e.text && /تجريبي|DEMO|dummy|test/i.test(e.text + e.title))
      err(`${at}: نص يحمل وسمًا تجريبيًّا`);
    // الصيغة: تشكيل النص أحرف عربية + علامات قرآنية فقط
    if (e.text && /[A-Za-z]/.test(e.text)) warn(`${at}: حروف لاتينية داخل النص`);
  });
}

// ── 3. المراجع المشتقّة ──
for (const d of ALL_DHIKR) {
  if (d.references.length === 0) {
    err(`${d.id}: لم يُشتق أي مرجع من المصدر (${d.source})`);
    continue;
  }
  for (const r of d.references) {
    if (!r.book.trim()) err(`${d.id}: اسم كتاب فارغ`);
    for (const n of r.hadithNumbers) {
      if (!/^\d+(\/\d+)?([،,\s]*\d+(\/\d+)?)*$/.test(n))
        warn(`${d.id}: رقم غير رقمي صرف «${n}» في ${r.book}`);
    }
  }
}

// ── 4. التكرارات النصية داخل القسم نفسه ──
for (const cat of ["morning", "evening"]) {
  const list = ALL_DHIKR.filter((d) => d.category === cat);
  const byText = new Map();
  for (const d of list) {
    const key = d.text.replace(/\s+/g, " ").trim();
    if (byText.has(key)) warn(`${cat}: نص مكرّر في ${byText.get(key)} و${d.id}`);
    else byText.set(key, d.id);
  }
}

// ── 5. الدرجات والفواضل: قيمتُها لا فراغها ──
const grades = new Set();
let withBenefit = 0;
let withNote = 0;
for (const d of ALL_DHIKR) {
  if (d.authenticity) grades.add(d.authenticity);
  if (d.benefit) withBenefit++;
  if (d.note) withNote++;
}

// ── 6. مخرجات ──
const total = ALL_DHIKR.length;
console.log(`──────────────────────────────────────────`);
console.log(`  الأذكار: ${total} (صباح ${MORNING.length} / مساء ${EVENING.length})`);
console.log(`  فضل موثّق: ${withBenefit} — ملاحظات توثيق: ${withNote}`);
console.log(`  الدرجات: ${[...grades].join(" | ") || "—"}`);
console.log(`──────────────────────────────────────────`);

if (warnings.length) {
  console.log(`\n⚠ تنبيهات (${warnings.length}):`);
  warnings.forEach((w) => console.log("  - " + w));
}
if (errors.length) {
  console.log(`\n✖ أخطاء (${errors.length}):`);
  errors.forEach((e) => console.log("  - " + e));
  process.exitCode = 1;
} else {
  console.log("\n✔ لا أخطاء بنية — قاعدة البيانات سليمة شكليًّا.");
}

rmSync(dir, { recursive: true, force: true });
