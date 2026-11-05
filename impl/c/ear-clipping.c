#include <stdio.h>

typedef struct { double x, y; } Pt;
static double cross(Pt o, Pt a, Pt b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
static double area(const Pt *P, int n) { double s = 0; for (int i = 0; i < n; i++) { int j = (i + 1) % n; s += P[i].x * P[j].y - P[j].x * P[i].y; } return s / 2; }

/* 凸頂點且三角形內沒有其他頂點 → 耳朵；切下來直到剩一個三角形 */
static void run(const Pt *P, int n) {
    int idx[32], m = n, tris[32][3], nt = 0;
    for (int i = 0; i < n; i++) idx[i] = area(P, n) < 0 ? n - 1 - i : i;
    while (m > 3) {
        int clipped = 0;
        for (int k = 0; k < m && !clipped; k++) {
            int p = idx[(k + m - 1) % m], i = idx[k], q = idx[(k + 1) % m];
            if (cross(P[p], P[i], P[q]) <= 1e-12) continue; /* 凹頂點 */
            int inside = 0;
            for (int t = 0; t < m; t++) {
                int j = idx[t];
                if (j == p || j == i || j == q) continue;
                if (cross(P[p], P[i], P[j]) >= -1e-12 && cross(P[i], P[q], P[j]) >= -1e-12 && cross(P[q], P[p], P[j]) >= -1e-12) inside = 1;
            }
            if (inside) continue;
            tris[nt][0] = p; tris[nt][1] = i; tris[nt][2] = q; nt++;
            for (int t = k; t + 1 < m; t++) idx[t] = idx[t + 1];
            m--;
            clipped = 1;
        }
        if (!clipped) { printf("no ear found\n"); return; }
    }
    tris[nt][0] = idx[0]; tris[nt][1] = idx[1]; tris[nt][2] = idx[2]; nt++;
    double total = 0;
    printf("%d vertices -> %d triangles:", n, nt);
    for (int t = 0; t < nt; t++) {
        Pt tri[3] = {P[tris[t][0]], P[tris[t][1]], P[tris[t][2]]};
        double a = area(tri, 3);
        total += a < 0 ? -a : a;
        printf(" %d-%d-%d", tris[t][0], tris[t][1], tris[t][2]);
    }
    double A = area(P, n);
    printf("; area sum %.2f = shoelace %.2f\n", total, A < 0 ? -A : A);
}

int main(void) {
    Pt p1[] = {{0, 0}, {8, 0}, {8, 6}, {5, 3}, {3, 7}, {1, 4}};
    Pt p2[] = {{0, 0}, {10, 0}, {10, 8}, {7, 8}, {7, 3}, {3, 3}, {3, 8}, {0, 8}};
    Pt p3[] = {{1, 4}, {3, 7}, {5, 3}, {8, 6}, {8, 0}, {0, 0}};
    run(p1, 6);
    run(p2, 8);
    run(p3, 6);
    return 0;
}
