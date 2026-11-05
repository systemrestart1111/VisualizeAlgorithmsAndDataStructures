#include <stdio.h>

/* PR(v) = (1-d)/N + d·Σ PR(u)/出度(u)（u 指向 v）；重複套用直到收斂（冪迭代） */
int main(void) {
    const char *E = "AB AC BC CA DC EA ED FE BD DA";
    int adj[6][6] = {{0}}, deg[6] = {0}, n = 6;
    for (const char *p = E; *p; p += p[2] ? 3 : 2) {
        int a = p[0] - 'A', b = p[1] - 'A';
        adj[a][deg[a]++] = b;
    }
    double D = 0.85, pr[6], nw[6];
    for (int v = 0; v < n; v++) pr[v] = 1.0 / n;
    for (int it = 1; it <= 20; it++) {
        for (int v = 0; v < n; v++) nw[v] = (1 - D) / n;
        for (int u = 0; u < n; u++)
            for (int k = 0; k < deg[u]; k++) nw[adj[u][k]] += D * pr[u] / deg[u];
        for (int v = 0; v < n; v++) pr[v] = nw[v];
        if (it == 1 || it == 5 || it == 20) {
            printf("iteration %2d:", it);
            for (int v = 0; v < n; v++) printf(" %c=%.4f", 'A' + v, pr[v]);
            printf("\n");
        }
    }
    int order[6], used[6] = {0};
    for (int t = 0; t < n; t++) {
        int best = -1;
        for (int v = 0; v < n; v++) if (!used[v] && (best < 0 || pr[v] > pr[best])) best = v;
        used[best] = 1;
        order[t] = best;
    }
    printf("ranking:");
    for (int t = 0; t < n; t++) printf(t ? " > %c" : " %c", 'A' + order[t]);
    double s = 0;
    for (int v = 0; v < n; v++) s += pr[v];
    printf("\nsum = %.4f\n", s);
    return 0;
}
