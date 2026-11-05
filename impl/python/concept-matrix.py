def matmul(A, B):
    """C[i][j] = Σ_k A[i][k]·B[k][j]"""
    assert len(A[0]) == len(B), "A 的行數必須等於 B 的列數"
    return [[sum(A[i][k] * B[k][j] for k in range(len(B))) for j in range(len(B[0]))] for i in range(len(A))]


def transpose(A):
    return [list(r) for r in zip(*A)]


def det(A):
    """第 0 列餘因子展開"""
    if len(A) == 1:
        return A[0][0]
    return sum((-1) ** j * A[0][j] * det([r[:j] + r[j + 1:] for r in A[1:]]) for j in range(len(A)))


A = [[1, 2], [3, 4]]
B = [[5, 6], [7, 8]]
print("AB =", matmul(A, B))
print("BA =", matmul(B, A))
print("A^T =", transpose(A))
print("det(A) =", det(A))
print("det([[2,0,1],[1,3,2],[1,1,1]]) =", det([[2, 0, 1], [1, 3, 2], [1, 1, 1]]))
