#include <iostream>
#include <vector>
using namespace std;

const int N = 6;
vector<bool> cols(N), d1(2 * N), d2(2 * N);
vector<int> pos;
vector<vector<int>> sols;

// 逐列放皇后；用三個陣列記錄被佔用的欄與兩條對角線，衝突就換下一欄（回溯）
void bt(int r) {
    if (r == N) { sols.push_back(pos); return; }
    for (int c = 0; c < N; c++) {
        if (cols[c] || d1[r - c + N] || d2[r + c]) continue;
        cols[c] = d1[r - c + N] = d2[r + c] = true;
        pos.push_back(c);
        bt(r + 1);
        pos.pop_back();
        cols[c] = d1[r - c + N] = d2[r + c] = false;
    }
}

int main() {
    bt(0);
    cout << "solutions = " << sols.size() << "\n";
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) cout << (c == sols[0][r] ? 'Q' : '.') << (c + 1 < N ? ' ' : '\n');
}
