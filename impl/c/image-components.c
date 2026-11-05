#include <stdio.h>
#include <stdlib.h>

#define N 16
typedef int Img[N][N];
static int parent[N * N + 1], np;
static int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }

static void blobs(Img a) {
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++)
            a[r][c] = (r - 5.5) * (r - 5.5) + (c - 5) * (c - 5) <= 16 || (r - 9) * (r - 9) + (c - 10.5) * (c - 10.5) <= 16 || (r - 13) * (r - 13) + (c - 2.5) * (c - 2.5) <= 3.5;
}
static void make(int t, Img a) {
    long long s = 5;
    if (t == 2) { for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) a[r][c] = ((r + c) % 4 == 0 && r % 2 == 0) || (r >= 10 && c >= 10 && (r + c) % 2 == 0); return; }
    blobs(a);
    if (t == 0) for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { s = s * 48271 % 2147483647; if (s % 100 < 6) a[r][c] = 1 - a[r][c]; }
}
static int cmpdesc(const void *a, const void *b) { return *(const int *)b - *(const int *)a; }

int main(void) {
    const char *names[3] = {"noisy blobs", "blobs", "diagonal dots"};
    int P8[4][2] = {{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}}, P4[2][2] = {{-1, 0}, {0, -1}};
    int D8[8][2] = {{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}}, D4[4][2] = {{-1, 0}, {0, -1}, {0, 1}, {1, 0}};
    Img A;
    for (int t = 0; t < 3; t++) {
        make(t, A);
        for (int conn = 4; conn <= 8; conn += 4) {
            /* 第一趟看已掃過的鄰居，給新標籤或用並查集合併；第二趟換成代表並重新編號 */
            int lab[N][N] = {{0}}, np2 = conn == 8 ? 4 : 2;
            np = 0;
            parent[0] = 0;
            for (int r = 0; r < N; r++)
                for (int c = 0; c < N; c++) {
                    if (!A[r][c]) continue;
                    int nbr[4], nn = 0;
                    for (int k = 0; k < np2; k++) {
                        int y = r + (conn == 8 ? P8[k][0] : P4[k][0]), x = c + (conn == 8 ? P8[k][1] : P4[k][1]);
                        if (y >= 0 && y < N && x >= 0 && x < N && lab[y][x]) nbr[nn++] = lab[y][x];
                    }
                    if (!nn) { np++; parent[np] = np; lab[r][c] = np; continue; }
                    int m = nbr[0];
                    for (int k = 1; k < nn; k++) if (nbr[k] < m) m = nbr[k];
                    lab[r][c] = m;
                    for (int k = 0; k < nn; k++) { int a = find(nbr[k]), b = find(m); if (a != b) { if (a > b) parent[a] = b; else parent[b] = a; } }
                }
            int remap[N * N + 1] = {0}, n = 0;
            for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) if (lab[r][c]) { int root = find(lab[r][c]); if (!remap[root]) remap[root] = ++n; lab[r][c] = remap[root]; }
            int lb[N][N] = {{0}}, nb = 0, q[N * N][2];
            for (int r = 0; r < N; r++)
                for (int c = 0; c < N; c++) {
                    if (!A[r][c] || lb[r][c]) continue;
                    nb++;
                    int h = 0, tl = 0;
                    q[tl][0] = r; q[tl][1] = c; tl++;
                    lb[r][c] = nb;
                    while (h < tl) {
                        int y = q[h][0], x = q[h][1];
                        h++;
                        for (int k = 0; k < conn; k++) {
                            int yy = y + (conn == 8 ? D8[k][0] : D4[k][0]), xx = x + (conn == 8 ? D8[k][1] : D4[k][1]);
                            if (yy >= 0 && yy < N && xx >= 0 && xx < N && A[yy][xx] && !lb[yy][xx]) { lb[yy][xx] = nb; q[tl][0] = yy; q[tl][1] = xx; tl++; }
                        }
                    }
                }
            int map[N * N + 1] = {0}, same = n == nb;
            for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) if (A[r][c]) { if (!map[lab[r][c]]) map[lab[r][c]] = lb[r][c]; else if (map[lab[r][c]] != lb[r][c]) same = 0; }
            int sizes[N * N] = {0};
            for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) if (lab[r][c]) sizes[lab[r][c] - 1]++;
            qsort(sizes, n, sizeof(int), cmpdesc);
            printf("%s, %d-connected: %d components (%d provisional labels), sizes [", names[t], conn, n, np);
            for (int k = 0; k < n; k++) printf(k ? ", %d" : "%d", sizes[k]);
            printf("], matches BFS %s\n", same ? "True" : "False");
        }
    }
    return 0;
}
