// 編譯並執行 impl/ 下各語言實作，比對五種語言輸出是否一致；一致時寫入 impl/output/<id>.txt
// 用法：npx tsx scripts/check-impl.ts [id 或分類 ...]
// 工具鏈可用環境變數覆寫：PYTHON、CC、CXX、JAVA、NODE
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ITEMS } from '../src/registry';

const ROOT = path.resolve(process.cwd(), 'impl');
const LANGS = [
  { id: 'python', ext: 'py' },
  { id: 'c', ext: 'c' },
  { id: 'cpp', ext: 'cpp' },
  { id: 'java', ext: 'java' },
  { id: 'js', ext: 'js' },
];
const PY = process.env.PYTHON ?? 'python';
const CC = process.env.CC ?? 'gcc';
const CXX = process.env.CXX ?? 'g++';
const JAVA = process.env.JAVA ?? (process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', 'java') : 'java');
const NODE = process.env.NODE ?? process.execPath;

const run = (cmd: string, args: string[], cwd: string) =>
  new Promise<{ ok: boolean; out: string; err: string }>((res) =>
    execFile(cmd, args, { cwd, timeout: 30000, maxBuffer: 1 << 24, windowsHide: true }, (e, out, err) => res({ ok: !e, out: String(out), err: String(err || e?.message || '') })),
  );
const norm = (s: string) => s.replace(/\r\n/g, '\n').split('\n').map((l) => l.trimEnd()).join('\n').trimEnd();

async function runOne(lang: string, file: string, work: string) {
  const exe = path.join(work, 'a.exe');
  switch (lang) {
    case 'python':
      return run(PY, ['-X', 'utf8', file], work);
    case 'js':
      return run(NODE, [file], work);
    case 'java':
      return run(JAVA, ['-Dfile.encoding=UTF-8', '-Dstdout.encoding=UTF-8', file], work);
    case 'c': {
      const c = await run(CC, ['-std=c11', '-O2', '-o', exe, file, '-lm'], work);
      return c.ok ? run(exe, [], work) : { ...c, ok: false, err: '編譯失敗\n' + c.err };
    }
    case 'cpp': {
      const c = await run(CXX, ['-std=c++14', '-O2', '-o', exe, file], work);
      return c.ok ? run(exe, [], work) : { ...c, ok: false, err: '編譯失敗\n' + c.err };
    }
  }
  throw new Error(lang);
}

const filters = process.argv.slice(2);
const items = ITEMS.filter((it) => !filters.length || filters.includes(it.id) || filters.includes(it.cat));
mkdirSync(path.join(ROOT, 'output'), { recursive: true });

let ok = 0, bad = 0, missing = 0;
const queue = [...items];
const report: string[] = [];
async function worker() {
  for (let it = queue.shift(); it; it = queue.shift()) {
    const have = LANGS.filter((l) => existsSync(path.join(ROOT, l.id, `${it.id}.${l.ext}`)));
    if (!have.length) { missing++; continue; }
    const outs: Record<string, string> = {};
    const errs: string[] = [];
    for (const l of have) {
      const work = mkdtempSync(path.join(tmpdir(), 'viz-'));
      try {
        const r = await runOne(l.id, path.join(ROOT, l.id, `${it.id}.${l.ext}`), work);
        if (!r.ok) errs.push(`  ${l.id}: ${r.err.split('\n').slice(0, 6).join('\n    ')}`);
        outs[l.id] = norm(r.out);
      } finally {
        rmSync(work, { recursive: true, force: true });
      }
    }
    const ref = outs[have[0].id];
    const diff = have.filter((l) => outs[l.id] !== ref);
    if (errs.length || diff.length || have.length < LANGS.length) {
      bad++;
      const lack = LANGS.filter((l) => !have.includes(l)).map((l) => l.id);
      let msg = `✗ ${it.id}` + (lack.length ? `（缺少 ${lack.join(', ')}）` : '');
      if (errs.length) msg += '\n' + errs.join('\n');
      for (const l of diff) {
        const a = ref.split('\n'), b = outs[l.id].split('\n');
        const k = a.findIndex((x, i) => x !== b[i]);
        const at = k < 0 ? Math.min(a.length, b.length) : k;
        msg += `\n  ${have[0].id} vs ${l.id} 第 ${at + 1} 行：\n    ${JSON.stringify(a[at])}\n    ${JSON.stringify(b[at])}`;
      }
      report.push(msg);
    } else {
      ok++;
      const f = path.join(ROOT, 'output', `${it.id}.txt`);
      if (!existsSync(f) || readFileSync(f, 'utf8') !== ref + '\n') writeFileSync(f, ref + '\n');
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
for (const r of report) console.log(r);
console.log(`\n一致 ${ok}、有問題 ${bad}、尚無實作 ${missing}（共 ${items.length} 項）`);
if (bad) process.exitCode = 1;
