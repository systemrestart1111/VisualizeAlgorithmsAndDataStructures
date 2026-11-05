A = [[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]]  # 增廣矩陣 [A | b]
n = len(A)
M = [[float(v) for v in row] for row in A]

# 前向消去：每一欄選絕對值最大的列當主元（部分樞軸），再消去下方各列；最後回代求解
for col in range(n):
    piv = max(range(col, n), key=lambda r: abs(M[r][col]))
    if piv != col:
        M[col], M[piv] = M[piv], M[col]
        print(f"swap rows {col} and {piv}")
    for r in range(col + 1, n):
        factor = M[r][col] / M[col][col]
        for c in range(col, n + 1):
            M[r][c] -= factor * M[col][c]
x = [0.0] * n
for r in range(n - 1, -1, -1):
    x[r] = (M[r][n] - sum(M[r][c] * x[c] for c in range(r + 1, n))) / M[r][r]
print("solution:", " ".join(f"x{i} = {0.0 if abs(v) < 1e-9 else v:.4f}" for i, v in enumerate(x)))
