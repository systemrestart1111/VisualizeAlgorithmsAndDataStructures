#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <vector>
using namespace std;
const int N = 16;
typedef vector<vector<int>> Img;

Img preset(bool low) {
    Img a(N, vector<int>(N));
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            int v = 30;
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
            if (low) v = 95 + (int)floor((v - 30) / 170.0 * 35 + 0.5) + (r / 4) * 3;
            a[r][c] = v;
        }
    return a;
}
int rnd(double x) { return x >= 0 ? (int)(x + 0.5) : -(int)(-x + 0.5); }

// 每格直方圖裁切上限後平均分回（總數不變），各自求對應表，再以雙線性內插消除接縫
void clahe(const string &name, const Img &A, int T, int clip) {
    int ts = N / T, P = ts * ts, limit = max(1, (clip * P + 255) / 256);
    bool ok = true;
    vector<vector<vector<int>>> maps(T, vector<vector<int>>(T, vector<int>(256)));
    for (int ti = 0; ti < T; ti++)
        for (int tj = 0; tj < T; tj++) {
            vector<int> h(256, 0);
            int excess = 0, tot = 0, s = 0;
            for (int i = 0; i < ts; i++) for (int j = 0; j < ts; j++) h[A[ti * ts + i][tj * ts + j]]++;
            for (int &v : h) if (v > limit) { excess += v - limit; v = limit; }
            for (int v = 0; v < 256; v++) { h[v] += excess / 256 + (v < excess % 256 ? 1 : 0); tot += h[v]; }
            if (tot != P) ok = false;
            for (int v = 0; v < 256; v++) { s += h[v]; maps[ti][tj][v] = rnd(s * 255.0 / P); }
        }
    Img no(N, vector<int>(N)), out = no;
    int sum = 0;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            int v = A[r][c];
            no[r][c] = maps[r / ts][c / ts][v];
            double fy = (r + 0.5) / ts - 0.5, fx = (c + 0.5) / ts - 0.5;
            int y0 = max(0, min(T - 1, (int)floor(fy))), x0 = max(0, min(T - 1, (int)floor(fx)));
            int y1 = min(T - 1, y0 + 1), x1 = min(T - 1, x0 + 1);
            double wy = max(0.0, min(1.0, fy - y0)), wx = max(0.0, min(1.0, fx - x0));
            out[r][c] = rnd((1 - wy) * ((1 - wx) * maps[y0][x0][v] + wx * maps[y0][x1][v]) + wy * ((1 - wx) * maps[y1][x0][v] + wx * maps[y1][x1][v]));
            sum += out[r][c];
        }
    int s1 = 0, s2 = 0;
    for (int k = 1; k < T; k++)
        for (int i = 0; i < N; i++) {
            s1 += abs(no[i][k * ts] - no[i][k * ts - 1]) + abs(no[k * ts][i] - no[k * ts - 1][i]);
            s2 += abs(out[i][k * ts] - out[i][k * ts - 1]) + abs(out[k * ts][i] - out[k * ts - 1][i]);
        }
    printf("%s, %dx%d tiles, clip %d: limit %d, totals preserved %s, seam without/with interpolation %d/%d, output sum %d\n", name.c_str(), T, T, clip, limit, ok ? "True" : "False", s1, s2, sum);
}

int main() {
    int cfg[3][2] = {{2, 8}, {4, 4}, {2, 32}};
    Img low = preset(true), sh = preset(false);
    for (auto &c : cfg) clahe("lowcontrast", low, c[0], c[1]);
    for (auto &c : cfg) clahe("shapes", sh, c[0], c[1]);
}
