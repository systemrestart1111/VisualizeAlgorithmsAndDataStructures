#include <stdio.h>

static double P[23][2] = {{2.1, 3.0}, {2.8, 2.4}, {3.4, 3.6}, {2.5, 4.1}, {3.9, 2.7}, {1.8, 2.2}, {3.0, 3.1}, {2.2, 3.8},
                          {7.0, 7.4}, {7.8, 6.6}, {8.3, 7.9}, {6.9, 6.4}, {7.5, 8.2}, {8.6, 6.9}, {7.2, 7.0},
                          {6.6, 2.1}, {7.4, 2.9}, {7.9, 2.2}, {6.9, 3.2},
                          {5.0, 5.2}, {0.5, 9.0}, {9.5, 0.6}, {4.6, 8.8}};
#define NP 23

/* N(p) 含 p 自己；|N(p)| ≥ minPts 為核心點；從核心點 BFS 擴張，其餘為雜訊 */
static void dbscan(double eps, int min_pts) {
    int nb[NP][NP], nn[NP], core[NP], lab[NP], q[NP], c = -1;
    for (int i = 0; i < NP; i++) {
        nn[i] = 0;
        for (int j = 0; j < NP; j++) { double dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1]; if (dx * dx + dy * dy <= eps * eps) nb[i][nn[i]++] = j; }
        core[i] = nn[i] >= min_pts;
        lab[i] = -1;
    }
    for (int i = 0; i < NP; i++) {
        if (lab[i] >= 0 || !core[i]) continue;
        c++;
        lab[i] = c;
        int h = 0, t = 0;
        q[t++] = i;
        while (h < t) {
            int cur = q[h++];
            for (int k = 0; k < nn[cur]; k++) { int j = nb[cur][k]; if (lab[j] < 0) { lab[j] = c; if (core[j]) q[t++] = j; } }
        }
    }
    int nc = 0, border = 0, noise = 0;
    for (int i = 0; i < NP; i++) { nc += core[i]; border += lab[i] >= 0 && !core[i]; noise += lab[i] < 0; }
    printf("eps %.1f, minPts %d: %d clusters, core %d, border %d, noise %d; labels", eps, min_pts, c + 1, nc, border, noise);
    for (int i = 0; i < NP; i++) printf(" %d", lab[i]);
    printf("\n");
}

int main(void) {
    dbscan(1.2, 4);
    dbscan(0.8, 4);
    dbscan(2.0, 4);
    dbscan(1.2, 3);
    dbscan(1.2, 6);
    return 0;
}
