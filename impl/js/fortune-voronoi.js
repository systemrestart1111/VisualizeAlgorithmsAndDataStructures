function circum(a, b, c) {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < 1e-12) return null;
  const A = a[0] ** 2 + a[1] ** 2, B = b[0] ** 2 + b[1] ** 2, C = c[0] ** 2 + c[1] ** 2;
  const ux = (A * (b[1] - c[1]) + B * (c[1] - a[1]) + C * (a[1] - b[1])) / d;
  const uy = (A * (c[0] - b[0]) + B * (a[0] - c[0]) + C * (b[0] - a[0])) / d;
  return [ux, uy, Math.hypot(a[0] - ux, a[1] - uy)];
}
// 焦點 s、準線 y = L 的拋物線在 x 的高度
const parab = (s, L, x) => (Math.abs(s[1] - L) < 1e-12 ? Infinity : ((x - s[0]) ** 2 + s[1] ** 2 - L * L) / (2 * (s[1] - L)));
// 左弧 a 與右弧 b 的斷點：兩拋物線的交點中，左邊由 a 較低的那一個
function breakX(a, b, L) {
  const da = 2 * (a[1] - L), db = 2 * (b[1] - L);
  if (Math.abs(da) < 1e-12) return a[0];
  if (Math.abs(db) < 1e-12) return b[0];
  const A = 1 / da - 1 / db, B = -2 * (a[0] / da - b[0] / db), C = (a[0] ** 2 + a[1] ** 2 - L * L) / da - (b[0] ** 2 + b[1] ** 2 - L * L) / db;
  if (Math.abs(A) < 1e-12) return -C / B;
  const disc = Math.sqrt(Math.max(0, B * B - 4 * A * C)), roots = [(-B - disc) / (2 * A), (-B + disc) / (2 * A)];
  const eps = 1e-6 * (1 + Math.abs(roots[0]) + Math.abs(roots[1]));
  return roots.find((x) => parab(a, L, x - eps) < parab(b, L, x - eps)) ?? roots[0];
}
const uniqSorted = (v) => v.filter((p, i) => v.findIndex((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) <= 1e-6) === i).sort((a, b) => a[0] - b[0] || a[1] - b[1]);

// 掃描線由上往下；站點事件切開弧，圓事件讓弧消失並產生 Voronoi 頂點
function fortune(S) {
  const xs = S.map((p) => p[0]);
  const scale = Math.max(...xs) - Math.min(...xs) + 6;
  let L = Math.max(...S.map((p) => p[1])) + 3;
  let beach = [];
  const ev = S.map((p, i) => ({ y: p[1], site: i, valid: true, used: false }));
  const verts = [];
  const check = (k) => {
    if (k < 1 || k + 1 >= beach.length || beach[k - 1].site === beach[k + 1].site) return;
    const a = S[beach[k - 1].site], b = S[beach[k].site], c = S[beach[k + 1].site];
    const cc = circum(a, b, c);
    if (!cc) return;
    const yb = cc[1] - cc[2], tol = 1e-5 * scale;
    if (yb > L + 1e-9) return;
    if (Math.abs(breakX(a, b, yb) - cc[0]) > tol || Math.abs(breakX(b, c, yb) - cc[0]) > tol) return;
    const e = { y: yb, arc: beach[k], c: cc, valid: true, used: false };
    beach[k].ev = e;
    ev.push(e);
  };
  const kill = (arc) => { if (arc.ev) arc.ev.valid = false; arc.ev = null; };
  for (;;) {
    let best = null;
    for (const e of ev) {
      if (e.used) continue;
      if (!best || e.y > best.y || (e.y === best.y && e.site !== undefined && best.site === undefined)) best = e;
    }
    if (!best) break;
    best.used = true;
    if (!best.valid) continue;
    L = best.y;
    if (best.site !== undefined) {
      const p = best.site;
      if (!beach.length) { beach.push({ site: p, ev: null }); continue; }
      let k = 0;
      while (k + 1 < beach.length && breakX(S[beach[k].site], S[beach[k + 1].site], L) < S[p][0]) k++;
      const old = beach[k];
      kill(old);
      beach.splice(k, 1, { site: old.site, ev: null }, { site: p, ev: null }, { site: old.site, ev: null });
      check(k);
      check(k + 2);
    } else {
      const k = beach.indexOf(best.arc);
      if (k < 1 || k + 1 >= beach.length) continue;
      verts.push([best.c[0], best.c[1]]);
      beach.splice(k, 1);
      kill(beach[k - 1]);
      kill(beach[k]);
      check(k - 1);
      check(k);
    }
  }
  return uniqSorted(verts);
}
// 暴力：外接圓內沒有其他站點的三點組，圓心就是 Voronoi 頂點
function brute(S) {
  const out = [];
  for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) for (let k = j + 1; k < S.length; k++) {
    const cc = circum(S[i], S[j], S[k]);
    if (cc && S.every((s) => Math.hypot(s[0] - cc[0], s[1] - cc[1]) >= cc[2] - 1e-7)) out.push([cc[0], cc[1]]);
  }
  return uniqSorted(out);
}
const f3 = (v) => (Math.abs(v) < 5e-4 ? 0 : v).toFixed(3);

let seed = 11;
const rnd = () => (seed = (seed * 48271) % 2147483647);
const t2 = Array.from({ length: 12 }, () => { const x = (rnd() % 100000) / 5000; const y = (rnd() % 100000) / 5000; return [x, y]; });
for (const S of [[[3, 3], [12, 4], [7, 9], [2, 13], [15, 12], [10, 16], [17, 7]], t2, [[0, 0], [10, 1], [5, 9]]]) {
  const v = fortune(S), b = brute(S);
  const same = v.length === b.length && v.every((p, i) => Math.hypot(p[0] - b[i][0], p[1] - b[i][1]) < 1e-6);
  console.log(`${S.length} sites: ${v.length} Voronoi vertices (brute force agrees ${same ? 'True' : 'False'})`);
  console.log('  ' + v.map(([x, y]) => `(${f3(x)}, ${f3(y)})`).join(' '));
}
