import { OriginalPdfFigure } from '../components/slides/OriginalPdfFigure';
import { SlideShell } from '../components/slides/SlideShell';
import type { SlideRenderProps } from './CoverSlide';

export function Slide6Simulation({ isActive = true, turnOffset = 0 }: SlideRenderProps) {
  return (
    <SlideShell
      slideIndex={4}
      accentLabel="05 · Evaluation Methodology"
      isActive={isActive}
      turnOffset={turnOffset}
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left: Original Table I directly from the PDF */}
        <div className="lg:col-span-6">
          <OriginalPdfFigure
            src="/assets/figures/table1.png"
            figureLabel="Table I · Simulation Parameters"
            sourcePage="Page 4"
            alt="Original Table I: Simulation Parameters from Uyoata et al. detailing 3GPP Dense Urban 21-cell setup, HARQ, RLC-ARQ, FTP3 traffic, and TCP configurations"
            caption="TABLE I reproduced directly from the paper PDF: 3GPP-compliant system-level simulator settings across PHY, MAC, RLC, and TCP layers."
          />
        </div>

        {/* Right: Structured Topology, KPIs & Experimental Sweep Details */}
        <div className="space-y-4 lg:col-span-6">
          <div className="rounded-xl border border-sky-200 bg-[#f2f8fe] p-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-800">
              Radio Topology &amp; Statistical Rigor
            </div>
            <ul className="mt-2 space-y-2 text-[13px] leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-[#0b192c]">3GPP Dense Urban Layout:</span>{' '}
                <span className="font-mono font-semibold text-sky-700">7</span> tri-sectorized
                macro sites (<span className="font-mono font-semibold text-sky-700">21 cells</span>)
                spaced at <span className="font-mono font-semibold text-sky-700">200 m ISD</span>,
                operating at <span className="font-mono font-semibold text-sky-700">4 GHz</span> with{' '}
                <span className="font-mono font-semibold text-sky-700">100 MHz</span> bandwidth and{' '}
                <span className="font-mono font-semibold text-sky-700">30 kHz</span> SCS.
              </li>
              <li>
                <span className="font-semibold text-[#0b192c]">Antenna &amp; Receiver Config:</span>{' '}
                Base stations use <span className="font-mono">51 dBm</span> Tx power with{' '}
                <span className="font-mono">32 Tx/Rx</span>; 21 uniformly dropped UEs (1/cell,{' '}
                <span className="font-mono">3 km/h</span>) use{' '}
                <span className="font-mono">4 Rx / 2 Tx</span>, SU-MIMO Rank 1, and LMMSE-IRC.
              </li>
              <li>
                <span className="font-semibold text-[#0b192c]">Monte Carlo Confidence:</span> Each
                operating point is averaged over{' '}
                <span className="font-mono font-semibold text-sky-700">10 random seeds/drops</span>{' '}
                with <span className="font-mono font-semibold text-sky-700">60 s</span> simulation
                time (excluding a <span className="font-mono">4 s</span> warm-up interval).
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0b192c]">
              Traffic Model &amp; Evaluated Sweeps
            </div>
            <ul className="mt-2 space-y-2 text-[13px] leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-[#0b192c]">FTP3 Offered Load:</span>{' '}
                <span className="font-mono font-semibold text-sky-700">35 MBytes</span> file packets
                generated at <span className="font-mono font-semibold text-sky-700">0.25 pkt/s</span>{' '}
                (≈ <span className="font-mono font-semibold text-sky-700">70 Mbps</span> average
                offered throughput per UE).
              </li>
              <li>
                <span className="font-semibold text-[#0b192c]">Residual Error Sweep:</span> NACK→ACK
                error (<span className="font-mono">P_na</span>) varied across{' '}
                <span className="font-mono font-semibold text-sky-700">0 to 1</span> to tune
                effective HARQ residual error rate <span className="font-mono">P_re</span> from{' '}
                <span className="font-mono">~10⁻⁶</span> to <span className="font-mono">~2.5×10⁻²</span>.
              </li>
              <li>
                <span className="font-semibold text-[#0b192c]">Backhaul / Network Delay:</span>{' '}
                Baseline fixed at <span className="font-mono font-semibold text-sky-700">10 ms</span>,
                then swept across{' '}
                <span className="font-mono font-semibold text-sky-700">0 – 50 ms</span> (Fig. 5) to
                verify delay invariance.
              </li>
            </ul>
          </div>

          {/* Two Key KPIs defined in Paper Section IV */}
          <div className="rounded-xl border border-slate-200 bg-[#f8fbff] p-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">
              Two Performance Metrics Measured (Section IV)
            </div>
            <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-xs font-bold text-[#0b192c]">1. Average User Throughput</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Total received bits divided by the full observation window (including idle gaps
                  between FTP arrivals). Captures overall session efficiency (Fig. 2 &amp; Fig. 3).
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-xs font-bold text-[#0b192c]">
                  2. Throughput per FTP Packet
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  File payload bits divided by active transfer duration only. Reflects peak burst
                  delivery speed without idle periods (Fig. 4 &amp; Fig. 5).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
