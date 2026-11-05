#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;
struct Pt { double x1, x2; int y; };

// 依正負號選擇不會溢位的寫法
double sigmoid(double z) { return z >= 0 ? 1 / (1 + exp(-z)) : exp(z) / (1 + exp(z)); }
// 交叉熵的穩定形式：max(z, 0) − y·z + log(1 + e^(−|z|))，不會出現 log(0)
double logLoss(double z, int y) { return max(z, 0.0) - y * z + log1p(exp(-fabs(z))); }

int main() {
    printf("stable loss for z = 40, y = 0: %.4f; for z = -40, y = 1: %.4f; z = 0: %.4f\n", logLoss(40, 0), logLoss(-40, 1), logLoss(0, 1));
    vector<pair<int, vector<pair<double, int>>>> cfgs = {{3, {{0.5, 300}, {0.1, 300}, {0.5, 3000}}}, {6, {{0.1, 300}, {0.1, 3000}, {0.02, 3000}}}};
    for (auto &cfg : cfgs) {
        long long s = 42;
        auto real = [&]() { s = s * 48271 % 2147483647; return s / 2147483647.0; };
        vector<Pt> D;
        for (int i = 0; i < 24; i++) { int y = i % 2; double c = y ? 6 : 3; double x1 = c + (real() - 0.5) * cfg.first; double x2 = c + (real() - 0.5) * cfg.first; D.push_back({x1, x2, y}); }
        for (auto &k : cfg.second) {
            double w1 = 0, w2 = 0, b = 0, n = D.size();
            for (int ep = 0; ep < k.second; ep++) {
                double g1 = 0, g2 = 0, gb = 0;
                for (auto &p : D) { double e = sigmoid(w1 * p.x1 + w2 * p.x2 + b) - p.y; g1 += e * p.x1 / n; g2 += e * p.x2 / n; gb += e / n; }
                w1 -= k.first * g1; w2 -= k.first * g2; b -= k.first * gb;
            }
            double loss = 0;
            int acc = 0;
            for (auto &p : D) { double z = w1 * p.x1 + w2 * p.x2 + b; loss += logLoss(z, p.y); acc += (sigmoid(z) >= 0.5 ? 1 : 0) == p.y; }
            printf("spread %d, lr %g, %d epochs: w = (%.3f, %.3f), b = %.3f, loss %.4f, accuracy %d/24\n", cfg.first, k.first, k.second, w1, w2, b, loss / n, acc);
        }
    }
}
