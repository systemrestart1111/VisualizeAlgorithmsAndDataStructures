const LEAVES = [3, 5, 6, 9, 1, 2, 0, -1, 8, 4, 7, 2, 5, 1, 3, 6], B = 2, DEPTH = 4, visited = [];

// α：MAX 已保證的下界，β：MIN 已保證的上界；一旦 α >= β，剩下的兄弟節點不可能影響結果，直接剪掉
function ab(depth, index, alpha, beta, isMax) {
  if (depth === DEPTH) { visited.push(index); return LEAVES[index]; }
  let best = isMax ? -Infinity : Infinity;
  for (let k = 0; k < B; k++) {
    const v = ab(depth + 1, index * B + k, alpha, beta, !isMax);
    if (isMax) { best = Math.max(best, v); alpha = Math.max(alpha, v); }
    else { best = Math.min(best, v); beta = Math.min(beta, v); }
    if (alpha >= beta) break;
  }
  return best;
}

const root = ab(0, 0, -Infinity, Infinity, true);
console.log('root value =', root);
console.log('leaves evaluated:', visited.join(' '));
console.log(`pruned ${LEAVES.length - visited.length} of ${LEAVES.length} leaves`);
