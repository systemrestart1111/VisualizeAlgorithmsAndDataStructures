#include <cstdio>
#include <queue>
#include <string>
#include <utility>
#include <vector>
using namespace std;

int main() {
    vector<string> G = {"S....#....", ".##..#.##.", "....#....S", ".#.....#..", ".#.##.....", "...#...S.."};
    int R = G.size(), C = G[0].size(), best = 0;
    vector<vector<int>> dist(R, vector<int>(C, -1));
    queue<pair<int, int>> q;
    // 所有起點同時入佇列、距離 0，第一次碰到某格時就是到最近起點的距離
    for (int i = 0; i < R; i++) for (int j = 0; j < C; j++) if (G[i][j] == 'S') { dist[i][j] = 0; q.push({i, j}); }
    int D[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    while (!q.empty()) {
        int i = q.front().first, j = q.front().second;
        q.pop();
        for (auto &d : D) {
            int a = i + d[0], b = j + d[1];
            if (a < 0 || b < 0 || a >= R || b >= C || G[a][b] == '#' || dist[a][b] >= 0) continue;
            dist[a][b] = dist[i][j] + 1;
            q.push({a, b});
        }
    }
    for (int i = 0; i < R; i++) {
        for (int j = 0; j < C; j++) {
            if (j) printf(" ");
            if (G[i][j] == '#') printf(" #"); else if (dist[i][j] < 0) printf(" ."); else printf("%2d", dist[i][j]);
            best = max(best, dist[i][j]);
        }
        printf("\n");
    }
    printf("farthest cell distance: %d\n", best);
}
