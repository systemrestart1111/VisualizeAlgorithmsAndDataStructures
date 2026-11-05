const moves = [];
// 把 n 個盤子從 src 移到 dst：先把上面 n-1 個移到 aux，移動最大的，再把 n-1 個移到 dst；共 2^n - 1 步
function hanoi(n, src, aux, dst) {
  if (n === 0) return;
  hanoi(n - 1, src, dst, aux);
  moves.push([n, src, dst]);
  hanoi(n - 1, aux, src, dst);
}

hanoi(4, 'A', 'B', 'C');
moves.forEach(([disk, a, b], i) => console.log(`${String(i + 1).padStart(2)}. disk ${disk}: ${a} -> ${b}`));
console.log('total moves =', moves.length);
