#include <stdio.h>

static double X[12], Y[12];
static long long st;
static double real(void) { st = st * 48271 % 2147483647; return st / 2147483647.0; }

static void data(int exact) {
    st = 42;
    for (int i = 0; i < 12; i++) { X[i] = 0.5 + i * 0.8; Y[i] = exact ? 2 * X[i] + 1 : 2 * X[i] + 1 + (real() - 0.5) * 4; }
}
static double mse(double w, double b) { double s = 0; for (int i = 0; i < 12; i++) s += (w * X[i] + b - Y[i]) * (w * X[i] + b - Y[i]); return s / 12; }

int main(void) {
    double lrs[4] = {0.02, 0.02, 0.005, 0.05};
    int eps[4] = {200, 2000, 200, 200};
    for (int exact = 0; exact <= 1; exact++) {
        data(exact);
        /* 正規方程：w = (nΣxy − ΣxΣy) / (nΣx² − (Σx)²)，b = (Σy − wΣx) / n */
        double sx = 0, sy = 0, sxx = 0, sxy = 0;
        for (int i = 0; i < 12; i++) { sx += X[i]; sy += Y[i]; sxx += X[i] * X[i]; sxy += X[i] * Y[i]; }
        double w = (12 * sxy - sx * sy) / (12 * sxx - sx * sx), b = (sy - w * sx) / 12;
        printf("%s data: closed form w = %.4f, b = %.4f, MSE = %.4f\n", exact ? "exact" : "noisy", w, b, mse(w, b));
        for (int k = 0; k < 4; k++) {
            /* 沿 ∂MSE/∂w = (2/n)Σe·x、∂MSE/∂b = (2/n)Σe 的反方向更新 */
            double gw_, gb_, ww = 0, bb = 0;
            int div = 0;
            for (int ep = 1; ep <= eps[k]; ep++) {
                gw_ = gb_ = 0;
                for (int i = 0; i < 12; i++) { double e = ww * X[i] + bb - Y[i]; gw_ += 2.0 / 12 * e * X[i]; gb_ += 2.0 / 12 * e; }
                ww -= lrs[k] * gw_; bb -= lrs[k] * gb_;
                if (mse(ww, bb) > 1e6) { div = ep; break; }
            }
            if (div) printf("  lr %g: diverged at epoch %d\n", lrs[k], div);
            else printf("  lr %g, %d epochs: w = %.4f, b = %.4f, MSE = %.4f\n", lrs[k], eps[k], ww, bb, mse(ww, bb));
        }
    }
    return 0;
}
