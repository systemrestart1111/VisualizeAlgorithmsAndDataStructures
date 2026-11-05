#include <iostream>
#include <vector>
using namespace std;

struct Prefix2D {
    vector<vector<int>> P;
    // P[i][j] = 左上角 (0,0) 到 (i-1, j-1) 的總和
    Prefix2D(const vector<vector<int>> &a) : P(a.size() + 1, vector<int>(a[0].size() + 1)) {
        for (size_t i = 1; i <= a.size(); i++)
            for (size_t j = 1; j <= a[0].size(); j++) P[i][j] = a[i - 1][j - 1] + P[i - 1][j] + P[i][j - 1] - P[i - 1][j - 1];
    }
    int query(int r1, int c1, int r2, int c2) const { return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]; }
};

int main() {
    vector<vector<int>> a = {{3, 0, 1, 4, 2}, {5, 6, 3, 2, 1}, {1, 2, 0, 1, 5}, {4, 1, 0, 1, 7}, {1, 0, 3, 0, 5}};
    Prefix2D p(a);
    int qs[4][4] = {{1, 1, 3, 3}, {0, 0, 4, 4}, {2, 2, 2, 2}, {0, 3, 4, 4}};
    for (auto &q : qs) {
        int brute = 0;
        for (int i = q[0]; i <= q[2]; i++) for (int j = q[1]; j <= q[3]; j++) brute += a[i][j];
        cout << "sum(" << q[0] << ", " << q[1] << ", " << q[2] << ", " << q[3] << ") = " << p.query(q[0], q[1], q[2], q[3]) << " (brute " << brute << ")\n";
    }
}
