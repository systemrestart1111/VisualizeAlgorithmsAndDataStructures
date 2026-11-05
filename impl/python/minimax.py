LEAVES = [3, 5, 6, 9, 1, 2, 0, -1, 8, 4, 7, 2, 5, 1, 3, 6]
B = 2  # 分支數


def minimax(level):
    """由下往上：MAX 層取子節點最大值、MIN 層取最小值（根為 MAX，層數交替）"""
    depth = 0
    while B ** depth < len(LEAVES):
        depth += 1
    vals = LEAVES[:]
    for d in range(depth - 1, -1, -1):
        is_max = d % 2 == 0
        vals = [(max if is_max else min)(vals[i:i + B]) for i in range(0, len(vals), B)]
        print(f"level {d} ({'MAX' if is_max else 'MIN'}):", *vals)
    return vals[0]


print("root value =", minimax(0))
