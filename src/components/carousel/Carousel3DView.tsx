import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, Maximize2, Minimize } from 'lucide-react';
import { TOPIC_METADATA } from '../../data/paperData';
import { CarouselPagePreview } from './CarouselPagePreview';

export type ViewPhase = 'carousel' | 'opening' | 'fullscreen' | 'closing';

export interface OriginRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Carousel3DViewProps {
  isLevelActive: boolean;
  selectedIndex: number;
  viewPhase: ViewPhase;
  onSelectIndex: (idx: number) => void;
  onOpenSlide: (idx: number, originRect?: OriginRect) => void;
  onBackToCover: () => void;
  isBrowserFullscreen?: boolean;
  onToggleBrowserFullscreen?: () => void;
}

export function Carousel3DView({
  isLevelActive,
  selectedIndex,
  viewPhase,
  onSelectIndex,
  onOpenSlide,
  onBackToCover,
  isBrowserFullscreen = false,
  onToggleBrowserFullscreen,
}: Carousel3DViewProps) {
  const total = TOPIC_METADATA.length; // Exactly 9 topics
  const [visualIndex, setVisualIndex] = useState(selectedIndex);
  const [viewportSize, setViewportSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  }));
  const viewportWidth = viewportSize.width;
  const viewportHeight = viewportSize.height;
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const visualRef = useRef(selectedIndex);
  const targetRef = useRef(selectedIndex);
  targetRef.current = selectedIndex;

  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startXRef = useRef(0);
  const startVisualRef = useRef(selectedIndex);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const wheelCooldownRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);

  // Sync visual index whenever entering Level 2 from Cover so last selected page appears centered cleanly
  useEffect(() => {
    if (isLevelActive) {
      visualRef.current = selectedIndex;
      setVisualIndex(selectedIndex);
    }
  }, [isLevelActive, selectedIndex]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () =>
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);

    let mq: MediaQueryList | null = null;
    const onMq = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    if (window.matchMedia) {
      mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      mq.addEventListener?.('change', onMq);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      mq?.removeEventListener?.('change', onMq);
    };
  }, []);

  // Continuous exponential damping loop for smooth carousel snapping & arc motion
  useEffect(() => {
    if (!isLevelActive) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      if (!draggingRef.current) {
        const diff = targetRef.current - visualRef.current;
        if (Math.abs(diff) > 0.0008) {
          const factor = prefersReducedMotion ? 1 : 1 - Math.exp(-9.5 * dt);
          visualRef.current += diff * factor;
          setVisualIndex(visualRef.current);
        } else if (visualRef.current !== targetRef.current) {
          visualRef.current = targetRef.current;
          setVisualIndex(visualRef.current);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isLevelActive, prefersReducedMotion]);

  const clampIdx = useCallback(
    (idx: number) => Math.max(0, Math.min(total - 1, idx)),
    [total],
  );

  const openIndexWithRect = useCallback(
    (idx: number) => {
      const cardEl = stageRef.current?.querySelector(
        `[data-page-idx="${idx}"]`,
      ) as HTMLElement | null;
      const r = cardEl?.getBoundingClientRect();
      onOpenSlide(
        idx,
        r && r.width > 20 && r.height > 20
          ? { top: r.top, left: r.left, width: r.width, height: r.height }
          : undefined,
      );
    },
    [onOpenSlide],
  );

  // Keyboard navigation while Level 2 Carousel is active
  useEffect(() => {
    if (!isLevelActive || viewPhase !== 'carousel') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onSelectIndex(clampIdx(selectedIndex + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (selectedIndex === 0) {
          onBackToCover();
        } else {
          onSelectIndex(clampIdx(selectedIndex - 1));
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        onSelectIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        onSelectIndex(total - 1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openIndexWithRect(selectedIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onBackToCover();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    clampIdx,
    isLevelActive,
    onBackToCover,
    onSelectIndex,
    openIndexWithRect,
    selectedIndex,
    total,
    viewPhase,
  ]);

  // Trackpad / wheel browsing along the horizontal carousel
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !isLevelActive || viewPhase !== 'carousel') return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      if (now - wheelCooldownRef.current < 240) return;
      const dominant = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(dominant) > 18) {
        wheelCooldownRef.current = now;
        if (dominant < 0 && selectedIndex === 0) {
          onBackToCover();
        } else {
          onSelectIndex(clampIdx(selectedIndex + (dominant > 0 ? 1 : -1)));
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [clampIdx, isLevelActive, onBackToCover, onSelectIndex, selectedIndex, viewPhase]);

  const dragStepPx = Math.max(190, Math.min(340, viewportWidth * 0.25));

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isLevelActive || viewPhase !== 'carousel') return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, a, [data-carousel-ui="true"]')) return;

    draggingRef.current = true;
    movedRef.current = false;
    startXRef.current = e.clientX;
    startVisualRef.current = visualRef.current;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 6) {
      movedRef.current = true;
    }

    const now = performance.now();
    const dt = Math.max(8, now - lastTimeRef.current);
    velocityRef.current = (e.clientX - lastXRef.current) / dt;
    lastXRef.current = e.clientX;
    lastTimeRef.current = now;

    const nextVisual = startVisualRef.current - dx / dragStepPx;
    const clamped = Math.max(-0.48, Math.min(total - 1 + 0.28, nextVisual));
    visualRef.current = clamped;
    setVisualIndex(clamped);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    if (movedRef.current) {
      const dx = e.clientX - startXRef.current;
      // Pulling backward past Topic 1 returns cleanly to Level 1 Cover
      if (startVisualRef.current <= 0.15 && (visualRef.current < -0.22 || dx > 72)) {
        onBackToCover();
        return;
      }

      const projected = visualRef.current - velocityRef.current * 0.32;
      const snapTarget = clampIdx(Math.round(projected));
      onSelectIndex(snapTarget);
      return;
    }

    // Clicking a neighboring sheet selects & centers it; clicking the centered sheet opens fullscreen
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const cardEl = el?.closest('[data-page-idx]') as HTMLElement | null;
    if (cardEl) {
      const idx = Number(cardEl.dataset.pageIdx);
      if (!Number.isNaN(idx)) {
        if (idx === selectedIndex) {
          openIndexWithRect(idx);
        } else {
          onSelectIndex(idx);
        }
      }
    }
  };

  const isFullscreenHidden = !isLevelActive || viewPhase === 'fullscreen';
  const isOpening = viewPhase === 'opening';
  const isClosing = viewPhase === 'closing';
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;

  // Compute safe available stage height (reserving top header + bottom controls + reflection room)
  const stageAvailHeight = Math.max(260, viewportHeight - (isMobile ? 124 : 138));
  const aspectRatio = isMobile ? 0.86 : isTablet ? 0.68 : 0.655;
  const maxSafeHeight = Math.round(stageAvailHeight * (isMobile ? 0.68 : 0.84));

  // Large prominent centerpiece width capped smoothly by safe stage height so controls never overlap
  const targetWidth = isMobile
    ? Math.round(Math.min(344, Math.max(276, viewportWidth * 0.81)))
    : isTablet
      ? Math.round(Math.min(640, viewportWidth * 0.68))
      : Math.round(Math.min(960, Math.max(540, viewportWidth * 0.57)));

  const cardWidth = Math.min(targetWidth, Math.round(maxSafeHeight / aspectRatio));
  const cardHeight = Math.round(cardWidth * aspectRatio);
  const perspectivePx = isMobile ? 1200 : isTablet ? 1600 : 1950;
  const arcStepX = cardWidth * (isMobile ? 0.88 : 0.77);

  return (
    <div
      ref={stageRef}
      aria-hidden={isFullscreenHidden}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`fixed inset-0 z-10 flex flex-col justify-between overflow-hidden select-none transition-all duration-500 ${
        !isLevelActive
          ? 'pointer-events-none translate-x-12 scale-[0.96] opacity-0'
          : viewPhase === 'fullscreen'
            ? 'pointer-events-none opacity-0'
            : 'pointer-events-auto translate-x-0 scale-100 opacity-100'
      }`}
    >
      {/* Top-Left Subtle Back to Cover Control */}
      <header
        data-carousel-ui="true"
        className={`relative z-30 flex items-center justify-between px-4 pt-3 sm:px-6 sm:pt-4 ${
          isOpening ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-300`}
      >
        <button
          type="button"
          onClick={onBackToCover}
          aria-label="Return to seminar cover"
          className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-900/[0.09] bg-white/85 px-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0b192c] shadow-[0_6px_18px_rgba(15,45,85,0.07)] transition hover:border-sky-500/50 hover:bg-white hover:text-sky-700"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-sky-600" />
          <span>Cover</span>
        </button>

        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] font-semibold tabular-nums tracking-[0.16em] text-slate-500">
            {selectedIndex + 1} / {total}
          </span>
          {onToggleBrowserFullscreen && (
            <button
              type="button"
              onClick={onToggleBrowserFullscreen}
              aria-label={
                isBrowserFullscreen
                  ? 'Exit fullscreen presentation mode'
                  : 'Enter fullscreen presentation mode'
              }
              title={isBrowserFullscreen ? 'Exit Fullscreen (F)' : 'Present Fullscreen (F)'}
              className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-900/[0.09] bg-white/85 px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0b192c] shadow-[0_6px_18px_rgba(15,45,85,0.07)] transition hover:border-sky-500/50 hover:bg-white hover:text-sky-700"
            >
              {isBrowserFullscreen ? (
                <Minimize className="h-3.5 w-3.5 text-sky-600" />
              ) : (
                <Maximize className="h-3.5 w-3.5 text-sky-600" />
              )}
              <span className="hidden sm:inline">
                {isBrowserFullscreen ? 'Exit Fullscreen' : 'Present'}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Soft Horizon Lighting Shadow Beneath Carousel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-14 left-1/2 h-44 w-[min(1080px,94vw)] -translate-x-1/2 rounded-full opacity-85"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(15, 45, 85, 0.09) 0%, rgba(14, 165, 233, 0.065) 55%, rgba(255, 255, 255, 0) 100%)',
        }}
      />

      {/* Wide Cinematic Horizontal 3D Topic Carousel (9 Topics Only) */}
      <div
        className="relative flex-1 w-full"
        style={{
          perspective: `${perspectivePx}px`,
          perspectiveOrigin: '50% 50%',
          transformStyle: 'preserve-3d',
        }}
      >
        {TOPIC_METADATA.map((meta, idx) => {
          const offset = idx - visualIndex;
          const absOff = Math.abs(offset);
          const isCenterSelected = idx === selectedIndex;

          const maxVisible = isMobile ? 2.35 : 3.45;
          const fadeStart = isMobile ? 1.25 : 2.1;
          const baseOpacity =
            absOff > maxVisible
              ? 0
              : Math.max(0, 1 - Math.max(0, absOff - fadeStart) / (maxVisible - fadeStart));

          // Center sheet straight (0 deg), side pages smaller and angled backward into depth arc
          const rawRotateY =
            Math.sign(offset) *
            Math.min(38, absOff * (isMobile ? 20 : 18) + Math.pow(absOff, 1.2) * 1.8);
          let rotateY = prefersReducedMotion ? 0 : -rawRotateY;

          // Smooth curved arc spacing: linear near 0 for drag responsiveness, gently wrapping inward at distance
          const arcNorm = absOff / (1 + (isMobile ? 0.32 : 0.42) * absOff);
          let translateX = Math.sign(offset) * arcNorm * arcStepX;
          let translateZ =
            -absOff * (isMobile ? 175 : 225) - Math.pow(absOff, 1.35) * (isMobile ? 32 : 52);
          let scale = Math.max(
            isMobile ? 0.46 : 0.38,
            1 / (1 + absOff * (isMobile ? 0.44 : 0.56)),
          );
          let opacity = baseOpacity;
          let zIndex = Math.round(50 - absOff * 10);

          if (isOpening) {
            if (isCenterSelected) {
              translateX = 0;
              translateZ = 340;
              rotateY = 0;
              scale = 1.45;
              opacity = 0.25;
              zIndex = 60;
            } else {
              translateZ -= 240;
              scale *= 0.85;
              opacity = 0;
            }
          } else if (isClosing) {
            if (isCenterSelected) {
              opacity = 1;
              zIndex = 60;
            }
          }

          const dimmingAlpha = isCenterSelected ? 0 : Math.min(0.46, absOff * 0.19);

          return (
            <div
              key={meta.id}
              data-page-idx={idx}
              role="button"
              tabIndex={isLevelActive && isCenterSelected && viewPhase === 'carousel' ? 0 : -1}
              aria-label={`Topic ${meta.numberLabel} of ${String(total).padStart(2, '0')}: ${meta.title}${
                isCenterSelected ? ' — click or press Enter to open' : ' — click to center'
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (isCenterSelected) openIndexWithRect(idx);
                  else onSelectIndex(idx);
                }
              }}
              className="absolute left-1/2 top-1/2 cursor-pointer will-change-transform focus:outline-none"
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                marginLeft: `${-cardWidth / 2}px`,
                marginTop: `${-cardHeight / 2 - (isMobile ? 6 : 8)}px`,
                transform: `translate3d(${translateX.toFixed(1)}px, 0px, ${translateZ.toFixed(
                  1,
                )}px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                opacity,
                visibility: opacity <= 0.01 ? 'hidden' : 'visible',
                zIndex,
                transition:
                  draggingRef.current && viewPhase === 'carousel'
                    ? 'none'
                    : isOpening || isClosing
                      ? 'transform 480ms cubic-bezier(0.22, 1, 0.36, 1), opacity 420ms ease'
                      : 'opacity 260ms ease',
              }}
            >
              <CarouselPagePreview
                slideIndex={idx}
                isSelected={isCenterSelected}
                dimmingAlpha={dimmingAlpha}
              />

              {/* Subtle light-sky floor reflection beneath each floating sheet */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[5%] right-[5%] top-[calc(100%+10px)] h-9 rounded-t-[14px]"
                style={{
                  background: isCenterSelected
                    ? 'linear-gradient(180deg, rgba(15, 45, 85, 0.10) 0%, rgba(2, 132, 199, 0.05) 28%, rgba(255, 255, 255, 0) 90%)'
                    : 'linear-gradient(180deg, rgba(15, 45, 85, 0.05) 0%, rgba(2, 132, 199, 0.025) 24%, rgba(255, 255, 255, 0) 85%)',
                  opacity: Math.max(0.15, 1 - absOff * 0.28),
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Minimal Bottom Control Dock: Previous -> 9 Dots -> Next -> Counter -> OPEN */}
      <footer
        data-carousel-ui="true"
        className={`relative z-30 flex items-center justify-center px-3 pb-4 pt-1 transition-all duration-400 sm:px-4 sm:pb-6 ${
          isOpening ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="flex items-center gap-1 rounded-full border border-slate-900/[0.09] bg-white/88 px-2 py-1.5 shadow-[0_12px_32px_rgba(15,45,85,0.09)] sm:gap-2 sm:px-3.5 sm:py-2">
          <button
            type="button"
            onClick={() => {
              if (selectedIndex === 0) onBackToCover();
              else onSelectIndex(clampIdx(selectedIndex - 1));
            }}
            aria-label={selectedIndex === 0 ? 'Back to cover' : 'Previous topic'}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0b192c] transition hover:border-sky-500/50 hover:text-sky-700 sm:h-9 sm:w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <nav aria-label="Topic pagination" className="flex items-center gap-0.5 sm:gap-1">
            {TOPIC_METADATA.map((meta, idx) => {
              const active = idx === selectedIndex;
              return (
                <button
                  key={meta.id}
                  type="button"
                  onClick={() => onSelectIndex(idx)}
                  aria-label={`Select topic ${meta.numberLabel}: ${meta.title}`}
                  aria-current={active ? 'step' : undefined}
                  className="group flex h-7 items-center justify-center px-0.5 focus:outline-none sm:px-1"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      active
                        ? 'w-4 bg-sky-600 shadow-[0_0_8px_rgba(2,132,199,0.45)] sm:w-6'
                        : 'w-1.5 bg-slate-400/45 group-hover:bg-slate-600/70'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => onSelectIndex(clampIdx(selectedIndex + 1))}
            disabled={selectedIndex === total - 1}
            aria-label="Next topic"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0b192c] transition hover:border-sky-500/50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <span
            aria-live="polite"
            className="hidden min-w-[2.6rem] text-center font-mono text-[11px] font-semibold tabular-nums text-slate-600 sm:inline-block"
          >
            {selectedIndex + 1}/{total}
          </span>

          <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-slate-200 sm:mx-0.5" />

          <button
            type="button"
            onClick={() => openIndexWithRect(selectedIndex)}
            className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#0b192c] to-[#0369a1] px-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_4px_14px_rgba(3,105,161,0.28)] transition hover:brightness-110 active:scale-[0.98] sm:h-9 sm:px-5 sm:tracking-[0.18em]"
          >
            <Maximize2 className="h-3 w-3 text-sky-200" />
            <span>Open</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
