#include <cstdio>

double f(double x) { return x * x * x - 2 * x - 5; }

// f(a) 與 f(b) 異號時區間內必有根；每次取中點，保留仍然異號的那一半，誤差每步減半
int main() {
    double a = 1, b = 3;
    for (int i = 1; i <= 12; i++) {
        double m = (a + b) / 2;
        if (f(a) * f(m) <= 0) b = m;
        else a = m;
        printf("step %2d: [%.12f, %.12f]\n", i, a, b);
    }
    printf("root ~ %.12f\n", (a + b) / 2);
}
