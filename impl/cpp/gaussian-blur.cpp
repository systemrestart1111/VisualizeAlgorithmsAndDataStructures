#include <algorithm>
#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;
const int N = 16;
typedef vector<vector<double>> Img;

Img noisy() {
    Img a(N, vector<double>(N));
    long long s = 7;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            int v = 30;
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
            s = s * 48271 % 2147483647;
            int t = s % 100;
            a[r][c] = t < 5 ? 0 : t < 10 ? 255 : v;
        }
    return a;
}
// 一維高斯：半徑 ⌈3σ⌉（最多 3），正規化成總和 1
vector<double> kernel(double sigma) {
    int rad = min(3, (int)ceil(3 * sigma));
    vector<double> k;
    double s = 0;
    for (int i = 0; i <= 2 * rad; i++) { k.push_back(exp(-((i - rad) * (i - rad)) / (2 * sigma * sigma))); s += k.back(); }
    for (auto &v : k) v /= s;
    return k;
}
double at(const Img &a, int r, int c, bool zero) {
    if (r >= 0 && r < N && c >= 0 && c < N) return a[r][c];
    if (zero) return 0;
    return a[min(N - 1, max(0, r))][min(N - 1, max(0, c))];
}
// 可分離：先水平再垂直
Img blur(const Img &a, double sigma, bool zero) {
    auto k = kernel(sigma);
    int rad = k.size() / 2;
    Img h(N, vector<double>(N)), out(N, vector<double>(N));
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double s = 0; for (int j = -rad; j <= rad; j++) s += k[j + rad] * at(a, r, c + j, zero); h[r][c] = s; }
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double s = 0; for (int i = -rad; i <= rad; i++) s += k[i + rad] * at(h, r + i, c, zero); out[r][c] = s; }
    return out;
}

int main() {
    Img A = noisy();
    for (double sigma : {0.6, 1.0, 2.0}) {
        Img out = blur(A, sigma, false);
        printf("sigma %.1f: kernel", sigma);
        for (double v : kernel(sigma)) printf(" %.6f", v);
        double sum = 0;
        for (auto &row : out) for (double v : row) sum += v;
        printf("\n  out(5,4) = %.3f, out(8,8) = %.3f, out(0,0) = %.3f, sum = %.3f\n", out[5][4], out[8][8], out[0][0], sum);
    }
    Img C(N, vector<double>(N, 120));
    for (bool zero : {false, true}) {
        Img out = blur(C, 1.0, zero);
        double dev = 0;
        for (auto &row : out) for (double v : row) dev = max(dev, fabs(v - 120));
        printf("constant image, border %s: max deviation %.3f\n", zero ? "zero" : "replicate", dev);
    }
}
