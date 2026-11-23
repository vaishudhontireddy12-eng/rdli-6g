import {
  PAPER_AUTHOR_H,
  PAPER_AUTHOR_W,
  roundedRectPath,
} from '../components/threeui/ThreeDPaper';

function createSeededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s >>> 8) / 8388608;
  };
}

function drawTrackedCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  tracking: number,
) {
  const chars = [...text];
  let totalWidth = 0;
  for (const ch of chars) {
    totalWidth += ctx.measureText(ch).width + tracking;
  }
  totalWidth -= tracking;

  let cursorX = centerX - totalWidth / 2;
  for (const ch of chars) {
    ctx.fillText(ch, cursorX, y);
    cursorX += ctx.measureText(ch).width + tracking;
  }
}

function drawBalancedCenteredLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  lines.forEach((line, index) => {
    const w = ctx.measureText(line).width;
    ctx.fillText(line, centerX - w / 2, startY + index * lineHeight);
  });
}

export function drawCoverSheetTexture(
  ctx: CanvasRenderingContext2D,
  w: number = PAPER_AUTHOR_W,
  h: number = PAPER_AUTHOR_H,
) {
  const cx = w / 2;

  // Crisp luminous white-pearl & icy-blue gradient paper surface
  const baseGrad = ctx.createLinearGradient(0, 0, w * 0.85, h);
  baseGrad.addColorStop(0, '#fcfdff');
  baseGrad.addColorStop(0.55, '#f2f7fd');
  baseGrad.addColorStop(1, '#e4effa');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle ambient icy-cyan glow in center upper area
  const radialGlow = ctx.createRadialGradient(cx, h * 0.34, 24, cx, h * 0.36, w * 0.7);
  radialGlow.addColorStop(0, 'rgba(14, 165, 233, 0.08)');
  radialGlow.addColorStop(0.55, 'rgba(56, 189, 248, 0.035)');
  radialGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, w, h);

  // Subtle wireless concentric wave arcs at top & bottom corners
  ctx.strokeStyle = 'rgba(2, 132, 199, 0.075)';
  ctx.lineWidth = 1.6;
  for (let r = 180; r <= 420; r += 80) {
    ctx.beginPath();
    ctx.arc(cx, h * 0.42, r, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }

  // Fine archival fiber micro-strokes
  const rand = createSeededRng(60061);
  ctx.lineWidth = 1;
  for (let i = 0; i < 300; i++) {
    const px = rand() * w;
    const py = rand() * h;
    const len = 8 + rand() * 20;
    const angle = (rand() - 0.5) * 0.45;
    ctx.strokeStyle =
      rand() > 0.5
        ? `rgba(15, 23, 42, ${0.015 + rand() * 0.015})`
        : `rgba(2, 132, 199, ${0.018 + rand() * 0.02})`;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(angle) * len, py + Math.sin(angle) * len);
    ctx.stroke();
  }

  // Outer & inner hairline frames
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.24)';
  ctx.lineWidth = 2.6;
  roundedRectPath(ctx, 36, 36, w - 72, h - 72, 16);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(2, 132, 199, 0.34)';
  ctx.lineWidth = 1.5;
  roundedRectPath(ctx, 52, 52, w - 104, h - 104, 10);
  ctx.stroke();

  // Four cyan corner brackets
  const tick = 22;
  const inset = 52;
  ctx.strokeStyle = 'rgba(2, 132, 199, 0.85)';
  ctx.lineWidth = 2.6;
  const corners: [number, number, number, number][] = [
    [inset, inset, 1, 1],
    [w - inset, inset, -1, 1],
    [w - inset, h - inset, -1, -1],
    [inset, h - inset, 1, -1],
  ];
  for (const [x, y, sx, sy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y + tick * sy);
    ctx.lineTo(x, y);
    ctx.lineTo(x + tick * sx, y);
    ctx.stroke();
  }

  // Eyebrow label
  ctx.fillStyle = '#0369a1';
  ctx.font = '700 22px "Plus Jakarta Sans", -apple-system, sans-serif';
  drawTrackedCentered(ctx, 'TECHNICAL SEMINAR', cx, 196, 7);

  const topRule = ctx.createLinearGradient(cx - 64, 0, cx + 64, 0);
  topRule.addColorStop(0, 'rgba(2, 132, 199, 0)');
  topRule.addColorStop(0.5, 'rgba(2, 132, 199, 0.75)');
  topRule.addColorStop(1, 'rgba(2, 132, 199, 0)');
  ctx.strokeStyle = topRule;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 64, 236);
  ctx.lineTo(cx + 64, 236);
  ctx.stroke();

  // Main seminar title in dark navy
  const titleLines = ['REVISITING DATA', 'RECOVERY LOOPS', 'IN 6G NETWORKS'];
  let titleSize = 94;
  const maxTitleWidth = 960;
  ctx.font = `600 ${titleSize}px "Playfair Display", Georgia, serif`;
  const widest = Math.max(...titleLines.map((line) => ctx.measureText(line).width));
  if (widest > maxTitleWidth) {
    titleSize = Math.floor(titleSize * (maxTitleWidth / widest));
    ctx.font = `600 ${titleSize}px "Playfair Display", Georgia, serif`;
  }

  ctx.save();
  ctx.fillStyle = '#0b192c';
  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  const titleStartY = 428;
  const titleLineHeight = 114;
  titleLines.forEach((line, idx) => {
    const lineWidth = ctx.measureText(line).width;
    ctx.fillText(line, cx - lineWidth / 2, titleStartY + idx * titleLineHeight);
  });
  ctx.restore();

  const midRule = ctx.createLinearGradient(cx - 180, 0, cx + 180, 0);
  midRule.addColorStop(0, 'rgba(2, 132, 199, 0)');
  midRule.addColorStop(0.3, 'rgba(148, 163, 184, 0.5)');
  midRule.addColorStop(0.5, 'rgba(2, 132, 199, 0.8)');
  midRule.addColorStop(0.7, 'rgba(148, 163, 184, 0.5)');
  midRule.addColorStop(1, 'rgba(2, 132, 199, 0)');
  ctx.strokeStyle = midRule;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx - 180, 728);
  ctx.lineTo(cx + 180, 728);
  ctx.stroke();

  ctx.fillStyle = '#1e293b';
  ctx.font = '500 30px "Plus Jakarta Sans", -apple-system, sans-serif';
  drawBalancedCenteredLines(
    ctx,
    'Reliability, Retransmission & Latency in Next-Generation Wireless Communication',
    cx,
    804,
    840,
    46,
  );

  // Authors extracted directly from the uploaded research paper PDF
  ctx.fillStyle = '#0369a1';
  ctx.font = '700 18px "Plus Jakarta Sans", -apple-system, sans-serif';
  drawTrackedCentered(ctx, 'AUTHORS', cx, 926, 5);

  const authorRows = [
    'Uyoata E. Uyoata   ·   Abolfazl Amiri',
    'Enric Juan   ·   Guillermo Pocovi   ·   Pilar Andres-Maldonado',
    'Klaus I. Pedersen   ·   Troels Kolding',
  ];
  ctx.fillStyle = '#0b192c';
  ctx.font = '600 26px "Plus Jakarta Sans", -apple-system, sans-serif';
  authorRows.forEach((rowText, idx) => {
    const rw = ctx.measureText(rowText).width;
    ctx.fillText(rowText, cx - rw / 2, 976 + idx * 44);
  });

  ctx.fillStyle = '#334155';
  ctx.font = '500 20px "Plus Jakarta Sans", -apple-system, sans-serif';
  const affText = 'Aalborg University, Denmark   ·   Nokia, Aalborg, Denmark';
  const affW = ctx.measureText(affText).width;
  ctx.fillText(affText, cx - affW / 2, 1114);

  const bottomRule = ctx.createLinearGradient(140, 0, w - 140, 0);
  bottomRule.addColorStop(0, 'rgba(15, 23, 42, 0)');
  bottomRule.addColorStop(0.5, 'rgba(15, 23, 42, 0.24)');
  bottomRule.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.strokeStyle = bottomRule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(140, 1184);
  ctx.lineTo(w - 140, 1184);
  ctx.stroke();

  ctx.fillStyle = '#0b192c';
  ctx.font = '700 26px "Plus Jakarta Sans", -apple-system, sans-serif';
  const bottomText = 'Presented by Team 404';
  const bottomWidth = ctx.measureText(bottomText).width;
  ctx.fillText(bottomText, cx - bottomWidth / 2, 1254);
}
