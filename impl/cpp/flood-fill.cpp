#include <cstdio>
#include <queue>
#include <vector>
using namespace std;
typedef vector<vector<int>> Grid;

// 外框（色 2）左上角缺一格，內部只能斜著碰到外面
Grid grid() {
    Grid a(12, vector<int>(12, 1));
    for (int i = 2; i <= 9; i++) for (int j = 2; j <= 9; j++) if (i == 2 || i == 9 || j == 2 || j == 9) a[i][j] = 2;
    a[2][2] = 1;
    for (int i = 5; i <= 6; i++) for (int j = 5; j <= 6; j++) a[i][j] = 3;
    return a;
}
// BFS 把與種子相連、顏色相同的格子塗成新顏色；新舊色相同時直接結束
int flood(Grid &a, int sr, int sc, int nw, int conn) {
    vector<pair<int, int>> nb = conn == 4 ? vector<pair<int, int>>{{-1, 0}, {0, -1}, {0, 1}, {1, 0}} : vector<pair<int, int>>{{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}};
    int old = a[sr][sc];
    if (old == nw) return 0;
    a[sr][sc] = nw;
    queue<pair<int, int>> q;
    q.push({sr, sc});
    int count = 1;
    while (!q.empty()) {
        auto p = q.front();
        q.pop();
        for (auto &d : nb) {
            int y = p.first + d.first, x = p.second + d.second;
            if (y >= 0 && y < 12 && x >= 0 && x < 12 && a[y][x] == old) { a[y][x] = nw; count++; q.push({y, x}); }
        }
    }
    return count;
}

int main() {
    int tests[6][4] = {{4, 4, 4, 4}, {4, 4, 4, 8}, {0, 0, 5, 4}, {5, 5, 3, 4}, {5, 5, 1, 8}, {2, 5, 4, 4}};
    for (auto &t : tests) {
        Grid a = grid();
        int n = flood(a, t[0], t[1], t[2], t[3]), sum = 0;
        for (auto &row : a) for (int v : row) sum += v;
        printf("seed (%d,%d) -> color %d, %d-connected: %d cells filled%s, grid sum %d\n", t[0], t[1], t[2], t[3], n, n == 0 ? " (same color, nothing to do)" : "", sum);
    }
}
