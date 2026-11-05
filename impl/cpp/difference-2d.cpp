#include <cstdio>
#include <vector>
using namespace std;

int main() {
    const int R = 5, C = 6;
    int ops[3][5] = {{0, 0, 2, 2, 3}, {1, 2, 4, 5, 2}, {3, 0, 4, 1, -1}};
    vector<vector<int>> D(R + 1, vector<int>(C + 1)), naive(R, vector<int>(C)), out(R, vector<int>(C));
    for (auto &o : ops) {
        int r1 = o[0], c1 = o[1], r2 = o[2], c2 = o[3], v = o[4];
        // 只改四個角
        D[r1][c1] += v; D[r1][c2 + 1] -= v; D[r2 + 1][c1] -= v; D[r2 + 1][c2 + 1] += v;
        for (int i = r1; i <= r2; i++) for (int j = c1; j <= c2; j++) naive[i][j] += v;
    }
    // 二維前綴和還原
    for (int i = 0; i < R; i++) {
        for (int j = 0; j < C; j++) {
            out[i][j] = D[i][j] + (i ? out[i - 1][j] : 0) + (j ? out[i][j - 1] : 0) - (i && j ? out[i - 1][j - 1] : 0);
            printf(j ? " %2d" : "%2d", out[i][j]);
        }
        printf("\n");
    }
    printf("matches naive: %s\n", out == naive ? "True" : "False");
}
