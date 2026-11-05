#include <stdio.h>

/* C = A(n×m) · B(m×p)：每格是 A 的一列與 B 的一行的內積 */
void matmul(int n, int m, int p, int A[][3], int B[][3], int C[][3]) {
    for (int i = 0; i < n; i++)
        for (int j = 0; j < p; j++) {
            C[i][j] = 0;
            for (int k = 0; k < m; k++) C[i][j] += A[i][k] * B[k][j];
        }
}

/* 第 0 列餘因子展開 */
int det(int n, int A[][3]) {
    if (n == 1) return A[0][0];
    int s = 0;
    for (int j = 0; j < n; j++) {
        int M[3][3], c;
        for (int r = 1; r < n; r++) { c = 0; for (int k = 0; k < n; k++) if (k != j) M[r - 1][c++] = A[r][k]; }
        s += (j % 2 ? -1 : 1) * A[0][j] * det(n - 1, M);
    }
    return s;
}

void show(const char *name, int n, int p, int M[][3]) {
    printf("%s = [", name);
    for (int i = 0; i < n; i++) {
        printf(i ? ", [" : "[");
        for (int j = 0; j < p; j++) printf(j ? ", %d" : "%d", M[i][j]);
        printf("]");
    }
    printf("]\n");
}

int main(void) {
    int A[3][3] = {{1, 2}, {3, 4}}, B[3][3] = {{5, 6}, {7, 8}}, C[3][3], T[3][3];
    matmul(2, 2, 2, A, B, C); show("AB", 2, 2, C);
    matmul(2, 2, 2, B, A, C); show("BA", 2, 2, C);
    for (int i = 0; i < 2; i++) for (int j = 0; j < 2; j++) T[j][i] = A[i][j];
    show("A^T", 2, 2, T);
    printf("det(A) = %d\n", det(2, A));
    int D[3][3] = {{2, 0, 1}, {1, 3, 2}, {1, 1, 1}};
    printf("det([[2,0,1],[1,3,2],[1,1,1]]) = %d\n", det(3, D));
    return 0;
}
