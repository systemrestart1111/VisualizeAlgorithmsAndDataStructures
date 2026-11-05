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

// 不用堆疊的中序走訪：暫時把左子樹最右節點的 right 指回自己（線索），走完再拆掉，O(1) 額外空間
function morrisInorder(cur) {
  const out = [];
  while (cur) {
    if (!cur.left) {
      out.push(cur.val);
      cur = cur.right;
    } else {
      let pre = cur.left;
      while (pre.right && pre.right !== cur) pre = pre.right;
      if (!pre.right) { pre.right = cur; cur = cur.left; } // 第一次到達：建立線索後往左
      else {                                              // 第二次到達：拆除線索
        pre.right = null;
        out.push(cur.val);
        cur = cur.right;
      }
    }
  }
  return out;
}

console.log(morrisInorder(buildLevel([6, 3, 9, 1, 4, 8, 11, null, 2, null, 5, 7])).join(' '));
