import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import type { SlideDefinition } from '../../slides/slides';
import type { OriginRect, ViewPhase } from '../carousel/Carousel3DView';

export interface FullscreenSlideViewProps {
  slides: SlideDefinition[];
  activeIndex: number;
  viewPhase: ViewPhase;
  originRect?: OriginRect;
  onChangeIndex: (idx: number) => void;
  onClose: () => void;
  isBrowserFullscreen?: boolean;
  onToggleBrowserFullscreen?: () => void;
}

export function FullscreenSlideView({
  slides,
  activeIndex,
  viewPhase,
  originRect,
  onChangeIndex,
  onClose,
  isBrowserFullscreen = false,
  onToggleBrowserFullscreen,
}: FullscreenSlideViewProps) {
  const [entered, setEntered] = useState(false);
  const [dragDeltaX, setDragDeltaX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const swipeActiveRef = useRef(false);
  const gestureAxisRef = useRef<'horizontal' | 'vertical' | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Trigger two-frame RAF so the browser commits the initial clip-path inset before expanding fullscreen
  useEffect(() => {
    if (viewPhase === 'opening' || viewPhase === 'fullscreen') {
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    } else if (viewPhase === 'closing') {
      setEntered(false);
    }
  }, [viewPhase]);

  const clampIdx = useCallback(
    (idx: number) => Math.max(0, Math.min(slides.length - 1, idx)),
    [slides.length],
  );

  const goNext = useCallback(() => {
    onChangeIndex(clampIdx(activeIndex + 1));
  }, [activeIndex, clampIdx, onChangeIndex]);

  const goPrev = useCallback(() => {
    onChangeIndex(clampIdx(activeIndex - 1));
  }, [activeIndex, clampIdx, onChangeIndex]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, onClose]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, a, [data-no-swipe="true"]')) return;
    // Ignore pointer drags initiated directly on a scrollable element's vertical scrollbar track
    const scrollHost = target?.closest('[data-slide-scroll="true"]') as HTMLElement | null;
    if (scrollHost && e.pointerType === 'mouse' && e.clientX >= scrollHost.getBoundingClientRect().right - 12) {
      return;
    }

    swipeActiveRef.current = true;
    gestureAxisRef.current = null;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startTimeRef.current = performance.now();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!swipeActiveRef.current) return;
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (!gestureAxisRef.current) {
      if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) {
        gestureAxisRef.current = 'vertical';
        swipeActiveRef.current = false;
        setIsSwiping(false);
        setDragDeltaX(0);
        return;
      }
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        gestureAxisRef.current = 'horizontal';
        setIsSwiping(true);
      } else {
        return;
      }
    }

    if (gestureAxisRef.current === 'vertical') return;

    // Swipe LEFT provides immediate pull-back feedback toward the carousel
    setDragDeltaX(dx < 0 ? Math.max(-240, dx) : Math.min(48, dx * 0.2));
  };

  const finishSwipe = (clientX: number) => {
    const wasHorizontal = gestureAxisRef.current === 'horizontal';
    gestureAxisRef.current = null;

    if (!swipeActiveRef.current) {
      setIsSwiping(false);
      setDragDeltaX(0);
      return;
    }
    swipeActiveRef.current = false;
    setIsSwiping(false);

    if (!wasHorizontal) {
      setDragDeltaX(0);
      return;
    }

    const dx = clientX - startXRef.current;
    const elapsed = Math.max(1, performance.now() - startTimeRef.current);
    const velocity = Math.abs(dx) / elapsed;
    const threshold = Math.min(88, window.innerWidth * 0.13);

    // Swiping LEFT in fullscreen returns directly to the topic carousel at activeIndex
    if (dx < -threshold || (dx < -32 && velocity > 0.35)) {
      setDragDeltaX(0);
      onClose();
      return;
    }

    setDragDeltaX(0);
  };

  const vw = typeof window !== 'undefined' ? Math.max(window.innerWidth, 1) : 1440;
  const vh = typeof window !== 'undefined' ? Math.max(window.innerHeight, 1) : 900;
  const swipeBackProgress = Math.max(0, Math.min(1, -dragDeltaX / 200));

  const isExpanded = entered && viewPhase !== 'closing';
  const collapsedClip = originRect
    ? `inset(${Math.max(0, originRect.top).toFixed(1)}px ${Math.max(
        0,
        vw - (originRect.left + originRect.width),
      ).toFixed(1)}px ${Math.max(
        0,
        vh - (originRect.top + originRect.height),
      ).toFixed(1)}px ${Math.max(0, originRect.left).toFixed(1)}px round 14px)`
    : 'inset(18% 36% 24% 36% round 14px)';

  const expandedClip = 'inset(0px 0px 0px 0px round 0px)';
  const stageClipPath = prefersReducedMotion
    ? expandedClip
    : isExpanded
      ? expandedClip
      : collapsedClip;

  const stageTransform = prefersReducedMotion
    ? 'scale(1)'
    : isExpanded
      ? `translate3d(${dragDeltaX * 0.32}px, 0, 0) scale(${1 - swipeBackProgress * 0.05})`
      : 'translate3d(0, 0, -120px) scale(0.94)';

  const activeSlide = slides[activeIndex] ?? slides[0];
  const ActiveSlideComponent = activeSlide.Component;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={activeSlide?.title ?? 'Slide view'}
      className={`fixed inset-0 z-50 overflow-hidden bg-[#eaf3fb]/94 touch-pan-y ${
        isSwiping ? 'select-none' : ''
      }`}
      style={{
        perspective: '1650px',
        perspectiveOrigin: '50% 50%',
        opacity: isExpanded || prefersReducedMotion ? 1 - swipeBackProgress * 0.15 : 0.96,
        transition: isSwiping ? 'none' : 'opacity 420ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => finishSwipe(e.clientX)}
      onPointerCancel={(e) => finishSwipe(e.clientX)}
    >
      {/* Unified soft icy-blue futuristic ambient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(64% 58% at 50% 44%, rgba(255, 255, 255, 0.85) 0%, rgba(235, 244, 253, 0.72) 55%, rgba(217, 233, 249, 0.96) 100%)',
        }}
      />

      {/* Physical-Page Clip-Path Morph + 3D Expansion Container */}
      <div
        className="relative h-full w-full will-change-[clip-path,transform]"
        style={{
          transformStyle: 'preserve-3d',
          clipPath: stageClipPath,
          transform: stageTransform,
          transition: isSwiping
            ? 'none'
            : viewPhase === 'closing'
              ? 'clip-path 560ms cubic-bezier(0.22, 1, 0.36, 1), transform 560ms cubic-bezier(0.22, 1, 0.36, 1)'
              : 'clip-path 640ms cubic-bezier(0.76, 0, 0.18, 1), transform 640ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <section className="absolute inset-0 h-full w-full overflow-visible">
          <ActiveSlideComponent isActive={viewPhase !== 'closing'} turnOffset={0} />
        </section>
      </div>

      {/* Top-Right Controls: Browser Fullscreen Toggle + Back to 3D Carousel */}
      <div
        data-no-swipe="true"
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed right-4 top-3.5 z-50 flex items-center gap-2 sm:right-6 sm:top-5"
      >
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
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300/80 bg-white/95 text-[#0b192c] shadow-[0_6px_18px_rgba(15,45,85,0.10)] backdrop-blur-md transition hover:border-sky-500/60 hover:bg-sky-50 hover:text-sky-700"
          >
            {isBrowserFullscreen ? (
              <Minimize className="h-3.5 w-3.5 text-sky-600" />
            ) : (
              <Maximize className="h-3.5 w-3.5 text-sky-600" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Back to topic carousel"
          className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-300/80 bg-white/95 px-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0b192c] shadow-[0_6px_18px_rgba(15,45,85,0.10)] backdrop-blur-md transition hover:border-sky-500/60 hover:bg-sky-50 hover:text-sky-700"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-sky-600" />
          <span>Back</span>
        </button>
      </div>

      {/* Subtle Bottom-Right Topic Stepper (1/9..9/9) */}
      <div
        data-no-swipe="true"
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed bottom-2.5 right-4 z-50 flex items-center gap-1.5 rounded-full border border-slate-300/70 bg-white/85 px-2 py-1 shadow-[0_6px_18px_rgba(15,45,85,0.08)] backdrop-blur-md transition-opacity duration-200 hover:bg-white sm:bottom-3 sm:right-6"
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={activeIndex === 0}
          aria-label="Previous topic"
          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-600 transition hover:bg-sky-50 hover:text-sky-700 disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <span
          aria-live="polite"
          className="min-w-[3.2rem] text-center font-mono text-[11px] font-medium tabular-nums tracking-wider text-[#0b192c]"
        >
          {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </span>

        <button
          type="button"
          onClick={goNext}
          disabled={activeIndex === slides.length - 1}
          aria-label="Next topic"
          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-600 transition hover:bg-sky-50 hover:text-sky-700 disabled:opacity-30"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
