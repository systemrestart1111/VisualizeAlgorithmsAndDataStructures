#include <functional>
#include <iostream>
#include <map>
#include <vector>
using namespace std;

// 逐欄處理；遮罩記錄目前這一欄已被前一欄橫放骨牌佔走的列
long long tilings(int R, int C) {
    map<int, long long> dp{{0, 1}};
    for (int c = 0; c < C; c++) {
        map<int, long long> nd;
        function<void(int, int, int, long long)> fill = [&](int row, int cur, int nxt, long long ways) {
            if (row == R) { nd[nxt] += ways; return; }
            if (cur >> row & 1) { fill(row + 1, cur, nxt, ways); return; }
            fill(row + 1, cur, nxt | (1 << row), ways);                               // 橫放
            if (row + 1 < R && !(cur >> (row + 1) & 1)) fill(row + 2, cur, nxt, ways);  // 直放
        };
        for (auto &kv : dp) fill(0, kv.first, 0, kv.second);
        dp = nd;
    }
    return dp.count(0) ? dp[0] : 0;
}
long long brute(int R, int C) {
    vector<vector<bool>> g(R, vector<bool>(C));
    function<long long(int)> go = [&](int pos) -> long long {
        if (pos == R * C) return 1;
        int i = pos / C, j = pos % C;
        if (g[i][j]) return go(pos + 1);
        long long t = 0;
        if (j + 1 < C && !g[i][j + 1]) { g[i][j] = g[i][j + 1] = true; t += go(pos + 1); g[i][j] = g[i][j + 1] = false; }
        if (i + 1 < R) { g[i][j] = g[i + 1][j] = true; t += go(pos + 1); g[i][j] = g[i + 1][j] = false; }
        return t;
    };
    return go(0);
}

int main() {
    int tests[6][2] = {{3, 4}, {2, 8}, {4, 4}, {3, 3}, {4, 6}, {6, 6}};
    for (auto &t : tests) {
        cout << t[0] << "x" << t[1] << ": " << tilings(t[0], t[1]) << " tilings";
        if (t[0] * t[1] <= 24) cout << " (brute " << brute(t[0], t[1]) << ")";
        cout << "\n";
    }
}
