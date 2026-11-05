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

// BFS：用佇列一層一層處理，每層開始時佇列長度就是這一層的節點數
let level = [buildLevel([1, 2, 3, 4, 5, 6, 7, null, 8, 9, null, null, 10])];
for (let d = 0; level.length; d++) {
  console.log(`level ${d}:`, level.map((n) => n.val).join(' '));
  level = level.flatMap((n) => [n.left, n.right].filter(Boolean));
}
