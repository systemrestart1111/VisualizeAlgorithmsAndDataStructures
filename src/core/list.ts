import type { Color, GEdge, GNode, GraphPanel } from './types';

export interface LL {
  val: Record<number, number | string>;
  next: Record<number, number | null>;
  prev?: Record<number, number | null>;
  pos: Record<number, { x: number; y: number }>;
}

export const GAP = 76;

/** 依序排在同一列 */
export function rowPos(ids: number[], y = 0, x0 = 0) {
  const p: Record<number, { x: number; y: number }> = {};
  ids.forEach((id, i) => (p[id] = { x: x0 + i * GAP, y }));
  return p;
}

export function makeList(vals: (number | string)[], startId = 0) {
  const L: LL = { val: {}, next: {}, pos: {} };
  const ids = vals.map((_, i) => startId + i);
  ids.forEach((id, i) => {
    L.val[id] = vals[i];
    L.next[id] = i + 1 < ids.length ? ids[i + 1] : null;
  });
  L.pos = rowPos(ids);
  return { L, ids };
}

/**
 * 畫鏈結串列：labels 為指標名稱（如 head、prev、cur），會顯示在節點上方。
 * nullAt 若給定，會在畫面上畫出一個 null 節點。
 */
export function listPanel(
  L: LL,
  o: {
    colors?: Record<number, Color | undefined>;
    labels?: Record<string, number | null | undefined>;
    edgeColors?: Record<number, Color | undefined>;
    title?: string;
    hide?: Set<number>;
    showNull?: boolean;
    w?: 'full' | 'half';
  } = {},
): GraphPanel {
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  const badges: Record<number, string[]> = {};
  const nullLabels: string[] = [];
  for (const [name, id] of Object.entries(o.labels ?? {})) {
    if (id === null) nullLabels.push(name);
    else if (id !== undefined) (badges[id] ??= []).push(name);
  }
  const ids = Object.keys(L.val).map(Number).filter((id) => !o.hide?.has(id));
  let maxX = 0, sumY = 0;
  for (const id of ids) {
    const p = L.pos[id];
    maxX = Math.max(maxX, p.x);
    sumY += p.y;
    nodes.push({ id: 'n' + id, x: p.x, y: p.y, label: String(L.val[id]), shape: 'rect', w: 42, h: 30, color: o.colors?.[id], badge: badges[id]?.join(', ') });
  }
  let needNull = !!o.showNull || nullLabels.length > 0;
  for (const id of ids) {
    const nx = L.next[id];
    if (nx === null || nx === undefined) continue;
    if (o.hide?.has(nx)) continue;
    const a = L.pos[id], b = L.pos[nx];
    // 往回指或跨列的邊用彎曲線
    const back = b.y === a.y && (b.x === a.x || b.x < a.x - GAP - 1);
    edges.push({ from: 'n' + id, to: 'n' + nx, directed: true, color: o.edgeColors?.[id], curve: back ? 30 : 0 });
  }
  if (L.prev)
    for (const id of ids) {
      const pv = L.prev[id];
      if (pv === null || pv === undefined || o.hide?.has(pv)) continue;
      edges.push({ from: 'n' + id, to: 'n' + pv, directed: true, curve: 8, dashed: true });
    }
  if (needNull) {
    nodes.push({ id: 'null', x: maxX + GAP, y: ids.length ? sumY / ids.length : 0, label: '∅', shape: 'rect', w: 30, h: 24, color: 'muted', badge: nullLabels.join(', ') || undefined });
  }
  return { type: 'graph', nodes, edges, title: o.title, w: o.w, height: 300 };
}
