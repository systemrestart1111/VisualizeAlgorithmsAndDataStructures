#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<string> grid = {"1312", "1#14", "4213", "21#1"};  // 只能往右或往下，# 為障礙
    int R = 4, C = 4;
    const long long INF = 1e9;
    vector<vector<long long>> count(R, vector<long long>(C, 0)), best(R, vector<long long>(C, INF));
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (grid[r][c] == '#') continue;
            int v = grid[r][c] - '0';
            if (r == 0 && c == 0) { count[r][c] = 1; best[r][c] = v; continue; }
            count[r][c] = (r ? count[r - 1][c] : 0) + (c ? count[r][c - 1] : 0);              // 路徑數：上方 + 左方
            best[r][c] = min(r ? best[r - 1][c] : INF, c ? best[r][c - 1] : INF) + v;        // 最小路徑和
        }
    cout << "paths = " << count[R - 1][C - 1] << "\nmin path sum = " << best[R - 1][C - 1] << "\n";
}
