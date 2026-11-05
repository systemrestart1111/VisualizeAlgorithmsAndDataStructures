const SUBJ = [[1, 4], [5, 11], [9, 6], [13, 10], [12, 2], [6, 0]];
const CLIP = [[3, 2], [11, 2], [11, 8], [3, 8]]; // 凸多邊形，逆時針
const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

// 線段 pq 與直線 ab 的交點
function intersect(p, q, a, b) {
  const t = cross(a, b, p) / (cross(a, b, p) - cross(a, b, q));
  return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
}

// Sutherland–Hodgman：依序用裁切窗的每一條邊去裁多邊形，只保留在邊左側（內側）的部分
function clip(subject, win) {
  let out = subject;
  win.forEach((a, i) => {
    const b = win[(i + 1) % win.length], inp = out;
    out = [];
    inp.forEach((p, k) => {
      const q = inp[(k + 1) % inp.length];
      const pin = cross(a, b, p) >= 0, qin = cross(a, b, q) >= 0;
      if (pin && qin) out.push(q);
      else if (pin && !qin) out.push(intersect(p, q, a, b));
      else if (!pin && qin) out.push(intersect(p, q, a, b), q);
    });
  });
  return out;
}

const res = clip(SUBJ, CLIP);
console.log('clipped polygon:', res.length, 'vertices');
for (const [x, y] of res) console.log(`  (${x.toFixed(4)}, ${y.toFixed(4)})`);
