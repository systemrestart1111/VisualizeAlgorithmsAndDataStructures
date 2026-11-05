def is_balanced(s):
    """遇到左括號就推入堆疊；遇到右括號時，堆疊頂端必須是對應的左括號"""
    pair = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pair:
            if not stack or stack.pop() != pair[ch]:
                return False
    return not stack


for s in ["{[()()]}([]{})", "{[(])}", "(("]:
    print(s, "->", is_balanced(s))
