// 數字推入堆疊；遇到運算子就彈出兩個數計算，結果再推回去
function evalPostfix(expr) {
  const stack = [];
  for (const tok of expr.trim().split(/\s+/)) {
    if ('+-*/'.includes(tok)) {
      const b = stack.pop(), a = stack.pop();
      stack.push(tok === '+' ? a + b : tok === '-' ? a - b : tok === '*' ? a * b : Math.trunc(a / b));
    } else stack.push(Number(tok));
  }
  return stack[0];
}

console.log(evalPostfix('5 1 2 + 4 * + 3 -'));
