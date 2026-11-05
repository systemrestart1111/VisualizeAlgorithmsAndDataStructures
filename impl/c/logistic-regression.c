#include <math.h>
#include <stdio.h>

static double X1[24], X2[24];
static int Y[24];
static long long st;
static double real(void) { st = st * 48271 % 2147483647; return st / 2147483647.0; }

/* 依正負號選擇不會溢位的寫法 */
static double sigmoid(double z) { return z >= 0 ? 1 / (1 + exp(-z)) : exp(z) / (1 + exp(z)); }
/* 交叉熵的穩定形式：max(z, 0) − y·z + log(1 + e^(−|z|))，不會出現 log(0) */
static double log_loss(double z, int y) { return (z > 0 ? z : 0) - y * z + log1p(exp(-fabs(z))); }

int main(void) {
    printf("stable loss for z = 40, y = 0: %.4f; for z = -40, y = 1: %.4f; z = 0: %.4f\n", log_loss(40, 0), log_loss(-40, 1), log_loss(0, 1));
    int seps[2] = {3, 6};
    double lrs[2][3] = {{0.5, 0.1, 0.5}, {0.1, 0.1, 0.02}};
    int eps[3] = {300, 300, 3000}, eps6[3] = {300, 3000, 3000};
    for (int s = 0; s < 2; s++) {
        st = 42;
        for (int i = 0; i < 24; i++) { Y[i] = i % 2; double c = Y[i] ? 6 : 3; X1[i] = c + (real() - 0.5) * seps[s]; X2[i] = c + (real() - 0.5) * seps[s]; }
        for (int k = 0; k < 3; k++) {
            double w1 = 0, w2 = 0, b = 0;
            for (int ep = 0; ep < (s ? eps6[k] : eps[k]); ep++) {
                double g1 = 0, g2 = 0, gb = 0;
                for (int i = 0; i < 24; i++) { double e = sigmoid(w1 * X1[i] + w2 * X2[i] + b) - Y[i]; g1 += e * X1[i] / 24; g2 += e * X2[i] / 24; gb += e / 24; }
                w1 -= lrs[s][k] * g1; w2 -= lrs[s][k] * g2; b -= lrs[s][k] * gb;
            }
            double loss = 0;
            int acc = 0;
            for (int i = 0; i < 24; i++) { double z = w1 * X1[i] + w2 * X2[i] + b; loss += log_loss(z, Y[i]); acc += (sigmoid(z) >= 0.5 ? 1 : 0) == Y[i]; }
            printf("spread %d, lr %g, %d epochs: w = (%.3f, %.3f), b = %.3f, loss %.4f, accuracy %d/24\n", seps[s], lrs[s][k], s ? eps6[k] : eps[k], w1, w2, b, loss / 24, acc);
        }
    }
    return 0;
}
