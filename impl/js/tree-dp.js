const TOKENS = [3, 4, 5, 1, 3, null, 1, 2, null, 6, null, 4]; // 層序表示的二元樹，數字為權重

function build(tok) {
  const root = { w: tok[0], left: null, right: null };
  const q = [root];
  let i = 1;
  while (q.length && i < tok.length) {
    const n = q.shift();
    for (const side of ['left', 'right']) {
      if (i >= tok.length) break;
      if (tok[i] !== null) { n[side] = { w: tok[i], left: null, right: null }; q.push(n[side]); }
      i++;
    }
  }
  return root;
}

// 回傳 [選 n 的最大權重, 不選 n 的最大權重]；選了 n 就不能選它的孩子
function solve(n) {
  if (!n) return [0, 0];
  const l = solve(n.left), r = solve(n.right);
  return [n.w + l[1] + r[1], Math.max(...l) + Math.max(...r)];
}

const [take, skip] = solve(build(TOKENS));
console.log('take root:', take, 'skip root:', skip);
console.log('max independent set weight =', Math.max(take, skip));
