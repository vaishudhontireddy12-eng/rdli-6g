import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { SixGWirelessBackdrop } from './components/background/SixGWirelessBackdrop';
import {
  Carousel3DView,
  type OriginRect,
  type ViewPhase,
} from './components/carousel/Carousel3DView';
import { CoverStageView } from './components/cover/CoverStageView';
import { FullscreenSlideView } from './components/slides/FullscreenSlideView';
import { TeamIntroStageView } from './components/team/TeamIntroStageView';
import { TOPIC_SLIDES } from './slides/slides';

type PresentationLevel = 'team' | 'cover' | 'carousel';

const OPEN_MORPH_MS = 640;
const CLOSE_MORPH_MS = 560;

export default function App() {
  const [level, setLevel] = useState<PresentationLevel>('team');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewPhase, setViewPhase] = useState<ViewPhase>('carousel');
  const [originRect, setOriginRect] = useState<OriginRect | undefined>(undefined);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);

  const phaseTimerRef = useRef<number | null>(null);

  const clearPhaseTimer = useCallback(() => {
    if (phaseTimerRef.current !== null) {
      window.clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearPhaseTimer();
  }, [clearPhaseTimer]);

  // Sync browser Fullscreen Presentation Mode state
  useEffect(() => {
    const syncFullscreen = () => {
      setIsBrowserFullscreen(Boolean(document.fullscreenElement));
    };
    syncFullscreen();
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  const toggleBrowserFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore if fullscreen is blocked by embed permissions
    }
  }, []);

  // Keyboard shortcut: press "F" anywhere to toggle browser Fullscreen Presentation Mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if ((e.key === 'f' || e.key === 'F') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        void toggleBrowserFullscreen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleBrowserFullscreen]);

  // Screen 1 (Team 404 ERROR) -> Screen 2 (Main Seminar Cover)
  const handleEnterCover = useCallback(() => {
    clearPhaseTimer();
    setViewPhase('carousel');
    setOriginRect(undefined);
    setLevel('cover');
  }, [clearPhaseTimer]);

  // Screen 2 (Main Seminar Cover) -> Screen 1 (Team 404 ERROR)
  const handleBackToTeam = useCallback(() => {
    clearPhaseTimer();
    setViewPhase('carousel');
    setOriginRect(undefined);
    setLevel('team');
  }, [clearPhaseTimer]);

  // Screen 2 (Main Seminar Cover) -> Screen 3 (9-Topic 3D Carousel)
  const handleEnterCarousel = useCallback(() => {
    clearPhaseTimer();
    setViewPhase('carousel');
    setOriginRect(undefined);
    setLevel('carousel');
  }, [clearPhaseTimer]);

  // Screen 3 (9-Topic 3D Carousel) -> Screen 2 (Main Seminar Cover)
  const handleBackToCover = useCallback(() => {
    clearPhaseTimer();
    setViewPhase('carousel');
    setOriginRect(undefined);
    setLevel('cover');
  }, [clearPhaseTimer]);

  // Screen 3 Carousel Sheet -> Animated Opening -> Detailed Vertically Scrollable Topic Fullscreen
  const handleOpenSlide = useCallback(
    (idx: number, rect?: OriginRect) => {
      clearPhaseTimer();
      setSelectedIndex(idx);
      setOriginRect(rect);
      setViewPhase('opening');
      phaseTimerRef.current = window.setTimeout(() => {
        setViewPhase('fullscreen');
        phaseTimerRef.current = null;
      }, OPEN_MORPH_MS);
    },
    [clearPhaseTimer],
  );

  // Detailed Topic Fullscreen -> Animated Closing -> Screen 3 Carousel at same selectedIndex
  const handleCloseSlide = useCallback(() => {
    if (viewPhase === 'closing' || viewPhase === 'carousel') return;
    clearPhaseTimer();
    setViewPhase('closing');
    phaseTimerRef.current = window.setTimeout(() => {
      setViewPhase('carousel');
      setOriginRect(undefined);
      phaseTimerRef.current = null;
    }, CLOSE_MORPH_MS);
  }, [clearPhaseTimer, viewPhase]);

  const showFullscreenSlide = level === 'carousel' && viewPhase !== 'carousel';

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#eef5fc] text-[#0b192c]">
      {/* Subtle 6G wireless waves, glowing nodes, and icy-blue futuristic ambient background */}
      <SixGWirelessBackdrop />

      {/* Browser Fullscreen Presentation Mode Button for Screen 1 & Screen 2 */}
      {level !== 'carousel' && (
        <button
          type="button"
          onClick={() => void toggleBrowserFullscreen()}
          aria-label={
            isBrowserFullscreen
              ? 'Exit fullscreen presentation mode'
              : 'Enter fullscreen presentation mode'
          }
          title={isBrowserFullscreen ? 'Exit Fullscreen (F)' : 'Present Fullscreen (F)'}
          className="fixed right-4 top-3 z-40 inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-900/[0.09] bg-white/85 px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0b192c] shadow-[0_6px_18px_rgba(15,45,85,0.07)] transition hover:border-sky-500/50 hover:bg-white hover:text-sky-700 sm:right-6 sm:top-4"
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

      {/* SCREEN 1 — Separate 404 ERROR Team Introduction */}
      <TeamIntroStageView
        isActive={level === 'team'}
        onEnterCover={handleEnterCover}
      />

      {/* SCREEN 2 — Separate Main Seminar Cover */}
      <CoverStageView
        isActive={level === 'cover'}
        level={level}
        onEnterCarousel={handleEnterCarousel}
        onBackToTeam={handleBackToTeam}
      />

      {/* SCREEN 3 — Animated 3D Curved Horizontal Carousel of All 9 Topics */}
      <Carousel3DView
        isLevelActive={level === 'carousel'}
        selectedIndex={selectedIndex}
        viewPhase={viewPhase}
        onSelectIndex={setSelectedIndex}
        onOpenSlide={handleOpenSlide}
        onBackToCover={handleBackToCover}
        isBrowserFullscreen={isBrowserFullscreen}
        onToggleBrowserFullscreen={toggleBrowserFullscreen}
      />

      {/* Animated Topic Opening -> Detailed Vertically Scrollable Fullscreen Content */}
      {showFullscreenSlide && (
        <FullscreenSlideView
          slides={TOPIC_SLIDES}
          activeIndex={selectedIndex}
          viewPhase={viewPhase}
          originRect={originRect}
          onChangeIndex={setSelectedIndex}
          onClose={handleCloseSlide}
          isBrowserFullscreen={isBrowserFullscreen}
          onToggleBrowserFullscreen={toggleBrowserFullscreen}
        />
      )}
    </div>
  );
}
