import React from 'react';
import type { BarsPanel, Color, GEdge, GNode, GraphPanel, Panel, PlotPanel, TablePanel, TextPanel, VarsPanel } from '../core/types';

const cv = (c?: Color) => (c && c !== 'default' ? `var(--c-${c})` : undefined);
const soft = (c?: Color) => (c && c !== 'default' ? `color-mix(in srgb, var(--c-${c}) 38%, transparent)` : undefined);
const COLORS: Color[] = ['default', 'compare', 'swap', 'active', 'done', 'visited', 'path', 'muted', 'special', 'bad', 'good', 'frontier'];

function BarsView({ p }: { p: BarsPanel }) {
  const n = p.values.length;
  const bw = 30;
  const H = p.height ?? 190;
  const maxV = Math.max(1, ...p.values.map((v) => (Number.isFinite(v) ? v : 0)));
  const minV = Math.min(0, ...p.values.map((v) => (Number.isFinite(v) ? v : 0)));
  const span = maxV - minV || 1;
  const zeroY = 14 + ((maxV - 0) / span) * (H - 14);
  const ptrs: Record<number, { label: string; color?: Color }[]> = {};
  for (const q of p.pointers ?? []) (ptrs[q.index] ??= []).push(q);
  const maxPtr = Math.max(0, ...Object.values(ptrs).map((a) => a.length));
  const showVal = n <= 48;
  const totalH = H + 18 + maxPtr * 15 + (p.ranges?.length ? 26 : 0) + 4;
  const W = Math.max(n * bw, 60);
  return (
    <svg viewBox={`-4 0 ${W + 8} ${totalH}`} style={{ width: '100%', maxWidth: Math.max(n * 56, 240), display: 'block', margin: '0 auto' }}>
      {minV < 0 && <line x1={0} x2={W} y1={zeroY} y2={zeroY} stroke="var(--fg-muted)" strokeWidth={1} />}
      {p.values.map((v, i) => {
        const val = Number.isFinite(v) ? v : 0;
        const h = (Math.abs(val) / span) * (H - 14);
        const y = val >= 0 ? zeroY - h : zeroY;
        const x = i * bw + 3;
        return (
          <g key={i}>
            <rect className="bar" x={x} y={y} width={bw - 6} height={Math.max(h, 1)} rx={Math.min(6, (bw - 6) / 2)} fill={cv(p.colors[i]) ?? 'var(--bar)'} style={{ y, height: Math.max(h, 1) }} />
            {showVal && (
              <text className="bar-val" x={x + (bw - 6) / 2} y={0} style={{ transform: `translateY(${val >= 0 ? y - 3 : y + h + 10}px)` }} textAnchor="middle" fontSize={n > 30 ? 7 : 10} fill="var(--fg)">
                {p.labels?.[i] ?? (Number.isFinite(v) ? +v.toFixed(2) : v > 0 ? '∞' : '-∞')}
              </text>
            )}
            <text x={x + (bw - 6) / 2} y={H + 12} textAnchor="middle" fontSize={8} fill="var(--fg-muted)">
              {i}
            </text>
          </g>
        );
      })}
      {Object.entries(ptrs).flatMap(([idx, qs]) =>
        qs.map((q, k) => (
          // 以標籤為 key，指標換位置時會滑過去而不是跳過去
          <text key={'ptr-' + q.label} className="slide" x={0} y={0} style={{ transform: `translate(${+idx * bw + 3 + (bw - 6) / 2}px, ${H + 26 + k * 15}px)` }} textAnchor="middle" fontSize={10} fontWeight={700} fill={cv(q.color) ?? 'var(--accent)'}>
            {q.label}
          </text>
        )),
      )}
      {(p.ranges ?? []).map((r, k) => {
        const y = H + 18 + maxPtr * 15 + 8;
        const x1 = r.from * bw + 3, x2 = r.to * bw + bw - 3;
        return (
          <g key={'r' + k} stroke={cv(r.color) ?? 'var(--accent)'} fill="none">
            <path d={`M${x1},${y - 5} V${y} H${x2} V${y - 5}`} strokeWidth={1.5} />
            {r.label && (
              <text x={(x1 + x2) / 2} y={y + 12} textAnchor="middle" fontSize={10} stroke="none" fill={cv(r.color) ?? 'var(--accent)'}>
                {r.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function TableView({ p }: { p: TablePanel }) {
  const small = p.cell !== undefined;
  const sz = p.cell ?? 0;
  const cols = Math.max(0, ...p.rows.map((r) => r.length));
  const ptrs: Record<number, { label: string; color?: Color }[]> = {};
  for (const q of p.pointers ?? []) (ptrs[q.c] ??= []).push(q);
  return (
    <div className="tbl-wrap">
      <table className={'tbl' + (small ? ' tbl-small' : '')}>
        {p.colHeaders && (
          <thead>
            <tr>
              {p.rowHeaders && <th />}
              {p.colHeaders.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {p.rows.map((row, r) => (
            <tr key={r}>
              {p.rowHeaders && <th>{p.rowHeaders[r]}</th>}
              {Array.from({ length: cols }, (_, c) => {
                const col = p.colors?.[`${r},${c}`];
                const v = row[c];
                const arrow = p.arrows?.[`${r},${c}`];
                return (
                  <td
                    key={c}
                    style={{
                      background: small ? cv(col) ?? 'var(--cell)' : soft(col),
                      borderColor: !small && col ? cv(col) : undefined,
                      width: small ? sz : undefined,
                      height: small ? sz : undefined,
                      minWidth: small ? sz : undefined,
                      fontSize: small ? Math.max(8, sz * 0.55) : undefined,
                      padding: small ? 0 : undefined,
                      color: small && col && col !== 'muted' ? '#fff' : undefined,
                    }}
                  >
                    {arrow && <span className="tbl-arrow">{arrow}</span>}
                    {v === null || v === undefined ? '' : v}
                  </td>
                );
              })}
            </tr>
          ))}
          {p.pointers && p.pointers.length > 0 && (
            <tr className="ptr-row">
              {p.rowHeaders && <th />}
              {Array.from({ length: cols }, (_, c) => (
                <td key={c}>
                  {(ptrs[c] ?? []).map((q, k) => (
                    <div key={k} style={{ color: cv(q.color) ?? 'var(--accent)' }}>
                      ▲{q.label}
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function nodeBox(n: GNode) {
  if (n.shape === 'rect') return { hw: (n.w ?? 44) / 2, hh: (n.h ?? 30) / 2 };
  const r = n.r ?? 18;
  return { hw: r, hh: r };
}

function trim(a: GNode, b: GNode, ctrl: { x: number; y: number } | null) {
  // 把端點從節點中心往外推到邊界
  const out = (n: GNode, toward: { x: number; y: number }) => {
    const dx = toward.x - n.x, dy = toward.y - n.y;
    const d = Math.hypot(dx, dy) || 1;
    if (n.shape === 'rect') {
      const { hw, hh } = nodeBox(n);
      const s = Math.min(hw / Math.abs(dx || 1e-9), hh / Math.abs(dy || 1e-9));
      return { x: n.x + dx * s, y: n.y + dy * s };
    }
    const r = (n.r ?? 18) + 1;
    return { x: n.x + (dx / d) * r, y: n.y + (dy / d) * r };
  };
  return [out(a, ctrl ?? b), out(b, ctrl ?? a)];
}

function GraphView({ p }: { p: GraphPanel }) {
  if (!p.nodes.length) return <div className="empty">（空）</div>;
  const byId: Record<string, GNode> = {};
  for (const n of p.nodes) byId[n.id] = n;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const n of p.nodes) {
    const { hw, hh } = nodeBox(n);
    x0 = Math.min(x0, n.x - hw); x1 = Math.max(x1, n.x + hw);
    y0 = Math.min(y0, n.y - hh - (n.badge ? 14 : 0)); y1 = Math.max(y1, n.y + hh + (n.sub ? 16 : 0));
  }
  const pad = 22;
  const W = x1 - x0 + pad * 2, H = y1 - y0 + pad * 2;
  const maxH = p.height ?? 440;
  const seen: Record<string, number> = {};
  const edgeEl = (e: GEdge, i: number) => {
    const a = byId[e.from], b = byId[e.to];
    const base = e.from + '>' + e.to;
    const key = base + '#' + (seen[base] = (seen[base] ?? -1) + 1);
    if (!a || !b) return null;
    const col = cv(e.color) ?? 'var(--edge)';
    const mk = e.directed ? `url(#arr-${e.color ?? 'default'})` : undefined;
    if (a === b) {
      const r = a.r ?? 18;
      return (
        <g key={key}>
          <path d={`M${a.x - 6},${a.y - r} C${a.x - 30},${a.y - r - 40} ${a.x + 30},${a.y - r - 40} ${a.x + 6},${a.y - r}`} fill="none" stroke={col} strokeWidth={e.width ?? 2} markerEnd={mk} />
          {e.label && <text className="elabel" x={a.x} y={a.y - r - 32} textAnchor="middle">{e.label}</text>}
        </g>
      );
    }
    let ctrl: { x: number; y: number } | null = null;
    if (e.curve) {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
      ctrl = { x: mx - (dy / d) * e.curve * 2, y: my + (dx / d) * e.curve * 2 };
    }
    const [s, t] = trim(a, b, ctrl);
    const d = ctrl ? `M${s.x},${s.y} Q${ctrl.x},${ctrl.y} ${t.x},${t.y}` : `M${s.x},${s.y} L${t.x},${t.y}`;
    const lx = ctrl ? (s.x + 2 * ctrl.x + t.x) / 4 : (s.x + t.x) / 2;
    const ly = ctrl ? (s.y + 2 * ctrl.y + t.y) / 4 : (s.y + t.y) / 2;
    return (
      <g key={key} className="gedge">
        <path d={d} fill="none" stroke={col} strokeWidth={e.width ?? (e.color && e.color !== 'muted' ? 3 : 1.8)} strokeDasharray={e.dashed ? '5 4' : undefined} markerEnd={mk} style={{ d: `path('${d}')` } as React.CSSProperties} />
        {e.label && (
          <text className="elabel slide" x={0} y={0} style={{ transform: `translate(${lx}px, ${ly + 4}px)` }} textAnchor="middle" fill={cv(e.color) ?? 'var(--fg)'}>
            {e.label}
          </text>
        )}
      </g>
    );
  };
  return (
    <svg viewBox={`${x0 - pad} ${y0 - pad} ${W} ${H}`} style={{ width: '100%', maxHeight: maxH, maxWidth: Math.max(W * 1.6, 200), display: 'block', margin: '0 auto' }}>
      <defs>
        {COLORS.map((c) => (
          <marker key={c} id={`arr-${c}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={cv(c) ?? 'var(--edge)'} />
          </marker>
        ))}
      </defs>
      {p.edges.map(edgeEl)}
      {p.nodes.map((n) => {
        const fill = cv(n.color) ?? 'var(--node-bg)';
        const txt = n.color && n.color !== 'default' && n.color !== 'muted' ? '#fff' : 'var(--fg)';
        const r = n.r ?? 18;
        const label = n.label ?? n.id;
        const fs = label.length > 4 ? 9 : label.length > 2 ? 11 : 13;
        return (
          // 節點以 transform 定位：位置改變時（如樹旋轉）會以彈簧動畫移動
          <g key={n.id} className="gnode" style={{ transform: `translate(${n.x}px, ${n.y}px)` }}>
            <g className="gnode-in">
              {n.shape === 'rect' ? (
                <rect x={-(n.w ?? 44) / 2} y={-(n.h ?? 30) / 2} width={n.w ?? 44} height={n.h ?? 30} rx={8} fill={fill} stroke={n.color && n.color !== 'default' ? fill : 'var(--node-stroke)'} strokeWidth={1.5} />
              ) : (
                <circle cx={0} cy={0} r={r} fill={fill} stroke={n.color && n.color !== 'default' ? fill : 'var(--node-stroke)'} strokeWidth={1.5} />
              )}
              <text x={0} y={fs / 2.8} textAnchor="middle" fontSize={fs} fontWeight={600} fill={txt}>
                {label}
              </text>
              {n.sub && (
                <text x={0} y={(n.shape === 'rect' ? (n.h ?? 30) / 2 : r) + 13} textAnchor="middle" fontSize={10} fill="var(--accent)" fontWeight={600}>
                  {n.sub}
                </text>
              )}
              {n.badge && (
                <text x={0} y={-(n.shape === 'rect' ? (n.h ?? 30) / 2 : r) - 5} textAnchor="middle" fontSize={10} fill="var(--fg-muted)">
                  {n.badge}
                </text>
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

function PlotView({ p }: { p: PlotPanel }) {
  const clipId = 'clip' + React.useId().replace(/:/g, '');
  let b = p.bounds;
  if (!b) {
    const xs: number[] = [], ys: number[] = [];
    for (const q of p.points ?? []) { xs.push(q.x); ys.push(q.y); }
    for (const s of p.segments ?? []) { xs.push(s.x1, s.x2); ys.push(s.y1, s.y2); }
    for (const pg of p.polygons ?? []) for (const [x, y] of pg.pts) { xs.push(x); ys.push(y); }
    for (const c of p.curves ?? []) for (const [x, y] of c.pts) { xs.push(x); ys.push(y); }
    for (const c of p.circles ?? []) { xs.push(c.x - c.r, c.x + c.r); ys.push(c.y - c.r, c.y + c.r); }
    if (!xs.length) { xs.push(0, 1); ys.push(0, 1); }
    b = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  }
  let [xa, xb, ya, yb] = b;
  if (xb - xa < 1e-9) { xa -= 1; xb += 1; }
  if (yb - ya < 1e-9) { ya -= 1; yb += 1; }
  const W = 600;
  const H = p.square ? (W * (yb - ya)) / (xb - xa) : p.height ?? 300;
  const sx = (x: number) => ((x - xa) / (xb - xa)) * W;
  const sy = (y: number) => H - ((y - ya) / (yb - ya)) * H;
  const pad = 20;
  return (
    <svg viewBox={`${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}`} style={{ width: '100%', maxHeight: 460, display: 'block', margin: '0 auto' }}>
      <defs>
        <clipPath id={clipId}>
          <rect x={-8} y={-8} width={W + 16} height={H + 16} />
        </clipPath>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="var(--plot-bg)" stroke="var(--border)" />
      <g clipPath={`url(#${clipId})`}>
      {p.axes && ya <= 0 && yb >= 0 && <line x1={0} x2={W} y1={sy(0)} y2={sy(0)} stroke="var(--fg-muted)" strokeWidth={1} />}
      {p.axes && xa <= 0 && xb >= 0 && <line y1={0} y2={H} x1={sx(0)} x2={sx(0)} stroke="var(--fg-muted)" strokeWidth={1} />}
      {p.axes && (
        <>
          <text x={0} y={H + 14} fontSize={10} fill="var(--fg-muted)">{+xa.toFixed(2)}</text>
          <text x={W} y={H + 14} fontSize={10} textAnchor="end" fill="var(--fg-muted)">{+xb.toFixed(2)}</text>
          <text x={-4} y={H} fontSize={10} textAnchor="end" fill="var(--fg-muted)">{+ya.toFixed(2)}</text>
          <text x={-4} y={8} fontSize={10} textAnchor="end" fill="var(--fg-muted)">{+yb.toFixed(2)}</text>
        </>
      )}
      {(p.polygons ?? []).map((pg, i) => (
        <polygon key={'pg' + i} points={pg.pts.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')} fill={pg.fill ? soft(pg.color ?? 'active') : 'none'} stroke={cv(pg.color) ?? 'var(--edge)'} strokeWidth={2} strokeDasharray={pg.dashed ? '5 4' : undefined} />
      ))}
      {(p.circles ?? []).map((c, i) => (
        <ellipse key={'c' + i} cx={sx(c.x)} cy={sy(c.y)} rx={(c.r / (xb - xa)) * W} ry={(c.r / (yb - ya)) * H} fill="none" stroke={cv(c.color) ?? 'var(--edge)'} strokeDasharray="4 3" />
      ))}
      {(p.curves ?? []).map((c, i) => (
        <polyline key={'cv' + i} points={c.pts.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')} fill="none" stroke={cv(c.color) ?? 'var(--accent)'} strokeWidth={c.width ?? 2} />
      ))}
      {(p.segments ?? []).map((s, i) => (
        <line key={'s' + i} x1={sx(s.x1)} y1={sy(s.y1)} x2={sx(s.x2)} y2={sy(s.y2)} stroke={cv(s.color) ?? 'var(--edge)'} strokeWidth={s.width ?? 2} strokeDasharray={s.dashed ? '5 4' : undefined} />
      ))}
      {(p.points ?? []).map((q, i) => (
        <g key={'p' + i}>
          <circle cx={sx(q.x)} cy={sy(q.y)} r={q.r ?? 5} fill={cv(q.color) ?? 'var(--bar)'} stroke="var(--bg)" strokeWidth={1} />
          {q.label && (
            <text x={sx(q.x) + 7} y={sy(q.y) - 6} fontSize={11} fill="var(--fg)">
              {q.label}
            </text>
          )}
        </g>
      ))}
      </g>
    </svg>
  );
}

function VarsView({ p }: { p: VarsPanel }) {
  return (
    <div className="vars">
      {p.items.map((it, i) => (
        <span key={i} className="var" style={{ borderColor: cv(it.color), background: soft(it.color) }}>
          <b>{it.k}</b> = {it.v}
        </span>
      ))}
    </div>
  );
}

function TextView({ p }: { p: TextPanel }) {
  return <pre className="textp">{p.lines.join('\n')}</pre>;
}

export function PanelView({ p }: { p: Panel }) {
  switch (p.type) {
    case 'bars': return <BarsView p={p} />;
    case 'table': return <TableView p={p} />;
    case 'graph': return <GraphView p={p} />;
    case 'plot': return <PlotView p={p} />;
    case 'vars': return <VarsView p={p} />;
    case 'text': return <TextView p={p} />;
  }
}

export function Panels({ panels }: { panels: Panel[] }) {
  return (
    <div className="panels">
      {panels.map((p, i) => (
        <div key={i} className={'panel panel-' + (p.w ?? (p.type === 'vars' ? 'auto' : 'full'))}>
          {p.title && <div className="panel-title">{p.title}</div>}
          <PanelView p={p} />
        </div>
      ))}
    </div>
  );
}

export const LEGEND: [Color, string][] = [
  ['compare', '比較'],
  ['swap', '交換／寫入'],
  ['active', '目前'],
  ['frontier', '待處理'],
  ['visited', '已拜訪'],
  ['done', '完成'],
  ['path', '路徑／結果'],
];
