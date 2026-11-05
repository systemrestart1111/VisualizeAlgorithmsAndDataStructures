#include <cmath>
#include <cstdio>
#include <string>
#include <vector>
using namespace std;
const int N = 16;

vector<vector<int>> preset(const string &name) {
    vector<vector<int>> a(N, vector<int>(N));
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            int v = 30;
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
            if (name == "lowcontrast") v = 95 + (int)floor((v - 30) / 170.0 * 35 + 0.5) + (r / 4) * 3;
            else if (name == "step") v = (c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0);
            else if (name == "flat") v = 120;
            a[r][c] = v;
        }
    return a;
}

int main() {
    for (string name : {"shapes", "lowcontrast", "step", "flat"}) {
        auto A = preset(name);
        vector<int> hist(256, 0);
        for (auto &row : A) for (int v : row) hist[v]++;
        int levels = 0, only = 0;
        for (int v = 0; v < 256; v++) if (hist[v]) { levels++; only = v; }
        if (levels == 1) { printf("%s: single gray level, t = %d, all background\n", name.c_str(), only); continue; }
        // 最大化類間變異數 ω₀ω₁(μ₀ − μ₁)²；空類別跳過
        double total = 0, best = -1, sum0 = 0;
        int w0 = 0, bt = 0, P = N * N;
        for (int v = 0; v < 256; v++) total += (double)v * hist[v];
        for (int t = 0; t < 256; t++) {
            w0 += hist[t];
            sum0 += (double)hist[t] * t;
            int w1 = P - w0;
            if (!w0 || !w1) continue;
            double m0 = sum0 / w0, m1 = (total - sum0) / w1;
            double sb = ((double)w0 / P) * ((double)w1 / P) * (m0 - m1) * (m0 - m1);
            if (sb > best) { best = sb; bt = t; }
        }
        int fg = 0;
        for (auto &row : A) for (int v : row) fg += v > bt;
        printf("%s: t = %d, between-class variance %.3f, foreground %d pixels\n", name.c_str(), bt, best, fg);
    }
}
