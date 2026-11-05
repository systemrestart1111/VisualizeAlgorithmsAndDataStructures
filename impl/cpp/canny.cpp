#include <algorithm>
#include <cmath>
#include <cstdio>
#include <queue>
#include <string>
#include <vector>
using namespace std;
const int N = 16;
typedef vector<vector<double>> Img;

Img preset(const string &name) {
    Img a(N, vector<double>(N));
    long long s = 7;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            if (name == "step") { a[r][c] = (c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0); continue; }
            int v = 30;
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
            if (name == "noisy") { s = s * 48271 % 2147483647; int t = s % 100; v = t < 5 ? 0 : t < 10 ? 255 : v; }
            a[r][c] = v;
        }
    return a;
}
int cl(int x) { return min(N - 1, max(0, x)); }

// 高斯模糊 → Sobel → 沿梯度方向細化 → 雙門檻 → 從強邊 BFS 連結弱邊
void canny(const string &name, const Img &A, double lo, double hi) {
    double k[7], s = 0;
    for (int i = 0; i < 7; i++) { k[i] = exp(-((i - 3) * (i - 3)) / 2.0); s += k[i]; }
    for (double &v : k) v /= s;
    Img h(N, vector<double>(N)), B = h, gx = h, gy = h, M = h, thin = h;
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double t = 0; for (int j = -3; j <= 3; j++) t += k[j + 3] * A[r][cl(c + j)]; h[r][c] = t; }
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double t = 0; for (int i = -3; i <= 3; i++) t += k[i + 3] * h[cl(r + i)][c]; B[r][c] = t; }
    double mx = 0;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            gx[r][c] = -B[cl(r - 1)][cl(c - 1)] + B[cl(r - 1)][cl(c + 1)] - 2 * B[r][cl(c - 1)] + 2 * B[r][cl(c + 1)] - B[cl(r + 1)][cl(c - 1)] + B[cl(r + 1)][cl(c + 1)];
            gy[r][c] = -B[cl(r - 1)][cl(c - 1)] - 2 * B[cl(r - 1)][c] - B[cl(r - 1)][cl(c + 1)] + B[cl(r + 1)][cl(c - 1)] + 2 * B[cl(r + 1)][c] + B[cl(r + 1)][cl(c + 1)];
            M[r][c] = floor(hypot(gx[r][c], gy[r][c]) * 10000 + 0.5) / 10000;
            mx = max(mx, M[r][c]);
        }
    if (mx == 0) mx = 1;
    auto get = [&](int r, int c) { return r >= 0 && r < N && c >= 0 && c < N ? M[r][c] : 0.0; };
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            double ang = atan2(gy[r][c], gx[r][c]) * 180 / acos(-1.0);
            if (ang < 0) ang += 180;
            int di, dj;
            if (ang < 22.5 || ang >= 157.5) { di = 0; dj = 1; } else if (ang < 67.5) { di = 1; dj = 1; } else if (ang < 112.5) { di = 1; dj = 0; } else { di = 1; dj = -1; }
            thin[r][c] = M[r][c] >= get(r + di, c + dj) && M[r][c] >= get(r - di, c - dj) ? M[r][c] : 0;
        }
    vector<vector<int>> lab(N, vector<int>(N));
    int strong = 0, weak = 0, promoted = 0, edges = 0;
    queue<pair<int, int>> q;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            lab[r][c] = thin[r][c] >= hi * mx ? 2 : thin[r][c] >= lo * mx ? 1 : 0;
            if (lab[r][c] == 2) { strong++; q.push({r, c}); }
            if (lab[r][c] == 1) weak++;
        }
    while (!q.empty()) {
        auto p = q.front();
        q.pop();
        for (int a = -1; a <= 1; a++)
            for (int b = -1; b <= 1; b++) {
                int y = p.first + a, x = p.second + b;
                if (y >= 0 && y < N && x >= 0 && x < N && lab[y][x] == 1) { lab[y][x] = 2; promoted++; q.push({y, x}); }
            }
    }
    for (auto &row : lab) for (int v : row) edges += v == 2;
    printf("%s, low %g high %g: strong %d, weak %d, promoted %d, dropped %d, edge pixels %d\n", name.c_str(), lo, hi, strong, weak, promoted, weak - promoted, edges);
}

int main() {
    for (string name : {"shapes", "noisy", "step"}) {
        Img A = preset(name);
        canny(name, A, 0.15, 0.4);
        canny(name, A, 0.1, 0.3);
    }
}
