#include <stdio.h>
#include <string.h>

#define M 9
#define N 6
static const char *NAMES = "CDEFGH";
static int EU[M], EV[M], EW[M] = {3, 2, 4, 1, 2, 3, 2, 1, 2};
typedef struct { int nodes[N], nn, edges[N], ne, cost; } Path;

/* 同距離時取名稱較小的點；只有嚴格更短才更新前驅。adjacency 依終點名稱排序 */
static int dijkstra(int s, int t, const int *banE, const int *banN, Path *out) {
    int dist[N], has[N] = {0}, done[N] = {0}, prev[N];
    dist[s] = 0; has[s] = 1;
    for (;;) {
        int u = -1;
        for (int v = 0; v < N; v++) if (!done[v] && has[v] && !banN[v] && (u < 0 || dist[v] < dist[u])) u = v;
        if (u < 0) return 0;
        if (u == t) break;
        done[u] = 1;
        for (int v = 0; v < N; v++)
            for (int i = 0; i < M; i++)
                if (EU[i] == u && EV[i] == v && !banE[i] && !banN[v] && (!has[v] || dist[u] + EW[i] < dist[v])) { dist[v] = dist[u] + EW[i]; has[v] = 1; prev[v] = i; }
    }
    int rev[N], k = 0;
    for (int x = t; x != s; x = EU[prev[x]]) rev[k++] = prev[x];
    out->ne = k; out->nn = k + 1; out->nodes[0] = s; out->cost = dist[t];
    for (int i = 0; i < k; i++) { out->edges[i] = rev[k - 1 - i]; out->nodes[i + 1] = EV[out->edges[i]]; }
    return 1;
}
static int same_nodes(const Path *a, const Path *b) { return a->nn == b->nn && !memcmp(a->nodes, b->nodes, a->nn * sizeof(int)); }
static int path_less(const Path *a, const Path *b) {
    if (a->cost != b->cost) return a->cost < b->cost;
    if (a->nn != b->nn) return a->nn < b->nn;
    for (int i = 0; i < a->nn; i++) if (a->nodes[i] != b->nodes[i]) return a->nodes[i] < b->nodes[i];
    return 0;
}

int main(void) {
    const char *E[M] = {"CD", "CE", "DF", "ED", "EF", "EG", "FG", "FH", "GH"};
    for (int i = 0; i < M; i++) { EU[i] = strchr(NAMES, E[i][0]) - NAMES; EV[i] = strchr(NAMES, E[i][1]) - NAMES; }
    int s = 0, t = 5, K = 4, nA = 0, nB = 0;
    Path A[8], B[64];
    int none[M] = {0}, noneN[N] = {0};
    if (!dijkstra(s, t, none, noneN, &A[0])) return 0;
    nA = 1;
    for (int k = 1; k < K; k++) {
        Path *last = &A[nA - 1];
        for (int i = 0; i < last->nn - 1; i++) {
            int banE[M] = {0}, banN[N] = {0}, rootCost = 0;
            for (int p = 0; p < nA; p++) if (A[p].nn > i && !memcmp(A[p].nodes, last->nodes, (i + 1) * sizeof(int))) banE[A[p].edges[i]] = 1;
            for (int j = 0; j < i; j++) { banN[last->nodes[j]] = 1; rootCost += EW[last->edges[j]]; }
            Path spur, cand;
            if (!dijkstra(last->nodes[i], t, banE, banN, &spur)) continue;
            cand.nn = i + spur.nn; cand.ne = i + spur.ne; cand.cost = rootCost + spur.cost;
            for (int j = 0; j <= i; j++) cand.nodes[j] = last->nodes[j];
            for (int j = 1; j < spur.nn; j++) cand.nodes[i + j] = spur.nodes[j];
            for (int j = 0; j < i; j++) cand.edges[j] = last->edges[j];
            for (int j = 0; j < spur.ne; j++) cand.edges[i + j] = spur.edges[j];
            int dup = 0;
            for (int p = 0; p < nA; p++) dup |= same_nodes(&A[p], &cand);
            for (int p = 0; p < nB; p++) dup |= same_nodes(&B[p], &cand);
            if (!dup) B[nB++] = cand;
        }
        if (!nB) break;
        int bi = 0;
        for (int p = 1; p < nB; p++) if (path_less(&B[p], &B[bi])) bi = p;
        A[nA++] = B[bi];
        for (int p = bi; p < nB - 1; p++) B[p] = B[p + 1];
        nB--;
    }
    for (int k = 0; k < nA; k++) {
        printf("%d:", k + 1);
        for (int i = 0; i < A[k].nn; i++) printf(i ? " -> %c" : " %c", NAMES[A[k].nodes[i]]);
        printf(" cost %d\n", A[k].cost);
    }
    return 0;
}
