// 依層序建樹，null 表示空節點
function buildLevel(tok) {
  const root = { val: tok[0], left: null, right: null };
  const q = [root];
  let i = 1;
  while (q.length && i < tok.length) {
    const n = q.shift();
    for (const side of ['left', 'right']) {
      if (i >= tok.length) break;
      if (tok[i] !== null) {
        n[side] = { val: tok[i], left: null, right: null };
        q.push(n[side]);
      }
      i++;
    }
  }
  return root;
}

const pre = (n, out) => { if (n) { out.push(n.val); pre(n.left, out); pre(n.right, out); } return out; };  // 根 → 左 → 右
const ino = (n, out) => { if (n) { ino(n.left, out); out.push(n.val); ino(n.right, out); } return out; };  // 左 → 根 → 右
const post = (n, out) => { if (n) { post(n.left, out); post(n.right, out); out.push(n.val); } return out; }; // 左 → 右 → 根

const root = buildLevel([1, 2, 3, 4, 5, 6, 7, null, 8, 9, null, null, 10]);
console.log('pre:', pre(root, []).join(' '));
console.log('in:', ino(root, []).join(' '));
console.log('post:', post(root, []).join(' '));
