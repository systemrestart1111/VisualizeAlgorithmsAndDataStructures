#include <cmath>
#include <cstdio>
#include <functional>
#include <string>
#include <vector>
using namespace std;
typedef function<double(double)> Fn;

// 係數 1, 4, 2, 4, …, 2, 4, 1 乘 h/3；n 必須是偶數（奇數回傳 NAN）
double simpson(Fn f, double a, double b, int n) {
    if (n % 2) return NAN;
    double h = (b - a) / n, s = f(a) + f(b);
    for (int i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
    return s * h / 3;
}
double trapezoid(Fn f, double a, double b, int n) {
    double h = (b - a) / n, s = 0;
    for (int i = 1; i < n; i++) s += f(a + i * h);
    return (f(a) + f(b)) / 2 * h + s * h;
}

int main() {
    const double PI = acos(-1.0);
    struct T { string name; Fn f; double a, b, exact; };
    vector<T> tests = {
        {"sin x on [0, pi]", [](double x) { return sin(x); }, 0, PI, 2.0},
        {"4/(1+x^2) on [0, 1]", [](double x) { return 4 / (1 + x * x); }, 0, 1, PI},
        {"x^3-2x+1 on [0, 2]", [](double x) { return x * x * x - 2 * x + 1; }, 0, 2, 2.0},
        {"sqrt x on [0, 1]", [](double x) { return sqrt(x); }, 0, 1, 2.0 / 3},
    };
    for (auto &t : tests)
        for (int n : {2, 6, 12, 24}) {
            double s = simpson(t.f, t.a, t.b, n);
            printf("%s, n = %d: simpson %.10f (err %.10f), trapezoid err %.10f\n", t.name.c_str(), n, s, fabs(s - t.exact), fabs(trapezoid(t.f, t.a, t.b, n) - t.exact));
        }
    printf("n = 5: %s\n", std::isnan(simpson([](double x) { return sin(x); }, 0, 1, 5)) ? "n must be even" : "ok");
}
