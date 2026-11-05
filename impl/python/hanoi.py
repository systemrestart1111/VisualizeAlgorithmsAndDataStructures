moves = []


def hanoi(n, src, aux, dst):
    """把 n 個盤子從 src 移到 dst：先把上面 n-1 個移到 aux，移動最大的，再把 n-1 個移到 dst；共 2^n - 1 步"""
    if n == 0:
        return
    hanoi(n - 1, src, dst, aux)
    moves.append((n, src, dst))
    hanoi(n - 1, aux, src, dst)


hanoi(4, "A", "B", "C")
for i, (disk, a, b) in enumerate(moves, 1):
    print(f"{i:2d}. disk {disk}: {a} -> {b}")
print("total moves =", len(moves))
