import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { drawCoverSheetTexture } from '../../slides/coverTexture';
import {
  PAPER_AUTHOR_H,
  PAPER_AUTHOR_W,
  ThreeDPaper,
} from '../threeui/ThreeDPaper';

export interface CoverStageViewProps {
  isActive: boolean;
  level: 'team' | 'cover' | 'carousel';
  onEnterCarousel: () => void;
  onBackToTeam: () => void;
}

export function CoverStageView({
  isActive,
  level,
  onEnterCarousel,
  onBackToTeam,
}: CoverStageViewProps) {
  const [dragDx, setDragDx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragActiveRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);

  const fontLoads = useMemo(
    () => [
      '600 94px "Playfair Display"',
      '700 26px "Plus Jakarta Sans"',
      '600 25px "Plus Jakarta Sans"',
      '500 30px "Plus Jakarta Sans"',
      '500 18px "Plus Jakarta Sans"',
    ],
    [],
  );

  const drawCoverTexture = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      w: number = PAPER_AUTHOR_W,
      h: number = PAPER_AUTHOR_H,
    ) => {
      drawCoverSheetTexture(ctx, w, h);
    },
    [],
  );

  // Keyboard navigation: ArrowRight/Enter -> 9-topic carousel, ArrowLeft/Escape -> Team Intro
  useEffect(() => {
    if (!isActive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onEnterCarousel();
      } else if (e.key === 'ArrowLeft' || e.key === 'Escape') {
        e.preventDefault();
        onBackToTeam();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isActive, onBackToTeam, onEnterCarousel]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isActive) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, a')) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore synthetic events
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

    // Swipe RIGHT enters carousel; Swipe LEFT returns to 404 ERROR team page
    setDragDx(Math.max(-240, Math.min(240, dx)));
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
      onEnterCarousel();
      return;
    }

    if (dx < -threshold || (dx < -34 && velocity < -0.35)) {
      setDragDx(0);
      onBackToTeam();
      return;
    }

    setDragDx(0);
  };

  const dragProgress = Math.min(1, Math.abs(dragDx) / 200);
  const inactiveTransform =
    level === 'team'
      ? 'translate3d(72px, 0px, -120px) scale(0.94)'
      : 'translate3d(-72px, 0px, -120px) scale(0.94)';

  return (
    <section
      aria-label="Seminar Cover"
      aria-hidden={!isActive}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      onDragStart={(e) => e.preventDefault()}
      className={`fixed inset-0 z-20 flex flex-col items-center justify-between overflow-hidden select-none touch-pan-y ${
        isActive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      style={{
        opacity: isActive ? 1 - dragProgress * 0.25 : 0,
        transform: isActive
          ? `translate3d(${dragDx * 0.38}px, 0px, 0px) scale(${1 - dragProgress * 0.04})`
          : inactiveTransform,
        transition: isDragging
          ? 'none'
          : 'transform 560ms cubic-bezier(0.22, 1, 0.36, 1), opacity 460ms ease',
      }}
    >
      {/* Top-Left Subtle Back to Team Page Control */}
      <header className="relative z-30 flex w-full items-center justify-start px-4 pt-3 sm:px-6 sm:pt-4">
        <button
          type="button"
          onClick={onBackToTeam}
          aria-label="Return to Team 404 ERROR page"
          className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-900/[0.09] bg-white/85 px-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0b192c] shadow-[0_6px_18px_rgba(15,45,85,0.07)] transition hover:border-sky-500/50 hover:bg-white hover:text-sky-700"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-sky-600" />
          <span>Team</span>
        </button>
      </header>

      {/* Large Centered Animated White-Pearl 3D Cover Sheet */}
      <div className="relative flex w-full flex-1 items-center justify-center">
        <div className="h-[calc(100vh-116px)] w-full max-w-[1160px] sm:h-[calc(100vh-132px)]">
          <ThreeDPaper
            drawContent={drawCoverTexture}
            fontLoads={fontLoads}
            rimColor={0x0284c7}
            rimIntensity={0.34}
            touchLightColor={0xbae6fd}
            isActive={isActive}
            enableDragTurn={false}
            heightFill={0.93}
            widthFill={0.97}
          />
        </div>
      </div>

      {/* Subtle Bottom Explore CTA (Alternative to Swiping Right) */}
      <footer className="relative z-30 flex items-center justify-center px-4 pb-6 pt-1 sm:pb-9">
        <button
          type="button"
          onClick={onEnterCarousel}
          className="group inline-flex h-10 items-center gap-2.5 whitespace-nowrap rounded-full border border-slate-900/[0.11] bg-white/90 px-6 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-[#0b192c] shadow-[0_10px_28px_rgba(15,45,85,0.10)] transition hover:border-sky-500/55 hover:bg-white hover:text-sky-700 active:scale-[0.98]"
        >
          <span>Explore Topics</span>
          <ArrowRight className="h-3.5 w-3.5 text-sky-600 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </footer>
    </section>
  );
}
