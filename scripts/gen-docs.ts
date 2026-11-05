// 由 registry 自動產生 docs/ALGORITHMS.md 的清單部分
import { writeFileSync, readFileSync } from 'node:fs';
import { CATEGORIES, ITEMS } from '../src/registry';

const head = readFileSync('docs/review.md', 'utf8');
const lines: string[] = [head.trimEnd(), '', '## 完整清單（由程式自動產生）', ''];
lines.push(`共 **${ITEMS.filter((i) => i.kind === 'ds').length}** 種資料結構、**${ITEMS.filter((i) => i.kind === 'algo').length}** 種演算法，合計 **${ITEMS.length}** 項。★ 為附錄標記的重點項目。`, '');
for (const c of CATEGORIES) {
  const list = ITEMS.filter((i) => i.cat === c.id);
  lines.push(`### ${c.no}. ${c.name}（${list.length}）`, '', '| 名稱 | English | 複雜度 |', '|---|---|---|');
  for (const it of list) {
    const cx = it.kind === 'algo' ? [it.time && `時間 ${it.time}`, it.space && `空間 ${it.space}`].filter(Boolean).join('；') : it.complexity.map(([k, v]) => `${k} ${v}`).join('；');
    lines.push(`| ${it.star ? '★ ' : ''}${it.name} | ${it.en} | ${cx.replace(/\|/g, '\|')} |`);
  }
  lines.push('');
}
writeFileSync('docs/ALGORITHMS.md', lines.join('\n'));
console.log('wrote docs/ALGORITHMS.md');
