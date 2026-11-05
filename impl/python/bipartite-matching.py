# 左側 L1..L5 可以配對的右側點
ADJ = {1: [1, 2], 2: [1, 3], 3: [2, 3], 4: [3, 4], 5: [4, 5]}
match_r = {}  # 右側點 -> 目前配到的左側點


def try_kuhn(u, seen):
    """替 u 找右側點：若對方空著就直接配；若已被配走，嘗試讓原本的左側點改配別人（增廣路徑）"""
    for v in ADJ[u]:
        if v in seen:
            continue
        seen.add(v)
        if v not in match_r or try_kuhn(match_r[v], seen):
            match_r[v] = u
            return True
    return False


size = sum(try_kuhn(u, set()) for u in ADJ)
print("matching size =", size)
for v, u in sorted(match_r.items(), key=lambda p: p[1]):
    print(f"L{u} - R{v}")
