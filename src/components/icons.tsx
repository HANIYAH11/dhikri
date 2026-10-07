/* ============================================================================
   أيقونات SVG — بسيطة، خط واحد، بلا حزم خارجية
   ========================================================================== */

interface P {
  className?: string;
}

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconHome = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="M3.5 10.5 12 4l8.5 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z" />
  </svg>
);

export const IconSun = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
  </svg>
);

export const IconMoon = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
  </svg>
);

export const IconHeart = ({ className = "h-6 w-6", filled = false }: P & { filled?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    {...base}
    fill={filled ? "currentColor" : "none"}
  >
    <path d="M12 20s-7.5-4.7-7.5-9.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8C19.5 15.3 12 20 12 20z" />
  </svg>
);

export const IconGear = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l1.8-1.3-1.9-3.3-2.1.8a7.6 7.6 0 0 0-2.6-1.5L14.2 3H9.8l-.4 2.2a7.6 7.6 0 0 0-2.6 1.5l-2.1-.8-1.9 3.3 1.8 1.3a7.6 7.6 0 0 0 0 3l-1.8 1.3 1.9 3.3 2.1-.8a7.6 7.6 0 0 0 2.6 1.5l.4 2.2h4.4l.4-2.2a7.6 7.6 0 0 0 2.6-1.5l2.1.8 1.9-3.3z" />
  </svg>
);

export const IconSearch = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

export const IconCheck = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const IconCopy = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M15 6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15" />
  </svg>
);

export const IconShare = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5" />
    <path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" />
  </svg>
);

export const IconReset = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="M4.5 8.5A8 8 0 1 1 4 13" />
    <path d="M4.5 4v4.5H9" />
  </svg>
);

export const IconBook = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
  </svg>
);

export const IconArrowStart = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="M14 6l-6 6 6 6" />
  </svg>
);

export const IconLeaf = ({ className = "h-10 w-10" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="M5 19c0-8 5-13 14-14 1 9-3.5 14-10 14H5z" />
    <path d="M9 15c1.5-3 4-5.5 7-7" />
  </svg>
);

/** الشعار: نجمة ثمانية هندسية مستديرة (هلال خفيف في القلب) */
export const Logo = ({ className = "h-11 w-11" }: P) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
    <g fill="none" stroke="url(#lg-grad)" strokeWidth="6" strokeLinejoin="round">
      <rect x="22" y="22" width="56" height="56" rx="6" />
      <rect x="22" y="22" width="56" height="56" rx="6" transform="rotate(45 50 50)" />
    </g>
    <path
      d="M60 50a13 13 0 1 1-9.6-12.6A15 15 0 1 0 60 50z"
      fill="url(#lg-grad)"
    />
    <defs>
      <linearGradient id="lg-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#c9a227" />
        <stop offset="100%" stopColor="#16705c" />
      </linearGradient>
    </defs>
  </svg>
);
