import { SlideShell } from '../components/slides/SlideShell';
import type { SlideRenderProps } from './CoverSlide';

const VARIABLE_DEFINITIONS = [
  {
    sym: 'P_re',
    name: 'HARQ Residual Error Rate',
    range: 'Target < 5×10⁻⁵',
    desc: 'Probability that a transport block fails to be delivered correctly after the HARQ loop finishes, leaking upward to RLC/TCP.',
  },
  {
    sym: 'P_ch',
    name: 'Control Channel Error Rate',
    range: 'Typically ≈ 1% (10⁻²)',
    desc: 'Probability that the UE misses the downlink scheduling grant on PDCCH, entering Discontinuous Transmission (DTX) state.',
  },
  {
    sym: 'P_e',
    name: 'Initial Data Channel BLER',
    range: '0.1 (10% target)',
    desc: 'First-transmission transport block error probability maintained by Outer Loop Link Adaptation (OLLA).',
  },
  {
    sym: 'P_da',
    name: 'DTX → ACK Misdetection',
    range: 'Typically ≈ 1% (10⁻²)',
    desc: 'UE sent nothing (DTX after missing PDCCH), but gNB noise triggers a false ACK — silently dropping the packet (dominant leak).',
  },
  {
    sym: 'P_na',
    name: 'NACK → ACK Error Rate',
    range: 'Typically ≈ 0.01% (10⁻⁴)',
    desc: 'UE correctly decoded PDCCH, failed data CRC, and returned NACK, which feedback channel noise flipped into a false ACK.',
  },
  {
    sym: 'P_gu',
    name: 'Give-Up Probability',
    range: '(0.1)⁶ = 10⁻⁶',
    desc: 'Probability that data fails all n = 6 allowed HARQ retransmissions despite accurate NACK feedback.',
  },
  {
    sym: 'P_an',
    name: 'ACK → NACK Error Rate',
    range: 'Harmless to P_re',
    desc: 'UE succeeded and sent ACK, but gNB hears NACK and sends a redundant retransmission; wastes minor capacity, zero data loss.',
  },
];

export function Slide4MathModel({ isActive = true, turnOffset = 0 }: SlideRenderProps) {
  return (
    <SlideShell
      slideIndex={2}
      accentLabel="03 · Analytical Formulation"
      isActive={isActive}
      turnOffset={turnOffset}
    >
      <div className="space-y-5">
        {/* Equations Row: Eq (1), Eq (2), Eq (3) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="rounded-xl border border-sky-200 bg-[#f2f8fe] p-4 lg:col-span-7">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
              <span>Eq. (1) · Full Residual Error Probability</span>
              <span className="font-mono text-slate-500">Paper Section III</span>
            </div>
            <div className="mt-2.5 overflow-x-auto font-['Playfair_Display'] text-lg font-medium tracking-wide text-[#0b192c] sm:text-xl">
              P<sub className="text-xs font-bold text-sky-700">re</sub> = (1 − P
              <sub className="text-xs">ch</sub>) P<sub className="text-xs">e</sub> P
              <sub className="text-xs">na</sub> + P<sub className="text-xs">ch</sub> P
              <sub className="text-xs">da</sub> + P<sub className="text-xs">gu</sub> + (1 − P
              <sub className="text-xs">ch</sub>)(1 − P<sub className="text-xs">e</sub>) P
              <sub className="text-xs">an</sub>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Captures every pathway by which a scheduled transport block either fails to reach the
              upper layer or encounters control-feedback corruption across the radio interface.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-5">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b192c]">
              <span>Eq. (2) &amp; Eq. (3) · Reduced Model</span>
              <span className="font-mono font-semibold normal-case tracking-normal text-sky-700">
                P_e=0.1, n=6 ⇒ P_gu=10⁻⁶
              </span>
            </div>
            <div className="mt-2.5 font-['Playfair_Display'] text-lg font-medium text-[#0b192c] sm:text-xl">
              P<sub className="text-xs font-bold text-sky-700">re</sub> ≃ (1 − P
              <sub className="text-xs">ch</sub>) P<sub className="text-xs">e</sub> P
              <sub className="text-xs">na</sub> + P<sub className="text-xs">ch</sub> P
              <sub className="text-xs">da</sub>
            </div>
            <div className="mt-2 font-mono text-xs font-semibold text-sky-800">
              Eq. (3): P_gu = (P_e)ⁿ = (0.1)⁶ = 10⁻⁶
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Because <span className="font-mono">P_gu ≈ 10⁻⁶</span> is negligible and{' '}
              <span className="font-mono">P_an</span> causes no packet loss, residual errors are
              governed almost entirely by <span className="font-mono">P_na</span> and{' '}
              <span className="font-mono">P_da</span>.
            </p>
          </div>
        </div>

        {/* Complete Variable Dictionary */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0b192c]">
              Complete Variable &amp; Probability Definitions
            </span>
            <span className="font-mono text-[11px] font-semibold text-sky-700">
              Note: Visual Control-Budget Contour Is Shown in Original Fig. 6 (Slide 08)
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {VARIABLE_DEFINITIONS.map((item) => (
              <div
                key={item.sym}
                className="rounded-lg border border-slate-200/90 bg-[#f8fbff] p-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-sky-700">{item.sym}</span>
                  <span className="font-mono text-[11px] font-semibold text-slate-600">
                    {item.range}
                  </span>
                </div>
                <div className="mt-1 text-xs font-semibold text-[#0b192c]">{item.name}</div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Worked Numerical Insight Box */}
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-amber-200/90 bg-amber-50/55 p-4 sm:grid-cols-2">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-800">
              Why Typical 5G Settings Exceed 5×10⁻⁵
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
              With typical values <span className="font-mono font-semibold">P_ch = 10⁻²</span>,{' '}
              <span className="font-mono font-semibold">P_da = 10⁻²</span>,{' '}
              <span className="font-mono font-semibold">P_e = 0.1</span>, and{' '}
              <span className="font-mono font-semibold">P_na = 10⁻⁴</span>:
            </p>
            <div className="mt-1.5 font-mono text-xs font-bold text-[#0b192c]">
              P_re ≈ (0.99)(0.1)(10⁻⁴) + (10⁻²)(10⁻²) ≈ 10⁻⁵ + 10⁻⁴ = 1.1×10⁻⁴ &gt; 5×10⁻⁵
            </div>
          </div>
          <div className="border-t border-amber-200 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-800">
              Dominant Bottleneck Identified by Eq. (2)
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
              The <span className="font-mono font-semibold text-sky-800">P_ch · P_da</span> term (
              <span className="font-mono">10⁻⁴</span>) is roughly{' '}
              <span className="font-semibold text-[#0b192c]">10× larger</span> than the{' '}
              <span className="font-mono">NACK→ACK</span> leakage term (
              <span className="font-mono">~10⁻⁵</span>). Tightening PDCCH error{' '}
              <span className="font-mono font-semibold text-sky-700">P_ch &lt; 1%</span> and{' '}
              <span className="font-mono font-semibold text-sky-700">DTX→ACK</span> detection is
              essential to suppress residual errors in 6G.
            </p>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
