#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define NP 11
static double P[NP][2] = {{1.8, 2.5}, {3.1, 3.4}, {2.2, 4.0}, {3.0, 2.1}, {6.4, 7.0}, {7.6, 8.1}, {7.2, 6.6}, {6.6, 8.4}, {8.1, 2.9}, {7.0, 2.0}, {7.9, 1.6}};
typedef struct { double d; int a, b; } Item;
static Item heap[512];
static int hn;
static int mem[2 * NP][NP], msz[2 * NP], alive[2 * NP];
static char linkage;

static int less(Item x, Item y) { return x.d < y.d || (x.d == y.d && (x.a < y.a || (x.a == y.a && x.b < y.b))); }
static void push(Item it) { int i = hn++; while (i > 0 && less(it, heap[(i - 1) / 2])) { heap[i] = heap[(i - 1) / 2]; i = (i - 1) / 2; } heap[i] = it; }
static Item pop(void) {
    Item top = heap[0], last = heap[--hn];
    int i = 0;
    for (;;) {
        int l = 2 * i + 1, r = l + 1, m = i;
        Item best = last;
        if (l < hn && less(heap[l], best)) { best = heap[l]; m = l; }
        if (r < hn && less(heap[r], best)) { best = heap[r]; m = r; }
        if (m == i) break;
        heap[i] = heap[m];
        i = m;
    }
    if (hn) heap[i] = last;
    return top;
}
static double d(int i, int j) { double dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1]; return sqrt(dx * dx + dy * dy); }
static double link(int A, int B) {
    double mn = 1e18, mx = -1, sum = 0;
    for (int i = 0; i < msz[A]; i++) for (int j = 0; j < msz[B]; j++) { double v = d(mem[A][i], mem[B][j]); if (v < mn) mn = v; if (v > mx) mx = v; sum += v; }
    return linkage == 's' ? mn : linkage == 'c' ? mx : sum / (msz[A] * msz[B]);
}
static int cmpi(const void *a, const void *b) { return *(const int *)a - *(const int *)b; }
static void print_set(int *m, int n) { int s[NP]; memcpy(s, m, n * sizeof(int)); qsort(s, n, sizeof(int), cmpi); printf("{"); for (int i = 0; i < n; i++) printf(i ? ",%d" : "%d", s[i]); printf("}"); }

/* 最小堆存所有群對距離；取出時若有一群已被合併就略過（延遲刪除） */
static void run(const char *name) {
    linkage = name[0];
    int nxt = NP, hist[NP][2], nh = 0;
    hn = 0;
    for (int i = 0; i < 2 * NP; i++) alive[i] = 0;
    for (int i = 0; i < NP; i++) { mem[i][0] = i; msz[i] = 1; alive[i] = 1; }
    for (int i = 0; i < NP; i++) for (int j = i + 1; j < NP; j++) push((Item){link(i, j), i, j});
    printf("%s:", name);
    int left = NP;
    while (left > 1) {
        Item it = pop();
        if (!alive[it.a] || !alive[it.b]) continue;
        printf(" ");
        print_set(mem[it.a], msz[it.a]);
        printf("+");
        print_set(mem[it.b], msz[it.b]);
        printf("@%.3f", it.d);
        alive[it.a] = alive[it.b] = 0;
        msz[nxt] = 0;
        for (int i = 0; i < msz[it.a]; i++) mem[nxt][msz[nxt]++] = mem[it.a][i];
        for (int i = 0; i < msz[it.b]; i++) mem[nxt][msz[nxt]++] = mem[it.b][i];
        alive[nxt] = 1;
        hist[nh][0] = it.a; hist[nh][1] = it.b; nh++;
        for (int c = 0; c < nxt; c++) if (alive[c]) push((Item){link(c, nxt), c < nxt ? c : nxt, c < nxt ? nxt : c});
        nxt++;
        left--;
    }
    /* 依合併順序重播前 n − k 次，得到 3 群 */
    int g[2 * NP][NP], gs[2 * NP], ga[2 * NP] = {0};
    for (int i = 0; i < NP; i++) { g[i][0] = i; gs[i] = 1; ga[i] = 1; }
    for (int s = 0; s < NP - 3; s++) {
        int a = hist[s][0], b = hist[s][1], id = NP + s;
        gs[id] = 0;
        for (int i = 0; i < gs[a]; i++) g[id][gs[id]++] = g[a][i];
        for (int i = 0; i < gs[b]; i++) g[id][gs[id]++] = g[b][i];
        ga[a] = ga[b] = 0; ga[id] = 1;
    }
    int order[3], no = 0, firsts[3];
    for (int i = 0; i < 2 * NP; i++) if (ga[i]) { qsort(g[i], gs[i], sizeof(int), cmpi); order[no] = i; firsts[no] = g[i][0]; no++; }
    for (int i = 1; i < no; i++) for (int j = i; j > 0 && firsts[j - 1] > firsts[j]; j--) { int t = firsts[j]; firsts[j] = firsts[j - 1]; firsts[j - 1] = t; t = order[j]; order[j] = order[j - 1]; order[j - 1] = t; }
    printf("\n  3 clusters:");
    for (int i = 0; i < no; i++) { printf(" "); print_set(g[order[i]], gs[order[i]]); }
    printf("\n");
}

int main(void) {
    run("single");
    run("complete");
    run("average");
    return 0;
}
