#include <iostream>
#include <vector>
using namespace std;

vector<int> KEYS = {10, 20, 30, 40, 50}, P = {15, 10, 5, 10, 20}, Q = {5, 10, 5, 5, 5, 10};
int n = KEYS.size();
vector<vector<int>> root(n + 1, vector<int>(n + 1));

void preorder(int i, int j) {
    if (i > j) return;
    int r = root[i][j];
    cout << " " << KEYS[r - 1];
    preorder(i, r - 1);
    preorder(r + 1, j);
}

int main() {
    vector<vector<int>> e(n + 2, vector<int>(n + 1)), w = e;
    for (int i = 1; i <= n + 1; i++) e[i][i - 1] = w[i][i - 1] = Q[i - 1];
    for (int len = 1; len <= n; len++)
        for (int i = 1; i + len - 1 <= n; i++) {
            int j = i + len - 1;
            w[i][j] = w[i][j - 1] + P[j - 1] + Q[j];
            e[i][j] = 1 << 30;
            for (int r = i; r <= j; r++) { int t = e[i][r - 1] + e[r + 1][j] + w[i][j]; if (t < e[i][j]) { e[i][j] = t; root[i][j] = r; } }  // 枚舉根
        }
    cout << "min expected cost: " << e[1][n] << "\nroot: " << KEYS[root[1][n] - 1] << " | preorder:";
    preorder(1, n);
    cout << "\n";
}
