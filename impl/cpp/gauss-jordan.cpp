#include <cmath>
#include <cstdio>
#include <string>
#include <vector>
using namespace std;

double z(double v) { return fabs(v) < 5e-7 ? 0.0 : v; }

// 化成簡化列梯形 (RREF)，判斷唯一解／無解／無限多解
string gaussJordan(vector<vector<double>> M) {
    int R = M.size(), nv = M[0].size() - 1, row = 0;
    vector<int> piv;
    for (int col = 0; col < nv && row < R; col++) {
        int p = row;
        for (int i = row + 1; i < R; i++) if (fabs(M[i][col]) > fabs(M[p][col])) p = i;
        if (fabs(M[p][col]) < 1e-9) continue; // 沒有主元：自由變數
        swap(M[p], M[row]);
        double pv = M[row][col];
        for (auto &v : M[row]) v /= pv;
        for (int i = 0; i < R; i++)
            if (i != row && fabs(M[i][col]) > 1e-12) { double f = M[i][col]; for (int j = 0; j <= nv; j++) M[i][j] -= f * M[row][j]; }
        piv.push_back(col);
        row++;
    }
    for (int i = row; i < R; i++) if (fabs(M[i][nv]) > 1e-9) return "no solution (row 0 ... 0 | c with c != 0)";
    if ((int)piv.size() < nv) {
        string s = "infinitely many: rank " + to_string(piv.size()) + " < " + to_string(nv) + ", free";
        for (int j = 0; j < nv; j++) { bool isp = false; for (int c : piv) if (c == j) isp = true; if (!isp) s += " x" + to_string(j + 1); }
        return s;
    }
    string s = "unique:";
    char buf[64];
    for (int i = 0; i < nv; i++) { snprintf(buf, sizeof buf, " x%d = %.6f", i + 1, z(M[i][nv])); s += buf; }
    return s;
}

int main() {
    vector<vector<vector<double>>> systems = {
        {{2, 1, -1, 8}, {-3, -1, 2, -11}, {-2, 1, 2, -3}},
        {{1, 2, -1, 3}, {2, 4, -2, 6}, {1, 1, 1, 4}},
        {{1, 1, 2, 3}, {2, 2, 4, 7}, {1, -1, 0, 1}},
        {{0, 2, 4}, {3, 1, 5}},
    };
    for (auto &s : systems) printf("%s\n", gaussJordan(s).c_str());
}
