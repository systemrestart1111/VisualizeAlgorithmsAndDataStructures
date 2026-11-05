#include <stdio.h>

typedef struct { long n, d; } Frac;
static long g(long a, long b) { while (b) { long t = a % b; a = b; b = t; } return a < 0 ? -a : a; }
static Frac mk(long n, long d) { long k = g(n, d); if (!k) k = 1; Frac f = {n / k, d / k}; return f; }
static Frac add(Frac a, Frac b) { return mk(a.n * b.d + b.n * a.d, a.d * b.d); }
static Frac mul(Frac a, Frac b) { return mk(a.n * b.n, a.d * b.d); }
static Frac dvd(Frac a, Frac b) { return mk(a.n * b.d, a.d * b.n); }
static void pr(Frac f) { if (f.d == 1) printf("%ld", f.n); else printf("%ld/%ld", f.n, f.d); }

int main(void) {
    int red = 3, blue = 2, total = red + blue;
    const char *names[4] = {"RR", "RB", "BR", "BB"};
    for (int replace = 1; replace >= 0; replace--) {
        Frac p[4];
        for (int f = 0; f < 2; f++) {
            Frac p1 = mk(f == 0 ? red : blue, total);
            int r2 = red, b2 = blue, t2 = total;
            if (!replace) { t2--; if (f == 0) r2--; else b2--; }
            for (int s = 0; s < 2; s++) p[f * 2 + s] = mul(p1, mk(s == 0 ? r2 : b2, t2));
        }
        puts(replace ? "with replacement" : "without replacement");
        for (int i = 0; i < 4; i++) { printf("  P(%s) = ", names[i]); pr(p[i]); puts(""); }
        Frac second = add(p[0], p[2]), cond = dvd(p[0], add(p[0], p[1]));
        printf("  P(2nd R) = "); pr(second); printf(", P(2nd R | 1st R) = "); pr(cond);
        printf(", independent = %s\n", second.n == cond.n && second.d == cond.d ? "True" : "False");
        Frac ex = add(mul(mk(2, 1), p[0]), add(p[1], p[2]));
        printf("  E[#red] = "); pr(ex); puts("");
    }
    return 0;
}
