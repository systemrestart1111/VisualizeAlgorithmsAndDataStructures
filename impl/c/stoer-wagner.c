#include <stdio.h>

#define N 8
/* 節點依首次出現順序：1 2 5 3 6 4 7 8 */
static int NODES[N] = {1, 2, 5, 3, 6, 4, 7, 8};
static int idx(int x) { for (int i = 0; i < N; i++) if (NODES[i] == x) return i; return -1; }

int main(void) {
    int E[12][3] = {{1, 2, 2}, {1, 5, 3}, {2, 3, 3}, {2, 5, 2}, {2, 6, 2}, {3, 4, 4}, {3, 7, 2}, {4, 7, 2}, {4, 8, 2}, {5, 6, 3}, {6, 7, 1}, {7, 8, 3}};
    int W[N][N] = {{0}}, alive[N], mem[N][N], nm[N], best = 1 << 30, bestSet[N], nb = 0;
    for (int e = 0; e < 12; e++) { int a = idx(E[e][0]), b = idx(E[e][1]); W[a][b] += E[e][2]; W[b][a] += E[e][2]; }
    for (int i = 0; i < N; i++) { alive[i] = 1; mem[i][0] = NODES[i]; nm[i] = 1; }
    printf("cut of each phase:");
    /* 每階段做最大鄰接排序，切出最後加入的點，再把最後兩點合併 */
    for (int phase = 0; phase < N - 1; phase++) {
        int ids[N], ni = 0, w[N], inA[N] = {0}, order[N], no = 0;
        for (int i = 0; i < N; i++) if (alive[i]) ids[ni++] = i;
        for (int v = 0; v < N; v++) w[v] = W[ids[0]][v];
        order[no++] = ids[0]; inA[ids[0]] = 1;
        while (no < ni) {
            int nxt = -1;
            for (int k = 0; k < ni; k++) { int v = ids[k]; if (!inA[v] && (nxt < 0 || w[v] > w[nxt])) nxt = v; }
            inA[nxt] = 1; order[no++] = nxt;
            for (int k = 0; k < ni; k++) if (!inA[ids[k]]) w[ids[k]] += W[nxt][ids[k]];
        }
        int s = order[no - 2], t = order[no - 1], cut = 0;
        for (int k = 0; k < ni; k++) if (ids[k] != t) cut += W[t][ids[k]];
        printf(" %d", cut);
        if (cut < best) { best = cut; nb = nm[t]; for (int i = 0; i < nm[t]; i++) bestSet[i] = mem[t][i]; }
        for (int v = 0; v < N; v++) { W[s][v] += W[t][v]; W[v][s] = W[s][v]; }
        for (int i = 0; i < nm[t]; i++) mem[s][nm[s]++] = mem[t][i];
        alive[t] = 0;
    }
    for (int i = 1; i < nb; i++) for (int j = i; j > 0 && bestSet[j - 1] > bestSet[j]; j--) { int x = bestSet[j]; bestSet[j] = bestSet[j - 1]; bestSet[j - 1] = x; }
    printf("\nmin cut: %d side: [", best);
    for (int i = 0; i < nb; i++) printf(i ? ", %d" : "%d", bestSet[i]);
    printf("]\n");
    return 0;
}
