import { SlideShell } from '../components/slides/SlideShell';
import type { SlideRenderProps } from './CoverSlide';

const MECHANISM_COMPARISON = [
  {
    feature: 'Protocol Layer',
    harq: 'PHY / MAC (L1/L2 boundary)',
    rlc: 'Radio Link Control (Upper L2)',
  },
  {
    feature: 'Loop Architecture',
    harq: '8 Asynchronous Stop-and-Wait processes',
    rlc: 'Sliding Window ARQ (Status PDU feedback)',
  },
  {
    feature: 'Error Recovery Method',
    harq: 'Chase Combining (soft-combines corrupted TBs, Gain = 0.95)',
    rlc: 'AM retransmits missing RLC PDUs; UM forwards with no L2 ReTX',
  },
  {
    feature: 'Max Retransmissions',
    harq: 'Max 6 HARQ retransmissions per Transport Block',
    rlc: 'Max 13 RLC retransmissions (in Acknowledged Mode)',
  },
  {
    feature: 'Control & Timer Mechanics',
    harq: 'Fast ACK/NACK feedback + 5 ms sub-band CQI + OLLA (0.1 BLER)',
    rlc: '25 ms Poll Retransmit Timer + 50 ms Reassembly Timer',
  },
  {
    feature: '6G Latency & Overhead Impact',
    harq: 'Low ms-scale loop; soft combining boosts post-combining SINR',
    rlc: 'AM adds polling stalls & head-of-line blocking; UM minimizes delay',
  },
];

export function Slide3HarqRlc({ isActive = true, turnOffset = 0 }: SlideRenderProps) {
  return (
    <SlideShell
      slideIndex={1}
      accentLabel="02 · Recovery Mechanisms"
      isActive={isActive}
      turnOffset={turnOffset}
    >
      <div className="space-y-5">
        {/* Two Side-by-Side Deep-Dive Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-sky-200 bg-[#f2f8fe] p-5">
            <div className="flex items-baseline justify-between border-b border-sky-200/80 pb-2.5">
              <h2 className="font-['Playfair_Display'] text-xl font-semibold text-[#0b192c]">
                PHY / MAC · HARQ
              </h2>
              <span className="font-mono text-xs font-semibold text-sky-700">
                Hybrid ARQ + Soft Combining
              </span>
            </div>
            <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-[#0b192c]">What is HARQ?</span> Hybrid Automatic
                Repeat Request combines standard ARQ retransmissions with Forward Error Correction
                (FEC) soft combining at the physical layer receiver.
              </li>
              <li>
                <span className="font-semibold text-[#0b192c]">Chase Combining (Gain = 0.95):</span>{' '}
                Instead of discarding failed packets, the UE buffers log-likelihood ratios (LLRs) and
                soft-combines retransmitted copies, raising effective SINR on every retry.
              </li>
              <li>
                <span className="font-semibold text-[#0b192c]">Parallelism &amp; Budget:</span>{' '}
                Uses <span className="font-mono font-semibold text-sky-700">8</span> asynchronous
                stop-and-wait processes with up to{' '}
                <span className="font-mono font-semibold text-sky-700">6</span> retransmissions per
                transport block to hide feedback turnaround idle time.
              </li>
              <li>
                <span className="font-semibold text-[#0b192c]">OLLA &amp; Link Adaptation:</span>{' '}
                Outer Loop Link Adaptation adjusts MCS around UE ACK/NACK and{' '}
                <span className="font-mono font-semibold text-sky-700">5 ms</span> sub-band CQI
                reports to maintain a{' '}
                <span className="font-mono font-semibold text-sky-700">0.1</span> (10%) first-transmission
                BLER target.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-baseline justify-between border-b border-slate-200 pb-2.5">
              <h2 className="font-['Playfair_Display'] text-xl font-semibold text-[#0b192c]">
                Layer 2 · RLC ARQ (AM vs. UM)
              </h2>
              <span className="font-mono text-xs font-medium text-slate-600">
                Sliding Window &amp; Timers
              </span>
            </div>
            <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-[#0b192c]">Unacknowledged Mode (UM):</span>{' '}
                Performs segmentation/reassembly without L2 retransmissions — lowest signaling
                overhead and zero timer-induced stalls, leaving rare losses to upper layers.
              </li>
              <li>
                <span className="font-semibold text-[#0b192c]">Acknowledged Mode (AM):</span>{' '}
                Provides an outer sliding-window ARQ loop catching residual blocks escaped from
                HARQ (<span className="font-mono font-semibold text-sky-700">Max ReTX = 13</span>).
              </li>
              <li>
                <span className="font-semibold text-[#0b192c]">Timer Overhead:</span> Relies on{' '}
                <span className="font-mono font-semibold text-sky-700">25 ms</span> Poll Retransmit
                and <span className="font-mono font-semibold text-sky-700">50 ms</span> Reassembly
                timers plus Status PDU exchange — creating latency jitter during out-of-order
                delivery.
              </li>
              <li>
                <span className="font-semibold text-[#0b192c]">Cross-Layer Interaction:</span>{' '}
                When RLC AM blocks in-order delivery to recover a single PDU, bursty delays and
                TCP ACK compression can reduce upper-layer efficiency if HARQ is already reliable.
              </li>
            </ul>
          </div>
        </div>

        {/* Structured Technical Comparison Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-[#f8fbff] px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0b192c]">
              Side-by-Side Technical Comparison · HARQ vs. RLC ARQ
            </span>
            <span className="font-mono text-[11px] font-medium text-sky-700">
              Paper Baseline Configuration (Table I)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="px-4 py-2.5">Attribute</th>
                  <th className="px-4 py-2.5 text-sky-800">PHY/MAC HARQ</th>
                  <th className="px-4 py-2.5 text-[#0b192c]">Layer 2 RLC ARQ (AM / UM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MECHANISM_COMPARISON.map((row) => (
                  <tr key={row.feature} className="hover:bg-[#f8fbff]">
                    <td className="px-4 py-2.5 font-semibold text-[#0b192c]">{row.feature}</td>
                    <td className="px-4 py-2.5 text-slate-700">{row.harq}</td>
                    <td className="px-4 py-2.5 text-slate-700">{row.rlc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seminar Key Takeaway */}
        <div className="rounded-xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-xs leading-relaxed text-slate-700 sm:text-[13px]">
          <span className="font-semibold text-sky-700">Seminar Takeaway:</span> HARQ recovers
          typical noisy wireless blocks rapidly at the physical layer using Chase soft combining,
          whereas RLC AM only justifies its 25 ms / 50 ms timer overhead when significant residual
          errors leak upward past HARQ.
        </div>
      </div>
    </SlideShell>
  );
}
