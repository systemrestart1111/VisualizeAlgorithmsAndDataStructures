#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;
typedef vector<vector<double>> Mat;

double z(double v) { return fabs(v) < 5e-7 ? 0.0 : v; }

// 修正版 Gram–Schmidt：依序扣掉在每個 q 上的投影，剩下的正規化成新的 q；回傳 −1 成功，否則為相依的欄
int qr(const Mat &A, Mat &Q, Mat &R) {
    int m = A.size(), n = A[0].size();
    Q.assign(m, vector<double>(n, 0));
    R.assign(n, vector<double>(n, 0));
    for (int j = 0; j < n; j++) {
        vector<double> v(m);
        for (int i = 0; i < m; i++) v[i] = A[i][j];
        for (int i = 0; i < j; i++) {
            double s = 0;
            for (int k = 0; k < m; k++) s += Q[k][i] * v[k];
            R[i][j] = s;
            for (int k = 0; k < m; k++) v[k] -= s * Q[k][i];
        }
        double nv = 0;
        for (double x : v) nv += x * x;
        nv = sqrt(nv);
        if (nv < 1e-9) return j;
        R[j][j] = nv;
        for (int k = 0; k < m; k++) Q[k][j] = v[k] / nv;
    }
    return -1;
}

int main() {
    vector<Mat> tests = {{{12, -51, 4}, {6, 167, -68}, {-4, 24, -41}}, {{1, 1}, {1, 0}, {0, 1}}, {{1, 2}, {2, 4}}};
    for (auto &A : tests) {
        Mat Q, R;
        int bad = qr(A, Q, R), m = A.size(), n = A[0].size();
        if (bad >= 0) { printf("column %d is linearly dependent\n", bad + 1); continue; }
        for (auto &row : Q) { printf("Q:"); for (double v : row) printf(" %.6f", z(v)); printf("\n"); }
        for (auto &row : R) { printf("R:"); for (double v : row) printf(" %.6f", z(v)); printf("\n"); }
        double e1 = 0, e2 = 0;
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) { double s = 0; for (int k = 0; k < m; k++) s += Q[k][i] * Q[k][j]; e1 = fmax(e1, fabs(s - (i == j))); }
        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) { double s = 0; for (int k = 0; k < n; k++) s += Q[i][k] * R[k][j]; e2 = fmax(e2, fabs(s - A[i][j])); }
        printf("QtQ = I: %s, QR = A: %s\n", e1 < 1e-9 ? "True" : "False", e2 < 1e-9 ? "True" : "False");
    }
}
