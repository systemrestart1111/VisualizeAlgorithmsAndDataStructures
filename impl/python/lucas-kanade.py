import math


def smooth(t):
    return 0.0 if t <= 0 else 1.0 if t >= 1 else t * t * (3 - 2 * t)


def tex(y, x):
    """上方平坦、左側只有垂直條紋（孔徑問題）、右下是二維紋理"""
    return 128 + smooth(y - 4) * (50 * math.sin(0.5 * x) + smooth((x - 7) / 2) * (40 * math.sin(0.45 * y + 0.3 * x) + 30 * math.cos(0.35 * x - 0.4 * y)))


def lucas_kanade(du, dv):
    """Ix·u + Iy·v + It = 0 在 5×5 視窗內以最小平方求解；依特徵值判斷可靠／孔徑問題／平坦"""
    I1 = [[tex(r, c) for c in range(16)] for r in range(16)]
    I2 = [[tex(r - dv, c - du) for c in range(16)] for r in range(16)]
    Ix = [[(I1[r][c + 1] - I1[r][c - 1]) / 2 if 0 < c < 15 else 0 for c in range(16)] for r in range(16)]
    Iy = [[(I1[r + 1][c] - I1[r - 1][c]) / 2 if 0 < r < 15 else 0 for c in range(16)] for r in range(16)]
    out = []
    for i in (1, 8, 12):
        for j in (2, 4, 11, 13):
            a = b = c = bx = by = 0.0
            for y in range(max(1, i - 2), min(14, i + 2) + 1):
                for x in range(max(1, j - 2), min(14, j + 2) + 1):
                    it = I2[y][x] - I1[y][x]
                    a += Ix[y][x] ** 2
                    b += Ix[y][x] * Iy[y][x]
                    c += Iy[y][x] ** 2
                    bx -= Ix[y][x] * it
                    by -= Iy[y][x] * it
            tr, det = a + c, a * c - b * b
            disc = math.sqrt(max(0.0, (tr / 2) ** 2 - det))
            l1, l2 = tr / 2 + disc, tr / 2 - disc
            if l1 < 200:
                out.append(f"({i},{j}) flat")
            elif l2 < 0.05 * l1:
                out.append(f"({i},{j}) aperture")
            else:
                u, v = (c * bx - b * by) / det, (a * by - b * bx) / det
                z = lambda t: 0.0 if abs(t) < 0.005 else t
                out.append(f"({i},{j}) ({z(u):.2f}, {z(v):.2f})")
    return out


for du, dv in [(1, 0.5), (0.5, 0), (0, 1), (3, 2)]:
    print(f"true ({du}, {dv}): " + "; ".join(lucas_kanade(du, dv)))
