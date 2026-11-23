import { OriginalPdfFigure } from '../components/slides/OriginalPdfFigure';
import { SlideShell } from '../components/slides/SlideShell';
import type { SlideRenderProps } from './CoverSlide';

export function Slide2Intro({ isActive = true, turnOffset = 0 }: SlideRenderProps) {
  return (
    <SlideShell
      slideIndex={0}
      accentLabel="01 · Introduction & Problem Statement"
      isActive={isActive}
      turnOffset={turnOffset}
    >
      <div className="space-y-6">
        {/* Top Two-Column Grid: Core Narrative + Original Fig. 1 */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left Narrative */}
          <div className="space-y-4 lg:col-span-6">
            <div className="border-l-2 border-sky-600 pl-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">
                Why 6G Challenges Legacy Data Recovery Loops
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
                Emerging 6G services — extended reality (XR), autonomous tactile robotics, and remote
                industrial control — demand ultra-high reliability paired with stringent end-to-end
                latency bounds. Legacy 4G/5G cellular protocol stacks still run three independent,
                nested retransmission loops that can compound delay and jitter.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 border-y border-slate-200 py-4 sm:grid-cols-2">
              <div>
                <div className="font-mono text-xl font-bold tabular-nums text-sky-600">3 Layers</div>
                <div className="mt-1 text-xs font-semibold text-[#0b192c]">
                  Nested Recovery Stack
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  L1/L2 Stop-and-Wait HARQ, L2 Sliding-Window RLC ARQ, and end-to-end TCP ARQ &amp;
                  flow control execute concurrently.
                </p>
              </div>
              <div className="border-t border-slate-200 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                <div className="font-mono text-xl font-bold tabular-nums text-sky-600">
                  &lt; 5×10⁻⁵
                </div>
                <div className="mt-1 text-xs font-semibold text-[#0b192c]">
                  Critical Residual Error Target
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Residual HARQ error threshold below which L2 RLC ARQ yields negligible throughput
                  benefit over Unacknowledged Mode.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-sky-200 bg-[#f2f8fe] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                Problem Statement (Uyoata et al., 2024)
              </div>
              <ul className="mt-2 space-y-2 text-[13px] leading-relaxed text-[#0b192c]">
                <li>
                  <span className="font-semibold">Error Leakage:</span> Imperfect radio control
                  signaling (<span className="font-mono font-semibold text-sky-700">P_ch</span>) and
                  false ACK detections allow unrecovered blocks (
                  <span className="font-mono font-semibold text-sky-700">P_re</span>) to leak above
                  HARQ into RLC and TCP.
                </li>
                <li>
                  <span className="font-semibold">Duplicate Retransmission Penalties:</span> If
                  HARQ fails or RLC stalls, TCP interprets missing segments as network congestion
                  and cuts its congestion window (<span className="font-mono">cwnd</span>),
                  depressing throughput.
                </li>
                <li>
                  <span className="font-semibold">Architectural Question:</span> Can 6G simplify its
                  stack by keeping HARQ soft combining while omitting L2 RLC ARQ when{' '}
                  <span className="font-mono font-semibold text-sky-700">P_re &lt; 5×10⁻⁵</span>?
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Original Fig. 1 directly from Research Paper PDF */}
          <div className="lg:col-span-6">
            <OriginalPdfFigure
              src="/assets/figures/fig1.png"
              figureLabel="Fig. 1 · Nested Protocol Loops"
              sourcePage="Page 1"
              alt="Original Fig. 1 from paper showing TCP, L2 ARQ, L1/L2 HARQ, and L1 transmission recovery loops"
              caption="Fig. 1 from Uyoata et al. (2024): End-to-end interaction between Server-side TCP, L2 Sliding Window ARQ, L1/L2 Stop & Wait HARQ, and physical-layer transmission."
            >
              <div className="space-y-1.5 text-xs leading-relaxed text-slate-700">
                <div>
                  <span className="font-semibold text-[#0b192c]">Key Signals in Fig. 1:</span>{' '}
                  <span className="font-mono font-semibold text-sky-700">P_ch</span> is control
                  channel error rate, <span className="font-mono font-semibold text-sky-700">P_i</span>{' '}
                  is transport block error rate, and{' '}
                  <span className="font-mono font-semibold text-sky-700">P_re</span> is the residual
                  error rate escaping HARQ into L2 ARQ.
                </div>
                <div>
                  <span className="font-semibold text-[#0b192c]">Research Focus:</span>{' '}
                  Investigating when L2 ARQ (which introduces polling and reassembly latency) can be
                  removed by bounding <span className="font-mono">P_re</span> at the lower layers.
                </div>
              </div>
            </OriginalPdfFigure>
          </div>
        </div>

        {/* Bottom Seminar Context Strip */}
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-sky-700">
              1 · Physical Transmission (L1)
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Transports radio blocks subject to channel BLER (<span className="font-mono">P_i</span>)
              and scheduling grant errors (<span className="font-mono">P_ch</span>) across a
              feedback channel.
            </p>
          </div>
          <div className="border-t border-slate-100 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-sky-700">
              2 · Link Layer Loops (HARQ + ARQ)
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              HARQ performs fast millisecond-scale soft combining; ideal L2 RLC ARQ guarantees
              in-order delivery at the cost of timers and Status PDUs.
            </p>
          </div>
          <div className="border-t border-slate-100 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-sky-700">
              3 · Transport Loop (TCP)
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Operates end-to-end across core network delay; sensitive to residual packet losses and
              delay spikes caused by lower-layer stalls.
            </p>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
