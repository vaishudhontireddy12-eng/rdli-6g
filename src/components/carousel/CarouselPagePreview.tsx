import { TOPIC_METADATA } from '../../data/paperData';

const PREVIEW_TAGS: Record<number, { category: string; title: string; subtitle: string }> = {
  0: {
    category: '01 · CONTEXT',
    title: 'INTRODUCTION & PROBLEM STATEMENT',
    subtitle: 'HARQ · RLC ARQ · TCP Loops',
  },
  1: {
    category: '02 · MECHANISMS',
    title: 'HARQ & RLC ARQ',
    subtitle: 'Soft Combining vs. Sliding Window',
  },
  2: {
    category: '03 · FORMULATION',
    title: 'RESIDUAL ERRORS & MATHEMATICAL MODEL',
    subtitle: 'NACK→ACK & DTX→ACK Analysis',
  },
  3: {
    category: '04 · TRANSPORT LAYER',
    title: 'TCP RENO & TCP CUBIC',
    subtitle: 'Window Recovery Under Leakage',
  },
  4: {
    category: '05 · METHODOLOGY',
    title: 'SIMULATION SETUP',
    subtitle: '21-Cell 3GPP Dense Urban · Table I',
  },
  5: {
    category: '06 · BASELINE RESULTS',
    title: 'HARQ VS L1 ARQ',
    subtitle: 'Empirical Throughput CDF · Fig. 2',
  },
  6: {
    category: '07 · CROSS-LAYER RESULTS',
    title: 'RESIDUAL ERRORS, RLC ARQ & THROUGHPUT',
    subtitle: '5×10⁻⁵ Threshold · Fig. 3 & Fig. 4',
  },
  7: {
    category: '08 · DELAY & CONTROL BUDGET',
    title: 'RESULTS & NETWORK DELAY',
    subtitle: '0–50 ms Sweep & P_da · Fig. 5 & Fig. 6',
  },
  8: {
    category: '09 · CONCLUSION',
    title: 'CONCLUSION & 6G RECOMMENDATIONS',
    subtitle: 'Control Targets & Lean 6G Stack',
  },
};

export interface CarouselPagePreviewProps {
  slideIndex: number;
  isSelected: boolean;
  dimmingAlpha?: number;
}

export function CarouselPagePreview({
  slideIndex,
  isSelected,
  dimmingAlpha = 0,
}: CarouselPagePreviewProps) {
  const total = TOPIC_METADATA.length;
  const totalPadded = String(total).padStart(2, '0');
  const meta = TOPIC_METADATA[slideIndex] ?? TOPIC_METADATA[0];
  const cfg = PREVIEW_TAGS[slideIndex] ?? {
    category: meta.category.toUpperCase(),
    title: meta.title.toUpperCase(),
    subtitle: meta.shortTitle,
  };

  return (
    <div
      className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[14px] text-[#0b192c] sm:rounded-[18px]"
      style={{
        background: 'linear-gradient(155deg, #ffffff 0%, #f8fbff 56%, #edf5fd 100%)',
        border: isSelected
          ? '1px solid rgba(2, 132, 199, 0.42)'
          : '1px solid rgba(15, 23, 42, 0.11)',
        boxShadow: isSelected
          ? '0 32px 72px -16px rgba(15, 45, 85, 0.22), 0 12px 28px -8px rgba(15, 45, 85, 0.12), 0 0 0 1px rgba(14, 165, 233, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.95)'
          : '0 20px 46px -14px rgba(15, 45, 85, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
      }}
    >
      {/* Soft top-left ambient sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(68% 58% at 24% 18%, rgba(56, 189, 248, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
        }}
      />

      {/* Thin elegant inner border */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-2.5 rounded-[9px] border border-slate-900/[0.06] sm:inset-3.5 sm:rounded-[11px]"
      />

      {/* Four subtle cyan corner brackets */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-2.5 h-2.5 w-2.5 rounded-tl-[4px] border-l-[1.5px] border-t-[1.5px] border-sky-600/45 sm:left-3.5 sm:top-3.5 sm:h-3 sm:w-3"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-tr-[4px] border-r-[1.5px] border-t-[1.5px] border-sky-600/45 sm:right-3.5 sm:top-3.5 sm:h-3 sm:w-3"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2.5 left-2.5 h-2.5 w-2.5 rounded-bl-[4px] border-b-[1.5px] border-l-[1.5px] border-sky-600/45 sm:bottom-3.5 sm:left-3.5 sm:h-3 sm:w-3"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2.5 right-2.5 h-2.5 w-2.5 rounded-br-[4px] border-b-[1.5px] border-r-[1.5px] border-sky-600/45 sm:bottom-3.5 sm:right-3.5 sm:h-3 sm:w-3"
      />

      {/* Minimalist Topic Cover Layout */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between px-6 py-5 sm:px-11 sm:py-8 lg:px-14 lg:py-10">
        {/* Top Row: Category + Page Number */}
        <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-700 sm:text-[11px] lg:text-xs">
          <span>{cfg.category}</span>
          <span className="font-mono tabular-nums text-slate-500">
            {meta.numberLabel} / {totalPadded}
          </span>
        </div>

        {/* Center Minimalist Heading & Typographic Index */}
        <div className="my-auto flex flex-col items-center text-center">
          <div className="mb-2.5 flex items-center gap-3 sm:mb-3.5">
            <span className="h-px w-6 bg-sky-600/35 sm:w-9" aria-hidden="true" />
            <span className="font-mono text-[10.5px] font-bold tracking-[0.22em] text-sky-700/85 sm:text-xs lg:text-[13px]">
              TOPIC {meta.numberLabel}
            </span>
            <span className="h-px w-6 bg-sky-600/35 sm:w-9" aria-hidden="true" />
          </div>

          <h2 className="max-w-[23ch] font-['Playfair_Display'] text-[18px] font-semibold leading-[1.18] tracking-tight text-[#0b192c] [text-wrap:balance] sm:text-[28px] lg:text-[34px] xl:text-[36px]">
            {cfg.title}
          </h2>

          <p className="mt-2 font-['Plus_Jakarta_Sans'] text-[11px] font-medium tracking-wide text-slate-500 sm:mt-3 sm:text-[13.5px] lg:text-[15px]">
            {cfg.subtitle}
          </p>

          <span
            aria-hidden="true"
            className="mt-3 h-[2px] w-12 rounded-full bg-gradient-to-r from-sky-500/20 via-sky-600/80 to-cyan-500/20 sm:mt-4 sm:w-16"
          />
        </div>

        {/* Quiet Bottom Accent Line */}
        <div className="flex items-center justify-between text-[8.5px] font-medium uppercase tracking-[0.22em] text-slate-400 sm:text-[10px]">
          <span>6G Wireless Seminar</span>
          <span className="font-mono tabular-nums text-sky-600/80">
            Page {meta.index + 1} of {total}
          </span>
        </div>
      </div>

      {/* Icy-white atmospheric depth veil for receding side sheets */}
      {dimmingAlpha > 0.01 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20"
          style={{ backgroundColor: `rgba(232, 242, 252, ${dimmingAlpha})` }}
        />
      )}
    </div>
  );
}
