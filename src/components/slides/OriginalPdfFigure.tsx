import type { ReactNode } from 'react';

export interface OriginalPdfFigureProps {
  src: string;
  figureLabel: string;
  sourcePage: string;
  caption: string;
  alt: string;
  maxWidthClass?: string;
  children?: ReactNode;
}

export function OriginalPdfFigure({
  src,
  figureLabel,
  sourcePage,
  caption,
  alt,
  maxWidthClass = 'max-w-full',
  children,
}: OriginalPdfFigureProps) {
  return (
    <figure className="flex flex-col rounded-xl border border-slate-200/95 bg-[#f8fbff] p-3.5 sm:p-4">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0b192c]">
          {figureLabel}
        </span>
        <span className="rounded border border-sky-200 bg-sky-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-800">
          Original PDF · {sourcePage}
        </span>
      </div>

      <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 sm:p-3">
        <img
          src={src}
          alt={alt}
          loading="eager"
          decoding="async"
          className={`h-auto w-full ${maxWidthClass} rounded object-contain select-none`}
        />
      </div>

      <figcaption className="mt-2.5 text-xs leading-relaxed text-slate-700">
        {caption}
      </figcaption>

      {children ? <div className="mt-2.5 border-t border-slate-200/80 pt-2.5">{children}</div> : null}
    </figure>
  );
}
