#include <stdio.h>

double f(double x) { return (x - 2) * (x - 2) + 1; } /* 最小值在 x = 2 */
double df(double x) { return 2 * (x - 2); }

/* 沿負梯度方向前進：x ← x − η·f'(x)；η 太大會震盪甚至發散，太小則收斂很慢 */
int main(void) {
    double x = 5.5, lr = 0.1;
    printf("step  0: x = %.6f, f(x) = %.6f\n", x, f(x));
    for (int step = 1; step <= 20; step++) {
        x -= lr * df(x);
        if (step <= 5 || step % 5 == 0) printf("step %2d: x = %.6f, f(x) = %.6f\n", step, x, f(x));
    }
    return 0;
}
