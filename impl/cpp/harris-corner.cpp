#include <algorithm>
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>
using namespace std;
const int N = 16;
typedef vector<vector<double>> Img;

Img preset(bool checker) {
    Img a(N, vector<double>(N, 30));
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            if (checker) { a[r][c] = ((r >> 2) + (c >> 2)) % 2 ? 210 : 40; continue; }
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) a[r][c] = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) a[r][c] = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) a[r][c] = 90;
        }
    return a;
}
int cl(int x) { return min(N - 1, max(0, x)); }
Img blur1(const Img &a) {
    double k[7], s = 0;
    for (int i = 0; i < 7; i++) { k[i] = exp(-((i - 3) * (i - 3)) / 2.0); s += k[i]; }
    for (double &v : k) v /= s;
    Img h(N, vector<double>(N)), out(N, vector<double>(N));
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double t = 0; for (int j = -3; j <= 3; j++) t += k[j + 3] * a[r][cl(c + j)]; h[r][c] = t; }
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double t = 0; for (int i = -3; i <= 3; i++) t += k[i + 3] * h[cl(r + i)][c]; out[r][c] = t; }
    return out;
}

// 結構張量 M（高斯加權），R = det(M) − k·trace(M)²；R 四捨五入成整數後做 3×3 非極大值抑制
void harris(const string &name, const Img &A, double k) {
    Img xx(N, vector<double>(N)), yy = xx, xy = xx;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            double ix = (-A[cl(r - 1)][cl(c - 1)] + A[cl(r - 1)][cl(c + 1)] - 2 * A[r][cl(c - 1)] + 2 * A[r][cl(c + 1)] - A[cl(r + 1)][cl(c - 1)] + A[cl(r + 1)][cl(c + 1)]) / 8;
            double iy = (-A[cl(r - 1)][cl(c - 1)] - 2 * A[cl(r - 1)][c] - A[cl(r - 1)][cl(c + 1)] + A[cl(r + 1)][cl(c - 1)] + 2 * A[cl(r + 1)][c] + A[cl(r + 1)][cl(c + 1)]) / 8;
            xx[r][c] = ix * ix; yy[r][c] = iy * iy; xy[r][c] = ix * iy;
        }
    Img Sxx = blur1(xx), Syy = blur1(yy), Sxy = blur1(xy);
    vector<vector<long long>> R(N, vector<long long>(N));
    long long mx = -(1LL << 62), mn = 1LL << 62;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            double t = Sxx[r][c] + Syy[r][c];
            R[r][c] = (long long)floor(Sxx[r][c] * Syy[r][c] - Sxy[r][c] * Sxy[r][c] - k * t * t + 0.5);
            mx = max(mx, R[r][c]); mn = min(mn, R[r][c]);
        }
    vector<pair<int, int>> corners;
    int edges = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++) {
            if (R[i][j] < 0.1 * mn) edges++;
            if (R[i][j] <= 0.1 * mx) continue;
            bool ok = true;
            for (int a = -1; a <= 1; a++)
                for (int b = -1; b <= 1; b++) {
                    int y = i + a, x = j + b;
                    if ((a || b) && y >= 0 && y < N && x >= 0 && x < N && (R[y][x] > R[i][j] || (R[y][x] == R[i][j] && (a < 0 || (a == 0 && b < 0))))) ok = false;
                }
            if (ok) corners.push_back({i, j});
        }
    printf("%s, k = %.2f: max R = %lld, edge pixels %d, %d corners:", name.c_str(), k, mx, edges, (int)corners.size());
    for (auto &p : corners) printf(" (%d,%d)", p.first, p.second);
    printf("\n");
}

int main() {
    for (string name : {"checker", "shapes"})
        for (double k : {0.04, 0.06}) harris(name, preset(name == "checker"), k);
}
