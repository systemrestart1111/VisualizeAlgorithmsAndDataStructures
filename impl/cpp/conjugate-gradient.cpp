#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;
typedef vector<double> Vec;
typedef vector<Vec> Mat;

double z(double v) { return fabs(v) < 5e-7 ? 0.0 : v; }

// 對稱且 Cholesky 成功才是對稱正定
bool isSpd(const Mat &A) {
    int n = A.size();
    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) if (A[i][j] != A[j][i]) return false;
    Mat L(n, Vec(n, 0));
    for (int i = 0; i < n; i++)
        for (int j = 0; j <= i; j++) {
            double s = A[i][j];
            for (int k = 0; k < j; k++) s -= L[i][k] * L[j][k];
            if (i == j) { if (s <= 1e-12) return false; L[i][i] = sqrt(s); }
            else L[i][j] = s / L[j][j];
        }
    return true;
}

// 方向 p 彼此 A-共軛：α = rᵀr / pᵀAp，β = r_newᵀr_new / rᵀr；至多 n 步
int cg(const Mat &A, const Vec &b, Vec &x) {
    int n = A.size();
    x.assign(n, 0);
    Vec r = b, p = b;
    for (int k = 1; k < n + 6; k++) {
        Vec Ap(n, 0), rn(n);
        double rr = 0, pAp = 0, rnn = 0;
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) Ap[i] += A[i][j] * p[j];
        for (int i = 0; i < n; i++) rr += r[i] * r[i];
        for (int i = 0; i < n; i++) pAp += p[i] * Ap[i];
        double alpha = rr / pAp;
        for (int i = 0; i < n; i++) { x[i] += alpha * p[i]; rn[i] = r[i] - alpha * Ap[i]; }
        for (double v : rn) rnn += v * v;
        if (sqrt(rnn) < 1e-10) return k;
        double beta = rnn / rr;
        for (int i = 0; i < n; i++) p[i] = rn[i] + beta * p[i];
        r = rn;
    }
    return 0;
}

int main() {
    vector<pair<Mat, Vec>> tests = {{{{3, 2}, {2, 6}}, {2, -8}}, {{{4, 1, 0}, {1, 3, 1}, {0, 1, 2}}, {1, 2, 3}}, {{{4, 1}, {1, 3}}, {1, 2}}, {{{1, 2}, {2, 1}}, {1, 1}}};
    for (auto &t : tests) {
        const Mat &A = t.first;
        const Vec &b = t.second;
        int n = A.size();
        if (!isSpd(A)) { printf("not symmetric positive definite: CG not applicable\n"); continue; }
        Vec x;
        int k = cg(A, b, x);
        double res = 0;
        for (int i = 0; i < n; i++) { double s = b[i]; for (int j = 0; j < n; j++) s -= A[i][j] * x[j]; res += s * s; }
        printf("x = (");
        for (int i = 0; i < n; i++) printf(i ? ", %.6f" : "%.6f", z(x[i]));
        printf(") in %d steps (n = %d), residual small %s\n", k, n, sqrt(res) < 1e-9 ? "True" : "False");
    }
}
