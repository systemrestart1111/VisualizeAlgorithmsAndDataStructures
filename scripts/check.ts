// 以預設輸入與數組隨機輸入執行所有演算法與資料結構操作，確保沒有例外。
import { ITEMS, CATEGORIES } from '../src/registry';

let fail = 0;
const ids = new Set<string>();
const only = process.argv[2];
for (const it of ITEMS) {
  if (only && !it.id.includes(only) && it.cat !== only) continue;
  if (ids.has(it.id)) { console.log('重複 id', it.id); fail++; }
  ids.add(it.id);
  if (!CATEGORIES.some((c) => c.id === it.cat)) { console.log('未知分類', it.id, it.cat); fail++; }
  const t0 = Date.now();
  try {
    if (it.kind === 'algo') {
      const runs = [Object.fromEntries(it.inputs.map((s) => [s.key, s.default]))];
      for (let k = 0; k < 6; k++) {
        const cur: Record<string, any> = Object.fromEntries(it.inputs.map((s) => [s.key, s.default]));
        for (const s of it.inputs) if ('random' in s && s.random) cur[s.key] = s.random(cur);
        if (it.cat === 'search' && 't' in cur && !cur.arr.includes(cur.t)) throw new Error('隨機目標值不在陣列中');
        runs.push(cur);
      }
      let total = 0;
      for (const inp of runs) {
        try {
          const f = it.run(inp);
          if (!f.length) throw new Error('沒有畫格');
          if (f.length > 6000) console.log(`  ⚠ ${it.id} 畫格過多 ${f.length}`);
          for (const fr of f) if (it.code && fr.line !== undefined && (fr.line < 1 || fr.line > it.code.length)) throw new Error('line 超出範圍 ' + fr.line);
          if (it.cat.startsWith('sort')) {
            const b = f[f.length - 1].panels.find((p: any) => p.type === 'bars') as any;
            const v: number[] = b.values;
            const src = (inp.arr as number[]).slice().sort((x, y) => x - y);
            if (v.some((x, i) => i && v[i - 1] > x)) throw new Error('結果未排序 ' + v);
            if (it.id !== 'bitonic-sort' && it.id !== 'counting-sort' && it.id !== 'radix-sort' && v.join() !== src.join()) throw new Error('元素不一致 ' + v + ' / ' + src);
          }
          total += f.length;
        } catch (e) {
          console.log('  輸入：', JSON.stringify(inp).slice(0, 300));
          throw e;
        }
      }
      console.log(`ok  ${it.id.padEnd(28)} ${String(total).padStart(6)} frames  ${Date.now() - t0}ms`);
    } else {
      const inst = it.create();
      for (const [op, a, b] of it.init ?? []) inst.apply(op, a, b);
      let total = 0;
      for (let k = 0; k < 25; k++) {
        const op = it.ops[k % it.ops.length];
        const a = op.rand ? op.rand() : undefined;
        const args = Array.isArray(a) ? a : [a];
        const f = inst.apply(op.key, ...args);
        total += f.length;
      }
      inst.view();
      console.log(`ok  ${it.id.padEnd(28)} ${String(total).padStart(6)} frames  ${Date.now() - t0}ms (ds)`);
    }
  } catch (e: any) {
    fail++;
    console.log(`FAIL ${it.id}: ${e?.stack ?? e}`);
  }
}
console.log(`\n共 ${ITEMS.length} 項，失敗 ${fail}`);
process.exit(fail ? 1 : 0);
