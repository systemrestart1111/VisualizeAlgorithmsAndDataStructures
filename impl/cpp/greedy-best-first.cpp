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

int h(int r, int c) { return abs(r - er) + abs(c - ec); }

// 只看 h（離終點多近）來決定下一步：通常很快，但不保證最短路徑
int main() {
    int sr = 0, sc = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (grid[r][c] == 'S') { sr = r; sc = c; }
            if (grid[r][c] == 'E') { er = r; ec = c; }
        }
    vector<vector<int>> par(R, vector<int>(C, -1));
    vector<vector<bool>> seen(R, vector<bool>(C));
    typedef tuple<int, int, int> T;  // (h, r, c)
    priority_queue<T, vector<T>, greater<T>> open;
    seen[sr][sc] = true;
    open.emplace(h(sr, sc), sr, sc);
    int expanded = 0;
    while (!open.empty()) {
        int hh, r, c;
        tie(hh, r, c) = open.top();
        open.pop();
        expanded++;
        if (r == er && c == ec) break;
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d], nc = c + DC[d];
            if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] == '#' || seen[nr][nc]) continue;
            seen[nr][nc] = true;
            par[nr][nc] = r * C + c;
            open.emplace(h(nr, nc), nr, nc);
        }
    }
    int length = 1;
    for (int p = par[er][ec]; p != sr * C + sc; p = par[p / C][p % C], length++) grid[p / C][p % C] = '*';
    cout << "path length = " << length << " expanded = " << expanded << "\n";
    for (auto& row : grid) cout << row << "\n";
}
