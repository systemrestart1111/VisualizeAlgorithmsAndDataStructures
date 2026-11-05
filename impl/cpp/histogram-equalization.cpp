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
            else if (name == "flat") v = 120;
            a[r][c] = v;
        }
    return a;
}

int main() {
    for (string name : {"lowcontrast", "shapes", "flat"}) {
        auto A = preset(name);
        vector<int> hist(256, 0), cdf(256);
        for (auto &row : A) for (int v : row) hist[v]++;
        int s = 0, cmin = -1;
        for (int v = 0; v < 256; v++) { s += hist[v]; cdf[v] = s; if (cmin < 0 && s > 0) cmin = s; }
        // map[v] = round((CDF[v] − CDF_min) / (N − CDF_min) × 255)；常數影像原樣輸出
        if (cmin == N * N) { printf("%s: constant image, unchanged\n", name.c_str()); continue; }
        printf("%s:", name.c_str());
        for (int v = 0; v < 256; v++) if (hist[v]) printf(" %d->%d", v, (int)floor((cdf[v] - cmin) * 255.0 / (N * N - cmin) + 0.5));
        printf("\n");
    }
}
