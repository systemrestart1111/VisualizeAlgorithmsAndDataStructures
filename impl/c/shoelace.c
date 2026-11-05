#include <stdio.h>
#include <stdlib.h>

typedef struct { long long x, y; } Pt;
static long long cross(Pt o, Pt a, Pt b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
static long long mn(long long a, long long b) { return a < b ? a : b; }
static long long mx(long long a, long long b) { return a > b ? a : b; }
static int on(Pt p, Pt q, Pt x) { return mn(p.x, q.x) <= x.x && x.x <= mx(p.x, q.x) && mn(p.y, q.y) <= x.y && x.y <= mx(p.y, q.y); }
/* 閉線段是否相交（含端點接觸） */
static int touch(Pt a, Pt b, Pt c, Pt d) {
    long long d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
    if (d1 && d2 && d3 && d4 && ((d1 > 0) != (d2 > 0)) && ((d3 > 0) != (d4 > 0))) return 1;
    return (!d1 && on(c, d, a)) || (!d2 && on(c, d, b)) || (!d3 && on(a, b, c)) || (!d4 && on(a, b, d));
}
static int is_simple(const Pt *P, int n) {
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            if (j == i + 1 || (i == 0 && j == n - 1)) continue;
            if (touch(P[i], P[(i + 1) % n], P[j], P[(j + 1) % n])) return 0;
        }
    return 1;
}
static long long gcd(long long a, long long b) { return b ? gcd(b, a % b) : a; }

/* S = Σ (xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ)；有向面積 S/2，正為逆時針 */
static void run(const Pt *P, int n) {
    long long s = 0, B = 0;
    for (int i = 0; i < n; i++) { int j = (i + 1) % n; s += P[i].x * P[j].y - P[j].x * P[i].y; }
    double A = s / 2.0;
    if (!is_simple(P, n)) { printf("signed area %.1f, but polygon is not simple: result is not its area\n", A); return; }
    for (int i = 0; i < n; i++) { int j = (i + 1) % n; B += gcd(llabs(P[j].x - P[i].x), llabs(P[j].y - P[i].y)); }
    double absA = A < 0 ? -A : A;
    printf("signed area %.1f (%s), area %.1f, Pick: B = %lld, I = %.0f\n", A, A > 0 ? "counter-clockwise" : "clockwise", absA, B, absA - B / 2.0 + 1);
}

int main(void) {
    Pt p1[] = {{1, 1}, {7, 2}, {9, 6}, {5, 9}, {4, 5}, {1, 7}};
    Pt p2[] = {{1, 7}, {4, 5}, {5, 9}, {9, 6}, {7, 2}, {1, 1}};
    Pt p3[] = {{0, 0}, {6, 0}, {6, 4}, {3, 2}, {0, 4}};
    Pt p4[] = {{0, 0}, {8, 6}, {8, 0}, {0, 6}};
    run(p1, 6);
    run(p2, 6);
    run(p3, 5);
    run(p4, 4);
    return 0;
}
