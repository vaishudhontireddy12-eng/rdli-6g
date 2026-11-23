import { OriginalPdfFigure } from '../components/slides/OriginalPdfFigure';
import { SlideShell } from '../components/slides/SlideShell';
import type { SlideRenderProps } from './CoverSlide';

const OPERATING_REGIMES = [
  {
    regime: 'Regime I · Safe Operating Zone',
    range: 'P_re < 5×10⁻⁶',
    throughput: '67.1 – 68.7 Mbps',
    amGain: '< 1% AM delta',
    verdict: 'RLC ARQ redundant; UM achieves near-offered-load parity without timer jitter.',
    tone: 'border-sky-200 bg-[#f2f8fe]',
    metricTone: 'text-sky-700',
  },
  {
    regime: 'Regime II · Reliability Tipping Point',
    range: 'P_re ≈ 5×10⁻⁵',
    throughput: '58.3 – 61.5 Mbps',
    amGain: '~4–5% AM lift',
    verdict: 'Boundary where residual radio errors begin cutting TCP congestion windows.',
    tone: 'border-amber-200 bg-amber-50/55',
    metricTone: 'text-amber-700',
  },
  {
    regime: 'Regime III · Control-Channel Collapse',
    range: 'P_re ≥ 5×10⁻⁴',
    throughput: '34.4 – 47.6 Mbps',
    amGain: '≥ 5–8% AM lift',
    verdict: 'PDCCH misses & DTX→ACK false alarms stall TCP; AM rescues partially but cannot match low P_re.',
    tone: 'border-rose-200 bg-rose-50/45',
    metricTone: 'text-rose-700',
  },
];

export function Slide8Analysis({ isActive = true, turnOffset = 0 }: SlideRenderProps) {
  return (
    <SlideShell
      slideIndex={7}
      accentLabel="08 · Results & Network Delay (Fig. 5 & Fig. 6)"
      isActive={isActive}
      turnOffset={turnOffset}
    >
      <div className="space-y-6">
        {/* Two Original PDF Figures: Fig. 5 (Delay Sweep) & Fig. 6 (P_na vs P_da Contours) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <OriginalPdfFigure
              src="/assets/figures/fig5.png"
              figureLabel="Fig. 5 · Network Delay Sweep (0–50 ms)"
              sourcePage="Page 5"
              alt="Original Fig. 5 from paper showing throughput versus network delay from 0 to 50 ms for AM and UM at residual error rates 2e-6 and 8e-5"
              caption="Fig. 5 from Uyoata et al. (2024): Throughput vs. one-way network delay (0–50 ms, TCP CUBIC) comparing RLC AM vs. UM at low (2×10⁻⁶) and elevated (8×10⁻⁵) residual error rates."
            >
              <ul className="space-y-1.5 text-xs leading-relaxed text-slate-700">
                <li>
                  <span className="font-semibold text-[#0b192c]">Expected RTT Decay:</span> Higher
                  delay slows TCP <span className="font-mono">cwnd</span> growth — e.g.,{' '}
                  <span className="font-mono font-semibold text-sky-700">AM (2×10⁻⁶)</span> drops
                  from <span className="font-mono font-semibold">~315 Mbps</span> at 0 ms to{' '}
                  <span className="font-mono font-semibold">~207 Mbps</span> at 50 ms.
                </li>
                <li>
                  <span className="font-semibold text-[#0b192c]">Delay-Invariant Threshold:</span>{' '}
                  At <span className="font-mono">P_re = 2×10⁻⁶</span>, the AM vs. UM gap remains
                  small across 0–50 ms (and virtually vanishes at 40 ms), confirming that{' '}
                  <span className="font-mono font-semibold text-sky-700">P_re &lt; 5×10⁻⁵</span>{' '}
                  holds regardless of core network delay.
                </li>
              </ul>
            </OriginalPdfFigure>
          </div>

          <div className="lg:col-span-6">
            <OriginalPdfFigure
              src="/assets/figures/fig6.png"
              figureLabel="Fig. 6 · P_na vs. P_da ARQ Gain Contours"
              sourcePage="Page 6"
              alt="Original Fig. 6 from paper plotting DTX-to-ACK error rate P_da versus NACK-to-ACK error rate P_na with ARQ gain contours (<1%, <5%, <10%, <20%)"
              caption="Fig. 6 from Uyoata et al. (2024): Throughput degradation contour map without RLC ARQ as a function of NACK→ACK (P_na) and DTX→ACK (P_da), assuming P_ch = 1% and P_i = 10%."
            >
              <ul className="space-y-1.5 text-xs leading-relaxed text-slate-700">
                <li>
                  <span className="font-semibold text-[#0b192c]">4 Contour Bands:</span> White (
                  <span className="font-mono font-semibold text-sky-700">ARQ gain &lt; 1%</span>),
                  Dark Blue (<span className="font-mono">&lt; 5%</span>), Blue (
                  <span className="font-mono">&lt; 10%</span>), and Dark Red (
                  <span className="font-mono text-rose-700">&lt; 20%</span>).
                </li>
                <li>
                  <span className="font-semibold text-[#0b192c]">P_da Dominates the Budget:</span>{' '}
                  Keeping <span className="font-mono">NACK→ACK</span> below{' '}
                  <span className="font-mono font-semibold">5×10⁻³</span> is feasible, whereas{' '}
                  <span className="font-mono font-semibold text-sky-700">DTX→ACK (P_da)</span> and
                  missed PDCCH grants (<span className="font-mono font-semibold">P_ch</span>) drive
                  steep horizontal boundary crossings — making{' '}
                  <span className="font-mono font-semibold text-sky-700">P_ch &lt; 1%</span> a
                  priority for 6G.
                </li>
              </ul>
            </OriginalPdfFigure>
          </div>
        </div>

        {/* Three Operating Regimes Summary Row */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {OPERATING_REGIMES.map((item) => (
            <div key={item.regime} className={`rounded-xl border p-4 ${item.tone}`}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0b192c]">
                {item.regime}
              </div>
              <div className={`mt-1.5 font-mono text-lg font-bold tabular-nums ${item.metricTone}`}>
                {item.range}
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-slate-900/10 pt-2 text-xs">
                <span className="text-slate-600">User Rate</span>
                <span className="font-mono font-semibold tabular-nums text-[#0b192c]">
                  {item.throughput}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-xs">
                <span className="text-slate-600">RLC AM Gain</span>
                <span className={`font-mono font-semibold tabular-nums ${item.metricTone}`}>
                  {item.amGain}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">{item.verdict}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}
