def next_greater(a):
    """單調遞減堆疊：新元素比堆疊頂端大時，頂端的「下一個較大元素」就是它"""
    res = [-1] * len(a)
    stack = []  # 存索引
    for i, x in enumerate(a):
        while stack and a[stack[-1]] < x:
            res[stack.pop()] = x
        stack.append(i)
    return res


print(*next_greater([4, 5, 2, 10, 8, 3, 7, 1, 9, 6]))
