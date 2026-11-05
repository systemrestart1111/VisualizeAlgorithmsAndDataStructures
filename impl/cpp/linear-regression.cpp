#include <cstdio>
#include <utility>
#include <vector>
using namespace std;
typedef vector<pair<double, double>> Data;

Data data(bool exact) {
    long long s = 42;
    Data P;
    for (int i = 0; i < 12; i++) {
        double x = 0.5 + i * 0.8;
        if (exact) P.push_back({x, 2 * x + 1});
        else { s = s * 48271 % 2147483647; P.push_back({x, 2 * x + 1 + (s / 2147483647.0 - 0.5) * 4}); }
    }
    return P;
}
double mse(const Data &P, double w, double b) { double s = 0; for (auto &p : P) s += (w * p.first + b - p.second) * (w * p.first + b - p.second); return s / P.size(); }

int main() {
    for (bool exact : {false, true}) {
        Data P = data(exact);
        // 正規方程：w = (nΣxy − ΣxΣy) / (nΣx² − (Σx)²)，b = (Σy − wΣx) / n
        double n = P.size(), sx = 0, sy = 0, sxx = 0, sxy = 0;
        for (auto &p : P) { sx += p.first; sy += p.second; sxx += p.first * p.first; sxy += p.first * p.second; }
        double w = (n * sxy - sx * sy) / (n * sxx - sx * sx), b = (sy - w * sx) / n;
        printf("%s data: closed form w = %.4f, b = %.4f, MSE = %.4f\n", exact ? "exact" : "noisy", w, b, mse(P, w, b));
        vector<pair<double, int>> cfg = {{0.02, 200}, {0.02, 2000}, {0.005, 200}, {0.05, 200}};
        for (auto &c : cfg) {
            // 沿 ∂MSE/∂w = (2/n)Σe·x、∂MSE/∂b = (2/n)Σe 的反方向更新
            double ww = 0, bb = 0;
            int div = 0;
            for (int ep = 1; ep <= c.second; ep++) {
                double gw = 0, gb = 0;
                for (auto &p : P) { double e = ww * p.first + bb - p.second; gw += 2 / n * e * p.first; gb += 2 / n * e; }
                ww -= c.first * gw; bb -= c.first * gb;
                if (mse(P, ww, bb) > 1e6) { div = ep; break; }
            }
            if (div) printf("  lr %g: diverged at epoch %d\n", c.first, div);
            else printf("  lr %g, %d epochs: w = %.4f, b = %.4f, MSE = %.4f\n", c.first, c.second, ww, bb, mse(P, ww, bb));
        }
    }
}
