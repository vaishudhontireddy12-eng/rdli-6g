import { SlideShell } from '../components/slides/SlideShell';
import type { SlideRenderProps } from './CoverSlide';

const TCP_SPEC_ROWS = [
  {
    param: 'Congestion Control Algorithm',
    reno: 'Classic Linear AIMD (RFC 5681)',
    cubic: 'Cubic time-dependent window growth',
  },
  {
    param: 'Initial Window / MSS / ssthresh',
    reno: '3 MSS · 1500 Bytes · 500 MSS',
    cubic: '3 MSS · 1500 Bytes · 500 MSS',
  },
  {
    param: 'Growth & Backoff Parameters',
    reno: '+1 MSS per RTT; halves cwnd (0.5×) on 3 dup-ACKs',
    cubic: 'β = 0.2 (multiplicative decrease), C = 0.4 (scaling factor)',
  },
  {
    param: 'Per-FTP3 Packet Throughput (Fig. 4)',
    reno: '~232 – 242 Mbps at low P_re',
    cubic: '~290 – 295 Mbps at low P_re (faster burst completion)',
  },
  {
    param: 'Time-Avg User Throughput (Fig. 3)',
    reno: '~68.1 – 68.7 Mbps plateau; +1.6–2.4 Mbps edge at higher P_re',
    cubic: '~67.1 – 68.3 Mbps plateau; lower session avg due to longer idle gaps',
  },
];

export function Slide5Tcp({ isActive = true, turnOffset = 0 }: SlideRenderProps) {
  return (
    <SlideShell
      slideIndex={3}
      accentLabel="04 · Transport Layer Dynamics"
      isActive={isActive}
      turnOffset={turnOffset}
    >
      <div className="space-y-5">
        {/* Two Protocol Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-baseline justify-between border-b border-slate-200 pb-2.5">
              <h2 className="font-['Playfair_Display'] text-xl font-semibold text-[#0b192c]">
                TCP Reno (RFC 5681)
              </h2>
              <span className="font-mono text-xs font-medium text-slate-600">
                Linear AIMD · Init cwnd = 3 MSS
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-[#0b192c]">Slow Start &amp; AIMD:</span> Doubles{' '}
                <span className="font-mono font-semibold text-sky-700">cwnd</span> from{' '}
                <span className="font-mono font-semibold text-sky-700">3 MSS</span> (1500 B MSS) up
                to loss or <span className="font-mono">ssthresh = 500 MSS</span>, then increments
                linearly by +1 MSS per RTT.
              </li>
              <li>
                <span className="font-semibold text-[#0b192c]">Loss Misinterpretation:</span>{' '}
                Cannot distinguish wireless residual errors (<span className="font-mono">P_re</span>)
                from router buffer congestion; halves <span className="font-mono">cwnd</span> on
                triple duplicate ACKs.
              </li>
              <li>
                <span className="font-semibold text-[#0b192c]">Observed Behavior (Fig. 3):</span>{' '}
                Outperforms CUBIC in average user throughput by{' '}
                <span className="font-mono font-semibold text-sky-700">~1.6–2.4 Mbps</span> as
                residual error rises above <span className="font-mono">5×10⁻⁵</span>.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-sky-200 bg-[#f2f8fe] p-5">
            <div className="flex items-baseline justify-between border-b border-sky-200/80 pb-2.5">
              <h2 className="font-['Playfair_Display'] text-xl font-semibold text-[#0b192c]">
                TCP CUBIC
              </h2>
              <span className="font-mono text-xs font-semibold text-sky-700">
                β = 0.2 · C = 0.4 · ssthresh = 500 MSS
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-[#0b192c]">Cubic Window Function:</span>{' '}
                Replaces per-RTT linear growth with a cubic curve over elapsed time since the last
                loss event, decoupling growth speed from short RTT variations.
              </li>
              <li>
                <span className="font-semibold text-[#0b192c]">Aggressive Reclamation:</span>{' '}
                Quickly ramps back toward <span className="font-mono">W_max</span> after transient
                drops, delivering{' '}
                <span className="font-mono font-semibold text-sky-700">~290–295 Mbps</span> average
                throughput per 35 MB FTP3 packet at low <span className="font-mono">P_re</span>{' '}
                (Fig. 4).
              </li>
              <li>
                <span className="font-semibold text-[#0b192c]">Default Linux / 5G Baseline:</span>{' '}
                Represents modern high-BDP transport behavior; serves as the primary protocol for
                the HARQ vs. L1 ARQ and delay-sweep evaluations (Fig. 2 &amp; Fig. 5).
              </li>
            </ul>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-[#f8fbff] px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0b192c]">
              TCP Reno vs. TCP CUBIC Parameters &amp; Empirical Contrast
            </span>
            <span className="font-mono text-[11px] font-medium text-sky-700">
              35 MBytes FTP3 · 0.25 pkt/s · 10 ms Delay Baseline
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="px-4 py-2.5">Dimension</th>
                  <th className="px-4 py-2.5 text-[#0b192c]">TCP Reno</th>
                  <th className="px-4 py-2.5 text-sky-800">TCP CUBIC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TCP_SPEC_ROWS.map((row) => (
                  <tr key={row.param} className="hover:bg-[#f8fbff]">
                    <td className="px-4 py-2.5 font-semibold text-[#0b192c]">{row.param}</td>
                    <td className="px-4 py-2.5 text-slate-700">{row.reno}</td>
                    <td className="px-4 py-2.5 text-slate-700">{row.cubic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Paper Observation: The User-vs-Packet Throughput Paradox */}
        <div className="rounded-xl border border-sky-200 bg-[#f2f8fe] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-800">
            Paper Insight · Why CUBIC Leads Per-Packet Rate (Fig. 4) While Reno Edges Out User Rate
            (Fig. 3)
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#0b192c] sm:text-[13px]">
            With Poisson FTP3 traffic arriving at{' '}
            <span className="font-mono font-semibold">0.25 packets/s</span> (each 35 MBytes), TCP
            CUBIC empties its transmission buffer faster during active bursts (
            <span className="font-mono font-semibold text-sky-700">~295 Mbps</span> vs.{' '}
            <span className="font-mono font-semibold">~240 Mbps</span>). Consequently, CUBIC UEs
            spend longer idle intervals waiting for the next FTP arrival — which yields slightly
            lower session-averaged user throughput than Reno in Fig. 3 while accelerating single-file
            completion time.
          </p>
        </div>
      </div>
    </SlideShell>
  );
}
