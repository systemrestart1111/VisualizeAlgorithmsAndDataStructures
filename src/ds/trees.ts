import type { Color, DSDef, GEdge, GNode, Panel } from '../core/types';
import { cells, vars, rnd } from '../core/helpers';
import { binaryPanel, layoutTree, type BNode } from '../core/graph';
import { DSBase, num } from './base';

const cat = 'ds-tree';
const rk = () => rnd.int(1, 99);

interface TN extends BNode {
  val: number;
  left: TN | null;
  right: TN | null;
  parent: TN | null;
  h: number;
}

type TH = { c?: Map<TN, Color>; msg?: string };

/** 有 parent 指標的二元搜尋樹基底，提供旋轉與繪圖 */
abstract class BSTBase extends DSBase<TH> {
  root: TN | null = null;
  id = 0;
  title = '二元搜尋樹';
  node(v: number, parent: TN | null): TN {
    return { id: this.id++, val: v, left: null, right: null, parent, h: 1 };
  }
  sub(_n: TN): string | undefined {
    return undefined;
  }
  nodeColor(_n: TN): Color | undefined {
    return undefined;
  }
  panels(h: TH = {}): Panel[] {
    return [binaryPanel(this.root, { color: (n) => h.c?.get(n as TN) ?? this.nodeColor(n as TN), sub: (n) => this.sub(n as TN), title: this.title }), vars({ 節點數: this.count(this.root), 高度: this.height(this.root) })];
  }
  count(n: TN | null): number {
    return n ? 1 + this.count(n.left) + this.count(n.right) : 0;
  }
  height(n: TN | null): number {
    return n ? 1 + Math.max(this.height(n.left), this.height(n.right)) : 0;
  }
  hl(...pairs: [TN | null, Color][]) {
    const m = new Map<TN, Color>();
    for (const [n, c] of pairs) if (n) m.set(n, c);
    return { c: m };
  }
  replaceChild(p: TN | null, old: TN, nw: TN | null) {
    if (!p) this.root = nw;
    else if (p.left === old) p.left = nw;
    else p.right = nw;
    if (nw) nw.parent = p;
  }
  rotateLeft(x: TN) {
    const y = x.right!;
    x.right = y.left;
    if (y.left) y.left.parent = x;
    this.replaceChild(x.parent, x, y);
    y.left = x;
    x.parent = y;
    return y;
  }
  rotateRight(x: TN) {
    const y = x.left!;
    x.left = y.right;
    if (y.right) y.right.parent = x;
    this.replaceChild(x.parent, x, y);
    y.right = x;
    x.parent = y;
    return y;
  }
  /** 一般 BST 尋找，沿路畫出比較過程，回傳找到的節點或最後一個節點 */
  walk(v: number, line?: number): { found: TN | null; last: TN | null } {
    let cur = this.root, last: TN | null = null;
    while (cur) {
      last = cur;
      if (v === cur.val) return { found: cur, last };
      this.snap(`${v} ${v < cur.val ? '<' : '>'} ${cur.val}，往${v < cur.val ? '左' : '右'}走`, line, this.hl([cur, 'compare']));
      cur = v < cur.val ? cur.left : cur.right;
    }
    return { found: null, last };
  }
  bstInsert(v: number): TN | null {
    if (!this.root) { this.root = this.node(v, null); this.snap(`樹為空，${v} 成為根`, 1, this.hl([this.root, 'swap'])); return this.root; }
    const { found, last } = this.walk(v, 2);
    if (found) { this.snap(`${v} 已存在`, 2, this.hl([found, 'done'])); return null; }
    const n = this.node(v, last);
    if (v < last!.val) last!.left = n; else last!.right = n;
    this.snap(`在 ${last!.val} 的${v < last!.val ? '左' : '右'}側插入 ${v}`, 3, this.hl([n, 'swap']));
    return n;
  }
  minOf(n: TN) {
    while (n.left) n = n.left;
    return n;
  }
  /** BST 刪除，回傳實際被移除位置的父節點（供平衡樹往上修正） */
  bstDelete(v: number): { removedParent: TN | null; ok: boolean } {
    const { found } = this.walk(v, 4);
    if (!found) { this.snap(`找不到 ${v}`, 4); return { removedParent: null, ok: false }; }
    let z = found;
    this.snap(`找到 ${v}`, 4, this.hl([z, 'bad']));
    if (z.left && z.right) {
      const s = this.minOf(z.right);
      this.snap(`${v} 有兩個子節點：找右子樹最小值（中序後繼）${s.val}`, 5, this.hl([z, 'bad'], [s, 'compare']));
      z.val = s.val;
      this.snap(`以 ${s.val} 取代 ${v}，改為刪除原本的後繼節點`, 5, this.hl([z, 'swap'], [s, 'bad']));
      z = s;
    }
    const child = z.left ?? z.right;
    const p = z.parent;
    this.replaceChild(p, z, child);
    this.snap(child ? `節點只有一個子節點，讓子節點 ${child.val} 接上父節點` : '移除葉節點', 6, this.hl([child, 'swap']));
    return { removedParent: p, ok: true };
  }
  inorder() {
    const out: TN[] = [];
    const go = (n: TN | null) => { if (!n) return; go(n.left); out.push(n); go(n.right); };
    go(this.root);
    return out;
  }
}

const bstCodes = {
  insert: ['若樹為空：新節點為根', '從根往下：v < node 走左，否則走右', '在空位置放入新節點'],
  delete: ['', '', '', '找到要刪除的節點 z', '若 z 有兩個子節點：以中序後繼取代，改刪後繼', '以 z 的唯一子節點（或 null）取代 z'],
  search: ['', '', '', '', '', '', 'cur = root; while cur: 相等則找到；否則往左／右'],
};


class BSTDS extends BSTBase {
  run(op: string, a?: any) {
    const v = num(a, rk());
    if (op === 'build') { for (const x of [50, 30, 70, 20, 40, 60, 80, 35, 65]) this.bstInsert(x); this.r.frames = []; this.snap('建立範例 BST'); return; }
    if (op === 'insert') this.bstInsert(v);
    else if (op === 'delete') { if (this.bstDelete(v).ok) this.snap(`刪除 ${v} 完成`, 6); }
    else if (op === 'search') { const { found } = this.walk(v, 7); this.snap(found ? `找到 ${v}` : `找不到 ${v}`, 7, this.hl([found, 'done'])); }
    else if (op === 'minmax') {
      if (!this.root) { this.snap('樹為空'); return; }
      let n = this.root;
      while (n.left) { this.snap(`最小值：一直往左走（${n.val}）`, undefined, this.hl([n, 'compare'])); n = n.left; }
      const mn = n;
      n = this.root;
      while (n.right) { this.snap(`最大值：一直往右走（${n.val}）`, undefined, this.hl([mn, 'done'], [n, 'compare'])); n = n.right; }
      this.snap(`最小值 ${mn.val}，最大值 ${n.val}`, undefined, this.hl([mn, 'done'], [n, 'done']));
    } else if (op === 'inorder') {
      const seq = this.inorder();
      const m = new Map<TN, Color>();
      seq.forEach((n, i) => { m.set(n, 'done'); this.snap(`中序走訪：${seq.slice(0, i + 1).map((x) => x.val).join(' ')}`, undefined, { c: new Map([...m, [n, 'active']]) }); });
      this.snap('BST 的中序走訪必定是遞增序列');
    }
  }
}

const bst: DSDef = {
  id: 'ds-bst', name: '二元搜尋樹', en: 'Binary Search Tree', cat, star: true,
  desc: '每個節點的左子樹都比它小、右子樹都比它大。搜尋、插入、刪除都只需沿一條路徑往下，時間與樹高成正比；但若依序插入已排序資料會退化成鏈狀（O(n)）。',
  complexity: [['搜尋／插入／刪除（平均）', 'O(log n)'], ['最差（退化成鏈）', 'O(n)'], ['中序走訪', 'O(n)']],
  codes: bstCodes,
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: rk },
    { key: 'delete', label: '刪除', arg: 'number', rand: rk },
    { key: 'search', label: '搜尋', arg: 'number', rand: rk },
    { key: 'minmax', label: '最小／最大', arg: 'none' },
    { key: 'inorder', label: '中序走訪', arg: 'none' },
  ],
  create: () => new BSTDS(),
  init: [['build']],
};

class BinaryTreeDS extends BSTBase {
  title = '二元樹（依層序插入，維持完全二元樹形狀）';
  levels() {
    const out: TN[] = [];
    if (this.root) for (let q = [this.root]; q.length; ) { const n = q.shift()!; out.push(n); if (n.left) q.push(n.left); if (n.right) q.push(n.right); }
    return out;
  }
  run(op: string, a?: any) {
    if (op === 'insert') {
      const v = num(a, rk());
      if (!this.root) { this.root = this.node(v, null); this.snap(`${v} 成為根`, 1, this.hl([this.root, 'swap'])); return; }
      const q = [this.root];
      while (q.length) {
        const n = q.shift()!;
        this.snap(`層序檢查 ${n.val} 是否有空的子位置`, 2, this.hl([n, 'compare']));
        if (!n.left) { n.left = this.node(v, n); this.snap(`放在 ${n.val} 的左子`, 3, this.hl([n.left, 'swap'])); return; }
        if (!n.right) { n.right = this.node(v, n); this.snap(`放在 ${n.val} 的右子`, 3, this.hl([n.right, 'swap'])); return; }
        q.push(n.left, n.right);
      }
    } else if (op === 'delete') {
      const v = num(a);
      const all = this.levels();
      const target = all.find((n) => n.val === v);
      if (!target) { this.snap(`找不到 ${v}`); return; }
      const deepest = all[all.length - 1];
      this.snap(`找到 ${v}；最深最右的節點為 ${deepest.val}`, 4, this.hl([target, 'bad'], [deepest, 'compare']));
      target.val = deepest.val;
      this.replaceChild(deepest.parent, deepest, null);
      this.snap(`以 ${deepest.val} 取代 ${v}，並移除最深節點（保持完全二元樹）`, 5, this.hl([target, 'swap']));
    } else {
      const seq: TN[] = [];
      const go = (n: TN | null) => { if (!n) return; if (op === 'pre') seq.push(n); go(n.left); if (op === 'in') seq.push(n); go(n.right); if (op === 'post') seq.push(n); };
      if (op === 'level') seq.push(...this.levels()); else go(this.root);
      const name = { pre: '前序', in: '中序', post: '後序', level: '層序' }[op as 'pre'];
      const m = new Map<TN, Color>();
      seq.forEach((n, i) => { m.set(n, 'done'); this.snap(`${name}：${seq.slice(0, i + 1).map((x) => x.val).join(' → ')}`, undefined, { c: new Map([...m, [n, 'active']]) }); });
    }
  }
}

const binaryTree: DSDef = {
  id: 'ds-binary-tree', name: '二元樹', en: 'Binary Tree', cat, star: true,
  desc: '每個節點最多有兩個子節點（左、右）。此處依層序插入，形狀保持為完全二元樹；可用來觀察四種走訪順序。更多走訪細節請見「樹操作與走訪」分類。',
  complexity: [['走訪', 'O(n)'], ['層序插入', 'O(n)'], ['完全二元樹高度', '⌊log₂ n⌋ + 1']],
  codes: { insert: ['若樹為空：成為根', '以 BFS 找第一個缺少子節點的節點', '放入該空位'], delete: ['', '', '', '找到目標與最深最右的節點', '以最深節點的值取代目標，再移除最深節點'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: rk },
    { key: 'delete', label: '刪除', arg: 'number', rand: rk },
    { key: 'pre', label: '前序', arg: 'none' },
    { key: 'in', label: '中序', arg: 'none' },
    { key: 'post', label: '後序', arg: 'none' },
    { key: 'level', label: '層序', arg: 'none' },
  ],
  create: () => new BinaryTreeDS(),
  init: [1, 2, 3, 4, 5, 6, 7, 8].map((v) => ['insert', v] as [string, number]),
};

class AVLDS extends BSTBase {
  title = 'AVL 樹（節點下方為平衡因子 = 左高 − 右高）';
  ht = (n: TN | null) => (n ? n.h : 0);
  upd(n: TN) { n.h = 1 + Math.max(this.ht(n.left), this.ht(n.right)); }
  bf = (n: TN) => this.ht(n.left) - this.ht(n.right);
  sub(n: TN) { return 'bf ' + this.bf(n); }
  nodeColor(n: TN): Color | undefined { return Math.abs(this.bf(n)) > 1 ? 'bad' : undefined; }
  rebalanceUp(n: TN | null) {
    while (n) {
      this.upd(n);
      const b = this.bf(n);
      if (b > 1) {
        if (this.bf(n.left!) < 0) {
          this.snap(`${n.val} 的平衡因子 ${b}：LR 型，先對左子 ${n.left!.val} 左旋`, 4, this.hl([n, 'bad'], [n.left, 'compare']));
          const l = n.left!; this.rotateLeft(l); this.upd(l); this.upd(n.left!);
          this.snap('左旋完成，變成 LL 型', 4, this.hl([n, 'bad'], [n.left, 'swap']));
        } else this.snap(`${n.val} 的平衡因子 ${b}：LL 型，右旋`, 4, this.hl([n, 'bad'], [n.left, 'compare']));
        const y = this.rotateRight(n); this.upd(n); this.upd(y);
        this.snap(`對 ${n.val} 右旋，${y.val} 成為此子樹的根`, 4, this.hl([y, 'swap'], [n, 'swap']));
        n = y;
      } else if (b < -1) {
        if (this.bf(n.right!) > 0) {
          this.snap(`${n.val} 的平衡因子 ${b}：RL 型，先對右子 ${n.right!.val} 右旋`, 5, this.hl([n, 'bad'], [n.right, 'compare']));
          const rr = n.right!; this.rotateRight(rr); this.upd(rr); this.upd(n.right!);
          this.snap('右旋完成，變成 RR 型', 5, this.hl([n, 'bad'], [n.right, 'swap']));
        } else this.snap(`${n.val} 的平衡因子 ${b}：RR 型，左旋`, 5, this.hl([n, 'bad'], [n.right, 'compare']));
        const y = this.rotateLeft(n); this.upd(n); this.upd(y);
        this.snap(`對 ${n.val} 左旋，${y.val} 成為此子樹的根`, 5, this.hl([y, 'swap'], [n, 'swap']));
        n = y;
      }
      n = n.parent;
    }
  }
  run(op: string, a?: any) {
    const v = num(a, rk());
    if (op === 'insert') {
      const n = this.bstInsert(v);
      if (n) { this.snap('沿路徑往上更新高度並檢查平衡因子', 3, this.hl([n, 'swap'])); this.rebalanceUp(n.parent); this.snap(`插入 ${v} 完成，樹保持平衡`, 6); }
    } else if (op === 'delete') {
      const { removedParent, ok } = this.bstDelete(v);
      if (ok) { this.rebalanceUp(removedParent); this.snap(`刪除 ${v} 完成，樹保持平衡`, 6); }
    } else if (op === 'search') { const { found } = this.walk(v); this.snap(found ? `找到 ${v}` : `找不到 ${v}`, undefined, this.hl([found, 'done'])); }
    else if (op === 'seq') { for (let k = 1; k <= 7; k++) this.run('insert', k * 10); }
  }
}

const avl: DSDef = {
  id: 'ds-avl', name: 'AVL 樹', en: 'AVL Tree', cat, star: true,
  desc: '自我平衡的 BST：每個節點左右子樹高度差（平衡因子）必須在 −1..1 之間。插入或刪除後沿路往上檢查，失衡時依 LL、RR、LR、RL 四種情況做單旋或雙旋，保證高度 O(log n)。試試「依序插入」看它如何避免退化。',
  complexity: [['搜尋／插入／刪除', 'O(log n)'], ['旋轉', 'O(1)'], ['高度上限', '≈ 1.44 log₂ n']],
  codes: { insert: ['BST 插入', '', '從新節點往上更新高度', 'bf > 1：LL 右旋；LR 先左旋左子再右旋', 'bf < −1：RR 左旋；RL 先右旋右子再左旋', '直到根'], delete: ['', '', '', 'BST 刪除', '從刪除位置往上依相同規則重新平衡', '', ''] },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: rk },
    { key: 'delete', label: '刪除', arg: 'number', rand: rk },
    { key: 'search', label: '搜尋', arg: 'number', rand: rk },
    { key: 'seq', label: '依序插入 10..70', arg: 'none' },
  ],
  create: () => new AVLDS(),
  init: [40, 20, 60, 10, 30, 50, 70, 25].map((v) => ['insert', v] as [string, number]),
};

// ---------------- 紅黑樹（CLRS，含 NIL 哨兵） ----------------

interface RN { id: number; val: number; red: boolean; left: RN; right: RN; parent: RN }

class RBDS extends DSBase<Map<RN, Color>> {
  NIL: RN;
  root: RN;
  id = 0;
  constructor() {
    super();
    const nil = { id: -1, val: 0, red: false } as RN;
    nil.left = nil.right = nil.parent = nil;
    this.NIL = nil;
    this.root = nil;
  }
  toB(n: RN): BNode | null {
    return n === this.NIL ? null : { id: n.id, val: n.val, left: this.toB(n.left), right: this.toB(n.right), red: n.red, ref: n };
  }
  panels(hl: Map<RN, Color> = new Map()): Panel[] {
    let bh = 0;
    for (let n = this.root; n !== this.NIL; n = n.left) if (!n.red) bh++;
    const g = binaryPanel(this.toB(this.root), { color: (n) => hl.get(n.ref) ?? (n.red ? 'bad' : undefined), sub: (n) => (n.red ? undefined : '黑'), title: '紅黑樹（紅底為紅色節點，標「黑」者為黑色節點）' });
    return [g, vars({ 黑高度: bh, 根: this.root === this.NIL ? '空' : this.root.val })];
  }
  find(v: number): RN | null {
    let n = this.root;
    while (n !== this.NIL) { if (n.val === v) return n; n = v < n.val ? n.left : n.right; }
    return null;
  }
  rotL(x: RN) {
    const y = x.right;
    x.right = y.left;
    if (y.left !== this.NIL) y.left.parent = x;
    y.parent = x.parent;
    if (x.parent === this.NIL) this.root = y; else if (x === x.parent.left) x.parent.left = y; else x.parent.right = y;
    y.left = x; x.parent = y;
  }
  rotR(x: RN) {
    const y = x.left;
    x.left = y.right;
    if (y.right !== this.NIL) y.right.parent = x;
    y.parent = x.parent;
    if (x.parent === this.NIL) this.root = y; else if (x === x.parent.right) x.parent.right = y; else x.parent.left = y;
    y.right = x; x.parent = y;
  }
  H = (...p: [RN, Color][]) => new Map(p.filter(([n]) => n !== this.NIL));
  insert(v: number) {
    let y = this.NIL, x = this.root;
    while (x !== this.NIL) {
      y = x;
      if (v === x.val) { this.snap(`${v} 已存在`, 1, this.H([x, 'done'])); return; }
      this.snap(`${v} ${v < x.val ? '<' : '>'} ${x.val}`, 1, this.H([x, 'compare']));
      x = v < x.val ? x.left : x.right;
    }
    const z: RN = { id: this.id++, val: v, red: true, left: this.NIL, right: this.NIL, parent: y };
    if (y === this.NIL) this.root = z; else if (v < y.val) y.left = z; else y.right = z;
    this.snap(`以紅色節點插入 ${v}`, 1, this.H([z, 'swap']));
    let k = z;
    while (k.parent.red) {
      const p = k.parent, g = p.parent;
      const leftSide = p === g.left;
      const u = leftSide ? g.right : g.left;
      if (u.red) {
        this.snap(`父 ${p.val} 與叔 ${u.val} 都是紅色（Case 1）：父、叔變黑，祖父 ${g.val} 變紅，往上繼續`, 3, this.H([k, 'swap'], [p, 'compare'], [u, 'compare'], [g, 'special']));
        p.red = false; u.red = false; g.red = true; k = g;
        this.snap('變色完成', 3, this.H([k, 'special']));
      } else {
        if (leftSide ? k === p.right : k === p.left) {
          this.snap(`叔為黑且 ${k.val} 是內側子節點（Case 2）：對父 ${p.val} ${leftSide ? '左' : '右'}旋，轉成 Case 3`, 4, this.H([k, 'swap'], [p, 'compare']));
          k = p;
          if (leftSide) this.rotL(k); else this.rotR(k);
          this.snap('旋轉完成', 4, this.H([k, 'swap']));
        }
        const pp = k.parent, gg = pp.parent;
        this.snap(`Case 3：父 ${pp.val} 變黑、祖父 ${gg.val} 變紅，對祖父${leftSide ? '右' : '左'}旋`, 5, this.H([pp, 'compare'], [gg, 'special']));
        pp.red = false; gg.red = true;
        if (leftSide) this.rotR(gg); else this.rotL(gg);
        this.snap('旋轉完成', 5, this.H([pp, 'done']));
      }
    }
    if (this.root.red) { this.root.red = false; this.snap('根節點必須是黑色', 6, this.H([this.root, 'done'])); }
    this.snap(`插入 ${v} 完成`, 6);
  }
  transplant(u: RN, v: RN) {
    if (u.parent === this.NIL) this.root = v; else if (u === u.parent.left) u.parent.left = v; else u.parent.right = v;
    v.parent = u.parent;
  }
  delete(v: number) {
    const z = this.find(v);
    if (!z) { this.snap(`找不到 ${v}`, 7); return; }
    this.snap(`找到 ${v}`, 7, this.H([z, 'bad']));
    let y = z, yRed = y.red, x: RN;
    if (z.left === this.NIL) { x = z.right; this.transplant(z, z.right); }
    else if (z.right === this.NIL) { x = z.left; this.transplant(z, z.left); }
    else {
      y = z.right; while (y.left !== this.NIL) y = y.left;
      this.snap(`有兩個子節點：以後繼 ${y.val} 取代`, 8, this.H([z, 'bad'], [y, 'compare']));
      yRed = y.red; x = y.right;
      if (y.parent === z) x.parent = y;
      else { this.transplant(y, y.right); y.right = z.right; y.right.parent = y; }
      this.transplant(z, y); y.left = z.left; y.left.parent = y; y.red = z.red;
    }
    this.snap(`移除節點${yRed ? '（被移走的是紅色，不影響黑高度）' : '（被移走的是黑色，需要修正「雙重黑」）'}`, 8, this.H([x, 'special']));
    if (!yRed) {
      while (x !== this.root && !x.red) {
        const left = x === x.parent.left;
        let w = left ? x.parent.right : x.parent.left;
        if (w.red) {
          this.snap(`兄弟 ${w.val} 是紅色（Case 1）：兄弟變黑、父變紅，對父旋轉`, 9, this.H([x, 'special'], [w, 'compare']));
          w.red = false; x.parent.red = true;
          if (left) this.rotL(x.parent); else this.rotR(x.parent);
          w = left ? x.parent.right : x.parent.left;
        }
        if (!w.left.red && !w.right.red) {
          this.snap(`兄弟 ${w.val} 的兩個子節點都是黑色（Case 2）：兄弟變紅，雙重黑往上移`, 9, this.H([x, 'special'], [w, 'compare']));
          w.red = true; x = x.parent;
        } else {
          if (left ? !w.right.red : !w.left.red) {
            this.snap(`兄弟 ${w.val} 的近側子節點紅、遠側黑（Case 3）：旋轉兄弟`, 9, this.H([x, 'special'], [w, 'compare']));
            if (left) { w.left.red = false; w.red = true; this.rotR(w); w = x.parent.right; }
            else { w.right.red = false; w.red = true; this.rotL(w); w = x.parent.left; }
          }
          this.snap(`兄弟 ${w.val} 的遠側子節點為紅（Case 4）：對父旋轉並重新著色，修正完成`, 9, this.H([x, 'special'], [w, 'compare']));
          w.red = x.parent.red; x.parent.red = false;
          if (left) { w.right.red = false; this.rotL(x.parent); } else { w.left.red = false; this.rotR(x.parent); }
          x = this.root;
        }
      }
      x.red = false;
    }
    this.NIL.parent = this.NIL;
    this.snap(`刪除 ${v} 完成`, 10);
  }
  run(op: string, a?: any) {
    const v = num(a, rk());
    if (op === 'insert') this.insert(v);
    else if (op === 'delete') this.delete(v);
    else if (op === 'search') {
      let n = this.root;
      while (n !== this.NIL && n.val !== v) { this.snap(`比較 ${n.val}`, undefined, this.H([n, 'compare'])); n = v < n.val ? n.left : n.right; }
      this.snap(n === this.NIL ? `找不到 ${v}` : `找到 ${v}`, undefined, this.H([n, 'done']));
    } else if (op === 'seq') for (let k = 1; k <= 8; k++) this.insert(k * 10);
  }
}

const rbt: DSDef = {
  id: 'ds-red-black', name: '紅黑樹', en: 'Red-Black Tree', cat, star: true,
  desc: '自我平衡的 BST，每個節點為紅或黑：根為黑、紅節點的子節點必為黑、任一節點到其下所有 NIL 的路徑黑節點數相同。插入以「變色 + 最多 2 次旋轉」修復，刪除最多 3 次旋轉。比 AVL 平衡較寬鬆但更新較快，C++ std::map、Java TreeMap 使用它。',
  complexity: [['搜尋／插入／刪除', 'O(log n)'], ['插入旋轉次數', '≤ 2'], ['刪除旋轉次數', '≤ 3'], ['高度上限', '2 log₂(n + 1)']],
  codes: {
    insert: ['BST 插入，新節點為紅色', '當父節點為紅色時修正：', '  Case 1 叔叔紅：父叔變黑、祖父變紅，往上', '  Case 2 叔叔黑、內側：旋轉父節點成 Case 3', '  Case 3 叔叔黑、外側：父變黑、祖父變紅，旋轉祖父', '根設為黑色'],
    delete: ['', '', '', '', '', '', '找到節點 z', '移除 z（兩子節點時以後繼取代）', '若移除的是黑色：依兄弟的顏色 Case 1~4 修正雙重黑', '完成'],
  },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: rk },
    { key: 'delete', label: '刪除', arg: 'number', rand: rk },
    { key: 'search', label: '搜尋', arg: 'number', rand: rk },
    { key: 'seq', label: '依序插入 10..80', arg: 'none' },
  ],
  create: () => new RBDS(),
  init: [41, 38, 31, 12, 19, 8].map((v) => ['insert', v] as [string, number]),
};

class SplayDS extends BSTBase {
  title = '伸展樹（每次存取後把該節點轉到根）';
  splay(x: TN) {
    while (x.parent) {
      const p = x.parent, g = p.parent;
      if (!g) {
        this.snap(`Zig：${x.val} 的父節點 ${p.val} 是根，單旋`, 2, this.hl([x, 'active'], [p, 'compare']));
        if (x === p.left) this.rotateRight(p); else this.rotateLeft(p);
      } else if ((x === p.left) === (p === g.left)) {
        this.snap(`Zig-Zig：${x.val}、${p.val} 同側，先旋轉祖父 ${g.val} 再旋轉父`, 3, this.hl([x, 'active'], [p, 'compare'], [g, 'special']));
        if (x === p.left) { this.rotateRight(g); this.rotateRight(p); } else { this.rotateLeft(g); this.rotateLeft(p); }
      } else {
        this.snap(`Zig-Zag：${x.val}、${p.val} 異側，連續兩次旋轉 ${x.val}`, 4, this.hl([x, 'active'], [p, 'compare'], [g, 'special']));
        if (x === p.left) { this.rotateRight(p); this.rotateLeft(g); } else { this.rotateLeft(p); this.rotateRight(g); }
      }
      this.snap('旋轉後', 1, this.hl([x, 'active']));
    }
  }
  run(op: string, a?: any) {
    const v = num(a, rk());
    if (op === 'insert') {
      const n = this.bstInsert(v) ?? this.walk(v).found;
      if (n) { this.splay(n); this.snap(`${v} 已伸展到根`, 5, this.hl([n, 'done'])); }
    } else if (op === 'search') {
      const { found, last } = this.walk(v, 1);
      const t = found ?? last;
      if (!t) { this.snap('樹為空'); return; }
      this.snap(found ? `找到 ${v}，把它伸展到根` : `找不到 ${v}，把最後走到的 ${t.val} 伸展到根`, 1, this.hl([t, found ? 'done' : 'compare']));
      this.splay(t);
      this.snap('完成：常被存取的節點會靠近根', 5, this.hl([t, 'done']));
    } else if (op === 'delete') {
      const { found, last } = this.walk(v, 1);
      if (!found) { if (last) this.splay(last); this.snap(`找不到 ${v}`); return; }
      this.splay(found);
      this.snap(`${v} 已在根，移除後合併左右子樹`, 6, this.hl([found, 'bad']));
      const L = found.left, R = found.right;
      if (L) L.parent = null;
      if (R) R.parent = null;
      if (!L) this.root = R;
      else {
        this.root = L;
        let m = L; while (m.right) m = m.right;
        this.snap(`把左子樹的最大值 ${m.val} 伸展到左子樹的根`, 6, this.hl([m, 'compare']));
        this.splay(m);
        m.right = R; if (R) R.parent = m;
      }
      this.snap(`刪除 ${v} 完成`, 6);
    }
  }
}

const splay: DSDef = {
  id: 'ds-splay', name: '伸展樹', en: 'Splay Tree', cat,
  desc: '每次存取（搜尋、插入、刪除）後，以 Zig、Zig-Zig、Zig-Zag 旋轉把該節點移到根。不儲存任何平衡資訊，但均攤時間為 O(log n)，且常被存取的元素會留在根附近（具有局部性）。',
  complexity: [['操作（均攤）', 'O(log n)'], ['單次最差', 'O(n)'], ['額外空間', 'O(1)（不需平衡欄位）']],
  codes: { insert: ['splay(x): 直到 x 成為根', '  Zig：父為根，單旋', '  Zig-Zig：同側，先轉祖父再轉父', '  Zig-Zag：異側，連續轉 x 兩次', 'insert / search 後 splay 該節點', 'delete：splay 後移除根，合併左右子樹'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: rk },
    { key: 'search', label: '搜尋（存取）', arg: 'number', rand: rk },
    { key: 'delete', label: '刪除', arg: 'number', rand: rk },
  ],
  create: () => new SplayDS(),
  init: [50, 30, 70, 20, 40, 60, 80].map((v) => ['insert', v] as [string, number]),
};

// ---------------- 堆積 ----------------

class HeapDS extends DSBase<Record<number, Color>> {
  h: number[] = [];
  max = false;
  better = (a: number, b: number) => (this.max ? a > b : a < b);
  panels(c: Record<number, Color> = {}): Panel[] {
    const nodes: BNode[] = this.h.map((v, i) => ({ id: i, val: v, left: null, right: null }));
    nodes.forEach((n, i) => { n.left = nodes[2 * i + 1] ?? null; n.right = nodes[2 * i + 2] ?? null; });
    return [binaryPanel(nodes[0] ?? null, { color: (n) => c[n.id], badge: (n) => String(n.id), title: `${this.max ? '最大' : '最小'}堆積（樹狀檢視，上方為陣列索引）` }), cells(this.h.length ? this.h : [''], this.h.length ? c : {}, { title: '底層陣列：子節點 2i+1、2i+2，父節點 (i−1)/2' })];
  }
  up(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      this.snap(`比較 ${this.h[i]} 與父節點 ${this.h[p]}`, 2, { [i]: 'active', [p]: 'compare' });
      if (!this.better(this.h[i], this.h[p])) break;
      [this.h[i], this.h[p]] = [this.h[p], this.h[i]];
      this.snap('上浮：與父節點交換', 3, { [i]: 'swap', [p]: 'swap' });
      i = p;
    }
  }
  down(i: number, n = this.h.length) {
    for (;;) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let m = i;
      if (l < n && this.better(this.h[l], this.h[m])) m = l;
      if (r < n && this.better(this.h[r], this.h[m])) m = r;
      this.snap(`比較 ${this.h[i]} 與其子節點`, 6, { [i]: 'active', ...(l < n ? { [l]: 'compare' as Color } : {}), ...(r < n ? { [r]: 'compare' as Color } : {}) });
      if (m === i) return;
      [this.h[i], this.h[m]] = [this.h[m], this.h[i]];
      this.snap(`下沉：與${this.max ? '較大' : '較小'}的子節點交換`, 7, { [i]: 'swap', [m]: 'swap' });
      i = m;
    }
  }
  run(op: string, a?: any) {
    if (op === 'insert') { this.h.push(num(a, rk())); this.snap(`把 ${this.h[this.h.length - 1]} 放到陣列尾端`, 1, { [this.h.length - 1]: 'swap' }); this.up(this.h.length - 1); this.snap('插入完成', 3); }
    else if (op === 'extract') {
      if (!this.h.length) { this.snap('堆積為空'); return; }
      const top = this.h[0];
      this.snap(`取出堆頂 ${top}`, 4, { 0: 'bad' });
      const last = this.h.pop()!;
      if (this.h.length) { this.h[0] = last; this.snap(`把最後一個元素 ${last} 移到堆頂`, 5, { 0: 'swap' }); this.down(0); }
      this.snap(`取出 ${top} 完成`, 7);
    } else if (op === 'peek') this.snap(this.h.length ? `堆頂 = ${this.h[0]}` : '堆積為空', undefined, { 0: 'done' });
    else if (op === 'build') {
      this.h = rnd.arr(10);
      this.snap('隨機陣列，尚未滿足堆積性質', 8);
      for (let i = (this.h.length >> 1) - 1; i >= 0; i--) { this.snap(`從最後一個非葉節點 ${i} 往前下沉`, 9, { [i]: 'active' }); this.down(i); }
      this.snap('建堆完成（Floyd 建堆法，O(n)）', 9);
    } else if (op === 'toggle') {
      this.max = !this.max;
      this.snap(`切換為${this.max ? '最大' : '最小'}堆積，重新建堆`);
      for (let i = (this.h.length >> 1) - 1; i >= 0; i--) this.down(i);
      this.snap('完成');
    }
  }
}

const heap: DSDef = {
  id: 'ds-heap', name: '二元堆積', en: 'Binary Heap (Priority Queue)', cat, star: true,
  desc: '以陣列存放的完全二元樹，滿足堆積性質：最小堆積中每個節點都 ≤ 子節點，所以堆頂永遠是最小值。插入時上浮、取出時把尾端移到頂端再下沉。優先佇列、Dijkstra、堆積排序都建立在它之上。',
  complexity: [['取得最小值', 'O(1)'], ['插入（上浮）', 'O(log n)'], ['取出堆頂（下沉）', 'O(log n)'], ['建堆', 'O(n)']],
  codes: { insert: ['h.push(x)', 'while x 比父節點優先:', '  與父節點交換（上浮）'], extract: ['', '', '', 'top = h[0]', 'h[0] = h.pop()', 'while 有子節點比它優先:', '  與較優先的子節點交換（下沉）'], build: ['', '', '', '', '', '', '', 'for i = n/2 - 1 down to 0:', '  siftDown(i)'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: rk },
    { key: 'extract', label: '取出堆頂', arg: 'none' },
    { key: 'peek', label: '查看堆頂', arg: 'none' },
    { key: 'build', label: '隨機建堆', arg: 'none' },
    { key: 'toggle', label: '切換最小／最大', arg: 'none' },
  ],
  create: () => new HeapDS(),
  init: [35, 12, 48, 7, 20, 3, 41].map((v) => ['insert', v] as [string, number]),
};

// ---------------- Trie ----------------

interface TrieN { id: string; ch: string; kids: Map<string, TrieN>; end: boolean }

class TrieDS extends DSBase<{ path?: Set<TrieN>; c?: Color }> {
  root: TrieN = { id: 't0', ch: '•', kids: new Map(), end: false };
  n = 1;
  panels(h: { path?: Set<TrieN>; c?: Color } = {}): Panel[] {
    const children: Record<string, string[]> = {};
    const all: TrieN[] = [];
    const walk = (t: TrieN) => { all.push(t); children[t.id] = [...t.kids.values()].sort((a, b) => a.ch.localeCompare(b.ch)).map((k) => k.id); [...t.kids.values()].forEach(walk); };
    walk(this.root);
    const pos = layoutTree('t0', children, 40, 58);
    const nodes: GNode[] = all.map((t) => ({ id: t.id, x: pos[t.id].x, y: pos[t.id].y, label: t.ch, color: h.path?.has(t) ? h.c ?? 'active' : t.end ? 'done' : undefined, r: 15 }));
    const edges: GEdge[] = all.flatMap((t) => [...t.kids.values()].map((k) => ({ from: t.id, to: k.id, color: h.path?.has(k) ? (h.c ?? 'active') : undefined })));
    const words: string[] = [];
    const collect = (t: TrieN, s: string) => { if (t.end) words.push(s); for (const k of t.kids.values()) collect(k, s + k.ch); };
    collect(this.root, '');
    return [{ type: 'graph', nodes, edges, title: 'Trie（綠色節點代表一個單字的結尾）' }, vars({ 單字數: words.length, 單字: words.sort().join(' ') })];
  }
  run(op: string, a?: any) {
    const w = String(a ?? '').trim().toLowerCase();
    if (!w) { this.snap('請輸入單字'); return; }
    const path = new Set<TrieN>([this.root]);
    let t = this.root;
    if (op === 'insert') {
      for (const ch of w) {
        if (!t.kids.has(ch)) { t.kids.set(ch, { id: 't' + this.n++, ch, kids: new Map(), end: false }); t = t.kids.get(ch)!; path.add(t); this.snap(`建立新節點 '${ch}'`, 2, { path: new Set(path), c: 'swap' }); }
        else { t = t.kids.get(ch)!; path.add(t); this.snap(`'${ch}' 已存在，沿用`, 1, { path: new Set(path) }); }
      }
      t.end = true;
      this.snap(`標記 '${w}' 的結尾`, 3, { path, c: 'done' });
      return;
    }
    if (op === 'search' || op === 'prefix') {
      for (const ch of w) {
        const nx = t.kids.get(ch);
        if (!nx) { this.snap(`找不到 '${ch}' 子節點 → ${op === 'search' ? `單字 '${w}' 不存在` : `沒有以 '${w}' 開頭的單字`}`, 5, { path, c: 'bad' }); return; }
        t = nx; path.add(t);
        this.snap(`走到 '${ch}'`, 4, { path: new Set(path) });
      }
      if (op === 'search') { this.snap(t.end ? `找到單字 '${w}'` : `'${w}' 只是前綴，不是完整單字`, 6, { path, c: t.end ? 'done' : 'compare' }); return; }
      const words: string[] = [];
      const collect = (x: TrieN, s: string) => { if (x.end) words.push(s); for (const k of x.kids.values()) collect(k, s + k.ch); };
      collect(t, w);
      const sub = new Set<TrieN>();
      const mark = (x: TrieN) => { sub.add(x); x.kids.forEach(mark); };
      mark(t);
      this.snap(`以 '${w}' 開頭的單字：${words.join(', ')}`, 6, { path: new Set([...path, ...sub]), c: 'frontier' });
      return;
    }
    if (op === 'delete') {
      const stack: TrieN[] = [this.root];
      for (const ch of w) { const nx = t.kids.get(ch); if (!nx) { this.snap(`'${w}' 不存在`); return; } t = nx; stack.push(t); }
      if (!t.end) { this.snap(`'${w}' 不存在（只是前綴）`); return; }
      t.end = false;
      this.snap(`取消 '${w}' 的結尾標記`, 7, { path: new Set(stack), c: 'bad' });
      for (let i = stack.length - 1; i > 0; i--) {
        const x = stack[i];
        if (x.end || x.kids.size) break;
        stack[i - 1].kids.delete(x.ch);
        this.snap(`節點 '${x.ch}' 不再被使用，移除`, 8, { path: new Set(stack.slice(0, i)), c: 'compare' });
      }
      this.snap('刪除完成');
    }
  }
}

const trie: DSDef = {
  id: 'ds-trie', name: '字典樹', en: 'Trie (Prefix Tree)', cat, star: true,
  desc: '以字元為邊的樹，從根到某節點的路徑代表一個前綴。插入與搜尋的時間只與單字長度 L 有關，與字典大小無關；特別適合前綴查詢（自動完成）、拼字檢查、IP 路由。',
  complexity: [['插入／搜尋', 'O(L)'], ['前綴查詢', 'O(L + 結果數)'], ['空間', 'O(總字元數 · σ)']],
  codes: { insert: ['for ch in word:', '  若沒有 ch 子節點則建立；往下走', '標記最後一個節點為單字結尾'], search: ['', '', '', 'for ch in word: 走到 ch 子節點', '  不存在則失敗', '搜尋：檢查結尾標記；前綴：收集子樹中所有單字'], delete: ['', '', '', '', '', '', '取消結尾標記', '由下往上移除沒有子節點且非結尾的節點'] },
  ops: [
    { key: 'insert', label: '插入單字', arg: 'text', rand: () => rnd.pick(['tea', 'ten', 'inn', 'tree', 'trie', 'try', 'to', 'in', 'apple', 'app']) },
    { key: 'search', label: '搜尋單字', arg: 'text', rand: () => rnd.pick(['tea', 'te', 'try', 'tr', 'app']) },
    { key: 'prefix', label: '前綴查詢', arg: 'text', rand: () => rnd.pick(['t', 'te', 'tr', 'a', 'in']) },
    { key: 'delete', label: '刪除單字', arg: 'text', rand: () => rnd.pick(['tea', 'ten', 'try']) },
  ],
  create: () => new TrieDS(),
  init: ['tea', 'ten', 'to', 'inn', 'in', 'tree', 'try'].map((w) => ['insert', w] as [string, string]),
};

// ---------------- B 樹（CLRS，最小度數 t） ----------------

interface BTN { id: number; keys: number[]; kids: BTN[]; leaf: boolean; next?: BTN | null }

function btPanel(root: BTN, hl: Map<BTN, Color>, keyHl: Map<BTN, number>, title: string, links = false): Panel {
  const children: Record<string, string[]> = {};
  const all: BTN[] = [];
  const walk = (n: BTN) => { all.push(n); children['b' + n.id] = n.kids.map((k) => 'b' + k.id); n.kids.forEach(walk); };
  walk(root);
  const pos = layoutTree('b' + root.id, children, 30, 70);
  const leaves = all.filter((n) => n.leaf);
  // 葉節點寬度不同，依實際寬度重新排列避免重疊
  let x = 0;
  const lp: Record<string, number> = {};
  for (const l of leaves.sort((a, b) => pos['b' + a.id].x - pos['b' + b.id].x)) { const w = Math.max(40, l.keys.length * 26 + 14); lp['b' + l.id] = x + w / 2; x += w + 14; }
  const fix = (n: BTN): number => { if (n.leaf) return (pos['b' + n.id].x = lp['b' + n.id]); const xs = n.kids.map(fix); return (pos['b' + n.id].x = (xs[0] + xs[xs.length - 1]) / 2); };
  fix(root);
  const nodes: GNode[] = all.map((n) => ({ id: 'b' + n.id, x: pos['b' + n.id].x, y: pos['b' + n.id].y, shape: 'rect', w: Math.max(40, n.keys.length * 26 + 14), h: 28, label: n.keys.map((k, i) => (keyHl.get(n) === i ? `[${k}]` : String(k))).join(' | ') || '∅', color: hl.get(n) }));
  const edges: GEdge[] = all.flatMap((n) => n.kids.map((k) => ({ from: 'b' + n.id, to: 'b' + k.id, color: hl.get(k) ? hl.get(k) : undefined })));
  if (links) for (const l of leaves) if (l.next) edges.push({ from: 'b' + l.id, to: 'b' + l.next.id, directed: true, dashed: true, color: 'frontier' });
  return { type: 'graph', nodes, edges, title };
}

class BTreeDS extends DSBase<{ c?: Map<BTN, Color>; k?: Map<BTN, number> }> {
  t = 2;
  id = 0;
  root: BTN = this.mk(true);
  mk(leaf: boolean): BTN { return { id: this.id++, keys: [], kids: [], leaf }; }
  panels(h: { c?: Map<BTN, Color>; k?: Map<BTN, number> } = {}): Panel[] {
    return [btPanel(this.root, h.c ?? new Map(), h.k ?? new Map(), `B 樹（最小度數 t = ${this.t}：每個節點 ${this.t - 1}~${2 * this.t - 1} 個鍵）`), vars({ t: this.t, 最大鍵數: 2 * this.t - 1 })];
  }
  H = (...p: [BTN, Color][]) => ({ c: new Map(p) });
  split(x: BTN, i: number) {
    const t = this.t, y = x.kids[i], z = this.mk(y.leaf);
    z.keys = y.keys.splice(t);
    const mid = y.keys.pop()!;
    if (!y.leaf) z.kids = y.kids.splice(t);
    x.kids.splice(i + 1, 0, z);
    x.keys.splice(i, 0, mid);
    this.snap(`分裂滿節點：中間鍵 ${mid} 上移到父節點`, 3, this.H([x, 'swap'], [y, 'compare'], [z, 'compare']));
  }
  insert(k: number) {
    if (this.search(k, false)) { this.snap(`${k} 已存在`); return; }
    let r = this.root;
    if (r.keys.length === 2 * this.t - 1) {
      this.snap('根節點已滿，先分裂根（樹高 +1）', 2, this.H([r, 'bad']));
      const s = this.mk(false);
      s.kids = [r];
      this.root = s;
      this.split(s, 0);
      r = s;
    }
    let x = r;
    while (!x.leaf) {
      let i = x.keys.length - 1;
      while (i >= 0 && k < x.keys[i]) i--;
      i++;
      this.snap(`在節點 [${x.keys.join(', ')}] 中決定往第 ${i} 個子節點走`, 1, this.H([x, 'compare']));
      if (x.kids[i].keys.length === 2 * this.t - 1) { this.snap('下一個子節點已滿，先分裂（預先分裂，保證不需回頭）', 2, this.H([x.kids[i], 'bad'])); this.split(x, i); if (k > x.keys[i]) i++; }
      x = x.kids[i];
    }
    let i = x.keys.length;
    while (i > 0 && x.keys[i - 1] > k) i--;
    x.keys.splice(i, 0, k);
    this.snap(`插入 ${k} 到葉節點`, 4, { c: new Map([[x, 'swap']]), k: new Map([[x, i]]) });
  }
  search(k: number, show = true): boolean {
    let x = this.root;
    for (;;) {
      let i = 0;
      while (i < x.keys.length && k > x.keys[i]) i++;
      if (i < x.keys.length && x.keys[i] === k) { if (show) this.snap(`找到 ${k}`, 5, { c: new Map([[x, 'done']]), k: new Map([[x, i]]) }); return true; }
      if (show) this.snap(`在 [${x.keys.join(', ')}] 中比較，${x.leaf ? '已是葉節點' : `往第 ${i} 個子節點`}`, 5, this.H([x, 'compare']));
      if (x.leaf) { if (show) this.snap(`找不到 ${k}`, 5); return false; }
      x = x.kids[i];
    }
  }
  del(x: BTN, k: number) {
    const t = this.t;
    let i = 0;
    while (i < x.keys.length && k > x.keys[i]) i++;
    if (i < x.keys.length && x.keys[i] === k) {
      if (x.leaf) { x.keys.splice(i, 1); this.snap(`情況 1：${k} 在葉節點，直接刪除`, 6, this.H([x, 'swap'])); return; }
      const y = x.kids[i], z = x.kids[i + 1];
      if (y.keys.length >= t) {
        let p = y; while (!p.leaf) p = p.kids[p.kids.length - 1];
        const pred = p.keys[p.keys.length - 1];
        this.snap(`情況 2a：左子節點有 ≥ t 個鍵，以前驅 ${pred} 取代 ${k}`, 7, this.H([x, 'bad'], [p, 'compare']));
        x.keys[i] = pred; this.del(y, pred);
      } else if (z.keys.length >= t) {
        let s = z; while (!s.leaf) s = s.kids[0];
        const succ = s.keys[0];
        this.snap(`情況 2b：右子節點有 ≥ t 個鍵，以後繼 ${succ} 取代 ${k}`, 7, this.H([x, 'bad'], [s, 'compare']));
        x.keys[i] = succ; this.del(z, succ);
      } else {
        this.snap(`情況 2c：左右子節點都只有 t−1 個鍵，把 ${k} 與右子節點合併到左子節點`, 7, this.H([x, 'bad'], [y, 'compare'], [z, 'compare']));
        y.keys.push(x.keys.splice(i, 1)[0], ...z.keys);
        y.kids.push(...z.kids);
        x.kids.splice(i + 1, 1);
        if (x === this.root && !x.keys.length) { this.root = y; }
        this.snap('合併完成', 7, this.H([y, 'swap']));
        this.del(y, k);
      }
      return;
    }
    if (x.leaf) { this.snap(`找不到 ${k}`, 6); return; }
    let c = x.kids[i];
    if (c.keys.length === t - 1) {
      const L = x.kids[i - 1], R = x.kids[i + 1];
      if (L && L.keys.length >= t) {
        this.snap('情況 3a：要下降的子節點只有 t−1 個鍵，向左兄弟借一個（經由父節點旋轉）', 8, this.H([c, 'bad'], [L, 'compare']));
        c.keys.unshift(x.keys[i - 1]); x.keys[i - 1] = L.keys.pop()!;
        if (!L.leaf) c.kids.unshift(L.kids.pop()!);
      } else if (R && R.keys.length >= t) {
        this.snap('情況 3a：要下降的子節點只有 t−1 個鍵，向右兄弟借一個（經由父節點旋轉）', 8, this.H([c, 'bad'], [R, 'compare']));
        c.keys.push(x.keys[i]); x.keys[i] = R.keys.shift()!;
        if (!R.leaf) c.kids.push(R.kids.shift()!);
      } else {
        const li = L ? i - 1 : i;
        const a = x.kids[li], b = x.kids[li + 1];
        this.snap('情況 3b：兄弟也只有 t−1 個鍵，與兄弟及父節點的分隔鍵合併', 8, this.H([a, 'compare'], [b, 'compare']));
        a.keys.push(x.keys.splice(li, 1)[0], ...b.keys);
        a.kids.push(...b.kids);
        x.kids.splice(li + 1, 1);
        if (x === this.root && !x.keys.length) this.root = a;
        c = a;
      }
      this.snap('調整完成，繼續往下', 8, this.H([c, 'swap']));
    }
    this.del(c, k);
  }
  run(op: string, a?: any) {
    const k = num(a, rk());
    if (op === 'insert') this.insert(k);
    else if (op === 'search') this.search(k);
    else if (op === 'delete') { this.del(this.root, k); this.snap('刪除流程結束'); }
    else if (op === 'fill') { for (const x of rnd.distinct(10)) this.insert(x); this.r.frames = []; this.snap('隨機插入 10 個鍵'); }
  }
}

const btree: DSDef = {
  id: 'ds-b-tree', name: 'B 樹', en: 'B-Tree', cat,
  desc: '多路平衡搜尋樹：每個節點可存多個鍵與子節點，所有葉節點在同一深度。節點滿了就分裂、鍵太少就向兄弟借或合併。因為一個節點對應一個磁碟頁，樹非常矮，是資料庫與檔案系統索引的基礎。（此處 t = 2，即 2-3-4 樹）',
  complexity: [['搜尋／插入／刪除', 'O(log n)'], ['磁碟 I/O', 'O(log_t n)'], ['每個節點的鍵數', 't−1 ~ 2t−1']],
  codes: { insert: ['往下尋找插入位置', '途中遇到滿節點（2t−1 個鍵）先分裂', '分裂：中間鍵上移到父節點', '在葉節點插入'], search: ['', '', '', '', '在節點中找第一個 ≥ k 的鍵，相等則找到，否則往對應子節點'], delete: ['', '', '', '', '', '1：在葉節點直接刪除', '2：在內部節點：以前驅／後繼取代，或合併', '3：下降前確保子節點至少 t 個鍵（借或合併）'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: rk },
    { key: 'delete', label: '刪除', arg: 'number', rand: rk },
    { key: 'search', label: '搜尋', arg: 'number', rand: rk },
    { key: 'fill', label: '隨機插入 10 個', arg: 'none' },
  ],
  create: () => new BTreeDS(),
  init: [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 28].map((v) => ['insert', v] as [string, number]),
};

// ---------------- B+ 樹（階數 4：每個節點最多 3 個鍵） ----------------

class BPlusDS extends DSBase<{ c?: Map<BTN, Color>; k?: Map<BTN, number> }> {
  M = 4;
  id = 0;
  root: BTN = { id: this.id++, keys: [], kids: [], leaf: true, next: null };
  panels(h: { c?: Map<BTN, Color>; k?: Map<BTN, number> } = {}): Panel[] {
    return [btPanel(this.root, h.c ?? new Map(), h.k ?? new Map(), `B+ 樹（階數 ${this.M}：每節點最多 ${this.M - 1} 個鍵；資料都在葉節點，青色虛線為葉節點串列）`, true)];
  }
  H = (...p: [BTN, Color][]) => ({ c: new Map(p) });
  findLeaf(k: number, show = true) {
    let x = this.root;
    const path: BTN[] = [x];
    while (!x.leaf) {
      let i = 0;
      while (i < x.keys.length && k >= x.keys[i]) i++;
      if (show) this.snap(`在內部節點 [${x.keys.join(', ')}] 往第 ${i} 個子節點走`, 1, this.H([x, 'compare']));
      x = x.kids[i];
      path.push(x);
    }
    return { leaf: x, path };
  }
  insert(k: number) {
    const { leaf, path } = this.findLeaf(k);
    if (leaf.keys.includes(k)) { this.snap(`${k} 已存在`, 2, this.H([leaf, 'done'])); return; }
    let i = 0;
    while (i < leaf.keys.length && leaf.keys[i] < k) i++;
    leaf.keys.splice(i, 0, k);
    this.snap(`插入 ${k} 到葉節點`, 2, { c: new Map([[leaf, 'swap']]), k: new Map([[leaf, i]]) });
    let node = leaf;
    for (let d = path.length - 1; node.keys.length >= this.M; d--) {
      const nw: BTN = { id: this.id++, keys: [], kids: [], leaf: node.leaf, next: null };
      const mid = Math.ceil(node.keys.length / 2);
      let up: number;
      if (node.leaf) {
        nw.keys = node.keys.splice(mid);
        nw.next = node.next; node.next = nw;
        up = nw.keys[0];
        this.snap(`葉節點溢位：分裂，並把右半第一個鍵 ${up} 「複製」到父節點（葉節點仍保留）`, 3, this.H([node, 'compare'], [nw, 'compare']));
      } else {
        up = node.keys[mid - 1];
        nw.keys = node.keys.splice(mid);
        node.keys.pop();
        nw.kids = node.kids.splice(mid);
        this.snap(`內部節點溢位：分裂，中間鍵 ${up} 「移動」到父節點`, 4, this.H([node, 'compare'], [nw, 'compare']));
      }
      const parent = path[d - 1];
      if (!parent) {
        this.root = { id: this.id++, keys: [up], kids: [node, nw], leaf: false };
        this.snap('建立新的根節點（樹高 +1）', 4, this.H([this.root, 'swap']));
        break;
      }
      const pi = parent.kids.indexOf(node);
      parent.keys.splice(pi, 0, up);
      parent.kids.splice(pi + 1, 0, nw);
      this.snap(`父節點加入鍵 ${up}`, 4, this.H([parent, 'swap']));
      node = parent;
    }
  }
  search(k: number) {
    const { leaf } = this.findLeaf(k);
    const i = leaf.keys.indexOf(k);
    this.snap(i >= 0 ? `在葉節點找到 ${k}` : `葉節點中沒有 ${k}`, 5, { c: new Map([[leaf, i >= 0 ? 'done' : 'bad']]), k: new Map([[leaf, i]]) });
  }
  range(a: number, b: number) {
    if (a > b) [a, b] = [b, a];
    let { leaf } = this.findLeaf(a);
    const out: number[] = [];
    const seen = new Map<BTN, Color>();
    for (let x: BTN | null | undefined = leaf; x; x = x.next) {
      seen.set(x, 'frontier');
      const ks = x.keys.filter((k) => k >= a && k <= b);
      out.push(...ks);
      this.snap(`沿葉節點串列掃描 [${x.keys.join(', ')}]：取出 ${ks.join(', ') || '無'}`, 6, { c: new Map(seen) });
      if (x.keys.length && x.keys[x.keys.length - 1] > b) break;
    }
    this.snap(`範圍 [${a}, ${b}] 的結果：${out.join(', ') || '無'}（B+ 樹的範圍查詢只需沿葉節點串列走）`, 6, { c: seen });
  }
  minKeys(n: BTN) {
    return n === this.root ? (n.leaf ? 0 : 1) : Math.ceil(this.M / 2) - (n.leaf ? 1 : 1);
  }
  delete(k: number) {
    const { leaf, path } = this.findLeaf(k);
    const i = leaf.keys.indexOf(k);
    if (i < 0) { this.snap(`找不到 ${k}`, 7); return; }
    leaf.keys.splice(i, 1);
    this.snap(`從葉節點刪除 ${k}`, 7, this.H([leaf, 'bad']));
    let node = leaf;
    for (let d = path.length - 1; d > 0; d--) {
      const parent = path[d - 1];
      const pi = parent.kids.indexOf(node);
      if (node.leaf && pi > 0 && node.keys.length) parent.keys[pi - 1] = node.keys[0];
      const min = Math.ceil(this.M / 2) - 1;
      if (node.keys.length >= min) break;
      const L = parent.kids[pi - 1], R = parent.kids[pi + 1];
      if (L && L.keys.length > min) {
        if (node.leaf) { node.keys.unshift(L.keys.pop()!); parent.keys[pi - 1] = node.keys[0]; }
        else { node.keys.unshift(parent.keys[pi - 1]); parent.keys[pi - 1] = L.keys.pop()!; node.kids.unshift(L.kids.pop()!); }
        this.snap('鍵數不足：向左兄弟借一個', 8, this.H([node, 'swap'], [L, 'compare']));
        break;
      }
      if (R && R.keys.length > min) {
        if (node.leaf) { node.keys.push(R.keys.shift()!); parent.keys[pi] = R.keys[0]; }
        else { node.keys.push(parent.keys[pi]); parent.keys[pi] = R.keys.shift()!; node.kids.push(R.kids.shift()!); }
        if (node.leaf && pi > 0) parent.keys[pi - 1] = node.keys[0];
        this.snap('鍵數不足：向右兄弟借一個', 8, this.H([node, 'swap'], [R, 'compare']));
        break;
      }
      const [a, b, sep] = L ? [L, node, pi - 1] : [node, R!, pi];
      if (a.leaf) { a.keys.push(...b.keys); a.next = b.next; }
      else { a.keys.push(parent.keys[sep], ...b.keys); a.kids.push(...b.kids); }
      parent.keys.splice(sep, 1);
      parent.kids.splice(sep + 1, 1);
      this.snap('兄弟也不夠借：與兄弟合併，並移除父節點的分隔鍵', 9, this.H([a, 'swap']));
      node = parent;
    }
    if (!this.root.leaf && this.root.keys.length === 0) { this.root = this.root.kids[0]; this.snap('根節點沒有鍵了，樹高 −1', 9, this.H([this.root, 'swap'])); }
    this.snap(`刪除 ${k} 完成`, 9);
  }
  run(op: string, a?: any, b?: any) {
    const k = num(a, rk());
    if (op === 'insert') this.insert(k);
    else if (op === 'search') this.search(k);
    else if (op === 'range') this.range(k, num(b, k + 30));
    else if (op === 'delete') this.delete(k);
  }
}

const bplus: DSDef = {
  id: 'ds-b-plus-tree', name: 'B+ 樹', en: 'B+ Tree', cat,
  desc: 'B 樹的變形：所有資料都存在葉節點，內部節點只放索引鍵；葉節點以串列相連，因此範圍查詢與循序掃描非常有效率。MySQL InnoDB、多數資料庫索引都採用 B+ 樹。',
  complexity: [['搜尋／插入／刪除', 'O(log n)'], ['範圍查詢', 'O(log n + 結果數)'], ['每節點鍵數', '⌈M/2⌉−1 ~ M−1']],
  codes: { insert: ['從根找到目標葉節點', '插入葉節點（保持排序）', '葉溢位：分裂，右半首鍵複製到父節點', '內部溢位：分裂，中間鍵移到父節點'], search: ['', '', '', '', '往下走到葉節點，在葉中尋找'], range: ['', '', '', '', '', '找到起點所在葉節點，沿 next 串列掃描到終點'], delete: ['', '', '', '', '', '', '從葉節點刪除', '不足時向兄弟借', '無法借則合併，必要時降低樹高'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: rk },
    { key: 'delete', label: '刪除', arg: 'number', rand: rk },
    { key: 'search', label: '搜尋', arg: 'number', rand: rk },
    { key: 'range', label: '範圍查詢(a, b)', arg: 'two', argLabel: 'a b', rand: () => { const x = rnd.int(1, 60); return [x, x + rnd.int(10, 35)]; } },
  ],
  create: () => new BPlusDS(),
  init: [5, 15, 25, 35, 45, 10, 20, 30, 40, 50, 12, 28].map((v) => ['insert', v] as [string, number]),
};

export default [binaryTree, bst, avl, rbt, splay, btree, bplus, heap, trie];
