/* ============================================================================
   أذكار — منطق التطبيق
   ----------------------------------------------------------------------------
   • التنقّل بين أذكار الصباح والمساء (تلقائي حسب الوقت أو يدوي)
   • مسبحة مستقلة لكل ذكر متعدّد: عدّ + تقدّم دائري + تصفير + اهتزاز
   • تكبير/تصغير الخط (٦ درجات) — الخط المثمّن افتراضيًا
   • تبديل الثيم: فاتح / داكن / تلقائي
   • تتبّع التقدّم يوميًا مع تصفير تلقائي عند تغيّر اليوم
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- البيانات ---------------- */
  var DATA = window.ADHKAR || { 'صباح': [], 'مساء': [] };
  var LIST = [];
  ['صباح', 'مساء'].forEach(function (cat) {
    (DATA[cat] || []).forEach(function (d) {
      d.count = Math.max(1, d.count | 0);
      d.category = cat;
      LIST.push(d);
    });
  });
  var byId = {};
  LIST.forEach(function (d) { byId[d.id] = d; });

  /* ---------------- التخزين ---------------- */
  var LS = {
    get: function (k, d) {
      try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); }
      catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* وضع التصفّح الخاص */ }
    }
  };

  var SIZES = [
    { fs: 15, pct: '٧٩٪' },
    { fs: 17, pct: '٨٩٪' },
    { fs: 19, pct: '١٠٠٪' },
    { fs: 21, pct: '١١١٪' },
    { fs: 23, pct: '١٢١٪' },
    { fs: 26, pct: '١٣٧٪' }
  ];

  var settings = Object.assign(
    { theme: 'auto', font: 'kufi', size: 2, keep: false, auto: true, printAll: true },
    LS.get('adhkar.settings', {})
  );
  if (!(settings.size >= 0 && settings.size < SIZES.length)) settings.size = 2;

  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  var TODAY = dayKey();
  var state = LS.get('adhkar.day.' + TODAY, null) || { counts: {}, done: {} };
  state.counts = state.counts || {};
  state.done = state.done || {};

  function saveState() {
    LS.set('adhkar.day.' + TODAY, state);
    if (settings.keep) LS.set('adhkar.last', state);
  }
  function saveSettings() { LS.set('adhkar.settings', settings); }

  /* ---------------- الحالة الحيّة ---------------- */
  var tab = 'صباح';
  var filter = 'all';           /* all | todo | done | repeat */
  var query = '';

  var root = document.documentElement;
  var main = document.getElementById('main');
  var timeProgress = document.getElementById('time-progress');

  /* ---------------- الثيم ---------------- */
  function sysDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function applyTheme() {
    var dark = settings.theme === 'dark' || (settings.theme === 'auto' && sysDark());
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.querySelector('.ico-dark').textContent = dark ? '☀' : '☾';
      btn.title = dark ? 'التبديل إلى المظهر الفاتح' : 'التبديل إلى المظهر الداكن';
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0c1512' : '#f7f4ec');
  }
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onMq = function () { if (settings.theme === 'auto') applyTheme(); };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else if (mq.addListener) mq.addListener(onMq);
  }

  /* ---------------- الخط ---------------- */
  function applyFont() {
    var s = SIZES[settings.size];
    root.style.setProperty('--fs', s.fs + 'px');
    root.style.setProperty('--fs-ui', Math.round(s.fs * 0.79) + 'px');
    root.setAttribute('data-font', settings.font);
    var lbl = document.getElementById('font-val');
    if (lbl) lbl.textContent = s.pct;
  }
  function changeSize(delta) {
    settings.size = Math.min(SIZES.length - 1, Math.max(0, settings.size + delta));
    saveSettings();
    applyFont();
    syncSettingsUI();
    toast(delta > 0 ? 'كبّرنا الخط' : 'صغّرنا الخط');
  }

  /* ---------------- مساعدات ---------------- */
  var AR_NUM = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  function arNum(n) {
    return String(n).replace(/[0-9]/g, function (d) { return AR_NUM[+d]; });
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function norm(s) {
    return String(s)
      .replace(/[\u064B-\u0652\u0640]/g, '')
      .replace(/[\u0622\u0623\u0625\u0671\u0672\u0673]/g, '\u0627')
      .replace(/\u0649/g, '\u064A')
      .replace(/\u0629/g, '\u0647')
      .replace(/\u0624/g, '\u0648')
      .replace(/\u0626/g, '\u064A');
  }

  function countOf(d) { return state.counts[d.id] | 0; }
  function isDone(d) {
    if (d.count > 1) return countOf(d) >= d.count;
    return !!state.done[d.id];
  }
  function catStats(cat) {
    var items = LIST.filter(function (d) { return d.category === cat; });
    var done = items.filter(isDone).length;
    return { done: done, total: items.length, pct: items.length ? Math.round(done / items.length * 100) : 0 };
  }

  /* ---------------- الوقت ---------------- */
  function autoTab() {
    var h = new Date().getHours();
    /* أذكار الصباح من بعد صلاة الفجر إلى ما قبل الزوال، والمساء من العصر إلى المساء والليل */
    if (h >= 4 && h < 15) return 'صباح';
    return 'مساء';
  }
  function greeting() {
    var h = new Date().getHours();
    if (h >= 4 && h < 12) return 'صباح الخير';
    if (h >= 12 && h < 17) return 'طاب يومك';
    if (h >= 17 && h < 20) return 'مساء الخير';
    return 'ليلة هادئة';
  }

  /* ---------------- البحث والتصفية ---------------- */
  function visibleItems() {
    var q = norm(query).trim();
    return LIST.filter(function (d) {
      if (d.category !== tab) return false;
      if (filter === 'todo' && isDone(d)) return false;
      if (filter === 'done' && !isDone(d)) return false;
      if (filter === 'repeat' && d.count < 2) return false;
      if (q) {
        var hay = norm(d.title + ' ' + d.text + ' ' + d.source + ' ' + d.virtue);
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  /* ---------------- بناء البطاقة ---------------- */
  var TASBIH_C = 238.76; /* محيط الدائرة (2π×38) في viewBox 0 0 88 88 */

  /* ترتيب الذكر داخل قسمه: ١..٢٨ للصباح و١..٣٠ للمساء (حتى مع التصفية) */
  var ORDS = null;
  function ordOf(d) {
    if (!ORDS) {
      ORDS = {};
      LIST.forEach(function (x) {
        ORDS[x.category] = (ORDS[x.category] || 0) + 1;
        ORDS[x.id] = ORDS[x.category];
      });
    }
    return ORDS[d.id] || 1;
  }

  /* خانات تكرار مرسومة للمطبوع (للتعقيب بالقلم) */
  function ticksHTML(d) {
    if (!(d.count > 1)) return '';
    var h = '<div class="print-only ticks"><span class="tk-label">مرّات التكرار</span>';
    for (var k = 0; k < d.count; k++) h += '<i class="tick"></i>';
    return h + '</div>';
  }

  function cardHTML(d) {
    var done = isDone(d);
    var n = countOf(d);
    var h = '';

    h += '<article class="card' + (done ? ' is-done' : '') + '" data-id="' + d.id + '" id="card-' + d.id + '">';

    /* الرأس */
    h += '<header class="card-head">';
    h += '<span class="card-num">' + arNum(ordOf(d)) + '</span>';
    h += '<h2 class="card-title">' + esc(d.title) + '</h2>';
    if (d.count > 1) h += '<span class="card-count">' + arNum(d.count) + '×</span>';
    h += '</header>';

    /* نص الذكر */
    h += '<div class="dhikr-text">' + esc(d.text) + '</div>';

    /* خانات التكرار (تظهر في الطباعة فقط) */
    h += ticksHTML(d);

    /* المصدر والحكم */
    h += '<div class="meta">';
    h += '<span class="tag src">📚 ' + esc(d.source) + '</span>';
    if (d.grade) h += '<span class="tag gr">⚖ ' + esc(d.grade) + '</span>';
    h += '</div>';

    /* الفضل */
    if (d.virtue) h += '<p class="virtue">' + esc(d.virtue) + '</p>';
    if (d.note) h += '<p class="note">ملاحظة: ' + esc(d.note) + '</p>';

    /* المسبحة للأذكار المتكرّرة */
    if (d.count > 1) {
      var pct = Math.min(1, n / d.count);
      var off = (TASBIH_C * (1 - pct)).toFixed(2);
      h += '<div class="tasbih">';
      h += '<button class="tasbih-btn" data-act="inc" data-id="' + d.id + '" aria-label="اضغط للعدّ: ' + esc(d.title) + '">';
      h += '<svg viewBox="0 0 88 88" aria-hidden="true">';
      h += '<circle class="tb-bg" cx="44" cy="44" r="38"></circle>';
      h += '<circle class="tb-fg" cx="44" cy="44" r="38" style="stroke-dashoffset:' + off + '"></circle>';
      h += '</svg>';
      h += '<span class="tasbih-num">' + arNum(n) + '</span>';
      h += '</button>';
      h += '<div class="tasbih-side">';
      h += '<div class="tasbih-of">العدد المطلوب: ' + arNum(d.count) + '</div>';
      h += '<div class="tasbih-hint">' + (done ? 'اكتمل الذكر، تقبّل الله منك 🤲' : 'اضغط الدائرة للعدّ، أو استخدم الأزرار.') + '</div>';
      h += '<div class="tasbih-ops">';
      h += '<button class="tops" data-act="dec" data-id="' + d.id + '">− طرح</button>';
      h += '<button class="tops" data-act="reset" data-id="' + d.id + '">↺ تصفير</button>';
      h += '<button class="tops" data-act="full" data-id="' + d.id + '">✓ إكمال</button>';
      h += '</div>';
      h += '</div></div>';
    } else {
      /* غير المتكرّر: زر تمّ فقط */
      h += '<div class="ack-row">';
      h += '<button class="ack' + (done ? ' on' : '') + '" data-act="ack" data-id="' + d.id + '">';
      h += '<span>' + (done ? '✓ تمّ الذكر' : '○ قرأتُه') + '</span></button>';
      h += '</div>';
    }

    /* الإجراءات */
    h += '<div class="card-acts">';
    h += '<button class="act copy" data-act="copy" data-id="' + d.id + '" title="نسخ الذكر ومصدره" aria-label="نسخ">⧉</button>';
    h += '<button class="act fav' + (LS.get('adhkar.favs', []).indexOf(d.id) > -1 ? ' on' : '') + '" data-act="fav" data-id="' + d.id + '" title="إضافة إلى المفضلة" aria-label="المفضلة">♥</button>';
    h += '</div>';

    h += '</article>';
    return h;
  }

  /* ---------------- العرض ---------------- */
  function heroHTML() {
    var st = catStats(tab);
    var C = 251.3; /* محيط حلقة التقدّم في viewBox 0 0 92 92 (2π×40) */
    var off = (C * (1 - st.pct / 100)).toFixed(2);
    var dateStr = new Date().toLocaleDateString('ar', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    var h = '<section class="hero">';
    h += '<div class="hero-top">';
    h += '<div class="hero-txt">';
    h += '<p class="hero-greet">' + esc(greeting()) + '</p>';
    h += '<p class="hero-sub">' + esc(dateStr) + ' — أذكار <b>' + esc(tab) + '</b> (' + arNum(st.total) + ' ذكرًا)</p>';
    h += '</div>';
    h += '<div class="ring-wrap" title="نسبة إتمامك">';
    h += '<svg viewBox="0 0 92 92" aria-hidden="true">';
    h += '<defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">';
    h += '<stop offset="0%" stop-color="var(--gold)"></stop><stop offset="100%" stop-color="var(--primary)"></stop>';
    h += '</linearGradient></defs>';
    h += '<circle class="ring-bg" cx="46" cy="46" r="40"></circle>';
    h += '<circle class="ring-fg" cx="46" cy="46" r="40" style="stroke-dashoffset:' + off + '"></circle>';
    h += '</svg>';
    h += '<div class="ring-num"><b>' + arNum(st.pct) + '٪</b><small>' + arNum(st.done) + '/' + arNum(st.total) + '</small></div>';
    h += '</div>';
    h += '</div>';

    h += '<div class="hero-badges">';
    var repeatCount = LIST.filter(function (d) { return d.category === tab && d.count > 1; }).length;
    h += '<span class="hbadge">⏱ ' + arNum(repeatCount) + ' ذكرًا متكرّرًا له مسبحة</span>';
    h += '<span class="hbadge gold">📖 ' + arNum(st.total) + ' موضعًا موثقًا المصدر</span>';
    if (st.pct === 100) h += '<span class="hbadge done">✓ أتممت أذكار ' + esc(tab) + ' — تقبّل الله</span>';
    h += '</div>';
    h += '</section>';
    return h;
  }

  function toolbarHTML() {
    var chips = [
      { k: 'all', t: 'الكل' },
      { k: 'todo', t: 'المتبقّي' },
      { k: 'done', t: 'المنجَز' },
      { k: 'repeat', t: 'ذو المسبحة' }
    ];
    var h = '<div class="toolbar">';
    h += '<div class="search' + (query ? ' has-val' : '') + '">';
    h += '<input type="search" id="q" placeholder="ابحث في الأذكار…" value="' + esc(query) + '" aria-label="بحث">';
    h += '<span class="s-ico" aria-hidden="true">⌕</span>';
    h += '<button class="s-clear" data-act="clear-q" aria-label="مسح البحث">✕</button>';
    h += '</div>';
    h += '<div class="chips">';
    chips.forEach(function (c) {
      h += '<button class="chip' + (filter === c.k ? ' on' : '') + '" data-act="filter" data-val="' + c.k + '">' + c.t + '</button>';
    });
    h += '</div></div>';
    return h;
  }

  /* ---------------- ترويسة وتذييل المطبوع ---------------- */
  function catName(cat) { return cat === 'مساء' ? 'المساء' : 'الصباح'; }

  function printHeadHTML() {
    var d = new Date();
    var dateStr = d.toLocaleDateString('ar', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    var hijri = '';
    try {
      hijri = ' — ' + d.toLocaleDateString('ar-SA-u-ca-islamic-umalqura', { year: 'numeric', month: 'long', day: 'numeric' }) + ' هـ';
    } catch (e) { hijri = ''; }

    var nS = LIST.filter(function (x) { return x.category === 'صباح'; }).length;
    var nE = LIST.filter(function (x) { return x.category === 'مساء'; }).length;
    var scope = settings.printAll
      ? 'الكتاب كاملًا: الصباح ' + arNum(nS) + ' + المساء ' + arNum(nE) + ' ذكرًا'
      : 'قسم أذكار ' + catName(tab) + ' — ' + arNum(catStats(tab).total) + ' ذكرًا';

    var h = '<div class="print-only print-head">';
    h += '<svg class="ph-orn" viewBox="0 0 100 100" aria-hidden="true">';
    h += '<g fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round">';
    h += '<rect x="24" y="24" width="52" height="52" rx="6"></rect>';
    h += '<rect x="24" y="24" width="52" height="52" rx="6" transform="rotate(45 50 50)"></rect>';
    h += '</g><circle cx="50" cy="50" r="10" fill="currentColor"></circle></svg>';
    h += '<div class="ph-title">أَذْكَار</div>';
    h += '<p class="ph-sub">أذكار الصباح والمساء — بمصادرها وأحكامها</p>';
    h += '<p class="ph-meta">' + esc(dateStr) + esc(hijri) + '</p>';
    h += '<p class="ph-scope">' + esc(scope) + '</p>';
    h += '</div>';
    return h;
  }

  function printFootHTML() {
    var h = '<div class="print-only print-foot">';
    h += '<svg class="pf-orn" viewBox="0 0 240 24" aria-hidden="true">';
    h += '<path d="M0 12h86M154 12h86M120 1l11 11-11 11-11-11z" fill="none" stroke="currentColor" stroke-width="1.4"></path>';
    h += '<circle cx="120" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.4"></circle></svg>';
    h += '<p class="pf-src">الأذكار منقولة عن <b>القرآن الكريم</b> و<b>صحيح البخاري</b> و<b>صحيح مسلم</b> و<b>سنن أبي داود</b> ' +
         'و<b>سنن الترمذي</b> و<b>سنن النسائي</b> و<b>مسند أحمد</b>، وهو ما اعتمده «<b>حصن المسلم</b>».</p>';
    h += '<p class="pf-note">تنبيه: عند الخلاف في العدد أو في التصحيح ذُكر ذلك في بطاقة الذكر. ' +
         'هذه الأذكار للاستذكار والقصد لا لاستنباط الأحكام، والرجوع لأهل العلم مفتاح الفهم.</p>';
    h += '<p class="pf-verse">﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾</p>';
    h += '</div>';
    return h;
  }

  function sectionBody(cat, items, withBar) {
    var st = catStats(cat);
    var h = '<div class="sec-title">أذكار ' + catName(cat) + '</div>';

    if (!items.length) {
      h += '<div class="empty"><div class="em-ico">☾</div><p>لا توجد أذكار مطابقة.</p><p>جرّب تغيير البحث أو التصفية.</p></div>';
      return h;
    }

    h += '<div class="cards">';
    items.forEach(function (d) { h += cardHTML(d); });
    h += '</div>';

    if (withBar) {
      h += '<div class="sticky-done">';
      h += '<span class="sd-txt">أنجزت <b>' + arNum(st.done) + '</b> من <b>' + arNum(st.total) + '</b> ذكرًا</span>';
      h += '<span class="sd-ops">';
      h += '<button class="btn ghost" data-act="print">🖨 طباعة</button>';
      h += '<button class="btn ghost" data-act="wipe-day">↺ تصفير اليوم</button>';
      h += '</span></div>';
    }
    return h;
  }

  /* كتاب كامل للطباعة: قسم الصباح ثم قسم المساء (صفحة لكل قسم) */
  function bookHTML() {
    var h = printHeadHTML();
    ['صباح', 'مساء'].forEach(function (c) {
      var items = LIST.filter(function (d) { return d.category === c; });
      h += '<div class="sec-block">' + sectionBody(c, items, false) + '</div>';
    });
    h += printFootHTML();
    return h;
  }

  /* ---------------- الطباعة / حفظ PDF ---------------- */
  var printingBook = false;

  /* تحديث ترويسة المطبوع لتعكس ما سيُطبع فعلًا (قسم واحد أم الكتاب كاملًا) */
  function refreshPrintHead() {
    var old = main.querySelector('.print-head');
    if (!old || !old.parentNode) return;
    var box = document.createElement('div');
    box.innerHTML = printHeadHTML();
    if (box.firstElementChild) old.parentNode.replaceChild(box.firstElementChild, old);
  }

  function doPrint() {
    /* ١) إيقاف الحركة أولًا (يلغي أي انتقال لونيّ معلّق) */
    document.documentElement.classList.add('no-anim');

    if (settings.printAll && !printingBook) {
      printingBook = true;
      main.innerHTML = bookHTML();   /* الكتاب كاملًا قبل فتح نافذة الطباعة */
    } else {
      refreshPrintHead();            /* القسم المعروض — يكفي تحديث الترويسة */
    }

    /* ٢) سماح بتحديث الأنماط ثم فتح نافذة الطباعة */
    setTimeout(function () {
      try { window.print(); } finally { endPrint(); }
    }, 60);
  }

  function endPrint() {
    if (printingBook) { printingBook = false; render(); }
    document.documentElement.classList.remove('no-anim');
  }

  window.addEventListener('afterprint', endPrint);

  /* ---------------- العرض ---------------- */
  function render() {
    var items = visibleItems();
    var st = catStats(tab);

    var h = printHeadHTML() + heroHTML() + toolbarHTML();
    h += '<div class="sec-block">' + sectionBody(tab, items, true) + '</div>';
    h += printFootHTML();

    main.innerHTML = h;
    timeProgress.style.width = st.pct + '%';
    document.querySelectorAll('.time-tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    bindToolbar();
  }

  function bindToolbar() {
    var q = document.getElementById('q');
    if (!q) return;
    q.addEventListener('input', function () {
      query = q.value;
      var pos = q.selectionStart;
      render();
      var nq = document.getElementById('q');
      if (nq) { nq.focus(); try { nq.setSelectionRange(pos, pos); } catch (e) {} }
    });
  }

  /* ---------------- الأحداث ---------------- */
  /* تحديث بطاقة واحدة **في مكانها** دون إعادة بناء، حفاظًا على الحركة والتركيز */
  function patchCard(id) {
    var d = byId[id];
    if (!d) return;
    var card = document.getElementById('card-' + d.id);
    if (!card) return;

    var done = isDone(d);
    var n = countOf(d);
    card.classList.toggle('is-done', done);

    /* المسبحة */
    var numEl = card.querySelector('.tasbih-num');
    if (numEl) numEl.textContent = arNum(n);

    var fg = card.querySelector('.tb-fg');
    if (fg) {
      var pct = Math.min(1, n / d.count);
      fg.style.strokeDashoffset = (TASBIH_C * (1 - pct)).toFixed(2);
    }

    var hint = card.querySelector('.tasbih-hint');
    if (hint) hint.textContent = done ? 'اكتمل الذكر، تقبّل الله منك 🤲' : 'اضغط الدائرة للعدّ، أو استخدم الأزرار.';

    /* زر التمّ للذكار غير المتكرّرة */
    var ack = card.querySelector('.ack');
    if (ack) {
      ack.classList.toggle('on', done);
      ack.querySelector('span').textContent = done ? '✓ تمّ الذكر' : '○ قرأتُه';
    }

    /* زر المفضلة */
    var favBtn = card.querySelector('.act.fav');
    if (favBtn) favBtn.classList.toggle('on', favs().indexOf(d.id) > -1);

    /* ومضة إضاءة عند الإتمام */
    if (done) {
      card.classList.add('flash');
      setTimeout(function () { card.classList.remove('flash'); }, 900);
    }

    updateGlobalProgress();
  }

  /* تحديث عناصر التقدّم العام (حلقة + شريط + نص) */
  function updateGlobalProgress() {
    var st = catStats(tab);
    var C = 251.3;
    var ring = main.querySelector('.ring-fg');
    if (ring) ring.style.strokeDashoffset = (C * (1 - st.pct / 100)).toFixed(2);

    var num = main.querySelector('.ring-num');
    if (num) num.innerHTML = '<b>' + arNum(st.pct) + '٪</b><small>' + arNum(st.done) + '/' + arNum(st.total) + '</small>';

    timeProgress.style.width = st.pct + '%';

    var sd = main.querySelector('.sd-txt');
    if (sd) sd.innerHTML = 'أنجزت <b>' + arNum(st.done) + '</b> من <b>' + arNum(st.total) + '</b> ذكرًا';

    var hb = main.querySelector('.hero-badges');
    if (hb) {
      var badge = hb.querySelector('.hbadge.done');
      if (st.pct === 100 && !badge) {
        var sp = document.createElement('span');
        sp.className = 'hbadge done';
        sp.textContent = '✓ أتممت أذكار ' + tab + ' — تقبّل الله';
        hb.appendChild(sp);
      } else if (st.pct < 100 && badge) {
        badge.remove();
      }
    }
  }

  function buzz(ms) { if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} } }

  function countTo(id, target) {
    var d = byId[id];
    if (!d) return;
    var n = Math.min(d.count, Math.max(0, target));
    state.counts[id] = n;
    saveState();
    patchCard(id);
  }

  /* ---------------- التنبيه ---------------- */
  var toastEl = document.getElementById('toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 1700);
  }

  /* ---------------- نسخ ---------------- */
  function copyText(t) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = t;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast('نُسخ الذكر ✓'); }
      catch (e) { toast('تعذّر النسخ'); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { toast('نُسخ الذكر ✓'); }, fallback);
    } else fallback();
  }
  function dhikrPlain(d) {
    var t = d.text + '\n\n📚 المصدر: ' + d.source;
    if (d.grade) t += '\n⚖ الحكم: ' + d.grade;
    if (d.count > 1) t += '\n⏱ التكرار: ' + d.count + ' مرات';
    return t;
  }

  /* ---------------- المفضلة ---------------- */
  function favs() { return LS.get('adhkar.favs', []); }
  function toggleFav(id) {
    var f = favs();
    var i = f.indexOf(id);
    if (i > -1) { f.splice(i, 1); toast('أُزيل من المفضلة'); }
    else { f.push(id); toast('أُضيف إلى المفضلة ♥'); }
    LS.set('adhkar.favs', f);
  }

  /* ---------------- تفويض الأحداث ---------------- */
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-act]');
    if (!el) return;
    var act = el.dataset.act;
    var id = el.dataset.id;

    switch (act) {
      case 'inc': {
        var d = byId[id];
        if (!d) return;
        var n = countOf(d);
        if (n >= d.count) { toast('تمّ العدد المطلوب ✓'); buzz(40); return; }
        countTo(id, n + 1);
        buzz(12);
        el.classList.remove('pop');
        void el.offsetWidth;
        el.classList.add('pop');
        if (countOf(d) === d.count) {
          setTimeout(function () { toast('اكتمل «' + d.title + '» — تقبّل الله 🤲'); buzz([25, 60, 25]); }, 120);
        }
        break;
      }
      case 'dec':
        countTo(id, countOf(byId[id]) - 1);
        break;
      case 'reset':
        countTo(id, 0);
        toast('صُفّر العدّ');
        break;
      case 'full':
        countTo(id, byId[id].count);
        toast('تمّ الذكر ✓');
        buzz([25, 60, 25]);
        break;
      case 'ack': {
        state.done[id] = !state.done[id];
        saveState();
        patchCard(id);
        buzz(15);
        if (state.done[id]) toast('جزاك الله خيرًا');
        break;
      }
      case 'copy':
        copyText(dhikrPlain(byId[id]));
        break;
      case 'fav':
        toggleFav(id);
        patchCard(id);
        break;
      case 'filter':
        filter = el.dataset.val;
        render();
        break;
      case 'clear-q':
        query = '';
        render();
        break;
      case 'wipe-day':
        if (confirm('تصفير تقدّم أذكار ' + tab + ' لهذا اليوم؟')) {
          LIST.filter(function (d) { return d.category === tab; }).forEach(function (d) {
            delete state.counts[d.id];
            delete state.done[d.id];
          });
          saveState();
          render();
          toast('صُفّر تقدّم اليوم');
        }
        break;
      case 'print':
        doPrint();
        break;
    }
  });

  /* أزرار التبويب */
  document.querySelectorAll('.time-tab').forEach(function (b) {
    b.addEventListener('click', function () {
      tab = b.dataset.tab;
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* أزرار الحجم والثيم */
  document.getElementById('font-inc').addEventListener('click', function () { changeSize(1); });
  document.getElementById('font-dec').addEventListener('click', function () { changeSize(-1); });
  document.getElementById('theme-toggle').addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') === 'dark';
    settings.theme = dark ? 'light' : 'dark';
    saveSettings();
    applyTheme();
    syncSettingsUI();
  });

  /* ---------------- لوحة الإعدادات ---------------- */
  var drawer = document.getElementById('settings');
  var backdrop = document.getElementById('settings-backdrop');

  function openDrawer() {
    clearTimeout(closeTimer);
    drawer.classList.remove('closing');
    backdrop.classList.remove('closing');
    drawer.hidden = false;
    backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    syncSettingsUI();
  }

  var closeTimer;
  function closeDrawer() {
    if (drawer.hidden) return;
    drawer.classList.add('closing');
    backdrop.classList.add('closing');
    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      drawer.hidden = true;
      drawer.classList.remove('closing');
      backdrop.hidden = true;
      backdrop.classList.remove('closing');
      document.body.style.overflow = '';
    }, 220);
  }
  document.getElementById('open-settings').addEventListener('click', openDrawer);
  document.getElementById('close-settings').addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !drawer.hidden) closeDrawer();
  });

  function syncSettingsUI() {
    drawer.querySelectorAll('.seg').forEach(function (seg) {
      var key = seg.dataset.set;
      var val = settings[key];
      seg.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('on', b.dataset.val === String(val));
      });
    });
    document.getElementById('opt-keep').checked = !!settings.keep;
    document.getElementById('opt-auto').checked = !!settings.auto;
    document.getElementById('opt-printall').checked = !!settings.printAll;

    var st1 = catStats('صباح'), st2 = catStats('مساء');
    document.getElementById('stats-line').textContent =
      'اليوم: صباح ' + arNum(st1.done) + '/' + arNum(st1.total) +
      ' — مساء ' + arNum(st2.done) + '/' + arNum(st2.total) +
      ' — المفضلة: ' + arNum(favs().length) + ' ذكرًا.';
  }

  drawer.querySelectorAll('.seg').forEach(function (seg) {
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var key = seg.dataset.set;
      settings[key] = key === 'size' ? +b.dataset.val : b.dataset.val;
      saveSettings();
      if (key === 'theme') applyTheme();
      if (key === 'font' || key === 'size') applyFont();
      syncSettingsUI();
    });
  });

  document.getElementById('opt-keep').addEventListener('change', function () {
    settings.keep = this.checked;
    saveSettings();
    toast(settings.keep ? 'سيُحفظ العدّ بين الأيام' : 'سيُصفَّر العدّ يوميًا');
  });
  document.getElementById('opt-auto').addEventListener('change', function () {
    settings.auto = this.checked;
    saveSettings();
  });
  document.getElementById('opt-printall').addEventListener('change', function () {
    settings.printAll = this.checked;
    saveSettings();
    toast(settings.printAll ? 'سيُطبع الكتاب كاملًا (الصباح والمساء)' : 'سيُطبع القسم المعروض فقط');
  });
  document.getElementById('btn-print').addEventListener('click', doPrint);
  document.getElementById('btn-wipe').addEventListener('click', function () {
    if (confirm('سيُمسح كل التقدّم والمفضلة. هل أنت متأكد؟')) {
      state = { counts: {}, done: {} };
      LS.set('adhkar.favs', []);
      saveState();
      render();
      syncSettingsUI();
      toast('مُسح كل شيء');
    }
  });

  /* ---------------- تغيّر اليوم ---------------- */
  setInterval(function () {
    var k = dayKey();
    if (k !== TODAY) {
      TODAY = k;
      var saved = settings.keep ? LS.get('adhkar.last', null) : null;
      state = saved || { counts: {}, done: {} };
      state.counts = state.counts || {};
      state.done = state.done || {};
      render();
      toast('يوم جديد — تصفّر الأذكار');
    }
  }, 60000);

  /* ---------------- اختصارات لوحة المفاتيح ---------------- */
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && typeof t.matches === 'function' &&
        t.matches('input, textarea, select, [contenteditable="true"]')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '+' || e.key === '=') { changeSize(1); }
    else if (e.key === '-' || e.key === '_') { changeSize(-1); }
    else if (e.key === 't' || e.key === 'T') { document.getElementById('theme-toggle').click(); }
  });

  /* ---------------- ارتفاع الشريط العلوي ---------------- */
  function syncTopbarHeight() {
    var tb = document.querySelector('.topbar');
    if (tb) root.style.setProperty('--topbar-h', Math.round(tb.getBoundingClientRect().height) + 'px');
  }
  window.addEventListener('resize', syncTopbarHeight);
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(syncTopbarHeight);
    var tbEl = document.querySelector('.topbar');
    if (tbEl) ro.observe(tbEl);
  }

  /* ---------------- الإقلاع ---------------- */
  if (settings.auto) tab = autoTab();
  applyTheme();
  applyFont();
  syncTopbarHeight();
  render();
  syncSettingsUI();
})();
