/* ============================================================================
   صوت نقرة خفيف للمسبحة — مُولَّد بـ WebAudio، بلا ملفات وخارج الشبكة
   يُستدعى فقط إذا فعّل المستخدم «الصوت» من الإعدادات.
   ========================================================================== */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** نقرة قصيرة منخفضة — لا تشتّت ولا تُشغَّل إلا بأمر المستخدم */
export function playTick(): void {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = 440;
  gain.gain.setValueAtTime(0.0001, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.12);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.13);
}

/** نغمة إكمال أخفض قليلًا */
export function playDone(): void {
  const c = getCtx();
  if (!c) return;
  [523.25, 659.25].forEach((f, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    const t = c.currentTime + i * 0.12;
    osc.type = "sine";
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.08, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.26);
  });
}
