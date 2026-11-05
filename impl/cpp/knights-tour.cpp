#include <algorithm>
#include <cstdio>
#include <utility>
#include <vector>
using namespace std;

const int N = 6;
int board[N][N], backtracks = 0;
int DR[] = {2, 1, -1, -2, -2, -1, 1, 2}, DC[] = {1, 2, 2, 1, -1, -2, -2, -1};

bool freeCell(int r, int c) { return r >= 0 && r < N && c >= 0 && c < N && board[r][c] == 0; }

// 從 (r, c) 還能跳到幾個沒走過的格子
int onward(int r, int c) {
    int k = 0;
    for (int d = 0; d < 8; d++) k += freeCell(r + DR[d], c + DC[d]);
    return k;
}

// Warnsdorff 規則：優先跳到「之後出路最少」的格子；仍走不通時回溯
bool tour(int r, int c, int step) {
    board[r][c] = step;
    if (step == N * N) return true;
    vector<pair<int, int>> cand;
    for (int d = 0; d < 8; d++)
        if (freeCell(r + DR[d], c + DC[d])) cand.push_back({r + DR[d], c + DC[d]});
    stable_sort(cand.begin(), cand.end(), [](const pair<int, int>& a, const pair<int, int>& b) {
        return onward(a.first, a.second) < onward(b.first, b.second);
    });
    for (auto& p : cand)
        if (tour(p.first, p.second, step + 1)) return true;
    board[r][c] = 0;
    backtracks++;
    return false;
}

int main() {
    bool found = tour(0, 0, 1);
    printf("found: %s backtracks = %d\n", found ? "True" : "False", backtracks);
    for (int r = 0; r < N; r++) {
        for (int c = 0; c < N; c++) printf("%3d", board[r][c]);
        printf("\n");
    }
}
