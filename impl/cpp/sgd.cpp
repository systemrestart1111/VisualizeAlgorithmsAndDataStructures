#include <cstdio>
#include <vector>
using namespace std;
vector<double> X, Y;
long long st;
long long nxt() { return st = st * 48271 % 2147483647; }
double mse(double w, double b) { double s = 0; for (size_t i = 0; i < X.size(); i++) s += (w * X[i] + b - Y[i]) * (w * X[i] + b - Y[i]); return s / X.size(); }

int main() {
    st = 9;
    for (int i = 0; i < 12; i++) { double x = 0.5 + i * 0.8; X.push_back(x); Y.push_back(2 * x + 1 + (nxt() / 2147483647.0 - 0.5) * 4); }
    for (double lr : {0.01, 0.002, 0.03}) {
        // 每輪先 Fisher–Yates 洗牌，再逐筆更新：w −= η·2e·x，b −= η·2e
        double w = 0, b = 0;
        int div = 0;
        st = 42;
        for (int ep = 1; ep <= 15 && !div; ep++) {
            vector<int> ord(12);
            for (int i = 0; i < 12; i++) ord[i] = i;
            for (int i = 11; i > 0; i--) { int j = nxt() % (i + 1); swap(ord[i], ord[j]); }
            for (int i : ord) { double e = w * X[i] + b - Y[i]; w -= lr * 2 * e * X[i]; b -= lr * 2 * e; }
            if (mse(w, b) > 1e6) div = ep;
        }
        double bw = 0, bb = 0;
        for (int ep = 0; ep < 15; ep++) {
            double gw = 0, gb = 0;
            for (int i = 0; i < 12; i++) gw += 2.0 / 12 * (bw * X[i] + bb - Y[i]) * X[i];
            for (int i = 0; i < 12; i++) gb += 2.0 / 12 * (bw * X[i] + bb - Y[i]);
            bw -= lr * gw; bb -= lr * gb;
        }
        printf("lr %g, 15 epochs: SGD ", lr);
        if (div) printf("diverged at epoch %d", div);
        else printf("w = %.4f, b = %.4f, MSE %.4f", w, b, mse(w, b));
        printf("; batch GD w = %.4f, b = %.4f, MSE %.4f\n", bw, bb, mse(bw, bb));
    }
}
