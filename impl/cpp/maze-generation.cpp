#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;

const int ROWS = 8, COLS = 12;
long long state = 42;

// Park–Miller 亂數產生器：五種語言用同一個公式，因此會產生同一個迷宮
int randK(int k) {
    state = state * 48271 % 2147483647;
    return (int)(state % k);
}

int main() {
    // 迷宮格子 (r, c) 位於字元圖的 (2r+1, 2c+1)；一開始全是牆
    vector<string> grid(2 * ROWS + 1, string(2 * COLS + 1, '#'));
    vector<vector<bool>> visited(ROWS, vector<bool>(COLS));
    int DR[] = {-1, 0, 1, 0}, DC[] = {0, 1, 0, -1};  // 上、右、下、左
    // 遞迴回溯法（用堆疊實作）：從目前格子隨機走向一個沒去過的鄰格並打通中間的牆；四周都去過就退回上一格
    vector<pair<int, int>> st = {{0, 0}};
    visited[0][0] = true;
    grid[1][1] = ' ';
    while (!st.empty()) {
        int r = st.back().first, c = st.back().second;
        vector<pair<int, int>> nbrs;
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d], nc = c + DC[d];
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc]) nbrs.push_back({nr, nc});
        }
        if (nbrs.empty()) { st.pop_back(); continue; }
        auto nxt = nbrs[randK((int)nbrs.size())];
        grid[r + nxt.first + 1][c + nxt.second + 1] = ' ';  // 兩格中間的牆
        grid[2 * nxt.first + 1][2 * nxt.second + 1] = ' ';
        visited[nxt.first][nxt.second] = true;
        st.push_back(nxt);
    }
    for (auto& row : grid) cout << row << "\n";
}
