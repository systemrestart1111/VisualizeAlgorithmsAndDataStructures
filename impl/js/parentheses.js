// 遇到左括號就推入堆疊；遇到右括號時，堆疊頂端必須是對應的左括號
function isBalanced(s) {
  const pair = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if ('([{'.includes(ch)) stack.push(ch);
    else if (ch in pair && stack.pop() !== pair[ch]) return false;
  }
  return stack.length === 0;
}

for (const s of ['{[()()]}([]{})', '{[(])}', '((']) console.log(s, '->', isBalanced(s) ? 'True' : 'False');
