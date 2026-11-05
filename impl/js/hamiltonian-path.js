const adj = {};
for (const [a, b] of 'AB AD BC BE CF DE EF DG EH FI GH HI'.split(' ')) {
  (adj[a] ??= []).push(b);
  (adj[b] ??= []).push(a);
}
const n = Object.keys(adj).length;

// 從起點延伸路徑，每次只走沒去過的鄰居；走不下去就退回（回溯），長度達到 n 即成功
function hamPath(start) {
  const path = [start], seen = new Set([start]);
  function bt() {
    if (path.length === n) return true;
    for (const v of adj[path[path.length - 1]]) {
      if (seen.has(v)) continue;
      path.push(v);
      seen.add(v);
      if (bt()) return true;
      path.pop();
      seen.delete(v);
    }
    return false;
  }
  return bt() ? path : null;
}

const p = hamPath('A');
console.log('Hamiltonian path:', p ? p.join(' -> ') : 'none');
