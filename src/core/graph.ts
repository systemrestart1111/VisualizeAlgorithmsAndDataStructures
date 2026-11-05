import type { Color, GEdge, GNode, GraphPanel } from './types';
import { rnd } from './helpers';

export interface Edge {
  u: string;
  v: string;
  w: number;
}
export interface G {
  nodes: string[];
  edges: Edge[];
  directed: boolean;
  pos: Record<string, { x: number; y: number }>;
}
export interface Adj {
  to: string;
  w: number;
  ei: number;
}

/**
 * 解析圖文字格式，每行一筆：
 *   A B 4     邊 A–B，權重 4（權重可省略，預設 1）
 *   A         孤立點
 *   A @120,80 指定座標
 */
export function parseGraph(src: string, directed: boolean): G {
  const nodes: string[] = [];
  const pos: G['pos'] = {};
  const edges: Edge[] = [];
  const add = (n: string) => {
    if (!nodes.includes(n)) nodes.push(n);
  };
  for (const raw of src.split(/\n|;/)) {
    const line = raw.trim();
    if (!line || line.startsWith('//')) continue;
    const m = line.match(/^(\S+)\s*@\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)$/);
    if (m) {
      add(m[1]);
      pos[m[1]] = { x: +m[2], y: +m[3] };
      continue;
    }
    const parts = line
      .replace(/->|,/g, ' ')
      .replace(/(\S)-(?=\S)/g, '$1 ')
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 1) add(parts[0]);
    else {
      add(parts[0]);
      add(parts[1]);
      edges.push({ u: parts[0], v: parts[1], w: parts[2] !== undefined ? Number(parts[2]) : 1 });
    }
  }
  const g: G = { nodes, edges, directed, pos };
  layoutGraph(g);
  return g;
}

export function adjacency(g: G): Record<string, Adj[]> {
  const a: Record<string, Adj[]> = {};
  for (const n of g.nodes) a[n] = [];
  g.edges.forEach((e, ei) => {
    a[e.u].push({ to: e.v, w: e.w, ei });
    if (!g.directed) a[e.v].push({ to: e.u, w: e.w, ei });
  });
  for (const n of g.nodes) a[n].sort((x, y) => (x.to < y.to ? -1 : x.to > y.to ? 1 : 0));
  return a;
}

/** 決定性的力導向配置，未指定座標的節點才會被配置 */
export function layoutGraph(g: G) {
  const free = g.nodes.filter((n) => !g.pos[n]);
  if (!free.length) return;
  const n = g.nodes.length;
  const P: Record<string, { x: number; y: number }> = {};
  const R = 60 + n * 18;
  g.nodes.forEach((id, i) => {
    P[id] = g.pos[id] ? { ...g.pos[id] } : { x: R * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), y: R * Math.sin((2 * Math.PI * i) / n - Math.PI / 2) };
  });
  const k = 90;
  for (let it = 0; it < 300; it++) {
    const D: Record<string, { x: number; y: number }> = {};
    for (const a of g.nodes) D[a] = { x: 0, y: 0 };
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const a = g.nodes[i], b = g.nodes[j];
        let dx = P[a].x - P[b].x, dy = P[a].y - P[b].y;
        let d = Math.hypot(dx, dy) || 0.01;
        const f = (k * k) / d;
        dx /= d; dy /= d;
        D[a].x += dx * f; D[a].y += dy * f;
        D[b].x -= dx * f; D[b].y -= dy * f;
      }
    for (const e of g.edges) {
      if (e.u === e.v) continue;
      let dx = P[e.u].x - P[e.v].x, dy = P[e.u].y - P[e.v].y;
      const d = Math.hypot(dx, dy) || 0.01;
      const f = (d * d) / k;
      dx /= d; dy /= d;
      D[e.u].x -= dx * f; D[e.u].y -= dy * f;
      D[e.v].x += dx * f; D[e.v].y += dy * f;
    }
    const t = 12 * (1 - it / 300) + 0.5;
    for (const a of free) {
      // 輕微拉向中心，避免不連通分量飄走
      D[a].x -= P[a].x * 0.05; D[a].y -= P[a].y * 0.05;
      const d = Math.hypot(D[a].x, D[a].y) || 1;
      P[a].x += (D[a].x / d) * Math.min(d, t);
      P[a].y += (D[a].y / d) * Math.min(d, t);
    }
  }
  for (const a of free) g.pos[a] = { x: Math.round(P[a].x), y: Math.round(P[a].y) };
}

export interface GStyle {
  node?: Record<string, Color | undefined>;
  edge?: Record<number, Color | undefined>;
  sub?: Record<string, string | number | undefined>;
  badge?: Record<string, string | undefined>;
  edgeLabel?: Record<number, string | undefined>;
  title?: string;
  w?: 'full' | 'half';
  hideWeights?: boolean;
  /** 額外的邊（例如殘量網路的反向邊） */
  extraEdges?: GEdge[];
  height?: number;
}

const fmtW = (w: number) => (w === Infinity ? '∞' : String(w));

export function gpanel(g: G, s: GStyle = {}): GraphPanel {
  const weighted = !s.hideWeights && g.edges.some((e) => e.w !== 1);
  // 有向圖中若有雙向邊，彎曲避免重疊
  const has = new Set(g.edges.map((e) => e.u + '\u0000' + e.v));
  const nodes: GNode[] = g.nodes.map((id) => ({
    id,
    x: g.pos[id].x,
    y: g.pos[id].y,
    label: id,
    color: s.node?.[id],
    sub: s.sub?.[id] !== undefined ? String(s.sub[id]) : undefined,
    badge: s.badge?.[id],
  }));
  const edges: GEdge[] = g.edges.map((e, i) => ({
    from: e.u,
    to: e.v,
    directed: g.directed,
    color: s.edge?.[i],
    label: s.edgeLabel?.[i] ?? (weighted ? fmtW(e.w) : undefined),
    curve: g.directed && has.has(e.v + '\u0000' + e.u) ? 18 : 0,
  }));
  return { type: 'graph', title: s.title, nodes, edges: [...edges, ...(s.extraEdges ?? [])], w: s.w, height: s.height };
}

export function graphToText(g: { nodes: string[]; edges: Edge[] }, weighted: boolean) {
  const lines = g.edges.map((e) => (weighted ? `${e.u} ${e.v} ${e.w}` : `${e.u} ${e.v}`));
  const used = new Set(g.edges.flatMap((e) => [e.u, e.v]));
  for (const n of g.nodes) if (!used.has(n)) lines.push(n);
  return lines.join('\n');
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** 隨機圖產生器 */
export function randomGraph(
  n: number,
  m: number,
  o: { directed?: boolean; weighted?: boolean; connected?: boolean; dag?: boolean; minW?: number; maxW?: number; negative?: boolean } = {},
): string {
  const nodes = LETTERS.slice(0, n);
  const edges: Edge[] = [];
  const seen = new Set<string>();
  const key = (u: string, v: string) => (o.directed ? u + v : [u, v].sort().join(''));
  const w = () => (o.weighted ? rnd.int(o.negative ? -2 : o.minW ?? 1, o.maxW ?? 9) : 1);
  const push = (u: string, v: string) => {
    if (u === v || seen.has(key(u, v))) return false;
    if (o.directed && seen.has(key(v, u)) && o.dag) return false;
    seen.add(key(u, v));
    edges.push({ u, v, w: w() });
    return true;
  };
  const order = rnd.shuffle(nodes);
  if (o.connected !== false)
    for (let i = 1; i < n; i++) {
      const j = rnd.int(0, i - 1);
      if (o.dag) push(order[j], order[i]);
      else if (o.directed && Math.random() < 0.5) push(order[i], order[j]);
      else push(order[j], order[i]);
    }
  let tries = 0;
  while (edges.length < m && tries++ < 500) {
    const i = rnd.int(0, n - 1), j = rnd.int(0, n - 1);
    if (o.dag) {
      if (i === j) continue;
      const [a, b] = i < j ? [i, j] : [j, i];
      push(order[a], order[b]);
    } else push(nodes[i], nodes[j]);
  }
  return graphToText({ nodes, edges }, !!o.weighted);
}

export const graphInput = (def: string, opt: Parameters<typeof randomGraph>[2] & { n?: number; m?: number } = {}) => ({
  key: 'graph',
  label: '圖（每行：起點 終點 [權重]）',
  type: 'text' as const,
  multiline: true,
  default: def,
  random: () => randomGraph(opt.n ?? rnd.int(6, 9), opt.m ?? rnd.int(8, 13), opt),
});

// ---------- 樹配置 ----------

export interface BNode {
  id: number;
  val: number | string;
  left: BNode | null;
  right: BNode | null;
  [k: string]: any;
}

/** 二元樹配置：x 取中序位置，y 取深度 */
export function layoutBinary(root: BNode | null, gapX = 44, gapY = 64) {
  const pos = new Map<BNode, { x: number; y: number }>();
  let i = 0;
  const walk = (n: BNode | null, d: number) => {
    if (!n) return;
    walk(n.left, d + 1);
    pos.set(n, { x: i++ * gapX, y: d * gapY });
    walk(n.right, d + 1);
  };
  walk(root, 0);
  return pos;
}

export function binaryPanel(
  root: BNode | null,
  o: {
    color?: (n: BNode) => Color | undefined;
    sub?: (n: BNode) => string | undefined;
    label?: (n: BNode) => string;
    badge?: (n: BNode) => string | undefined;
    title?: string;
    w?: 'full' | 'half';
    edgeColor?: (p: BNode, c: BNode) => Color | undefined;
    extra?: GNode[];
  } = {},
): GraphPanel {
  const pos = layoutBinary(root);
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  for (const [n, p] of pos) {
    nodes.push({
      id: 'n' + n.id,
      x: p.x,
      y: p.y,
      label: o.label ? o.label(n) : String(n.val),
      color: o.color?.(n),
      sub: o.sub?.(n),
      badge: o.badge?.(n),
    });
    for (const c of [n.left, n.right]) if (c) edges.push({ from: 'n' + n.id, to: 'n' + c.id, color: o.edgeColor?.(n, c) });
  }
  if (o.extra) nodes.push(...o.extra);
  return { type: 'graph', title: o.title, nodes, edges, w: o.w };
}

/** 一般（多元）樹配置：葉節點依序排列，父節點置中於子節點 */
export function layoutTree(root: string, children: Record<string, string[]>, gapX = 50, gapY = 64) {
  const pos: Record<string, { x: number; y: number }> = {};
  let leaf = 0;
  const walk = (u: string, d: number): number => {
    const ch = children[u] ?? [];
    let x: number;
    if (!ch.length) x = leaf++ * gapX;
    else {
      const xs = ch.map((c) => walk(c, d + 1));
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    pos[u] = { x, y: d * gapY };
    return x;
  };
  walk(root, 0);
  return pos;
}

/** 由邊列表建立以 root 為根的樹（children 依字母排序） */
export function rootTree(g: G, root: string) {
  const a = adjacency(g);
  const children: Record<string, string[]> = {};
  const parent: Record<string, string | null> = { [root]: null };
  const order = [root];
  for (let i = 0; i < order.length; i++) {
    const u = order[i];
    children[u] = [];
    for (const { to } of a[u])
      if (!(to in parent)) {
        parent[to] = u;
        children[u].push(to);
        order.push(to);
      }
  }
  return { children, parent, order };
}

export function randomTreeText(n: number) {
  const nodes = Array.from({ length: n }, (_, i) => String(i + 1));
  const lines: string[] = [];
  for (let i = 1; i < n; i++) lines.push(`${nodes[rnd.int(Math.max(0, i - 3), i - 1)]} ${nodes[i]}`);
  return lines.join('\n');
}
