#include <stdio.h>
#include <stdlib.h>

int parent[26];

int find(int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}

int main(void) {
    const char *S[] = {"AB7", "AD5", "BC8", "BD9", "BE7", "CE5", "DE15", "DF6", "EF8", "EG9", "FG11"};
    int m = 11, n = 7, A[11], B[11], W[11], total = 0, comps = n, rnd = 0;
    for (int i = 0; i < m; i++) { A[i] = S[i][0] - 'A'; B[i] = S[i][1] - 'A'; W[i] = atoi(S[i] + 2); }
    for (int v = 0; v < n; v++) parent[v] = v;
    /* 每一輪：每個連通塊各自找一條最便宜的對外邊（同權重取編號小的），全部一起加入；塊數每輪至少減半 */
    while (comps > 1) {
        int cheapest[26], pick[11] = {0};
        for (int v = 0; v < n; v++) cheapest[v] = -1;
        for (int i = 0; i < m; i++) {
            int r[2] = {find(A[i]), find(B[i])};
            if (r[0] == r[1]) continue;
            for (int k = 0; k < 2; k++) {
                int c = cheapest[r[k]];
                if (c < 0 || W[i] < W[c] || (W[i] == W[c] && i < c)) cheapest[r[k]] = i;
            }
        }
        for (int v = 0; v < n; v++) if (cheapest[v] >= 0) pick[cheapest[v]] = 1;
        printf("round %d:", ++rnd);
        for (int i = 0; i < m; i++) {
            if (!pick[i] || find(A[i]) == find(B[i])) continue;
            parent[find(A[i])] = find(B[i]);
            total += W[i];
            comps--;
            printf(" %c-%c(%d)", 'A' + A[i], 'A' + B[i], W[i]);
        }
        printf("\n");
    }
    printf("total weight = %d\n", total);
    return 0;
}
