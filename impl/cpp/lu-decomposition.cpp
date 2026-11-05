#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;
typedef vector<vector<double>> Mat;

double z(double v) { return fabs(v) < 5e-7 ? 0.0 : v; }

// PA = LU（部分樞軸）；交換列時 L 已算好的欄也要一起交換；回傳 −1 成功，否則為奇異的欄
int lu(const Mat &A, vector<int> &perm, Mat &L, Mat &U) {
    int n = A.size();
    U = A;
    L.assign(n, vector<double>(n, 0));
    perm.resize(n);
    for (int i = 0; i < n; i++) { L[i][i] = 1; perm[i] = i; }
    for (int k = 0; k < n; k++) {
        int p = k;
        for (int i = k + 1; i < n; i++) if (fabs(U[i][k]) > fabs(U[p][k])) p = i;
        if (p != k) {
            swap(U[k], U[p]);
            swap(perm[k], perm[p]);
            for (int j = 0; j < k; j++) swap(L[k][j], L[p][j]);
        }
        if (fabs(U[k][k]) < 1e-12) return k;
        for (int i = k + 1; i < n; i++) {
            double f = U[i][k] / U[k][k];
            L[i][k] = f;
            for (int j = k; j < n; j++) U[i][j] -= f * U[k][j];
        }
    }
    return -1;
}

int main() {
    vector<Mat> tests = {{{2, 1, 1, 0}, {4, 3, 3, 1}, {8, 7, 9, 5}, {6, 7, 9, 8}}, {{1, 2, 3}, {2, 4, 6}, {1, 0, 1}}, {{0, 1}, {1, 0}}};
    for (auto &A : tests) {
        vector<int> perm;
        Mat L, U;
        int bad = lu(A, perm, L, U), n = A.size();
        if (bad >= 0) { printf("singular: no pivot in column %d\n", bad + 1); continue; }
        printf("perm:");
        for (int p : perm) printf(" %d", p);
        printf("\n");
        for (int i = 0; i < n; i++) {
            printf("L:");
            for (double v : L[i]) printf(" %.6f", z(v));
            printf(" | U:");
            for (double v : U[i]) printf(" %.6f", z(v));
            printf("\n");
        }
        double err = 0;
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) { double s = 0; for (int k = 0; k < n; k++) s += L[i][k] * U[k][j]; err = fmax(err, fabs(A[perm[i]][j] - s)); }
        printf("PA = LU: %s\n", err < 1e-9 ? "True" : "False");
    }
}
