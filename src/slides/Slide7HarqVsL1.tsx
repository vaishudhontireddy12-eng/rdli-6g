import { OriginalPdfFigure } from '../components/slides/OriginalPdfFigure';
import { SlideShell } from '../components/slides/SlideShell';
import type { SlideRenderProps } from './CoverSlide';

export function Slide7HarqVsL1({ isActive = true, turnOffset = 0 }: SlideRenderProps) {
  return (
    <SlideShell
      slideIndex={5}
      accentLabel="06 · Baseline Results (Fig. 2)"
      isActive={isActive}
      turnOffset={turnOffset}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left: Original Fig. 2 directly from Research Paper PDF */}
          <div className="lg:col-span-7">
            <OriginalPdfFigure
              src="/assets/figures/fig2.png"
              figureLabel="Fig. 2 · HARQ vs. L1 ARQ Throughput CDF"
              sourcePage="Page 5"
              alt="Original Fig. 2 from paper showing empirical CDF of user throughput for L1 ARQ and HARQ with BLER targets 0.1 and 1e-5"
              caption="Fig. 2 from Uyoata et al. (2024): Empirical CDF of user throughput (Mbps) comparing L1 ARQ (without soft combining) against HARQ (Chase combining gain = 0.95) at 0.1 and 10⁻⁵ initial BLER targets (TCP CUBIC, 10 ms delay)."
            >
              <div className="grid grid-cols-1 gap-2 text-xs leading-relaxed text-slate-700 sm:grid-cols-2">
                <div>
                  <span className="font-semibold text-[#0b192c]">Axes &amp; Metric:</span> X-axis is
                  User Throughput (0–120 Mbps); Y-axis is Empirical CDF (fraction of UE drops ≤
                  given throughput).
                </div>
                <div>
                  <span className="font-semibold text-[#0b192c]">4 Compared Curves:</span> L1 ARQ
                  (BLER = 0.1 &amp; 10⁻⁵, upper-left curves) vs. HARQ (BLER = 0.1 &amp; 10⁻⁵,
                  right-shifted curves).
                </div>
              </div>
            </OriginalPdfFigure>
          </div>

          {/* Right: Detailed Quantitative Findings & Technical Explanation */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-xl border border-sky-200 bg-[#f2f8fe] p-4">
              <div className="font-mono text-2xl font-bold tabular-nums text-sky-700">&gt; 66%</div>
              <div className="mt-1 text-sm font-semibold text-[#0b192c]">
                50th-Percentile (Median) Throughput Gain
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">
                HARQ delivers{' '}
                <span className="font-mono font-semibold text-sky-700">~64–68 Mbps</span> median
                throughput versus{' '}
                <span className="font-mono font-semibold text-rose-700">~37–43 Mbps</span> for ideal
                L1 ARQ without soft combining — proving Chase combining is indispensable for 6G
                spectral efficiency.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="font-mono text-2xl font-bold tabular-nums text-[#0b192c]">
                ~25–27 vs. ~0 Mbps
              </div>
              <div className="mt-1 text-sm font-semibold text-[#0b192c]">
                5th-Percentile (Cell-Edge) User Survival
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">
                Under L1 ARQ, roughly <span className="font-mono font-semibold">15%</span> of low-SINR
                cell-edge UEs collapse near{' '}
                <span className="font-mono font-semibold text-rose-700">0 Mbps</span> because
                discarding failed blocks prevents packets from ever passing CRC. Chase combining
                accumulates SNR across retries to sustain{' '}
                <span className="font-mono font-semibold text-sky-700">~25–27 Mbps</span> at the 5th
                percentile.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200/90 bg-amber-50/55 p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-800">
                Why Lowering Initial BLER to 10⁻⁵ Does Not Fix L1 ARQ
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">
                Forcing initial BLER from <span className="font-mono font-semibold">0.1</span> down
                to <span className="font-mono font-semibold">10⁻⁵</span> forces link adaptation to
                pick ultra-conservative, low-rate MCS levels. The resulting spectral-efficiency
                penalty leaves L1 ARQ far behind HARQ across almost the entire CDF.
              </p>
            </div>
          </div>
        </div>

        {/* Seminar Key Takeaway */}
        <div className="rounded-xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-[13px] leading-relaxed text-slate-700">
          <span className="font-semibold text-sky-700">Key Seminar Answer:</span> Should 6G drop
          HARQ soft combining in favor of single-shot ultra-low-BLER transmission (L1 ARQ)?{' '}
          <span className="font-semibold text-[#0b192c]">No</span> — Fig. 2 proves HARQ combining
          must be retained; any simplification in 6G should instead target removing upper-layer RLC
          ARQ overhead once <span className="font-mono font-semibold">P_re &lt; 5×10⁻⁵</span>.
        </div>
      </div>
    </SlideShell>
  );
}
