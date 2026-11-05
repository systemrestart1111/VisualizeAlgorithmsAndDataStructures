#include <cmath>
#include <cstdio>
#include <functional>
#include <string>
#include <vector>
using namespace std;
typedef function<double(double, double)> Fn;

// 每步四個斜率：起點、兩個中點、終點，以 1:2:2:1 加權
double rk4(Fn f, double y0, double h, double T) {
    double t = 0, y = y0;
    int n = (int)floor(T / h + 0.5);
    for (int k = 0; k < n; k++) {
        double k1 = f(t, y), k2 = f(t + h / 2, y + h * k1 / 2), k3 = f(t + h / 2, y + h * k2 / 2), k4 = f(t + h, y + h * k3);
        y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
        t = (k + 1) * h;
    }
    return y;
}
double euler(Fn f, double y0, double h, double T) {
    double t = 0, y = y0;
    int n = (int)floor(T / h + 0.5);
    for (int k = 0; k < n; k++) { y += h * f(t, y); t = (k + 1) * h; }
    return y;
}

int main() {
    struct O { string name; Fn f; double T, exact; };
    vector<O> odes = {
        {"y' = y, y(0) = 1", [](double, double y) { return y; }, 2, exp(2.0)},
        {"y' = -2ty, y(0) = 1", [](double t, double y) { return -2 * t * y; }, 2, exp(-4.0)},
        {"y' = t - y, y(0) = 1", [](double t, double y) { return t - y; }, 3, 3 - 1 + 2 * exp(-3.0)},
    };
    for (auto &o : odes) {
        for (double h : {0.5, 0.25, 0.1}) {
            double y = rk4(o.f, 1.0, h, o.T), ye = euler(o.f, 1.0, h, o.T);
            printf("%s, h = %g: y(%g) rk4 %.8f (err %.8f), euler %.8f (err %.8f)\n", o.name.c_str(), h, o.T, y, fabs(y - o.exact), ye, fabs(ye - o.exact));
        }
        double e1 = fabs(rk4(o.f, 1.0, 0.2, o.T) - o.exact), e2 = fabs(rk4(o.f, 1.0, 0.1, o.T) - o.exact);
        printf("  halving h from 0.2 to 0.1 shrinks rk4 error by %.1fx\n", e1 / e2);
    }
}
