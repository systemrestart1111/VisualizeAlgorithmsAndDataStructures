#include <iostream>
#include <string>
using namespace std;

struct Frac {
    long n, d;
    Frac(long a = 0, long b = 1) {
        long x = a, y = b;
        while (y) { long t = x % y; x = y; y = t; }
        if (x < 0) x = -x;
        if (!x) x = 1;
        n = a / x; d = b / x;
    }
    Frac operator+(const Frac &o) const { return Frac(n * o.d + o.n * d, d * o.d); }
    Frac operator*(const Frac &o) const { return Frac(n * o.n, d * o.d); }
    Frac operator/(const Frac &o) const { return Frac(n * o.d, d * o.n); }
    bool operator==(const Frac &o) const { return n == o.n && d == o.d; }
};
ostream &operator<<(ostream &os, const Frac &f) { return f.d == 1 ? os << f.n : os << f.n << "/" << f.d; }

int main() {
    int red = 3, blue = 2, total = red + blue;
    string names[4] = {"RR", "RB", "BR", "BB"};
    for (int replace = 1; replace >= 0; replace--) {
        Frac p[4];
        for (int f = 0; f < 2; f++) {
            Frac p1(f == 0 ? red : blue, total);
            int r2 = red, b2 = blue, t2 = total;
            if (!replace) { t2--; if (f == 0) r2--; else b2--; }
            for (int s = 0; s < 2; s++) p[f * 2 + s] = p1 * Frac(s == 0 ? r2 : b2, t2);
        }
        cout << (replace ? "with replacement" : "without replacement") << "\n";
        for (int i = 0; i < 4; i++) cout << "  P(" << names[i] << ") = " << p[i] << "\n";
        Frac second = p[0] + p[2], cond = p[0] / (p[0] + p[1]);
        cout << "  P(2nd R) = " << second << ", P(2nd R | 1st R) = " << cond << ", independent = " << (second == cond ? "True" : "False") << "\n";
        cout << "  E[#red] = " << (Frac(2) * p[0] + p[1] + p[2]) << "\n";
    }
}
