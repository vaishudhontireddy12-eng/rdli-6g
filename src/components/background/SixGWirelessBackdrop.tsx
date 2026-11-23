const NETWORK_NODES = [
  { x: 110, y: 170, r: 3.2 },
  { x: 255, y: 115, r: 2.6 },
  { x: 390, y: 215, r: 2.2 },
  { x: 185, y: 345, r: 2.8 },
  { x: 1180, y: 145, r: 2.8 },
  { x: 1320, y: 235, r: 3.4 },
  { x: 1245, y: 395, r: 2.4 },
  { x: 1055, y: 295, r: 2.0 },
  { x: 210, y: 740, r: 2.6 },
  { x: 420, y: 805, r: 2.0 },
  { x: 1040, y: 790, r: 2.2 },
  { x: 1265, y: 715, r: 3.0 },
];

const NETWORK_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [3, 2],
  [4, 5],
  [4, 7],
  [5, 6],
  [6, 7],
  [8, 9],
  [10, 11],
];

export function SixGWirelessBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{
        background:
          'linear-gradient(155deg, #ffffff 0%, #f1f7fe 46%, #dfeefb 100%)',
      }}
    >
      {/* Subtle Futuristic Light-Blue Ambient Key Glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 52% at 50% 44%, rgba(56, 189, 248, 0.14) 0%, rgba(186, 230, 253, 0.08) 48%, rgba(255, 255, 255, 0) 100%)',
        }}
      />

      {/* Subtle 6G Wireless Signal Waves & Faint Network Nodes Backdrop */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="sixgNodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(14, 165, 233, 0.45)" />
            <stop offset="100%" stopColor="rgba(14, 165, 233, 0)" />
          </radialGradient>
        </defs>

        {/* Subtle 6G Signal Concentric Waves */}
        {[260, 390, 520, 660, 810].map((r, i) => (
          <circle
            key={`wave-${r}`}
            cx="720"
            cy="430"
            r={r}
            fill="none"
            stroke="rgba(2, 132, 199, 0.06)"
            strokeWidth={i % 2 === 0 ? '1.1' : '0.8'}
            strokeDasharray={i % 2 === 1 ? '6 8' : undefined}
          />
        ))}

        {/* Soft horizon signal sine waves */}
        <path
          d="M -60 470 Q 340 410, 720 465 T 1500 445"
          fill="none"
          stroke="rgba(14, 165, 233, 0.09)"
          strokeWidth="1.2"
        />
        <path
          d="M -60 495 Q 380 545, 760 480 T 1500 505"
          fill="none"
          stroke="rgba(56, 189, 248, 0.075)"
          strokeWidth="1"
          strokeDasharray="5 7"
        />

        {/* Faint mesh edges */}
        {NETWORK_EDGES.map(([a, b], idx) => {
          const na = NETWORK_NODES[a];
          const nb = NETWORK_NODES[b];
          return (
            <line
              key={`edge-${idx}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke="rgba(2, 132, 199, 0.11)"
              strokeWidth="1"
            />
          );
        })}

        {/* Subtle glowing nodes */}
        {NETWORK_NODES.map((n, idx) => (
          <g key={`node-${idx}`}>
            <circle cx={n.x} cy={n.y} r={n.r * 6} fill="url(#sixgNodeGlow)" />
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="rgba(2, 132, 199, 0.42)"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
