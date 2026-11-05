const PTS = [[3, 1], [7, 2], [10, 5], [6, 4], [2, 6], [5, 7], [8, 9], [1, 3], [4, 4], [9, 7], [6, 10], [3, 9], [7, 6]];
const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

// 依 (x, y) 排序後，左到右建下凸殼、右到左建上凸殼，兩者接起來就是凸包（不需算角度）
function monotoneChain(pts) {
  pts = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const half = (seq) => {
    const h = [];
    for (const p of seq) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
      h.push(p);
    }
    return h.slice(0, -1);
  };
  return [...half(pts), ...half([...pts].reverse())];
}

console.log('hull (counter-clockwise):', monotoneChain(PTS).map(([x, y]) => `(${x},${y})`).join(' '));
