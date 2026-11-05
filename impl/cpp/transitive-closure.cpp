#include <iostream>
#include <string>
#include <vector>
using namespace std;

// Warshall：依序讓每個頂點 k 當中繼站，R[i][j] |= R[i][k] && R[k][j]
vector<vector<int>> closure(int n, const vector<string> &edges, bool reflexive) {
    vector<vector<int>> R(n, vector<int>(n));
    for (int i = 0; i < n; i++) R[i][i] = reflexive;
    for (auto &e : edges) R[e[0] - 'A'][e[1] - 'A'] = 1;
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) R[i][j] = R[i][j] || (R[i][k] && R[k][j]);
    return R;
}

int main() {
    vector<string> edges = {"AB", "BC", "CA", "CD", "ED", "EF"};
    for (bool refl : {false, true}) {
        auto R = closure(6, edges, refl);
        cout << (refl ? "reflexive" : "non-reflexive") << "\n  A B C D E F\n";
        for (int i = 0; i < 6; i++) {
            cout << char('A' + i);
            for (int x : R[i]) cout << " " << x;
            cout << "\n";
        }
    }
}
