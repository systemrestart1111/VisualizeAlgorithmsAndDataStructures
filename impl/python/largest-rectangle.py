def largest_rectangle(h):
    """單調遞增堆疊：柱子被彈出時，它的左右邊界就確定了，可算出以它為高的最大矩形"""
    stack, best = [], (0, 0, 0)
    for i in range(len(h) + 1):
        cur = h[i] if i < len(h) else 0  # 最後補一根高度 0 的柱子把堆疊清空
        while stack and h[stack[-1]] >= cur:
            height = h[stack.pop()]
            left = stack[-1] + 1 if stack else 0
            area = height * (i - left)
            if area > best[0]:
                best = (area, left, i - 1)
        stack.append(i)
    return best


area, l, r = largest_rectangle([2, 1, 5, 6, 2, 3, 4, 1, 3])
print(f"max area = {area}, bars [{l}, {r}]")
