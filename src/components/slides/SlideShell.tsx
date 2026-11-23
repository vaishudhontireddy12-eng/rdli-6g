import { useEffect, useState, type ReactNode } from 'react';
import { TOPIC_METADATA } from '../../data/paperData';

export interface SlideShellProps {
  slideIndex: number;
  children: ReactNode;
  accentLabel?: string;
  isActive?: boolean;
  turnOffset?: number;
}

const PAPER_GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

export function SlideShell({
  slideIndex,
  children,
  accentLabel,
  isActive = true,
  turnOffset = 0,
}: SlideShellProps) {
  const meta = TOPIC_METADATA[slideIndex] ?? TOPIC_METADATA[0];
  const [tilt, setTilt] = useState({ x: 0, y: 0, lx: 50, ly: 32 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const absTurn = Math.abs(turnOffset);
  const canTilt = isActive && absTurn < 0.02 && !prefersReducedMotion;

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!canTilt || e.pointerType === 'touch') return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({
      x: -ny * 1.15,
      y: nx * 1.35,
      lx: 50 + nx * 18,
      ly: 32 + ny * 16,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0, lx: 50, ly: 32 });
  };

  const shadowAlpha = Math.min(0.45, absTurn * 0.45);
  const sheetTransform =
    canTilt && (tilt.x !== 0 || tilt.y !== 0)
      ? `perspective(1800px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`
      : 'perspective(1800px) rotateX(0deg) rotateY(0deg)';

  return (
    <div className="relative flex h-full w-full items-center justify-center px-3 pb-12 pt-3 sm:px-8 sm:pb-14 sm:pt-7 lg:px-14 lg:py-8">
      {/* Soft ambient shadow halo behind the suspended white PowerPoint sheet */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 inset-y-8 -z-10 mx-auto max-w-[1260px] max-h-[820px] rounded-[28px] opacity-85"
        style={{
          background:
            'radial-gradient(64% 58% at 50% 54%, rgba(15, 45, 85, 0.22) 0%, rgba(15, 45, 85, 0.09) 62%, rgba(15, 45, 85, 0) 100%)',
          transform: 'translateZ(-40px) scale(1.03)',
        }}
      />

      {/* Physical Presentation Sheet — crisp white/off-white academic PowerPoint slide */}
      <article
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative flex h-full w-full max-w-[1260px] max-h-[860px] flex-col overflow-hidden rounded-[18px] text-[#0b192c] sm:rounded-[22px]"
        style={{
          background:
            'linear-gradient(155deg, #ffffff 0%, #f9fcff 58%, #f1f7fe 100%)',
          border: '1px solid rgba(15, 45, 85, 0.14)',
          boxShadow:
            '0 36px 84px rgba(15, 45, 85, 0.16), 0 12px 30px rgba(15, 45, 85, 0.10), 0 0 0 1px rgba(2, 132, 199, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)',
          transform: sheetTransform,
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Subtle studio key-light sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(64% 52% at ${tilt.lx}% ${tilt.ly}%, rgba(186, 230, 253, 0.18) 0%, rgba(224, 242, 254, 0.06) 54%, rgba(255, 255, 255, 0) 100%)`,
          }}
        />

        {/* Subtle matte paper grain texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.02] mix-blend-multiply"
          style={{ backgroundImage: PAPER_GRAIN_SVG, backgroundSize: '160px 160px' }}
        />

        {/* Outer crisp hairline frame */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2 rounded-[13px] border border-slate-200/80 sm:inset-3.5 sm:rounded-[14px]"
        />

        {/* 4 Subtle Cyan Corner Registration L-Brackets */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-3 h-3 w-3 rounded-tl-[7px] border-l-[1.5px] border-t-[1.5px] border-sky-600/45 sm:left-[21px] sm:top-[21px] sm:h-4 sm:w-4 sm:rounded-tl-[10px]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3 h-3 w-3 rounded-tr-[7px] border-r-[1.5px] border-t-[1.5px] border-sky-600/45 sm:right-[21px] sm:top-[21px] sm:h-4 sm:w-4 sm:rounded-tr-[10px]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 rounded-bl-[7px] border-b-[1.5px] border-l-[1.5px] border-sky-600/45 sm:bottom-[21px] sm:left-[21px] sm:h-4 sm:w-4 sm:rounded-bl-[10px]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 rounded-br-[7px] border-b-[1.5px] border-r-[1.5px] border-sky-600/45 sm:bottom-[21px] sm:right-[21px] sm:h-4 sm:w-4 sm:rounded-br-[10px]"
        />

        {/* Main Sheet Interior Canvas */}
        <div className="relative z-10 flex h-full min-h-0 w-full flex-col px-5 pb-4 pt-5 sm:px-10 sm:pb-5 sm:pt-7 lg:px-12 lg:py-7">
          {/* Pinned Sheet Header */}
          <header
            className={`shrink-0 pb-3 pr-28 sm:pb-3.5 sm:pr-32 ${isActive ? 'slide-reveal' : ''}`}
            style={{ ['--reveal-delay' as string]: '40ms' }}
          >
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600">
              <span className="font-mono tabular-nums text-slate-500">{meta.numberLabel}</span>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span>{(accentLabel ?? meta.category).replace(/^\d+\s*·\s*/, '')}</span>
            </div>
            <h1 className="mt-1 font-['Playfair_Display'] text-xl font-semibold tracking-tight text-[#0b192c] [text-wrap:balance] sm:text-3xl lg:text-[2.05rem] lg:leading-[1.12]">
              {meta.title}
            </h1>
            <p className="mt-1 max-w-3xl font-['Plus_Jakarta_Sans'] text-xs text-slate-600 sm:mt-1.5 sm:text-sm">
              {meta.summary}
            </p>
            <div
              aria-hidden="true"
              className="mt-2.5 h-px w-full bg-gradient-to-r from-sky-500/45 via-slate-200 to-transparent sm:mt-3"
            />
          </header>

          {/* Vertically Scrollable Sheet Body (works smoothly on both desktop and mobile) */}
          <div
            data-slide-scroll="true"
            tabIndex={0}
            className={`slide-scroll-area mt-1 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1.5 sm:mt-1.5 sm:pr-2.5 focus:outline-none ${
              isActive ? 'slide-reveal' : ''
            }`}
            style={{ ['--reveal-delay' as string]: '130ms' }}
          >
            <div className="w-full py-2 pb-6">{children}</div>
          </div>

          {/* Quiet Pinned Physical Sheet Folio Footer */}
          <footer className="mt-2 shrink-0 pt-1">
            <div
              aria-hidden="true"
              className="mb-2 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"
            />
            <div className="flex items-center justify-between gap-4 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
              <span className="truncate">Revisiting Data Recovery Loops in 6G Networks</span>
              <span className="shrink-0 font-mono font-semibold tabular-nums text-[#0b192c]">
                Slide {meta.numberLabel} / {String(TOPIC_METADATA.length).padStart(2, '0')}
              </span>
            </div>
          </footer>
        </div>

        {/* Dynamic 3D Page-Turn Cast Shadow & Edge Specular Highlight Scoped to Sheet */}
        {absTurn > 0.01 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 rounded-[18px] sm:rounded-[22px]"
            style={{
              backgroundColor: `rgba(218, 234, 249, ${shadowAlpha})`,
              boxShadow:
                turnOffset < 0
                  ? 'inset -24px 0 46px rgba(2, 132, 199, 0.12), inset 16px 0 32px rgba(15, 45, 85, 0.14)'
                  : 'inset 24px 0 46px rgba(2, 132, 199, 0.12), inset -16px 0 32px rgba(15, 45, 85, 0.14)',
            }}
          />
        )}
      </article>
    </div>
  );
}
