// 檢查學習路徑資料：每一項都有先備定義且只屬於一個階段、沒有環、先備不晚於自己的階段。
import { ITEMS } from '../src/registry';
import { RAW_REQ, STAGES, STAGE_OF, levels, ancestors } from '../src/learning';
let bad = 0;
const fail = (m: string) => { bad++; if (bad < 20) console.log('FAIL', m); };
const ids = new Set(ITEMS.map((i) => i.id));

for (const id of ids) if (!(id in RAW_REQ)) fail(`${id} 沒有先備定義`);
for (const [id, ps] of Object.entries(RAW_REQ)) {
  if (!ids.has(id)) fail(`未知項目 ${id}`);
  for (const p of ps) if (!ids.has(p)) fail(`${id} 的先備 ${p} 不存在`);
}
const seen = new Map<string, string>();
for (const s of STAGES) for (const id of s.items) {
  if (seen.has(id)) fail(`${id} 同時在 ${seen.get(id)} 與 ${s.id}`);
  seen.set(id, s.id);
  if (!ids.has(id)) fail(`階段 ${s.id} 有未知項目 ${id}`);
}
for (const id of ids) if (!seen.has(id)) fail(`${id} 不在任何階段`);

// 環：DFS 三色
const color: Record<string, number> = {};
const visit = (x: string, path: string[]) => {
  if (color[x] === 2) return;
  if (color[x] === 1) { fail('環：' + [...path, x].join(' → ')); return; }
  color[x] = 1;
  for (const p of RAW_REQ[x] ?? []) visit(p, [...path, x]);
  color[x] = 2;
};
for (const id of ids) visit(id, []);

for (const [id, ps] of Object.entries(RAW_REQ))
  for (const p of ps) if (STAGE_OF[p] > STAGE_OF[id]) fail(`${id}（${STAGES[STAGE_OF[id]].id}）的先備 ${p} 在較晚的階段 ${STAGES[STAGE_OF[p]].id}`);

if (process.argv.includes('--stats')) {
  const rows = [...ids].map((id) => {
    const set = [...ancestors(id), id];
    const lv = levels(set);
    const width = Math.max(...Object.values(Object.groupBy(Object.values(lv), (x) => x)).map((a) => a!.length));
    return { id, n: set.length, depth: Math.max(...Object.values(lv)) + 1, width };
  });
  for (const k of ['n', 'depth', 'width'] as const) console.log(k, rows.sort((a, b) => b[k] - a[k]).slice(0, 5).map((r) => `${r.id}:${r[k]}`).join(' '));
}
console.log('learning failures:', bad);
process.exit(bad ? 1 : 0);
