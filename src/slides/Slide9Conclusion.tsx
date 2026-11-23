import { SlideShell } from '../components/slides/SlideShell';
import type { SlideRenderProps } from './CoverSlide';

const RECOMMENDATIONS = [
  {
    num: '01',
    title: 'Preserve PHY/MAC HARQ Combining',
    metric: '> 66% Median Gain',
    body: 'Soft Chase combining (Gain = 0.95) cannot be traded for conservative BLER targets; removing it collapses 5th-percentile cell-edge user throughput from ~25–27 Mbps down to ~0 Mbps (Fig. 2).',
  },
  {
    num: '02',
    title: 'Maintain Residual Error P_re < 5×10⁻⁵',
    metric: 'Performance Plateau',
    body: 'Below P_re = 5×10⁻⁵ (and flat near ~68 Mbps below 5×10⁻⁶), leaked block losses are sparse enough that TCP Reno and CUBIC run near offered load without upper-layer rescue (Fig. 3 & Fig. 4).',
  },
  {
    num: '03',
    title: 'Disable RLC ARQ (Use UM) When Target Holds',
    metric: '0–50 ms Delay Invariant',
    body: 'Across all tested core delays (0–50 ms), RLC AM provides < 1% gain at low P_re while adding 25 ms poll and 50 ms reassembly latency overhead — enabling a leaner L2 stack with RLC UM (Fig. 5).',
  },
  {
    num: '04',
    title: 'Harden PDCCH (P_ch < 1%) & DTX→ACK (P_da)',
    metric: 'Primary Leak Control',
    body: 'NACK→ACK (P_na < 5×10⁻³) is readily achieved, whereas missed scheduling grants (P_ch) coupled with DTX→ACK false alarms (P_da) dominate residual error probability in Eq. (2) and Fig. 6.',
  },
  {
    num: '05',
    title: 'Explore Packet-Level Coding for ~10 ms Services',
    metric: 'Latency-Critical 6G',
    body: 'For stringent ~10 ms ultra-low-latency 6G links where P_re < 5×10⁻⁵ cannot always be guaranteed, replace timer-stalling reactive RLC ARQ with proactive packet-level coding (as noted in ref. [19]).',
  },
];

export function Slide9Conclusion({ isActive = true, turnOffset = 0 }: SlideRenderProps) {
  return (
    <SlideShell
      slideIndex={8}
      accentLabel="09 · Conclusion & 6G Recommendations"
      isActive={isActive}
      turnOffset={turnOffset}
    >
      <div className="space-y-5">
        {/* Five Numbered Architectural Recommendations */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {RECOMMENDATIONS.map((item, idx) => (
            <div
              key={item.num}
              className={`rounded-xl border border-slate-200 bg-white p-4 sm:p-5 transition-colors hover:border-sky-300 ${
                idx === RECOMMENDATIONS.length - 1 ? 'sm:col-span-2' : ''
              }`}
            >
              <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="font-mono text-xs font-bold text-sky-700">
                  RECOMMENDATION {item.num}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-600">
                  {item.metric}
                </span>
              </div>
              <h2 className="mt-2.5 font-['Playfair_Display'] text-lg font-semibold text-[#0b192c] sm:text-xl">
                {item.title}
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">{item.body}</p>
            </div>
          ))}
        </div>

        {/* Concluding Seminar Synthesis Banner */}
        <div className="rounded-xl border border-sky-200 bg-[#f2f8fe] p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">
                Conclusion · Leaner, Faster 6G Recovery Architecture
              </div>
              <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-[#0b192c]">
                Redundant cross-layer recovery loops carry tangible latency and complexity costs.
                Pairing <span className="font-semibold text-sky-800">HARQ Chase combining</span>{' '}
                with{' '}
                <span className="font-semibold text-sky-800">
                  tighter PDCCH / DTX→ACK reliability (P_re &lt; 5×10⁻⁵)
                </span>{' '}
                allows 6G networks to retire legacy L2 RLC ARQ, minimize delay jitter, and sustain
                full TCP throughput.
              </p>
            </div>

            <div className="shrink-0 border-t border-sky-200/80 pt-3 text-left sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 sm:text-right">
              <div className="text-xs font-bold text-[#0b192c]">Presented by Team of 9</div>
              <div className="mt-0.5 text-[11px] text-slate-600">
                Source: Uyoata et al. (2024) · arXiv:2404.07579
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
