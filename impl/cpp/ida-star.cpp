#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

const int FOUND = -1, INF = 1000000;
vector<string> grid = {"S..#....", ".#.#.##.", ".#...#..", ".####.#.", "......#E"};
int R = 5, C = 8, er = 4, ec = 7;
int DR[] = {0, 1, 0, -1}, DC[] = {1, 0, -1, 0};
vector<int> path;
vector<vector<bool>> inPath(5, vector<bool>(8));

int h(int r, int c) { return abs(r - er) + abs(c - ec); }

// 深度優先，但 f = g + h 超過門檻就剪掉；回傳被剪掉的最小 f 作為下一輪門檻
int search(int g, int bound) {
    int u = path.back(), r = u / C, c = u % C;
    int f = g + h(r, c);
    if (f > bound) return f;
    if (r == er && c == ec) return FOUND;
    int mn = INF;
    for (int d = 0; d < 4; d++) {
        int nr = r + DR[d], nc = c + DC[d];
        if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] == '#' || inPath[nr][nc]) continue;
        path.push_back(nr * C + nc);
        inPath[nr][nc] = true;
        int t = search(g + 1, bound);
        if (t == FOUND) return FOUND;
        mn = min(mn, t);
        path.pop_back();
        inPath[nr][nc] = false;
    }
    return mn;
}

// 疊代加深：門檻從 h(S) 開始，每輪提高到上一輪被剪掉的最小 f，記憶體只需 O(路徑長)
int main() {
    int bound = h(0, 0);
    path.push_back(0);
    inPath[0][0] = true;
    cout << "bounds:";
    for (;;) {
        cout << " " << bound;
        int t = search(0, bound);
        if (t == FOUND || t == INF) break;
        bound = t;
    }
    cout << "\npath length = " << path.size() - 1 << "\n";
    for (size_t i = 1; i + 1 < path.size(); i++) grid[path[i] / C][path[i] % C] = '*';
    for (auto& row : grid) cout << row << "\n";
}
