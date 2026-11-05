const adj = {};
for (const [a, b] of 'AB AC BD BE CF EF DG EG FH GH'.split(' ')) {
  (adj[a] ??= []).push(b);
  (adj[b] ??= []).push(a);
}

const order = [], seen = new Set();
// 沿著一條路一直走到底，無路可走才回溯（遞迴本身就是堆疊）
function dfs(u) {
  seen.add(u);
  order.push(u);
  for (const v of adj[u]) if (!seen.has(v)) dfs(v);
}

dfs('A');
console.log('order:', order.join(' '));
