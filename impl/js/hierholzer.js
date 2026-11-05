const EDGES = 'AB BC CA CD DE EC BD AD'.split(' ');
const nodes = [...new Set(EDGES.join(''))].sort();
const adj = Object.fromEntries(nodes.map((v) => [v, []])); // adj[u] = [[鄰居, 邊編號]]
EDGES.forEach(([a, b], i) => { adj[a].push([b, i]); adj[b].push([a, i]); });

const odd = nodes.filter((v) => adj[v].length % 2);
const start = odd.length ? odd[0] : nodes[0]; // 有兩個奇點時必須從奇點出發
const used = new Array(EDGES.length).fill(false);
const ptr = Object.fromEntries(nodes.map((v) => [v, 0]));

// 沿著未用過的邊一直走，走不動時把該點加入路徑並回退；最後路徑反轉即為歐拉路徑
const stack = [start], path = [];
while (stack.length) {
  const u = stack[stack.length - 1];
  while (ptr[u] < adj[u].length && used[adj[u][ptr[u]][1]]) ptr[u]++;
  if (ptr[u] === adj[u].length) path.push(stack.pop());
  else {
    const [v, i] = adj[u][ptr[u]];
    used[i] = true;
    stack.push(v);
  }
}
console.log('odd vertices:', odd.join(' '));
console.log('euler path:', path.reverse().join(' -> '));
