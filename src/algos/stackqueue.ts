import type { AlgoDef, CMap } from '../core/types';
import { Rec, bars, cells, vars, inArr, inNum, inText, rnd, range } from '../core/helpers';
import { ptrs } from '../core/sortTracer';

const cat = 'stackq';

const stackCells = (s: unknown[], c: CMap = {}, title = '堆疊（右端為頂）') => cells(s.length ? s : [''], s.length ? c : {}, { title, headers: false, w: 'half' });

const paren: AlgoDef = {
  id: 'parentheses', name: '括號匹配', en: 'Balanced Parentheses', cat, star: true,
  desc: '遇到左括號就推入堆疊；遇到右括號時，堆疊頂必須是對應的左括號，否則不合法。最後堆疊必須為空。',
  time: 'O(n)', space: 'O(n)',
  code: ['for ch in s:', '  if ch 是左括號: push(ch)', '  elif ch 是右括號:', '    if 堆疊空 or top 不匹配: return false', '    pop()', 'return 堆疊為空'],
  inputs: [inText('s', '字串', '{[()()]}([]{})', () => rnd.pick(['(([]){})', '{[(])}', '((a+b)*[c-d])', '([{}])(', '}{', '[()]{}{[()()]()}']))],
  run({ s }) {
    const r = new Rec();
    const ch = [...s];
    const st: { c: string; i: number }[] = [];
    const pair: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
    const matched: CMap = {};
    for (let i = 0; i < ch.length; i++) {
      const c = ch[i];
      if ('([{'.includes(c)) {
        st.push({ c, i });
        r.snap(`'${c}' 是左括號，推入堆疊`, [cells(ch, { ...matched, [i]: 'active' }), stackCells(st.map((x) => x.c), { [st.length - 1]: 'swap' })], 2);
      } else if (')]}'.includes(c)) {
        if (!st.length || st[st.length - 1].c !== pair[c]) {
          r.snap(st.length ? `'${c}' 與堆疊頂 '${st[st.length - 1].c}' 不匹配 → 不合法` : `'${c}' 出現時堆疊為空 → 不合法`, [cells(ch, { ...matched, [i]: 'bad' }), stackCells(st.map((x) => x.c), { [st.length - 1]: 'bad' })], 4);
          return r.frames;
        }
        const top = st.pop()!;
        matched[top.i] = 'done';
        matched[i] = 'done';
        r.snap(`'${c}' 與堆疊頂 '${top.c}' 匹配，彈出`, [cells(ch, { ...matched, [i]: 'good', [top.i]: 'good' }), stackCells(st.map((x) => x.c))], 5);
      } else r.snap(`'${c}' 不是括號，略過`, [cells(ch, { ...matched, [i]: 'muted' }), stackCells(st.map((x) => x.c))], 1);
    }
    r.snap(st.length ? `結束時堆疊還有 ${st.length} 個左括號 → 不合法` : '堆疊為空 → 括號完全匹配！', [cells(ch, { ...matched, ...Object.fromEntries(st.map((x) => [x.i, 'bad'])) }), stackCells(st.map((x) => x.c))], 6);
    return r.frames;
  },
};

const PREC: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 };
const tokenize = (s: string) => s.match(/\d+(\.\d+)?|[a-zA-Z_]\w*|[-+*/%^(),]/g) ?? [];

const infix: AlgoDef = {
  id: 'infix-to-postfix', name: '中序轉後序表示式', en: 'Infix to Postfix', cat,
  desc: '運算元直接輸出；運算子依優先序處理：堆疊頂優先序較高（或相同且左結合）時先彈出輸出。左括號推入，右括號則彈出直到遇到左括號。',
  time: 'O(n)', space: 'O(n)',
  code: ['for tok in tokens:', '  數字/變數: output.append(tok)', '  "(": push', '  ")": pop 到 output 直到 "("', '  運算子 o:', '    while top 是運算子且 (prec(top) > prec(o)', '          或 相同且 o 左結合): pop → output', '    push(o)', '最後把堆疊剩餘全部 pop → output'],
  inputs: [inText('s', '中序表示式', 'A + B * (C - D) / E ^ F ^ G', () => rnd.pick(['a*(b+c)-d/e', '3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3', '(A+B)*(C+D)', 'x^y/(5*z)+2']))],
  run({ s }) {
    const r = new Rec();
    const tk = tokenize(s);
    const out: string[] = [], st: string[] = [];
    const P = (i: number, sc: CMap = {}, oc: CMap = {}) => [cells(tk, { ...range(0, i - 1, 'muted'), [i]: 'active' }, { title: '輸入 tokens' }), stackCells(st, sc, '運算子堆疊（右端為頂）'), cells(out.length ? out : [''], oc, { title: '輸出（後序）', headers: false, w: 'half' })];
    for (let i = 0; i < tk.length; i++) {
      const t = tk[i];
      if (/^[\w.]+$/.test(t)) { out.push(t); r.snap(`運算元 ${t} 直接輸出`, P(i, {}, { [out.length - 1]: 'swap' }), 2); }
      else if (t === '(') { st.push(t); r.snap('左括號推入堆疊', P(i, { [st.length - 1]: 'swap' }), 3); }
      else if (t === ')') {
        while (st.length && st[st.length - 1] !== '(') { out.push(st.pop()!); r.snap(`彈出 ${out[out.length - 1]} 到輸出`, P(i, {}, { [out.length - 1]: 'swap' }), 4); }
        st.pop();
        r.snap('丟棄左括號', P(i), 4);
      } else {
        while (st.length && st[st.length - 1] !== '(' && (PREC[st[st.length - 1]] > PREC[t] || (PREC[st[st.length - 1]] === PREC[t] && t !== '^'))) {
          out.push(st.pop()!);
          r.snap(`堆疊頂 ${out[out.length - 1]} 優先序 ≥ ${t}，彈出輸出`, P(i, {}, { [out.length - 1]: 'swap' }), 6);
        }
        st.push(t);
        r.snap(`推入 ${t}${t === '^' ? '（^ 為右結合）' : ''}`, P(i, { [st.length - 1]: 'swap' }), 8);
      }
    }
    while (st.length) { out.push(st.pop()!); r.snap(`清空堆疊：輸出 ${out[out.length - 1]}`, P(tk.length, {}, { [out.length - 1]: 'swap' }), 9); }
    r.snap(`後序表示式：${out.join(' ')}`, P(tk.length, {}, Object.fromEntries(out.map((_, i) => [i, 'done']))), 9);
    return r.frames;
  },
};

const postfix: AlgoDef = {
  id: 'postfix-eval', name: '後序表示式求值', en: 'Postfix Evaluation', cat,
  desc: '由左至右掃描：數字推入堆疊；遇到運算子就彈出兩個運算元（先彈出的是右運算元），計算後把結果推回。',
  time: 'O(n)', space: 'O(n)',
  code: ['for tok in tokens:', '  if tok 是數字: push(tok)', '  else:', '    b = pop(); a = pop()', '    push(a tok b)', 'return pop()'],
  inputs: [inText('s', '後序表示式（空白分隔）', '5 1 2 + 4 * + 3 -', () => rnd.pick(['2 3 1 * + 9 -', '6 2 / 3 - 4 2 * +', '3 4 + 2 * 7 /', '2 3 ^ 1 -']))],
  run({ s }) {
    const r = new Rec();
    const tk = String(s).trim().split(/\s+/);
    const st: number[] = [];
    for (let i = 0; i < tk.length; i++) {
      const t = tk[i];
      const tc = { ...range(0, i - 1, 'muted'), [i]: 'active' } as CMap;
      if (!Number.isNaN(Number(t))) { st.push(Number(t)); r.snap(`數字 ${t} 推入`, [cells(tk, tc, { title: 'tokens' }), stackCells(st, { [st.length - 1]: 'swap' })], 2); continue; }
      const b = st.pop() ?? 0, a = st.pop() ?? 0;
      r.snap(`運算子 ${t}：彈出 b = ${b}、a = ${a}`, [cells(tk, tc, { title: 'tokens' }), stackCells(st), vars({ a, b })], 4);
      const v = t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : t === '/' ? a / b : t === '%' ? a % b : t === '^' ? a ** b : NaN;
      st.push(+v.toFixed(6));
      r.snap(`${a} ${t} ${b} = ${st[st.length - 1]}，推回`, [cells(tk, tc, { title: 'tokens' }), stackCells(st, { [st.length - 1]: 'swap' }), vars({ a, b })], 5);
    }
    r.snap(`結果 = ${st[st.length - 1]}`, [cells(tk, range(0, tk.length - 1, 'muted'), { title: 'tokens' }), stackCells(st, { [st.length - 1]: 'done' })], 6);
    return r.frames;
  },
};

const FN: Record<string, (...a: number[]) => number> = { max: Math.max, min: Math.min, sqrt: Math.sqrt, abs: Math.abs, sin: Math.sin, cos: Math.cos };

const shunting: AlgoDef = {
  id: 'shunting-yard', name: '調度場演算法（直接求值）', en: 'Shunting Yard Evaluation', cat,
  desc: 'Dijkstra 調車場演算法的完整版：同時維護「數值堆疊」與「運算子堆疊」，彈出運算子時立刻計算。支援函式（max、min、sqrt、abs）、逗號參數、一元負號與右結合的 ^。',
  time: 'O(n)', space: 'O(n)',
  code: ['for tok in tokens:', '  數字: vals.push', '  函式名稱 / "(": ops.push', '  ",": 計算直到遇到 "("', '  ")": 計算直到 "("，彈出 "("；若頂端是函式則套用', '  運算子 o: 當 ops 頂端優先序較高時先計算', '    ops.push(o)', '把 ops 剩下的全部計算完', 'apply: 彈出運算子與運算元，計算後推回 vals'],
  inputs: [inText('s', '中序表示式', '3 + max(4, 2 * 5) * -2 ^ 2 - sqrt(16)', () => rnd.pick(['2 * (3 + 4) ^ 2', 'max(1, min(7, 3)) * 10 - 4', '-(5 - 8) * abs(-3) + 2 ^ 3 ^ 2 / 64', '10 / 4 - 1.5']))],
  run({ s }) {
    const r = new Rec();
    const tk = tokenize(s);
    const vals: number[] = [], ops: string[] = [];
    const argc: number[] = [];
    let i = 0;
    const P = (vc: CMap = {}, oc: CMap = {}) => [cells(tk, { ...range(0, i - 1, 'muted'), [i]: 'active' }, { title: '輸入 tokens' }), stackCells(vals, vc, '數值堆疊'), stackCells(ops, oc, '運算子堆疊')];
    const prec = (o: string) => (o === 'neg' ? 2.5 : PREC[o] ?? 0);
    const apply = () => {
      const o = ops.pop()!;
      let v: number, desc: string;
      if (o === 'neg') { const a = vals.pop()!; v = -a; desc = `−(${a})`; }
      else if (FN[o]) {
        const n = argc.pop() ?? 1;
        const args = vals.splice(vals.length - n, n);
        v = FN[o](...args); desc = `${o}(${args.join(', ')})`;
      } else {
        const b = vals.pop()!, a = vals.pop()!;
        v = o === '+' ? a + b : o === '-' ? a - b : o === '*' ? a * b : o === '/' ? a / b : o === '%' ? a % b : a ** b;
        desc = `${a} ${o} ${b}`;
      }
      vals.push(+v.toFixed(6));
      r.snap(`計算 ${desc} = ${vals[vals.length - 1]}`, P({ [vals.length - 1]: 'swap' }), 9);
    };
    let prevIsValue = false;
    for (; i < tk.length; i++) {
      const t = tk[i];
      if (/^\d/.test(t)) { vals.push(Number(t)); prevIsValue = true; r.snap(`數字 ${t} 推入數值堆疊`, P({ [vals.length - 1]: 'swap' }), 2); }
      else if (FN[t]) { ops.push(t); argc.push(1); prevIsValue = false; r.snap(`函式 ${t} 推入運算子堆疊`, P({}, { [ops.length - 1]: 'swap' }), 3); }
      else if (t === '(') { ops.push(t); prevIsValue = false; r.snap('左括號推入', P({}, { [ops.length - 1]: 'swap' }), 3); }
      else if (t === ',') {
        while (ops.length && ops[ops.length - 1] !== '(') apply();
        argc[argc.length - 1]++;
        prevIsValue = false;
        r.snap('逗號：參數個數 +1', P(), 4);
      } else if (t === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') apply();
        ops.pop();
        r.snap('遇到右括號，彈出左括號', P(), 5);
        if (ops.length && FN[ops[ops.length - 1]]) apply();
        prevIsValue = true;
      } else {
        const o = t === '-' && !prevIsValue ? 'neg' : t;
        if (o !== 'neg')
          while (ops.length && ops[ops.length - 1] !== '(' && !FN[ops[ops.length - 1]] && (prec(ops[ops.length - 1]) > prec(o) || (prec(ops[ops.length - 1]) === prec(o) && o !== '^'))) apply();
        ops.push(o);
        prevIsValue = false;
        r.snap(o === 'neg' ? '前面不是數值，「-」視為一元負號 neg' : `運算子 ${o} 推入`, P({}, { [ops.length - 1]: 'swap' }), 7);
      }
    }
    while (ops.length) apply();
    r.snap(`結果 = ${vals[0]}`, P({ 0: 'done' }), 8);
    return r.frames;
  },
};

const nge: AlgoDef = {
  id: 'next-greater', name: '下一個較大元素', en: 'Next Greater Element (Monotonic Stack)', cat,
  desc: '單調遞減堆疊：由左到右掃描，當目前元素大於堆疊頂端時，堆疊頂端的「下一個較大元素」就是目前元素，彈出並記錄。',
  time: 'O(n)', space: 'O(n)',
  code: ['ans[0..n-1] = -1, st = []', 'for i = 0 .. n-1:', '  while st 非空 and a[st.top] < a[i]:', '    ans[st.pop()] = a[i]', '  st.push(i)'],
  inputs: [inArr([4, 5, 2, 10, 8, 3, 7, 1, 9, 6], '陣列', 10)],
  run({ arr: a }) {
    const r = new Rec();
    const ans = new Array(a.length).fill(-1);
    const st: number[] = [];
    const P = (i: number, c: CMap = {}, ac: CMap = {}) => [bars(a, { ...Object.fromEntries(st.map((s) => [s, 'frontier'])), [i]: 'active', ...c }, { pointers: ptrs({ i }) }), stackCells(st.map((s) => `${a[s]}(#${s})`), {}, '堆疊（存索引，值單調遞減）'), cells(ans, ac, { title: 'ans', w: 'half' })];
    for (let i = 0; i < a.length; i++) {
      r.snap(`處理 a[${i}] = ${a[i]}`, P(i), 2);
      while (st.length && a[st[st.length - 1]] < a[i]) {
        const j = st.pop()!;
        ans[j] = a[i];
        r.snap(`a[${j}] = ${a[j]} < ${a[i]}，它的下一個較大元素是 ${a[i]}`, P(i, { [j]: 'done' }, { [j]: 'swap' }), 4);
      }
      st.push(i);
      r.snap(`推入索引 ${i}`, P(i), 5);
    }
    r.snap('堆疊中剩餘的元素沒有下一個較大元素（-1）', P(-1, {}, Object.fromEntries(ans.map((_, i) => [i, 'done']))));
    return r.frames;
  },
};

const histogram: AlgoDef = {
  id: 'largest-rectangle', name: '直方圖最大矩形', en: 'Largest Rectangle in Histogram', cat,
  desc: '單調遞增堆疊：當遇到較矮的柱子時，彈出堆疊頂的柱子，以它為高度、左右邊界由堆疊決定，計算面積。末端放一個高度 0 的哨兵以清空堆疊。',
  time: 'O(n)', space: 'O(n)',
  code: ['st = [], best = 0', 'for i = 0 .. n (h[n] = 0):', '  while st 非空 and h[st.top] >= h[i]:', '    height = h[st.pop()]', '    width = st 空 ? i : i - st.top - 1', '    best = max(best, height * width)', '  st.push(i)'],
  inputs: [inArr([2, 1, 5, 6, 2, 3, 4, 1, 3], '柱子高度', 10, 1, 9)],
  run({ arr: h }) {
    const r = new Rec();
    const st: number[] = [];
    let best = 0, bl = 0, br = -1;
    const P = (i: number, extra: CMap = {}, rg?: [number, number, string]) => [bars(h, { ...Object.fromEntries(st.map((s) => [s, 'frontier'])), ...(i < h.length ? { [i]: 'active' } : {}), ...extra }, { pointers: ptrs({ i: i < h.length ? i : undefined }), ranges: [...(br >= bl ? [{ from: bl, to: br, color: 'done' as const, label: `best ${best}` }] : []), ...(rg ? [{ from: rg[0], to: rg[1], color: 'compare' as const, label: rg[2] }] : [])] }), stackCells(st.map((s) => `${h[s]}(#${s})`), {}, '堆疊（高度單調遞增）'), vars({ best })];
    for (let i = 0; i <= h.length; i++) {
      const cur = i < h.length ? h[i] : 0;
      while (st.length && h[st[st.length - 1]] >= cur) {
        const j = st.pop()!;
        const w = st.length ? i - st[st.length - 1] - 1 : i;
        const l = st.length ? st[st.length - 1] + 1 : 0;
        const area = h[j] * w;
        r.snap(`彈出 #${j}（高 ${h[j]}），寬 ${w}，面積 ${area}`, P(i, range(l, i - 1, 'compare'), [l, i - 1, `${h[j]}×${w}=${area}`]), 5);
        if (area > best) { best = area; bl = l; br = i - 1; r.snap(`更新最大面積 = ${best}`, P(i, range(l, i - 1, 'done')), 6); }
      }
      if (i < h.length) { st.push(i); r.snap(`推入 #${i}（高 ${h[i]}）`, P(i), 7); }
    }
    r.snap(`最大矩形面積 = ${best}`, P(h.length, range(bl, br, 'done')));
    return r.frames;
  },
};

const sliding: AlgoDef = {
  id: 'sliding-window-max', name: '滑動視窗最大值', en: 'Sliding Window Maximum (Monotonic Deque)', cat,
  desc: '雙端佇列存索引，值由前到後單調遞減：新元素從尾端進入前先移除所有比它小的；隊首若已滑出視窗就移除。隊首永遠是視窗最大值。',
  time: 'O(n)', space: 'O(k)',
  code: ['dq = []', 'for i = 0 .. n-1:', '  if dq.front <= i - k: dq.popFront()', '  while dq 非空 and a[dq.back] <= a[i]: dq.popBack()', '  dq.pushBack(i)', '  if i >= k - 1: output a[dq.front]'],
  inputs: [inArr([1, 3, -1, -3, 5, 3, 6, 7, 2, 4, 1], '陣列', 12, -5, 9), inNum('k', '視窗大小 k', 3, 1, 10)],
  run({ arr: a, k }) {
    const r = new Rec();
    k = Math.min(k, a.length);
    const dq: number[] = [];
    const out: number[] = [];
    const P = (i: number, c: CMap = {}) => [bars(a, { ...Object.fromEntries(dq.map((d) => [d, 'frontier'])), [i]: 'active', ...c }, { ranges: [{ from: Math.max(0, i - k + 1), to: i, color: 'compare', label: '視窗' }], pointers: ptrs({ i }) }), cells(dq.length ? dq.map((d) => `${a[d]}(#${d})`) : [''], dq.length ? { 0: 'done' } : {}, { title: '雙端佇列（左為隊首）', headers: false, w: 'half' }), cells(out.length ? out : [''], {}, { title: '輸出', headers: false, w: 'half' })];
    for (let i = 0; i < a.length; i++) {
      if (dq.length && dq[0] <= i - k) { const d = dq.shift()!; r.snap(`隊首 #${d} 已滑出視窗，移除`, P(i, { [d]: 'muted' }), 3); }
      while (dq.length && a[dq[dq.length - 1]] <= a[i]) { const d = dq.pop()!; r.snap(`a[${d}] = ${a[d]} ≤ ${a[i]}，從尾端移除（不可能再成為最大值）`, P(i, { [d]: 'bad' }), 4); }
      dq.push(i);
      r.snap(`推入 #${i}`, P(i), 5);
      if (i >= k - 1) { out.push(a[dq[0]]); r.snap(`視窗 [${i - k + 1}, ${i}] 的最大值 = ${a[dq[0]]}`, P(i, { [dq[0]]: 'done' }), 6); }
    }
    return r.frames;
  },
};

export default [paren, infix, postfix, shunting, nge, histogram, sliding];
