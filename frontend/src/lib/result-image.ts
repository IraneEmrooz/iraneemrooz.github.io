import { clampPercent, fa } from './format';
import type { AxisRow, ResultRow } from './domain/result-view';
import { AXIS_ICON, CLAY_ICONS } from '../components/clay-icons.generated';
import { IRAN_MAP } from './iran-map.generated';

/** 9:16 share image (1080×1920), drawn on a <canvas>. RTL: first pole / first item sits on the RIGHT. */
export const IMAGE_W = 1080;
export const IMAGE_H = 1920;

export interface ResultImageInput {
  general: readonly AxisRow[];
  future: readonly ResultRow[];
  distanceFromStatusQuo: number;
}

const M = 56;                       // outer margin
const GAP = 24;                     // gap between the two card columns
const CARD_W = (IMAGE_W - 2 * M - GAP) / 2;
const C = {
  ink: '#1c1917', mute: '#57534e', soft: '#78716c', line: '#e7e5e4', tick: '#a8a29e',
  teal: '#115e59', white: '#ffffff',
};

/** Fixed vertical geometry (px). Shared by drawing and by computeLayout so they can never disagree. */
const HERO_TOP = 194, HERO_H = 172;
const SECTION_TITLE_Y = 408;
const CARDS_TOP = 474;
const CARD_HEAD_H = 58, CARD_ROW_H = 80, CARD_PAD_B = 8, CARD_GAP_Y = 20;
const ICON_BOX = 40, ICON_GAP = 14;   // icon badge + gap, reserved on the right of every axis row
const FUTURE_HEAD_H = 98, FUTURE_PAD_B = 10;
export const FUTURE_ROW_STEP = 86;
const FOOTER_H = 104;

export interface ImageLayout {
  generalTop: number;
  generalBottom: number;
  futureTop: number;
  futureBottom: number;
  footerY: number;
  fits: boolean;
}

/** Fixed layout for the 1080×1920 share card (the general-axis block is always the same size). */
export function computeLayout(_generalCount: number, futureCount: number): ImageLayout {
  const futureRows = Math.max(1, Math.ceil(futureCount / 2));
  const generalTop = CARDS_TOP;
  const generalBottom = generalTop + (CARD_HEAD_H + CARD_PAD_B) * 2 + CARD_GAP_Y + 9 * CARD_ROW_H;   // the taller column (9 rows)
  const futureTop = generalBottom + 30;
  const futureBottom = futureTop + FUTURE_HEAD_H + futureRows * FUTURE_ROW_STEP + FUTURE_PAD_B;
  const footerY = futureBottom + 34;
  return { generalTop, generalBottom, futureTop, futureBottom, footerY, fits: footerY + FOOTER_H <= IMAGE_H - 32 };
}

/** Greedy word wrap using the context's own measurement. */
export function wrapWords(measure: (s: string) => number, text: string, maxW: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && measure(next) > maxW) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

type Ctx = CanvasRenderingContext2D;
const font = (weight: number, size: number, family: string) => `${weight} ${size}px ${family}`;

/** Prefers ONE line (shrinking down to `oneLineMin`), then falls back to up to `maxLines` lines at `base`…`min`. */
function fit(ctx: Ctx, text: string, maxW: number, family: string, weight: number, base: number, min: number, maxLines: number, oneLineMin = min + 2) {
  const attempt = (size: number, lines: number) => {
    ctx.font = font(weight, size, family);
    const l = wrapWords((s) => ctx.measureText(s).width, text, maxW);
    return l.length <= lines && l.every((x) => ctx.measureText(x).width <= maxW) ? l : null;
  };
  for (let size = base; size >= oneLineMin; size -= 1) { const l = attempt(size, 1); if (l) return { lines: l, size }; }
  for (let size = base - 1; size >= min; size -= 1) { const l = attempt(size, maxLines); if (l) return { lines: l, size }; }
  ctx.font = font(weight, min, family);
  return { lines: wrapWords((s) => ctx.measureText(s).width, text, maxW).slice(0, maxLines), size: min };
}

interface TextOpts { size: number; weight?: number; color?: string; align?: 'right' | 'left' | 'center'; family: string }
function text(ctx: Ctx, s: string, x: number, y: number, o: TextOpts) {
  ctx.font = font(o.weight ?? 400, o.size, o.family);
  ctx.fillStyle = o.color ?? C.ink;
  ctx.textAlign = o.align ?? 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

/** Wrapped label whose LAST line is centred on `yLast` (so the label always sits right above its bar). */
function labelBlock(ctx: Ctx, s: string, x: number, yLast: number, maxW: number, align: 'right' | 'left', family: string, size: number, forceSize?: number) {
  let { lines, size: fs } = fit(ctx, s, maxW, family, 500, size, 15, 2, 17);
  if (forceSize && forceSize < fs) { fs = forceSize; ctx.font = font(500, fs, family); lines = wrapWords((t) => ctx.measureText(t).width, s, maxW).slice(0, 2); }
  lines.forEach((l, i) => text(ctx, l, x, yLast - (lines.length - 1 - i) * (fs + 3), { size: fs, weight: 500, align, family }));
  return fs;
}
/** Width available to each pole label: a short label lends its unused space to the long one on the other side. */
function poleWidths(ctx: Ctx, a: string, b: string, w: number, family: string, size: number): [number, number] {
  ctx.font = font(500, size, family);
  const wa = ctx.measureText(a).width, wb = ctx.measureText(b).width, avail = w - 24, half = avail / 2;
  if (wa + wb <= avail) return [wa + 2, wb + 2];
  if (wa < half) return [wa + 2, avail - wa];
  if (wb < half) return [avail - wb, wb + 2];
  return [half, half];
}
/** Size a label would get on its own (used so both poles of an axis share one font size). */
const labelSize = (ctx: Ctx, s: string, maxW: number, family: string, size: number) => fit(ctx, s, maxW, family, 500, size, 15, 2, 17).size;

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ───────────────────────── background ─────────────────────────
function ridge(ctx: Ctx, baseY: number, amp: number, phase: number, fill: string, fromTop: boolean) {
  ctx.beginPath();
  const edge = fromTop ? -10 : IMAGE_H + 10;
  ctx.moveTo(-10, edge);
  ctx.lineTo(-10, baseY);
  const steps = 8, sw = (IMAGE_W + 20) / steps;
  for (let i = 0; i < steps; i++) {
    const x0 = -10 + i * sw, x1 = x0 + sw;
    const peak = baseY + (fromTop ? 1 : -1) * amp * (0.55 + 0.45 * Math.sin(phase + i * 1.7));
    ctx.quadraticCurveTo((x0 + x1) / 2, peak, x1, baseY + (fromTop ? 1 : -1) * amp * 0.25 * Math.sin(phase + i * 2.3 + 1));
  }
  ctx.lineTo(IMAGE_W + 10, edge);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Faint silhouette of Iran (province paths merged by drawing them opaque on a scratch canvas, then blending once). */
function drawMap(ctx: Ctx, x: number, y: number, width: number, alpha: number) {
  const k = width / IRAN_MAP.width, h = Math.ceil(IRAN_MAP.height * k);
  const scratch = document.createElement('canvas');
  scratch.width = Math.ceil(width); scratch.height = h;
  const sc = scratch.getContext('2d');
  if (!sc) return;
  sc.scale(k, k);
  sc.fillStyle = '#115e59'; sc.strokeStyle = '#115e59'; sc.lineWidth = 1.2 / k; sc.lineJoin = 'round';
  for (const d of IRAN_MAP.paths) { const p = new Path2D(d); sc.fill(p); sc.stroke(p); }
  ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(scratch, x, y); ctx.restore();
}

function drawBackground(ctx: Ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, IMAGE_H);
  g.addColorStop(0, '#f4f7f5'); g.addColorStop(0.5, '#fafaf9'); g.addColorStop(1, '#f1f5f3');
  ctx.fillStyle = g; ctx.fillRect(0, 0, IMAGE_W, IMAGE_H);
  ridge(ctx, 130, 70, 0.4, 'rgba(17,94,89,0.045)', true);
  ridge(ctx, 100, 60, 2.1, 'rgba(17,94,89,0.04)', true);
  ridge(ctx, IMAGE_H - 130, 80, 1.1, 'rgba(17,94,89,0.045)', false);
  ridge(ctx, IMAGE_H - 90, 60, 3.0, 'rgba(17,94,89,0.04)', false);
  drawMap(ctx, IMAGE_W - M - 330, 18, 360, 0.1);
}

// ───────────────────────── icons ─────────────────────────
interface IconStyle { color: string; bg: string }
/** Clay icon (SVG data) drawn on a rounded badge. `cx`,`cy` = badge centre. */
function drawIcon(ctx: Ctx, axisName: string, cx: number, cy: number, st: IconStyle) {
  const icon = CLAY_ICONS[AXIS_ICON[axisName]];
  if (!icon) return;
  ctx.fillStyle = st.bg; roundRect(ctx, cx - ICON_BOX / 2, cy - ICON_BOX / 2, ICON_BOX, ICON_BOX, 12); ctx.fill();
  const [, , vw, vh] = icon.viewBox.split(' ').map(Number);
  const size = 22, k = size / Math.max(vw, vh);
  ctx.save();
  ctx.translate(cx - (vw * k) / 2, cy - (vh * k) / 2); ctx.scale(k, k);
  ctx.fillStyle = st.color;
  for (const [tag, a] of icon.els) {
    if (a.fill === 'none') continue;
    const rule = a.fillRule === 'evenodd' ? 'evenodd' : 'nonzero';
    if (tag === 'path' && a.d) ctx.fill(new Path2D(a.d), rule);
    else if (tag === 'circle') { ctx.beginPath(); ctx.arc(+a.cx, +a.cy, +a.r, 0, Math.PI * 2); ctx.fill(); }
    else if (tag === 'rect') ctx.fillRect(+a.x, +a.y, +a.width, +a.height);
  }
  ctx.restore();
}

// ───────────────────────── rows ─────────────────────────
/** Share toward the closer pole, printed under the bar on that pole's side (same number the page's sentence uses). */
function drawLeanPercent(ctx: Ctx, value: number, x: number, w: number, y: number, family: string) {
  const b = Math.round(clampPercent(value)), a = 100 - b;
  const text_ = `${fa(Math.max(a, b))}٪`;
  const align = a > b ? 'right' : b > a ? 'left' : 'center';
  const px = a > b ? x + w : b > a ? x : x + w / 2;
  text(ctx, text_, px, y, { size: 17, weight: 700, color: C.teal, align, family });
}
function track(ctx: Ctx, x: number, y: number, w: number) {
  ctx.fillStyle = C.line;
  roundRect(ctx, x, y - 4, w, 8, 4); ctx.fill();
}

/** Two-pole axis row. `x` = left edge, `w` = width, `y` = top of the row. */
function drawAxisRow(ctx: Ctx, row: AxisRow, x0: number, y: number, w0: number, family: string, o: { label: number; barDy: number; r: number; gap: number; icon: IconStyle }) {
  const by = y + o.barDy;
  drawIcon(ctx, row.name, x0 + w0 - ICON_BOX / 2, by - o.gap + 2, o.icon);
  const x = x0, w = w0 - ICON_BOX - ICON_GAP;          // content area, to the left of the icon
  const [maxA, maxB] = poleWidths(ctx, row.poleA, row.poleB, w, family, o.label);
  const fs = Math.min(labelSize(ctx, row.poleA, maxA, family, o.label), labelSize(ctx, row.poleB, maxB, family, o.label));
  labelBlock(ctx, row.poleA, x + w, by - o.gap, maxA, 'right', family, o.label, fs);
  labelBlock(ctx, row.poleB, x, by - o.gap, maxB, 'left', family, o.label, fs);
  track(ctx, x, by, w);
  ctx.fillStyle = C.tick; ctx.fillRect(x + w / 2 - 1, by - 8, 2, 16);
  const v = clampPercent(row.value);
  const cx = x + w - o.r - (v / 100) * (w - 2 * o.r);
  ctx.beginPath(); ctx.arc(cx, by, o.r, 0, Math.PI * 2);
  ctx.fillStyle = C.teal; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = C.white; ctx.stroke();
  drawLeanPercent(ctx, row.value, x, w, by + o.r + 11, family);
}

/** Independent single-pole metric: title on the right, percentage on the left, bar fills from the right. */
function drawMetricRow(ctx: Ctx, row: ResultRow, x0: number, y: number, w0: number, family: string, o: { label: number; barDy: number; gap: number; icon: IconStyle }) {
  if (row.kind !== 'metric') return;
  const v = clampPercent(row.value);
  const by = y + o.barDy;
  drawIcon(ctx, row.name, x0 + w0 - ICON_BOX / 2, by - o.gap + 2, o.icon);
  const x = x0, w = w0 - ICON_BOX - ICON_GAP;
  labelBlock(ctx, row.title, x + w, by - o.gap, w - 90, 'right', family, o.label);
  text(ctx, `${fa(Math.round(v))}٪`, x, by - o.gap, { size: 24, weight: 700, color: C.teal, align: 'left', family });
  track(ctx, x, by, w);
  const fw = Math.max(8, (v / 100) * w);
  ctx.fillStyle = C.teal; roundRect(ctx, x + w - fw, by - 4, fw, 8, 4); ctx.fill();
}

// ───────────────────────── category cards ─────────────────────────
interface Tone { head: string; border: string; title: string }
const GENERAL_CATEGORIES: readonly { title: string; tone: Tone; names: readonly string[] }[] = [
  { title: 'حقوق و جامعه', tone: { head: '#d3eee8', border: '#a5d6cc', title: '#115e59' }, names: ['individual_freedom', 'citizen_equality', 'secularism', 'assimilation_vs_pluralism'] },
  { title: 'حکومت و اقتصاد', tone: { head: '#d9eaf7', border: '#acd0ea', title: '#0c4a6e' }, names: ['democracy', 'rule_of_law', 'decentralization', 'market_vs_state', 'limited_vs_service_state'] },
  { title: 'هویت و مهاجرت', tone: { head: '#e8ddf9', border: '#cbb6ee', title: '#5b21b6' }, names: ['identity_emphasis', 'immigration'] },
  { title: 'سیاست خارجی و امنیت', tone: { head: '#fde2d2', border: '#f4bf9f', title: '#9a3412' }, names: ['west_engagement', 'regional_role', 'foreign_intervention', 'defense_capability', 'military_political_role', 'governance'] },
];

function buildCategoryRows(rows: readonly AxisRow[], names: readonly string[]): AxisRow[] {
  const byName = new Map(rows.map((r) => [r.name, r]));
  return names.flatMap((name) => { const row = byName.get(name); return row ? [row] : []; });
}

function drawCard(ctx: Ctx, title: string, rows: readonly AxisRow[], tone: Tone, xRight: number, top: number, rowH: number, family: string): number {
  const h = CARD_HEAD_H + rows.length * rowH + CARD_PAD_B;
  const x = xRight - CARD_W;
  ctx.save();
  ctx.shadowColor = 'rgba(28,25,23,0.07)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8;
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; roundRect(ctx, x, top, CARD_W, h, 26); ctx.fill();
  ctx.restore();
  ctx.save();
  roundRect(ctx, x, top, CARD_W, h, 26); ctx.clip();
  ctx.fillStyle = tone.head; ctx.fillRect(x, top, CARD_W, CARD_HEAD_H);
  ctx.restore();
  roundRect(ctx, x, top, CARD_W, h, 26); ctx.lineWidth = 2; ctx.strokeStyle = tone.border; ctx.stroke();
  text(ctx, title, xRight - 24, top + CARD_HEAD_H / 2 + 1, { size: 26, weight: 700, color: tone.title, family });

  const rx = x + 24, rw = CARD_W - 48;
  rows.forEach((row, i) => {
    const y = top + CARD_HEAD_H + i * rowH;
    drawAxisRow(ctx, row, rx, y, rw, family, { label: 19, barDy: rowH - 31, r: 10, gap: 24, icon: { color: tone.title, bg: tone.head } });
    if (i < rows.length - 1) { ctx.fillStyle = 'rgba(28,25,23,0.06)'; ctx.fillRect(rx, y + rowH - 1, rw, 1); }
  });
  return h;
}

function drawGeneralCategories(ctx: Ctx, rows: readonly AxisRow[], family: string) {
  const cats = GENERAL_CATEGORIES.map((c) => ({ ...c, rows: buildCategoryRows(rows, c.names) })).filter((c) => c.rows.length);
  const by = new Map(cats.map((c) => [c.title, c]));
  const pick = (titles: string[]) => titles.map((t) => by.get(t)).filter(Boolean) as typeof cats;
  const columns = [
    { items: pick(['حقوق و جامعه', 'حکومت و اقتصاد']), xRight: IMAGE_W - M },
    { items: pick(['هویت و مهاجرت', 'سیاست خارجی و امنیت']), xRight: M + CARD_W },
  ];
  const natural = (items: typeof cats) => items.reduce((s, c) => s + CARD_HEAD_H + c.rows.length * CARD_ROW_H + CARD_PAD_B, 0) + CARD_GAP_Y * Math.max(0, items.length - 1);
  const target = Math.max(...columns.map((c) => natural(c.items)));
  for (const col of columns) {
    const nRows = col.items.reduce((s, c) => s + c.rows.length, 0);
    const extra = nRows ? Math.min(10, Math.max(0, (target - natural(col.items)) / nRows)) : 0;   // short column: spread the slack so bottoms line up
    let y = CARDS_TOP;
    for (const c of col.items) y += drawCard(ctx, c.title, c.rows, c.tone, col.xRight, y, CARD_ROW_H + extra, family) + CARD_GAP_Y;
  }
}

// ───────────────────────── future government ─────────────────────────
const FUTURE_ICON: IconStyle = { color: '#115e59', bg: '#d3eee8' };
function drawFuture(ctx: Ctx, rows: readonly ResultRow[], top: number, bottom: number, family: string) {
  const x = M, w = IMAGE_W - 2 * M;
  ctx.save();
  ctx.shadowColor = 'rgba(28,25,23,0.07)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8;
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; roundRect(ctx, x, top, w, bottom - top, 28); ctx.fill();
  ctx.restore();
  ctx.save();
  roundRect(ctx, x, top, w, bottom - top, 28); ctx.clip();
  ctx.fillStyle = '#d3eee8'; ctx.fillRect(x, top, w, 84);
  ctx.restore();
  roundRect(ctx, x, top, w, bottom - top, 28); ctx.lineWidth = 2; ctx.strokeStyle = '#a5d6cc'; ctx.stroke();

  text(ctx, 'آیندهٔ حکومت', IMAGE_W - M - 28, top + 34, { size: 30, weight: 700, color: C.teal, family });
  text(ctx, 'نگاه شما به ساختار و مسیر گذار', IMAGE_W - M - 28, top + 66, { size: 18, color: C.mute, family });
  text(ctx, 'این بخش جدا از محورهای عمومی است و با آن‌ها در هیچ عدد کلی ترکیب نشده است.', M + 28, top + 50, { size: 15, color: C.soft, align: 'left', family });

  const inner = w - 56, colGap = 40, colW = (inner - colGap) / 2;
  const perCol = Math.ceil(rows.length / 2);
  rows.forEach((row, i) => {
    const col = Math.floor(i / perCol), idx = i % perCol;
    const cx = col === 0 ? x + w - 28 - colW : x + 28;
    const ry = top + FUTURE_HEAD_H + idx * FUTURE_ROW_STEP;
    if (row.kind === 'axis') drawAxisRow(ctx, row, cx, ry, colW, family, { label: 20, barDy: 58, r: 12, gap: 26, icon: FUTURE_ICON });
    else drawMetricRow(ctx, row, cx, ry, colW, family, { label: 20, barDy: 58, gap: 26, icon: FUTURE_ICON });
  });
}

// ───────────────────────── hero ─────────────────────────
function drawHero(ctx: Ctx, distance: number, family: string) {
  const x = M, w = IMAGE_W - 2 * M, top = HERO_TOP, h = HERO_H;
  ctx.save();
  ctx.shadowColor = 'rgba(28,25,23,0.07)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8;
  ctx.fillStyle = 'rgba(255,255,255,0.92)'; roundRect(ctx, x, top, w, h, 28); ctx.fill();
  ctx.restore();
  roundRect(ctx, x, top, w, h, 28); ctx.lineWidth = 2; ctx.strokeStyle = '#a5d6cc'; ctx.stroke();
  const d = clampPercent(distance);

  // Gauge (left): full ring + clockwise progress from 12 o'clock.
  const gx = x + 104, gy = top + h / 2, gr = 52;
  ctx.lineCap = 'round'; ctx.lineWidth = 15;
  ctx.strokeStyle = '#d3eee8'; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.stroke();
  if (d > 0) {
    ctx.strokeStyle = C.teal; ctx.beginPath(); ctx.arc(gx, gy, gr, -Math.PI / 2, -Math.PI / 2 + (d / 100) * Math.PI * 2); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  text(ctx, `${fa(Math.round(d))}٪`, gx, gy + 2, { size: 36, weight: 700, color: C.teal, align: 'center', family });

  // Divider + text block (right)
  ctx.fillStyle = C.line; ctx.fillRect(x + 214, top + 28, 2, h - 56);
  const rx = x + w - 34, bw = w - 214 - 34 - 34, bx = rx - bw;
  text(ctx, 'فاصله از وضع موجود', rx, top + 46, { size: 32, weight: 700, family });
  text(ctx, 'یک معیار مستقل از پاسخ‌های شما؛ نه امتیاز سیاسی کلی', rx, top + 86, { size: 18, color: C.mute, family });
  const by = top + 125;
  ctx.fillStyle = C.line; roundRect(ctx, bx, by - 6, bw, 12, 6); ctx.fill();
  const fw = Math.max(12, (d / 100) * bw);
  ctx.fillStyle = C.teal; roundRect(ctx, rx - fw, by - 6, fw, 12, 6); ctx.fill();
  ctx.beginPath(); ctx.arc(rx - fw, by, 11, 0, Math.PI * 2); ctx.fillStyle = C.teal; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = C.white; ctx.stroke();
}

/** Draws the whole share image. `family` is a CSS font-family list; fonts must already be loaded. */
export function drawResultImage(canvas: HTMLCanvasElement, input: ResultImageInput, family: string): void {
  canvas.width = IMAGE_W;
  canvas.height = IMAGE_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unsupported');
  ctx.direction = 'rtl';
  const L = computeLayout(input.general.length, input.future.length);

  drawBackground(ctx);

  // Header
  text(ctx, 'ایران امروز', IMAGE_W / 2, 64, { size: 28, weight: 500, color: C.teal, align: 'center', family });
  text(ctx, 'نتیجهٔ آزمون شما', IMAGE_W / 2, 122, { size: 56, weight: 700, align: 'center', family });
  text(ctx, 'نگاهی کوتاه به دیدگاه‌های شما', IMAGE_W / 2, 170, { size: 20, color: C.mute, align: 'center', family });

  drawHero(ctx, input.distanceFromStatusQuo, family);

  // General axes, grouped in four coloured cards
  text(ctx, 'نقشهٔ دیدگاه‌ها', IMAGE_W - M, SECTION_TITLE_Y, { size: 32, weight: 700, family });
  text(ctx, 'نگاهی به مواضع شما در مهم‌ترین محورهای سیاسی و اجتماعی', IMAGE_W - M, SECTION_TITLE_Y + 38, { size: 18, color: C.mute, family });
  drawGeneralCategories(ctx, input.general, family);

  // Future government — deliberately separate from the general axes.
  drawFuture(ctx, input.future, L.futureTop, L.futureBottom, family);

  // Footer
  const fy = L.footerY;
  text(ctx, 'این تصویر یک نتیجهٔ توصیفی از پاسخ‌های شماست.', IMAGE_W / 2, fy + 10, { size: 18, color: C.mute, align: 'center', family });
  text(ctx, '۵۰٪ فقط نقطهٔ میانی ریاضی هر محور است؛ نه بی‌طرفی سیاسی.', IMAGE_W / 2, fy + 38, { size: 16, color: C.mute, align: 'center', family });
  ctx.fillStyle = C.teal; roundRect(ctx, IMAGE_W - M - 36, fy + 6, 36, 36, 11); ctx.fill();
  ctx.fillStyle = C.white; ctx.beginPath(); ctx.moveTo(IMAGE_W - M - 31, fy + 35); ctx.lineTo(IMAGE_W - M - 22, fy + 18); ctx.lineTo(IMAGE_W - M - 14, fy + 31); ctx.lineTo(IMAGE_W - M - 9, fy + 35); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(IMAGE_W - M - 12, fy + 17, 3.4, 0, Math.PI * 2); ctx.fill();
  text(ctx, 'ایران امروز', IMAGE_W - M - 48, fy + 24, { size: 24, weight: 700, color: C.teal, family });
  text(ctx, 'iraneemrooz.github.io', M, fy + 24, { size: 19, weight: 700, color: C.teal, align: 'left', family });
}

export async function renderResultImage(input: ResultImageInput): Promise<Blob> {
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-vazir').trim() || 'Tahoma, sans-serif';
  await Promise.all([400, 500, 700].map((w) => document.fonts.load(`${w} 24px ${family}`)));
  const canvas = document.createElement('canvas');
  drawResultImage(canvas, input, family);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob_failed'))), 'image/png'));
}
