#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;
const int N = 16;
int S[N][N];

// 不小於視窗內所有鄰居才保留；相等時只留光柵順序最早的
void nms(int rad, int thr) {
    vector<pair<int, int>> kept;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++) {
            if (S[i][j] < thr) continue;
            bool ok = true;
            for (int a = -rad; a <= rad; a++)
                for (int b = -rad; b <= rad; b++) {
                    int y = i + a, x = j + b;
                    if ((a || b) && y >= 0 && y < N && x >= 0 && x < N && (S[y][x] > S[i][j] || (S[y][x] == S[i][j] && (a < 0 || (a == 0 && b < 0))))) ok = false;
                }
            if (ok) kept.push_back({i, j});
        }
    printf("window %dx%d, threshold %d: %d kept:", 2 * rad + 1, 2 * rad + 1, thr, (int)kept.size());
    for (auto &p : kept) printf(" (%d,%d)=%d", p.first, p.second, S[p.first][p.second]);
    printf("\n");
}

int main() {
    int bumps[5][3] = {{3, 3, 100}, {3, 6, 100}, {10, 4, 80}, {8, 12, 120}, {13, 13, 60}};
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            double s = 0;
            for (auto &b : bumps) s += b[2] * exp(-((r - b[0]) * (r - b[0]) + (c - b[1]) * (c - b[1])) / 3.0);
            S[r][c] = (int)floor(s + 0.5);
        }
    S[12][7] = S[12][8] = S[13][7] = S[13][8] = 70;
    nms(1, 30);
    nms(2, 30);
    nms(1, 80);
}
