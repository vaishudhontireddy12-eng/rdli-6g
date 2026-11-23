import { OriginalPdfFigure } from '../components/slides/OriginalPdfFigure';
import { SlideShell } from '../components/slides/SlideShell';
import type { SlideRenderProps } from './CoverSlide';

export function Slide8Results({ isActive = true, turnOffset = 0 }: SlideRenderProps) {
  return (
    <SlideShell
      slideIndex={6}
      accentLabel="07 · Residual Errors, RLC ARQ & Throughput (Fig. 3 & Fig. 4)"
      isActive={isActive}
      turnOffset={turnOffset}
    >
      <div className="space-y-6">
        {/* Two Original PDF Graphs Side-by-Side (Stacked on Mobile) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <OriginalPdfFigure
              src="/assets/figures/fig3.png"
              figureLabel="Fig. 3 · Average User Throughput vs. P_re"
              sourcePage="Page 5"
              alt="Original Fig. 3 from paper showing average user throughput (Mbps) versus HARQ residual error rate P_re for UM+Reno, AM+Reno, UM+CUBIC, and AM+CUBIC"
              caption="Fig. 3 from Uyoata et al. (2024): Session-averaged user throughput (30–70 Mbps) across log-scale HARQ residual error rates P_re (10⁻⁶ to 10⁻¹) with TCP Reno and CUBIC."
            >
              <ul className="space-y-1.5 text-xs leading-relaxed text-slate-700">
                <li>
                  <span className="font-semibold text-[#0b192c]">Flat Plateau (&le; 5×10⁻⁶):</span>{' '}
                  All 4 curves converge near{' '}
                  <span className="font-mono font-semibold text-sky-700">67–69 Mbps</span> (near
                  the 70 Mbps offered load); RLC AM gain over UM is negligible (&lt; 1%).
                </li>
                <li>
                  <span className="font-semibold text-[#0b192c]">Collapse (&gt; 5×10⁻⁵):</span>{' '}
                  Throughput falls sharply toward{' '}
                  <span className="font-mono font-semibold text-amber-700">34–48 Mbps</span> as TCP
                  halves <span className="font-mono">cwnd</span> on leaked losses; AM recovers{' '}
                  <span className="font-mono font-semibold text-sky-700">≥ 5%</span> over UM.
                </li>
              </ul>
            </OriginalPdfFigure>
          </div>

          <div className="lg:col-span-6">
            <OriginalPdfFigure
              src="/assets/figures/fig4.png"
              figureLabel="Fig. 4 · Throughput per FTP Packet vs. P_re"
              sourcePage="Page 5"
              alt="Original Fig. 4 from paper showing average throughput per FTP packet (Mbps) versus HARQ residual error rate P_re for UM+Reno, AM+Reno, UM+CUBIC, and AM+CUBIC"
              caption="Fig. 4 from Uyoata et al. (2024): Active per-FTP3-packet throughput (50–300 Mbps) versus residual error rate P_re across the four RLC/TCP combinations."
            >
              <ul className="space-y-1.5 text-xs leading-relaxed text-slate-700">
                <li>
                  <span className="font-semibold text-[#0b192c]">CUBIC Peak Burst Speed:</span>{' '}
                  <span className="font-mono font-semibold text-sky-700">AM + CUBIC</span> achieves{' '}
                  <span className="font-mono font-semibold">~295 Mbps</span> and{' '}
                  <span className="font-mono font-semibold">UM + CUBIC ~290 Mbps</span> below{' '}
                  <span className="font-mono">5×10⁻⁶</span>, versus{' '}
                  <span className="font-mono">~232–242 Mbps</span> for Reno.
                </li>
                <li>
                  <span className="font-semibold text-[#0b192c]">Consistent Tipping Point:</span>{' '}
                  Like Fig. 3, active per-packet speed drops steeply once{' '}
                  <span className="font-mono font-semibold text-amber-700">
                    P_re &gt; 5×10⁻⁵
                  </span>
                  , sliding down to <span className="font-mono">~100–150 Mbps</span> at{' '}
                  <span className="font-mono">10⁻²</span>.
                </li>
              </ul>
            </OriginalPdfFigure>
          </div>
        </div>

        {/* Three-Column Quantitative Interpretation */}
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
          <div className="border-l-2 border-sky-600 pl-3.5">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-800">
              1 · The 5×10⁻⁵ Threshold
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-700">
              For <span className="font-mono font-semibold text-sky-700">P_re &lt; 5×10⁻⁵</span>,
              leaked block losses are rare enough that TCP sustains high throughput without L2 RLC
              AM retransmissions — justifying a simpler UM stack.
            </p>
          </div>

          <div className="border-l-2 border-amber-600 pl-3.5">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
              2 · Why RLC AM Helps Only Above 5×10⁻⁵
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-700">
              At <span className="font-mono font-semibold">P_re ≥ 5×10⁻⁴</span>, unrecovered radio
              blocks frequently trigger TCP fast-retransmit and timeout stalls. RLC AM shields TCP by
              retransmitting lost PDUs at L2, recovering ≥ 5% user rate.
            </p>
          </div>

          <div className="border-l-2 border-emerald-600 pl-3.5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              3 · Reno vs. CUBIC Paradox Explained
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-700">
              CUBIC dominates active per-packet bursts (Fig. 4), draining 35 MB FTP files faster;
              that extra idle wait between 0.25 pkt/s arrivals lets Reno edge out CUBIC in Fig. 3
              session-averaged throughput.
            </p>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
