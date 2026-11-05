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

// λmin = trace/2 − √((Sxx−Syy)²/4 + Sxy²)；依分數由大到小貪婪挑選，保持最小間距
void shiTomasi(const string &name, const Img &A, double q, int dist) {
    Img xx(N, vector<double>(N)), yy = xx, xy = xx;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            double ix = (-A[cl(r - 1)][cl(c - 1)] + A[cl(r - 1)][cl(c + 1)] - 2 * A[r][cl(c - 1)] + 2 * A[r][cl(c + 1)] - A[cl(r + 1)][cl(c - 1)] + A[cl(r + 1)][cl(c + 1)]) / 8;
            double iy = (-A[cl(r - 1)][cl(c - 1)] - 2 * A[cl(r - 1)][c] - A[cl(r - 1)][cl(c + 1)] + A[cl(r + 1)][cl(c - 1)] + 2 * A[cl(r + 1)][c] + A[cl(r + 1)][cl(c + 1)]) / 8;
            xx[r][c] = ix * ix; yy[r][c] = iy * iy; xy[r][c] = ix * iy;
        }
    Img Sxx = blur1(xx), Syy = blur1(yy), Sxy = blur1(xy), lam(N, vector<double>(N));
    double mx = -1e300;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            double d = (Sxx[r][c] - Syy[r][c]) / 2;
            lam[r][c] = floor(((Sxx[r][c] + Syy[r][c]) / 2 - sqrt(d * d + Sxy[r][c] * Sxy[r][c])) * 1000 + 0.5) / 1000;
            mx = max(mx, lam[r][c]);
        }
    vector<pair<int, int>> cand, chosen;
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) if (mx > 0 && lam[r][c] >= q * mx) cand.push_back({r, c});
    sort(cand.begin(), cand.end(), [&](const pair<int, int> &a, const pair<int, int> &b) { double la = lam[a.first][a.second], lb = lam[b.first][b.second]; return la != lb ? la > lb : a < b; });
    for (auto &p : cand) {
        bool ok = true;
        for (auto &s : chosen) if (hypot(p.first - s.first, p.second - s.second) < dist) ok = false;
        if (ok) chosen.push_back(p);
    }
    printf("%s, quality %.1f, min distance %d: %d candidates, %d chosen:", name.c_str(), q, dist, (int)cand.size(), (int)chosen.size());
    for (auto &p : chosen) printf(" (%d,%d)", p.first, p.second);
    printf("\n");
}

int main() {
    Img ch = preset(true), sh = preset(false);
    shiTomasi("checker", ch, 0.1, 3);
    shiTomasi("checker", ch, 0.1, 5);
    shiTomasi("checker", ch, 0.3, 3);
    shiTomasi("shapes", sh, 0.1, 3);
}
