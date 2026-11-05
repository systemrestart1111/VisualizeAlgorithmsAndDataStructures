import type { AlgoDef, Color } from '../core/types';
import { Rec, vars, inArr, inNum, inSorted, rnd } from '../core/helpers';
import { listPanel, makeList, rowPos, GAP, type LL } from '../core/list';

const cat = 'linked';

const insDel: AlgoDef = {
  id: 'll-insert-delete', name: '插入與刪除', en: 'Linked List Insert & Delete', cat, star: true,
  desc: '在位置 i 插入：先走到第 i−1 個節點 prev，令 new.next = prev.next，再令 prev.next = new（順序不能顛倒）。刪除則令 prev.next = prev.next.next。',
  time: '定位 O(n)，改指標 O(1)', space: 'O(1)',
  code: ['insert(i, v):', '  prev = 走到第 i-1 個節點', '  node.next = prev.next', '  prev.next = node', 'delete(i):', '  prev = 走到第 i-1 個節點', '  target = prev.next', '  prev.next = target.next'],
  inputs: [inArr([10, 20, 30, 40, 50], '串列', 5), inNum('i', '插入位置 i', 2, 0, 20), inNum('v', '插入值 v', 99, undefined, undefined, () => rnd.int(1, 99)), inNum('d', '之後刪除位置', 4, 0, 20)],
  run({ arr, i, v, d }) {
    const r = new Rec();
    const { L, ids } = makeList(arr);
    const dummy = -1;
    L.val[dummy] = 'H';
    L.next[dummy] = ids[0] ?? null;
    L.pos[dummy] = { x: -GAP, y: 0 };
    const P = (o: Parameters<typeof listPanel>[1] = {}) => listPanel(L, { showNull: true, ...o, title: '（H 為 dummy head）' });
    i = Math.min(i, ids.length);
    let prev = dummy;
    r.snap(`在位置 ${i} 插入 ${v}`, [P({ labels: { prev } })], 1);
    for (let k = 0; k < i; k++) {
      prev = L.next[prev]!;
      r.snap(`prev 前進到第 ${k} 個節點`, [P({ labels: { prev }, colors: { [prev]: 'active' } })], 2);
    }
    const nid = 1000;
    L.val[nid] = v;
    L.next[nid] = null;
    L.pos[nid] = { x: L.pos[prev].x + GAP / 2, y: 70 };
    r.snap(`建立新節點 ${v}`, [P({ labels: { prev, node: nid }, colors: { [prev]: 'active', [nid]: 'swap' } })], 2);
    L.next[nid] = L.next[prev];
    r.snap('node.next = prev.next', [P({ labels: { prev, node: nid }, colors: { [prev]: 'active', [nid]: 'swap' }, edgeColors: { [nid]: 'swap' } })], 3);
    L.next[prev] = nid;
    r.snap('prev.next = node，插入完成', [P({ labels: { prev, node: nid }, colors: { [nid]: 'done' }, edgeColors: { [prev]: 'swap' } })], 4);
    // 重新排列位置
    const order: number[] = [];
    for (let c: number | null = L.next[dummy]; c !== null; c = L.next[c]) order.push(c);
    Object.assign(L.pos, rowPos(order));
    r.snap('重新排列', [P({ colors: { [nid]: 'done' } })]);
    d = Math.min(d, order.length - 1);
    prev = dummy;
    r.snap(`刪除位置 ${d}`, [P({ labels: { prev } })], 5);
    for (let k = 0; k < d; k++) {
      prev = L.next[prev]!;
      r.snap(`prev 前進`, [P({ labels: { prev }, colors: { [prev]: 'active' } })], 6);
    }
    const tg = L.next[prev]!;
    r.snap(`target = prev.next（值 ${L.val[tg]}）`, [P({ labels: { prev, target: tg }, colors: { [prev]: 'active', [tg]: 'bad' } })], 7);
    L.next[prev] = L.next[tg];
    L.pos[tg] = { x: L.pos[tg].x, y: 70 };
    r.snap('prev.next = target.next，target 被移出串列', [P({ labels: { prev, target: tg }, colors: { [tg]: 'muted' }, edgeColors: { [prev]: 'swap' } })], 8);
    delete L.val[tg];
    const order2: number[] = [];
    for (let c: number | null = L.next[dummy]; c !== null; c = L.next[c]) order2.push(c);
    Object.assign(L.pos, rowPos(order2));
    r.snap('刪除完成', [P()]);
    return r.frames;
  },
};

const reverse: AlgoDef = {
  id: 'll-reverse', name: '串列反轉', en: 'Reverse Linked List', cat, star: true,
  desc: '以 prev、cur、next 三個指標迭代：每一步把 cur.next 指回 prev，然後三個指標一起往前移。',
  time: 'O(n)', space: 'O(1)',
  code: ['prev = null, cur = head', 'while cur != null:', '  next = cur.next', '  cur.next = prev', '  prev = cur', '  cur = next', 'head = prev'],
  inputs: [inArr([1, 2, 3, 4, 5, 6], '串列', 6)],
  run({ arr }) {
    const r = new Rec();
    const { L, ids } = makeList(arr);
    let prev: number | null = null, cur: number | null = ids[0] ?? null, nxt: number | null = null;
    const done = new Set<number>();
    const P = (ec: Record<number, Color> = {}) => listPanel(L, { labels: { prev, cur, next: nxt }, colors: Object.fromEntries([...done].map((d) => [d, 'done' as Color]).concat(cur !== null ? [[cur, 'active']] : [])), edgeColors: ec });
    r.snap('prev = null, cur = head', [P()], 1);
    while (cur !== null) {
      nxt = L.next[cur];
      r.snap('next = cur.next（先記住下一個）', [P()], 3);
      L.next[cur] = prev;
      r.snap('cur.next = prev（反轉指標）', [P({ [cur]: 'swap' })], 4);
      done.add(cur);
      prev = cur;
      cur = nxt;
      r.snap('prev = cur, cur = next', [P()], 6);
    }
    nxt = null;
    r.snap(`head = prev，反轉完成`, [listPanel(L, { labels: { head: prev }, colors: Object.fromEntries(ids.map((d) => [d, 'done'])) })], 7);
    return r.frames;
  },
};

const middle: AlgoDef = {
  id: 'll-middle', name: '尋找中點', en: 'Find Middle (Slow / Fast Pointers)', cat,
  desc: '快慢指標：slow 每次走一步、fast 每次走兩步。fast 走到尾端時，slow 恰好在中點。',
  time: 'O(n)', space: 'O(1)',
  code: ['slow = fast = head', 'while fast != null and fast.next != null:', '  slow = slow.next', '  fast = fast.next.next', 'return slow'],
  inputs: [inArr([3, 7, 1, 9, 4, 8, 2], '串列', 7)],
  run({ arr }) {
    const r = new Rec();
    const { L, ids } = makeList(arr);
    let slow: number | null = ids[0], fast: number | null = ids[0];
    const P = (c: Color = 'active') => listPanel(L, { labels: { slow, fast }, colors: { ...(fast !== null ? { [fast]: 'frontier' as Color } : {}), ...(slow !== null ? { [slow]: c } : {}) } });
    r.snap('slow = fast = head', [P()], 1);
    while (fast !== null && L.next[fast] !== null) {
      slow = L.next[slow!];
      fast = L.next[L.next[fast]!];
      r.snap('slow 走一步，fast 走兩步', [P()], 3);
    }
    r.snap(`fast 到達尾端，中點為 ${L.val[slow!]}`, [P('done')], 5);
    return r.frames;
  },
};

const mergeSorted: AlgoDef = {
  id: 'll-merge-sorted', name: '合併有序串列', en: 'Merge Two Sorted Lists', cat,
  desc: '用一個 dummy 節點與 tail 指標，每次從兩串列的頭取較小者接到 tail 後面。只改指標，不建立新節點。',
  time: 'O(n + m)', space: 'O(1)',
  code: ['dummy = new Node, tail = dummy', 'while a != null and b != null:', '  if a.val <= b.val: tail.next = a; a = a.next', '  else: tail.next = b; b = b.next', '  tail = tail.next', 'tail.next = (a != null ? a : b)', 'return dummy.next'],
  inputs: [inSorted([1, 4, 7, 10, 15], '串列 A', 5), { key: 'b', label: '串列 B', type: 'array', default: [2, 3, 8, 12, 20, 25], random: () => rnd.sorted(rnd.int(3, 6)) }],
  run({ arr, b }) {
    const r = new Rec();
    const A = [...arr].sort((x, y) => x - y), B = [...b].sort((x, y) => x - y);
    const L: LL = { val: {}, next: {}, pos: {} };
    const ia = A.map((_, i) => i), ib = B.map((_, i) => 100 + i);
    ia.forEach((id, i) => { L.val[id] = A[i]; L.next[id] = ia[i + 1] ?? null; L.pos[id] = { x: GAP * (i + 1), y: 0 }; });
    ib.forEach((id, i) => { L.val[id] = B[i]; L.next[id] = ib[i + 1] ?? null; L.pos[id] = { x: GAP * (i + 1) + GAP / 2, y: 120 }; });
    const D = -1;
    L.val[D] = 'D'; L.next[D] = null; L.pos[D] = { x: 0, y: 60 };
    let a: number | null = ia[0] ?? null, bb: number | null = ib[0] ?? null, tail = D;
    const merged = new Set<number>();
    const P = (ec: Record<number, Color> = {}) => listPanel(L, { labels: { a, b: bb, tail }, colors: { ...Object.fromEntries([...merged].map((m) => [m, 'done' as Color])), [D]: 'muted' }, edgeColors: ec, title: '上：A　下：B　（D 為 dummy）' });
    r.snap('dummy 與 tail 指向同一個哨兵節點', [P()], 1);
    while (a !== null && bb !== null) {
      r.snap(`比較 ${L.val[a]} 與 ${L.val[bb]}`, [P()], 2);
      if ((L.val[a] as number) <= (L.val[bb] as number)) { L.next[tail] = a; a = L.next[a]; }
      else { L.next[tail] = bb; bb = L.next[bb]; }
      const e = tail;
      tail = L.next[tail]!;
      merged.add(tail);
      r.snap(`接上 ${L.val[tail]}，tail 前進`, [P({ [e]: 'swap' })], 5);
    }
    L.next[tail] = a ?? bb;
    for (let c = L.next[tail]; c !== null; c = L.next[c]) merged.add(c);
    r.snap('其中一條用完，把剩下的整段接上', [P({ [tail]: 'swap' })], 6);
    const order: number[] = [];
    for (let c: number | null = L.next[D]; c !== null; c = L.next[c]) order.push(c);
    Object.assign(L.pos, rowPos(order, 60, GAP));
    r.snap('合併完成（重新排列）', [listPanel(L, { labels: { head: order[0] }, colors: Object.fromEntries(order.map((o) => [o, 'done'])), hide: new Set([D]) })], 7);
    return r.frames;
  },
};

const removeNth: AlgoDef = {
  id: 'll-remove-nth', name: '刪除倒數第 k 個節點', en: 'Remove k-th Node from End', cat,
  desc: '雙指標：fast 先走 k 步，之後 fast、slow 同步前進；fast 到尾時 slow 正好在待刪節點的前一個。用 dummy 處理刪除頭節點的情況。',
  time: 'O(n)', space: 'O(1)',
  code: ['dummy.next = head; slow = fast = dummy', 'fast 先走 k 步', 'while fast.next != null:', '  slow = slow.next; fast = fast.next', 'slow.next = slow.next.next'],
  inputs: [inArr([10, 20, 30, 40, 50, 60, 70], '串列', 7), inNum('k', 'k', 3, 1, 20)],
  run({ arr, k }) {
    const r = new Rec();
    const { L, ids } = makeList(arr);
    k = Math.max(1, Math.min(k, ids.length));
    const D = -1;
    L.val[D] = 'D'; L.next[D] = ids[0]; L.pos[D] = { x: -GAP, y: 0 };
    let slow = D, fast = D;
    const P = (c: Record<number, Color> = {}, ec: Record<number, Color> = {}) => listPanel(L, { labels: { slow, fast }, colors: { [D]: 'muted', ...c }, edgeColors: ec, showNull: true });
    r.snap('slow = fast = dummy', [P()], 1);
    for (let s = 0; s < k; s++) {
      fast = L.next[fast]!;
      r.snap(`fast 先走第 ${s + 1} 步`, [P({ [fast]: 'frontier' })], 2);
    }
    while (L.next[fast] !== null) {
      slow = L.next[slow]!;
      fast = L.next[fast]!;
      r.snap('slow、fast 同步前進', [P({ [fast]: 'frontier', [slow]: 'active' })], 4);
    }
    const tg = L.next[slow]!;
    r.snap(`fast 到尾端；slow.next（${L.val[tg]}）就是倒數第 ${k} 個`, [P({ [slow]: 'active', [tg]: 'bad' })], 5);
    L.next[slow] = L.next[tg];
    L.pos[tg] = { ...L.pos[tg], y: 70 };
    r.snap('slow.next = slow.next.next', [P({ [tg]: 'muted' }, { [slow]: 'swap' })], 5);
    return r.frames;
  },
};

function cycleList(vals: number[], entry: number) {
  // 前段排成一列，環的部分排成圓形
  const L: LL = { val: {}, next: {}, pos: {} };
  const n = vals.length;
  vals.forEach((v, i) => { L.val[i] = v; L.next[i] = i + 1 < n ? i + 1 : entry >= 0 ? entry : null; });
  const cyc = entry >= 0 ? n - entry : 0;
  for (let i = 0; i < n; i++) {
    if (entry < 0 || i < entry) L.pos[i] = { x: i * GAP, y: 0 };
    else {
      const R = Math.max(60, (cyc * GAP) / (2 * Math.PI));
      const ang = Math.PI + ((i - entry) / cyc) * 2 * Math.PI;
      L.pos[i] = { x: entry * GAP + R + R * Math.cos(ang), y: R * Math.sin(ang) };
    }
  }
  return L;
}

const cycleInputs = () => [inArr([3, 8, 1, 6, 9, 4, 7, 2, 5], '節點值', 9), inNum('pos', '尾端接回的位置（-1 = 無環）', 3, -1, 30, () => rnd.int(0, 6))];

const floyd: AlgoDef = {
  id: 'floyd-cycle', name: '龜兔賽跑環偵測', en: "Floyd's Cycle Detection (Tortoise & Hare)", cat,
  desc: '龜兔賽跑：slow 每次一步、fast 每次兩步。若有環，fast 必定在環內追上 slow；若 fast 走到 null 則無環。',
  time: 'O(n)', space: 'O(1)',
  code: ['slow = fast = head', 'while fast != null and fast.next != null:', '  slow = slow.next', '  fast = fast.next.next', '  if slow == fast: return 有環', 'return 無環'],
  inputs: cycleInputs(),
  run({ arr, pos }) {
    const r = new Rec();
    pos = Math.min(pos, arr.length - 1);
    const L = cycleList(arr, pos);
    let slow: number | null = 0, fast: number | null = 0;
    const P = (c?: Record<number, Color>) => listPanel(L, { labels: { slow, fast }, colors: c ?? { ...(fast !== null ? { [fast]: 'frontier' as Color } : {}), ...(slow !== null ? { [slow]: 'active' as Color } : {}) }, showNull: pos < 0 });
    r.snap('slow = fast = head', [P()], 1);
    let steps = 0;
    while (fast !== null && L.next[fast] !== null) {
      slow = L.next[slow!];
      fast = L.next[L.next[fast]!];
      steps++;
      r.snap(`第 ${steps} 步：slow → ${L.val[slow!]}，fast → ${fast === null ? 'null' : L.val[fast]}`, [P(), vars({ steps })], 3);
      if (slow === fast) {
        r.snap(`slow 與 fast 在節點 ${L.val[slow!]} 相遇 → 有環！`, [P({ [slow!]: 'done' }), vars({ steps })], 5);
        return r.frames;
      }
    }
    r.snap('fast 走到 null → 無環', [P(), vars({ steps })], 6);
    return r.frames;
  },
};

const entry: AlgoDef = {
  id: 'cycle-entry', name: '尋找環入口', en: 'Find Cycle Start', cat,
  desc: 'Floyd 相遇後，把一個指標放回 head，兩者都改成每次走一步，再次相遇的位置就是環的入口。（因為 head 到入口的距離 ≡ 相遇點到入口的距離 mod 環長）',
  time: 'O(n)', space: 'O(1)',
  code: ['以 Floyd 找到相遇點 meet', 'p = head, q = meet', 'while p != q:', '  p = p.next; q = q.next', 'return p   (環入口)'],
  inputs: [inArr([3, 8, 1, 6, 9, 4, 7, 2, 5], '節點值', 9), inNum('pos', '尾端接回的位置', 3, 0, 30, () => rnd.int(0, 6))],
  run({ arr, pos }) {
    const r = new Rec();
    pos = Math.max(0, Math.min(pos, arr.length - 1));
    const L = cycleList(arr, pos);
    let slow = 0, fast = 0;
    do {
      slow = L.next[slow]!;
      fast = L.next[L.next[fast]!]!;
      r.snap('階段一：Floyd 快慢指標', [listPanel(L, { labels: { slow, fast }, colors: { [fast]: 'frontier', [slow]: 'active' } })], 1);
    } while (slow !== fast);
    r.snap(`在 ${L.val[slow]} 相遇`, [listPanel(L, { labels: { meet: slow }, colors: { [slow]: 'special' } })], 1);
    let p = 0, q = slow;
    r.snap('p 回到 head，q 留在相遇點', [listPanel(L, { labels: { p, q }, colors: { [p]: 'active', [q]: 'frontier' } })], 2);
    while (p !== q) {
      p = L.next[p]!;
      q = L.next[q]!;
      r.snap('p、q 各走一步', [listPanel(L, { labels: { p, q }, colors: { [p]: 'active', [q]: 'frontier' } })], 4);
    }
    r.snap(`再次相遇於 ${L.val[p]}（索引 ${p}），即為環入口`, [listPanel(L, { labels: { entry: p }, colors: { [p]: 'done' } })], 5);
    return r.frames;
  },
};

const intersect: AlgoDef = {
  id: 'll-intersection', name: '相交串列偵測', en: 'Intersection of Two Lists', cat,
  desc: '兩指標 pA、pB 分別從兩串列頭出發，走到尾端就跳到「另一條」的頭。兩者走過的總長相同（a + c + b），因此會在交點相遇；若不相交則同時到達 null。',
  time: 'O(n + m)', space: 'O(1)',
  code: ['pA = headA, pB = headB', 'while pA != pB:', '  pA = (pA == null) ? headB : pA.next', '  pB = (pB == null) ? headA : pB.next', 'return pA   (交點或 null)'],
  inputs: [inArr([4, 1, 7], 'A 獨有部分', 3), { key: 'b', label: 'B 獨有部分', type: 'array', default: [5, 6, 2, 9, 3], random: () => rnd.arr(rnd.int(1, 5)) }, { key: 'c', label: '共同部分（空 = 不相交）', type: 'array', default: [8, 10, 12], random: () => rnd.arr(rnd.int(0, 3)) }],
  run({ arr, b, c }) {
    const r = new Rec();
    const L: LL = { val: {}, next: {}, pos: {} };
    const A = arr.map((_: number, i: number) => i), B = b.map((_: number, i: number) => 100 + i), C = c.map((_: number, i: number) => 200 + i);
    const off = Math.max(A.length, B.length);
    A.forEach((id: number, i: number) => { L.val[id] = arr[i]; L.pos[id] = { x: (off - A.length + i) * GAP, y: 0 }; L.next[id] = A[i + 1] ?? C[0] ?? null; });
    B.forEach((id: number, i: number) => { L.val[id] = b[i]; L.pos[id] = { x: (off - B.length + i) * GAP, y: 140 }; L.next[id] = B[i + 1] ?? C[0] ?? null; });
    C.forEach((id: number, i: number) => { L.val[id] = c[i]; L.pos[id] = { x: (off + i) * GAP + GAP / 2, y: 70 }; L.next[id] = C[i + 1] ?? null; });
    const hA = A[0] ?? C[0] ?? null, hB = B[0] ?? C[0] ?? null;
    let pA: number | null = hA, pB: number | null = hB;
    const P = () => listPanel(L, { labels: { pA, pB }, colors: { ...(pA !== null ? { [pA]: 'active' as Color } : {}), ...(pB !== null ? { [pB]: 'frontier' as Color } : {}), ...Object.fromEntries(C.map((x: number) => [x, pA === x && pB === x ? 'done' : (pA === x ? 'active' : pB === x ? 'frontier' : 'muted') as Color])) }, title: '上：A　下：B　中間灰色：共同部分' });
    r.snap('pA = headA, pB = headB', [P()], 1);
    let guard = 0;
    while (pA !== pB && guard++ < 100) {
      pA = pA === null ? hB : L.next[pA];
      pB = pB === null ? hA : L.next[pB];
      r.snap(`pA → ${pA === null ? 'null' : L.val[pA]}，pB → ${pB === null ? 'null' : L.val[pB]}`, [P()], 3);
    }
    r.snap(pA === null ? '兩者同時到達 null → 不相交' : `相遇於節點 ${L.val[pA]}，即為交點`, [P()], 5);
    return r.frames;
  },
};

export default [insDel, reverse, middle, mergeSorted, removeNth, floyd, entry, intersect];
