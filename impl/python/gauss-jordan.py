def fmt(v):
    return f"{0.0 if abs(v) < 5e-7 else v:.6f}"


def gauss_jordan(M):
    """化成簡化列梯形 (RREF)，判斷唯一解／無解／無限多解"""
    M = [[float(v) for v in row] for row in M]
    R, nv = len(M), len(M[0]) - 1
    piv_cols, row = [], 0
    for col in range(nv):
        if row >= R:
            break
        p = max(range(row, R), key=lambda i: abs(M[i][col]))
        if abs(M[p][col]) < 1e-9:
            continue  # 沒有主元：自由變數
        M[row], M[p] = M[p], M[row]
        pv = M[row][col]
        M[row] = [v / pv for v in M[row]]
        for i in range(R):
            if i != row and abs(M[i][col]) > 1e-12:
                f = M[i][col]
                M[i] = [a - f * b for a, b in zip(M[i], M[row])]
        piv_cols.append(col)
        row += 1
    if any(abs(M[i][nv]) > 1e-9 for i in range(row, R)):
        return "no solution (row 0 ... 0 | c with c != 0)"
    if len(piv_cols) < nv:
        free = [f"x{j + 1}" for j in range(nv) if j not in piv_cols]
        return f"infinitely many: rank {len(piv_cols)} < {nv}, free {' '.join(free)}"
    return "unique: " + " ".join(f"x{i + 1} = {fmt(M[i][nv])}" for i in range(nv))


systems = [
    [[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]],
    [[1, 2, -1, 3], [2, 4, -2, 6], [1, 1, 1, 4]],
    [[1, 1, 2, 3], [2, 2, 4, 7], [1, -1, 0, 1]],
    [[0, 2, 4], [3, 1, 5]],
]
for s in systems:
    print(gauss_jordan(s))
