def eval_postfix(expr):
    """數字推入堆疊；遇到運算子就彈出兩個數計算，結果再推回去"""
    stack = []
    for tok in expr.split():
        if tok in "+-*/":
            b, a = stack.pop(), stack.pop()
            stack.append(a + b if tok == "+" else a - b if tok == "-" else a * b if tok == "*" else a // b)
        else:
            stack.append(int(tok))
    return stack[0]


print(eval_postfix("5 1 2 + 4 * + 3 -"))
