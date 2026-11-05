#include <math.h>
#include <stdio.h>
#include <stdlib.h>

#define N 16
static double H[N][N];
static int lab[N][N];
typedef struct { double h; int seq, r, c; } Item;
static Item heap[4096];
static int hn;
static int less(Item a, Item b) { return a.h < b.h || (a.h == b.h && a.seq < b.seq); }
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
static void terrain(int t) {
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            if (t == 1) { int a = (r - 4) * (r - 4) + (c - 4) * (c - 4), b = (r - 11) * (r - 11) + (c - 11) * (c - 11); H[r][c] = (a < b ? a : b) / 4; continue; }
            int inside = (r - 5.5) * (r - 5.5) + (c - 5) * (c - 5) <= 16 || (r - 9) * (r - 9) + (c - 10.5) * (c - 10.5) <= 16 || (r - 13) * (r - 13) + (c - 2.5) * (c - 2.5) <= 3.5;
            H[r][c] = inside ? 0 : 1;
        }
    if (t == 1) return;
    double D[N][N];
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            if (H[r][c] == 1) { D[r][c] = 1; continue; }
            double best = 1e9;
            for (int y = 0; y < N; y++) for (int x = 0; x < N; x++) if (H[y][x] == 1) { double d = hypot(y - r, x - c); if (d < best) best = d; }
            D[r][c] = -floor(best * 10 + 0.5) / 10;
        }
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) H[r][c] = D[r][c];
}
static int cmpdesc(const void *a, const void *b) { return *(const int *)b - *(const int *)a; }

/* 區域極小值各給一個編號；優先佇列每次取最低者（同高度先進先出），把未標記的鄰居標成同一編號 */
static int watershed(void) {
    int D4[4][2] = {{-1, 0}, {0, -1}, {0, 1}, {1, 0}}, seen[N][N] = {{0}}, n = 0, comp[N * N][2], seq = 0;
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) lab[r][c] = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++) {
            if (seen[i][j]) continue;
            int nc = 1, k = 0, is_min = 1;
            comp[0][0] = i; comp[0][1] = j;
            seen[i][j] = 1;
            while (k < nc) {
                int y = comp[k][0], x = comp[k][1];
                k++;
                for (int d = 0; d < 4; d++) {
                    int yy = y + D4[d][0], xx = x + D4[d][1];
                    if (yy < 0 || yy >= N || xx < 0 || xx >= N) continue;
                    if (H[yy][xx] < H[i][j]) is_min = 0;
                    else if (H[yy][xx] == H[i][j] && !seen[yy][xx]) { seen[yy][xx] = 1; comp[nc][0] = yy; comp[nc][1] = xx; nc++; }
                }
            }
            if (is_min) { n++; for (int t = 0; t < nc; t++) lab[comp[t][0]][comp[t][1]] = n; }
        }
    hn = 0;
    for (int i = 0; i < N; i++) for (int j = 0; j < N; j++) if (lab[i][j]) push((Item){H[i][j], seq++, i, j});
    while (hn) {
        Item it = pop();
        for (int d = 0; d < 4; d++) {
            int y = it.r + D4[d][0], x = it.c + D4[d][1];
            if (y >= 0 && y < N && x >= 0 && x < N && !lab[y][x]) { lab[y][x] = lab[it.r][it.c]; push((Item){H[y][x], seq++, y, x}); }
        }
    }
    return n;
}

int main(void) {
    const char *names[2] = {"blob distance", "two basins"};
    for (int t = 0; t < 2; t++) {
        terrain(t);
        int n = watershed(), sizes[N * N] = {0}, boundary = 0;
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                sizes[lab[r][c] - 1]++;
                if ((c + 1 < N && lab[r][c + 1] != lab[r][c]) || (r + 1 < N && lab[r + 1][c] != lab[r][c])) boundary++;
            }
        qsort(sizes, n, sizeof(int), cmpdesc);
        printf("%s: %d regions, sizes [", names[t], n);
        for (int k = 0; k < n; k++) printf(k ? ", %d" : "%d", sizes[k]);
        printf("], watershed boundary pixels %d\n", boundary);
    }
    return 0;
}
