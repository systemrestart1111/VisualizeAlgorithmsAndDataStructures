#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;
typedef pair<double, double> Pt;

struct PM {
    long long s;
    long long next() { return s = s * 48271 % 2147483647; }
    int nextInt(int n) { return next() % n; }
    double real() { return next() / 2147483647.0; }
};
vector<Pt> P;

pair<double, double> lsq(const vector<int> &idx) {
    double n = idx.size(), sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (int k : idx) { sx += P[k].first; sy += P[k].second; sxx += P[k].first * P[k].first; sxy += P[k].first * P[k].second; }
    double det = n * sxx - sx * sx;
    return det != 0 ? make_pair((n * sxy - sx * sy) / det, (sxx * sy - sx * sxy) / det) : make_pair(0.0, sy / n);
}

// 隨機抽兩點定直線，數誤差門檻內的內點，保留最多者；最後只用內點重新擬合
void ransac(long long seed, int iters, double thr) {
    PM g{seed};
    vector<int> best;
    bool has = false;
    for (int it = 0; it < iters; it++) {
        int i = g.nextInt(30), j = g.nextInt(30), tries = 0;
        while (P[i] == P[j] && tries < 10) { j = g.nextInt(30); tries++; }
        if (P[i] == P[j]) continue;
        double A = P[j].second - P[i].second, B = P[i].first - P[j].first, C = -(A * P[i].first + B * P[i].second), nrm = hypot(A, B);
        vector<int> inl;
        for (int k = 0; k < 30; k++) if (fabs(A * P[k].first + B * P[k].second + C) / nrm < thr) inl.push_back(k);
        if (!has || inl.size() > best.size()) { best = inl; has = true; }
    }
    auto ab = lsq(best);
    int realIn = 0;
    for (int k : best) realIn += k < 20;
    printf("seed %lld, %d iterations, threshold %.1f: %d inliers (%d true), refit y = %.3fx + %.3f\n", seed, iters, thr, (int)best.size(), realIn, ab.first, ab.second);
}

int main() {
    PM g{7};
    for (int i = 0; i < 20; i++) { double x = 0.5 + i * 9.0 / 19; P.push_back({x, 0.6 * x + 2 + (g.real() - 0.5) * 0.6}); }
    for (int i = 0; i < 10; i++) { double x = g.real() * 10; double y = g.real() * 10; P.push_back({x, y}); }
    vector<int> all;
    for (int k = 0; k < 30; k++) all.push_back(k);
    auto ab = lsq(all);
    printf("least squares on all 30 points: y = %.3fx + %.3f\n", ab.first, ab.second);
    ransac(42, 20, 0.5);
    ransac(1, 5, 0.5);
    ransac(2024, 50, 0.3);
    ransac(42, 20, 1.0);
}
