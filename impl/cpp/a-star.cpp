#include <cstdlib>
#include <functional>
#include <iostream>
#include <queue>
#include <string>
#include <tuple>
#include <vector>
using namespace std;

vector<string> grid = {"S.....#.........", ".####.#.#######.", ".#....#.......#.", ".#.#######.##.#.", ".#..........#...",
                       ".#######.#.###.#", ".........#...#..", "########.####.#.", "..............#E"};
int R = (int)grid.size(), C = (int)grid[0].size(), er, ec;
int DR[] = {0, 1, 0, -1}, DC[] = {1, 0, -1, 0};

int h(int r, int c) { return abs(r - er) + abs(c - ec); }  // 曼哈頓距離：不會高估，因此 A* 保證最短

// 依 f = g + h 由小到大展開（同分時比 h，再比座標）
int main() {
    int sr = 0, sc = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (grid[r][c] == 'S') { sr = r; sc = c; }
            if (grid[r][c] == 'E') { er = r; ec = c; }
        }
    vector<vector<int>> g(R, vector<int>(C, 1 << 30)), par(R, vector<int>(C, -1));
    vector<vector<bool>> closed(R, vector<bool>(C));
    typedef tuple<int, int, int, int> T;  // (f, h, r, c)
    priority_queue<T, vector<T>, greater<T>> open;
    g[sr][sc] = 0;
    open.emplace(h(sr, sc), h(sr, sc), sr, sc);
    int expanded = 0;
    while (!open.empty()) {
        int f, hh, r, c;
        tie(f, hh, r, c) = open.top();
        open.pop();
        if (closed[r][c]) continue;
        closed[r][c] = true;
        expanded++;
        if (r == er && c == ec) break;
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d], nc = c + DC[d];
            if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] == '#') continue;
            if (g[r][c] + 1 < g[nr][nc]) {
                g[nr][nc] = g[r][c] + 1;
                par[nr][nc] = r * C + c;
                open.emplace(g[nr][nc] + h(nr, nc), h(nr, nc), nr, nc);
            }
        }
    }
    cout << "path length = " << g[er][ec] << " expanded = " << expanded << "\n";
    for (int p = par[er][ec]; p != sr * C + sc; p = par[p / C][p % C]) grid[p / C][p % C] = '*';
    for (auto& row : grid) cout << row << "\n";
}
