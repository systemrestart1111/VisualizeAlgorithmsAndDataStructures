#include <cmath>
#include <cstdio>
#include <functional>
#include <string>
using namespace std;

// x2 = x1 − f(x1)(x1 − x0) / (f(x1) − f(x0))；分母趨近 0 或 |x| 爆增時停止
string secant(function<double(double)> f, double x0, double x1) {
    char buf[96];
    for (int k = 1; k <= 25; k++) {
        double f0 = f(x0), f1 = f(x1);
        if (fabs(f1 - f0) < 1e-14) return "flat secant (f(x0) = f(x1)), stop";
        double x2 = x1 - f1 * (x1 - x0) / (f1 - f0);
        if (!std::isfinite(x2) || fabs(x2) > 1e6) { snprintf(buf, sizeof buf, "diverged after %d steps", k); return buf; }
        if (fabs(x2 - x1) < 1e-12) { snprintf(buf, sizeof buf, "root %.10f after %d steps", fabs(x2) < 5e-11 ? 0.0 : x2, k); return buf; }
        x0 = x1; x1 = x2;
    }
    return "no convergence in 25 steps";
}

int main() {
    auto cubic = [](double x) { return x * x * x - 2 * x - 5; };
    auto cs = [](double x) { return cos(x) - x; };
    auto sq = [](double x) { return x * x - 2; };
    auto at = [](double x) { return atan(x); };
    printf("x^3-2x-5, x0 = 1, x1 = 3: %s\n", secant(cubic, 1, 3).c_str());
    printf("cos x - x, x0 = 0, x1 = 1: %s\n", secant(cs, 0, 1).c_str());
    printf("x^2-2, x0 = 1, x1 = 2: %s\n", secant(sq, 1, 2).c_str());
    printf("x^2-2, x0 = -1, x1 = 1: %s\n", secant(sq, -1, 1).c_str());
    printf("atan x, x0 = 1, x1 = 2: %s\n", secant(at, 1, 2).c_str());
    printf("atan x, x0 = 3, x1 = 5: %s\n", secant(at, 3, 5).c_str());
}
