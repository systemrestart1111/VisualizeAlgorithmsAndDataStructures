// 單調遞減堆疊：新元素比堆疊頂端大時，頂端的「下一個較大元素」就是它
function nextGreater(a) {
  const res = new Array(a.length).fill(-1), stack = []; // stack 存索引
  a.forEach((x, i) => {
    while (stack.length && a[stack[stack.length - 1]] < x) res[stack.pop()] = x;
    stack.push(i);
  });
  return res;
}

console.log(nextGreater([4, 5, 2, 10, 8, 3, 7, 1, 9, 6]).join(' '));
