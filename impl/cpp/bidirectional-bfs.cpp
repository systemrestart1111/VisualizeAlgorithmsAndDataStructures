#include <iostream>
#include <string>
#include <vector>
using namespace std;

vector<string> grid = {"S.....#.........", ".####.#.#######.", ".#....#.......#.", ".#.#######.##.#.", ".#..........#...",
                       ".#######.#.###.#", ".........#...#..", "########.####.#.", "..............#E"};
int R = (int)grid.size(), C = (int)grid[0].size();
int DR[] = {0, 1, 0, -1}, DC[] = {1, 0, -1, 0};
int bestLen = -1, bestCell = -1;

// 把一側展開一整層；若碰到另一側已拜訪的格子，記下最短的接合點
vector<int> expand(const vector<int>& frontier, vector<int>& dist, const vector<int>& other) {
    vector<int> nxt;
    for (int u : frontier) {
        int r = u / C, c = u % C;
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d], nc = c + DC[d], v = nr * C + nc;
            if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] == '#') continue;
            if (other[v] >= 0) {
                int cand = dist[u] + 1 + other[v];
                if (bestLen < 0 || cand < bestLen) { bestLen = cand; bestCell = v; }
            }
            if (dist[v] < 0) { dist[v] = dist[u] + 1; nxt.push_back(v); }
        }
    }
    return nxt;
}

// 從起點與終點同時做 BFS，每次展開較小的那一側；兩邊相遇時即得最短路徑
int main() {
    vector<int> ds(R * C, -1), de(R * C, -1), fs, fe;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (grid[r][c] == 'S') { fs.push_back(r * C + c); ds[r * C + c] = 0; }
            if (grid[r][c] == 'E') { fe.push_back(r * C + c); de[r * C + c] = 0; }
        }
    while (!fs.empty() && !fe.empty()) {
        if (fs.size() <= fe.size()) fs = expand(fs, ds, de);
        else fe = expand(fe, de, ds);
        if (bestLen >= 0) break;
    }
    int visited = 0;
    for (int i = 0; i < R * C; i++) visited += (ds[i] >= 0) + (de[i] >= 0);
    cout << "path length = " << bestLen << "\nmeet at (" << bestCell / C << ", " << bestCell % C << ")\nvisited cells = " << visited << "\n";
}
