#include <algorithm>
#include <cstdio>
#include <cstdlib>
#include <queue>
#include <string>
#include <vector>
using namespace std;
const int N = 16;
typedef vector<vector<int>> Img;
typedef vector<pair<int, int>> Nb;

Img make(int t) {
    Img a(N, vector<int>(N));
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++)
            a[r][c] = t == 0 ? ((r - 5.5) * (r - 5.5) + (c - 5) * (c - 5) <= 16 || (r - 9) * (r - 9) + (c - 10.5) * (c - 10.5) <= 16 || (r - 13) * (r - 13) + (c - 2.5) * (c - 2.5) <= 3.5)
                             : ((r >= 2 && r <= 6 && c >= 2 && c <= 7) || (r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96);
    return a;
}
// 所有背景像素同時入列的多源 BFS：4 鄰接得 L1、8 鄰接得 L∞（都不是歐氏距離）
Img distance(const Img &B, const Nb &nb) {
    const int INF = 1000000;
    Img d(N, vector<int>(N));
    queue<pair<int, int>> q;
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { d[r][c] = B[r][c] ? INF : 0; if (!B[r][c]) q.push({r, c}); }
    while (!q.empty()) {
        auto p = q.front();
        q.pop();
        for (auto &k : nb) {
            int y = p.first + k.first, x = p.second + k.second;
            if (y >= 0 && y < N && x >= 0 && x < N && d[y][x] == INF) { d[y][x] = d[p.first][p.second] + 1; q.push({y, x}); }
        }
    }
    return d;
}

int main() {
    Nb D4 = {{-1, 0}, {0, -1}, {0, 1}, {1, 0}}, D8 = {{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}};
    const char *names[2] = {"blobs", "shapes"};
    for (int t = 0; t < 2; t++) {
        Img B = make(t);
        for (int m = 0; m < 2; m++) {
            Img d = distance(B, m == 0 ? D4 : D8);
            int mx = 0;
            for (auto &row : d) for (int v : row) mx = max(mx, v);
            vector<int> hist(mx + 1, 0);
            bool ok = true;
            for (int r = 0; r < N; r++)
                for (int c = 0; c < N; c++) {
                    if (d[r][c]) hist[d[r][c]]++;
                    if (!B[r][c]) continue;
                    int best = 1 << 30;
                    for (int y = 0; y < N; y++) for (int x = 0; x < N; x++) if (!B[y][x]) { int dy = abs(y - r), dx = abs(x - c); best = min(best, m == 0 ? dy + dx : max(dy, dx)); }
                    if (best != d[r][c]) ok = false;
                }
            printf("%s, %s: max distance %d, pixels per distance [", names[t], m == 0 ? "L1" : "Linf", mx);
            for (int k = 1; k <= mx; k++) printf(k > 1 ? ", %d" : "%d", hist[k]);
            printf("], matches brute force %s\n", ok ? "True" : "False");
        }
    }
}
