#include <cmath>
#include <cstdio>
#include <string>
#include <vector>
using namespace std;

vector<pair<double, double>> P0 = {{2.0, 1.6}, {3.1, 2.4}, {4.2, 2.6}, {5.0, 3.5}, {5.9, 3.7}, {6.8, 4.6}, {7.7, 4.4}, {8.9, 5.6}, {4.6, 3.6}, {6.1, 3.0}};

// 中心化（可選標準化）→ 共變異數矩陣 → 2×2 對稱矩陣的特徵分解
void pca(const string &name, double scale, bool standardize) {
    int n = P0.size();
    vector<pair<double, double>> X;
    double mx = 0, my = 0;
    for (auto &p : P0) { mx += p.first * scale; my += p.second; }
    mx /= n; my /= n;
    for (auto &p : P0) X.push_back({p.first * scale - mx, p.second - my});
    if (standardize) {
        double sx = 0, sy = 0;
        for (auto &p : X) { sx += p.first * p.first; sy += p.second * p.second; }
        sx = sqrt(sx / (n - 1)); sy = sqrt(sy / (n - 1));
        for (auto &p : X) { p.first /= sx; p.second /= sy; }
    }
    double a = 0, b = 0, c = 0;
    for (auto &p : X) { a += p.first * p.first; b += p.first * p.second; c += p.second * p.second; }
    a /= n - 1; b /= n - 1; c /= n - 1;
    double tr = a + c, det = a * c - b * b, disc = sqrt(fmax(0.0, (tr / 2) * (tr / 2) - det));
    double l1 = tr / 2 + disc, l2 = tr / 2 - disc, v0, v1;
    if (fabs(b) > 1e-12) { v0 = l1 - c; v1 = b; } else if (a >= c) { v0 = 1; v1 = 0; } else { v0 = 0; v1 = 1; }
    double nv = hypot(v0, v1);
    v0 /= nv; v1 /= nv;
    if (v0 < 0) { v0 = -v0; v1 = -v1; }
    printf("%s, %s: cov [%.3f %.3f; %.3f %.3f], eigenvalues %.3f %.3f (sum %.3f = trace %.3f), PC1 (%.3f, %.3f) explains %.2f%%, first projections %.3f %.3f\n",
           name.c_str(), standardize ? "standardized" : "centered", a, b, b, c, l1, l2, l1 + l2, a + c, v0, v1, 100 * l1 / (l1 + l2), X[0].first * v0 + X[0].second * v1, X[1].first * v0 + X[1].second * v1);
}

int main() {
    pca("original", 1, false);
    pca("original", 1, true);
    pca("x scaled by 10", 10, false);
    pca("x scaled by 10", 10, true);
}
