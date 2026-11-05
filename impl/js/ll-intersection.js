const build = (vals, tail = null) => vals.reduceRight((next, val) => ({ val, next }), tail);

// 兩指標各走自己的串列，走到尾就跳到另一條的開頭；兩者走過的總長相同，會在交點相遇
function intersection(a, b) {
  let p = a, q = b;
  while (p !== q) {
    p = p ? p.next : b;
    q = q ? q.next : a;
  }
  return p;
}

const common = build([8, 10, 12]);
const node = intersection(build([4, 1, 7], common), build([5, 6, 2, 9, 3], common));
console.log('intersection at', node ? node.val : 'None');
