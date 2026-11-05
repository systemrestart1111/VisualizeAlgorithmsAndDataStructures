#include <cstdio>

double f(double x) { return x * x * x - 2 * x - 5; }
double df(double x) { return 3 * x * x - 2; }

// 用切線逼近：x ← x − f(x) / f'(x)；靠近根時誤差每步大約平方縮小（二次收斂）
int main() {
    double x = 3;
    printf("x0 = %.10f\n", x);
    for (int i = 1; i <= 6; i++) {
        x -= f(x) / df(x);
        printf("x%d = %.10f\n", i, x);
    }
}
