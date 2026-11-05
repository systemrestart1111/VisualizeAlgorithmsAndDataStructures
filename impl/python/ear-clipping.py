def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def area(P):
    return sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P))) / 2


def ear_clipping(P):
    """凸頂點且三角形內沒有其他頂點 → 耳朵；切下來直到剩一個三角形"""
    idx = list(range(len(P)))
    if area(P) < 0:
        idx.reverse()
    tris = []
    while len(idx) > 3:
        for k in range(len(idx)):
            p, i, q = idx[k - 1], idx[k], idx[(k + 1) % len(idx)]
            if cross(P[p], P[i], P[q]) <= 1e-12:
                continue  # 凹頂點
            if any(j not in (p, i, q) and cross(P[p], P[i], P[j]) >= -1e-12 and cross(P[i], P[q], P[j]) >= -1e-12 and cross(P[q], P[p], P[j]) >= -1e-12 for j in idx):
                continue  # 三角形內有其他頂點
            tris.append((p, i, q))
            idx.pop(k)
            break
        else:
            return None
    tris.append(tuple(idx))
    return tris


for P in [[(0, 0), (8, 0), (8, 6), (5, 3), (3, 7), (1, 4)],
          [(0, 0), (10, 0), (10, 8), (7, 8), (7, 3), (3, 3), (3, 8), (0, 8)],
          [(1, 4), (3, 7), (5, 3), (8, 6), (8, 0), (0, 0)]]:
    tris = ear_clipping(P)
    total = sum(abs(area([P[i] for i in t])) for t in tris)
    print(f"{len(P)} vertices -> {len(tris)} triangles: " + " ".join("-".join(map(str, t)) for t in tris) + f"; area sum {total:.2f} = shoelace {abs(area(P)):.2f}")
