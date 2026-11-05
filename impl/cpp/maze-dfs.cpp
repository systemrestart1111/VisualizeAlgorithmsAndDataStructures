#include <iostream>
#include <string>
#include <vector>
using namespace std;

vector<string> grid = {"S.#.......#.....", ".##.#####.#.###.", "....#...#...#...", ".####.#.#####.#.", "......#.......#.",
                       "#######.#####.#.", "......#.#.....#.", ".####.#.#.#####.", ".#....#...#....E"};
int R = (int)grid.size(), C = (int)grid[0].size();
vector<vector<bool>> seen(R, vector<bool>(C));
int DR[] = {0, 1, 0, -1}, DC[] = {1, 0, -1, 0};  // 右、下、左、上

// 往四個方向深入；走到死路就退回上一格換方向（回溯），到達 E 時整條路徑都還在遞迴堆疊上
bool dfs(int r, int c) {
    if (grid[r][c] == 'E') return true;
    seen[r][c] = true;
    for (int d = 0; d < 4; d++) {
        int nr = r + DR[d], nc = c + DC[d];
        if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] == '#' || seen[nr][nc]) continue;
        if (grid[nr][nc] == '.') grid[nr][nc] = '*';
        if (dfs(nr, nc)) return true;
        if (grid[nr][nc] == '*') grid[nr][nc] = '.';
    }
    return false;
}

int main() {
    bool found = dfs(0, 0);
    int len = 1;
    for (auto& row : grid)
        for (char ch : row) len += ch == '*';
    cout << "found: " << (found ? "True" : "False") << " path length = " << len << "\n";
    for (auto& row : grid) cout << row << "\n";
}
