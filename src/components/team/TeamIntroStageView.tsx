import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export interface TeamIntroStageViewProps {
  isActive: boolean;
  onEnterCover: () => void;
}

export function TeamIntroStageView({ isActive, onEnterCover }: TeamIntroStageViewProps) {
  const [dragDx, setDragDx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragActiveRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);

  // Keyboard ArrowRight / Enter / Space transitions smoothly to Screen 2 (Main Seminar Cover)
  useEffect(() => {
    if (!isActive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onEnterCover();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isActive, onEnterCover]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isActive) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, a')) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore synthetic events where pointer capture is unavailable
    }

    dragActiveRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startTimeRef.current = performance.now();
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragActiveRef.current) return;
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;
    if (Math.abs(dy) > Math.abs(dx) * 1.35 && Math.abs(dx) < 16) return;

    // Swipe RIGHT advances to Main Seminar Cover; slight resistance when dragging left
    setDragDx(dx > 0 ? Math.min(240, dx) : Math.max(-28, dx * 0.14));
  };

  const finishPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragActiveRef.current) return;
    dragActiveRef.current = false;
    setIsDragging(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore release errors
    }

    const dx = e.clientX - startXRef.current;
    const elapsed = Math.max(1, performance.now() - startTimeRef.current);
    const velocity = dx / elapsed;
    const threshold = Math.min(84, window.innerWidth * 0.14);

    if (dx > threshold || (dx > 34 && velocity > 0.35)) {
      setDragDx(0);
      onEnterCover();
      return;
    }

    setDragDx(0);
  };

  const dragProgress = Math.max(0, Math.min(1, dragDx / 200));

  return (
    <section
      aria-label="Team 404 ERROR Introduction"
      aria-hidden={!isActive}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      onDragStart={(e) => e.preventDefault()}
      className={`fixed inset-0 z-30 flex flex-col items-center justify-between overflow-hidden select-none touch-pan-y cursor-grab active:cursor-grabbing ${
        isActive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      style={{
        opacity: isActive ? 1 - dragProgress * 0.25 : 0,
        transform: isActive
          ? `translate3d(${dragDx * 0.38}px, 0px, 0px) scale(${1 - dragProgress * 0.04})`
          : 'translate3d(-72px, 0px, -120px) scale(0.94)',
        transition: isDragging
          ? 'none'
          : 'transform 560ms cubic-bezier(0.22, 1, 0.36, 1), opacity 460ms ease',
      }}
    >
      {/* Quiet Top Indicator */}
      <div className="h-8 sm:h-10" aria-hidden="true" />

      {/* Large Standalone Centered White/Light-Blue Physical Presentation Sheet */}
      <div className="relative flex w-full flex-1 items-center justify-center px-4 py-2 sm:px-8 sm:py-4">
        <div
          className="relative flex w-full max-w-[920px] items-center justify-center overflow-hidden rounded-[18px] p-3 sm:rounded-[24px] sm:p-5"
          style={{
            background: 'linear-gradient(155deg, #ffffff 0%, #f8fbff 56%, #edf5fd 100%)',
            border: '1px solid rgba(2, 132, 199, 0.34)',
            boxShadow:
              '0 38px 88px -18px rgba(15, 45, 85, 0.22), 0 14px 34px -8px rgba(15, 45, 85, 0.12), 0 0 0 1px rgba(14, 165, 233, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.96)',
          }}
        >
          {/* Subtle inner architectural frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-2.5 rounded-[12px] border border-slate-900/[0.06] sm:inset-3.5 sm:rounded-[16px]"
          />

          {/* 4 subtle cyan corner brackets */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-2.5 h-3 w-3 rounded-tl-[6px] border-l-[1.5px] border-t-[1.5px] border-sky-600/45 sm:left-3.5 sm:top-3.5 sm:h-4 sm:w-4"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-2.5 h-3 w-3 rounded-tr-[6px] border-r-[1.5px] border-t-[1.5px] border-sky-600/45 sm:right-3.5 sm:top-3.5 sm:h-4 sm:w-4"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2.5 left-2.5 h-3 w-3 rounded-bl-[6px] border-b-[1.5px] border-l-[1.5px] border-sky-600/45 sm:bottom-3.5 sm:left-3.5 sm:h-4 sm:w-4"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2.5 right-2.5 h-3 w-3 rounded-br-[6px] border-b-[1.5px] border-r-[1.5px] border-sky-600/45 sm:bottom-3.5 sm:right-3.5 sm:h-4 sm:w-4"
          />

          <img
            src="/assets/aistudio/Futuristic_404_Error_Tech_Banner_e39ce6b8.png"
            alt="404 ERROR — Team Introduction"
            loading="eager"
            decoding="async"
            draggable={false}
            className="pointer-events-none relative z-10 h-auto max-h-[68vh] w-full rounded-[10px] object-contain select-none sm:rounded-[14px]"
          />
        </div>
      </div>

      {/* Simple Navigation CTA (Alternative to Swiping Right) */}
      <footer className="relative z-30 flex items-center justify-center px-4 pb-6 pt-1 sm:pb-9">
        <button
          type="button"
          onClick={onEnterCover}
          className="group inline-flex h-10 items-center gap-2.5 whitespace-nowrap rounded-full border border-slate-900/[0.11] bg-white/90 px-6 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-[#0b192c] shadow-[0_10px_28px_rgba(15,45,85,0.10)] transition hover:border-sky-500/55 hover:bg-white hover:text-sky-700 active:scale-[0.98]"
        >
          <span>Seminar Cover</span>
          <ArrowRight className="h-3.5 w-3.5 text-sky-600 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </footer>
    </section>
  );
}
