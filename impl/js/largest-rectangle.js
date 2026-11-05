// 單調遞增堆疊：柱子被彈出時，它的左右邊界就確定了，可算出以它為高的最大矩形
function largestRectangle(h) {
  const stack = [];
  let best = [0, 0, 0];
  for (let i = 0; i <= h.length; i++) {
    const cur = i < h.length ? h[i] : 0; // 最後補一根高度 0 的柱子把堆疊清空
    while (stack.length && h[stack[stack.length - 1]] >= cur) {
      const height = h[stack.pop()];
      const left = stack.length ? stack[stack.length - 1] + 1 : 0;
      const area = height * (i - left);
      if (area > best[0]) best = [area, left, i - 1];
    }
    stack.push(i);
  }
  return best;
}

const [area, l, r] = largestRectangle([2, 1, 5, 6, 2, 3, 4, 1, 3]);
console.log(`max area = ${area}, bars [${l}, ${r}]`);
