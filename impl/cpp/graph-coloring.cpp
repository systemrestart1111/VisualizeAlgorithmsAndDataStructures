#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

const int N = 6;
vector<vector<bool>> adj(N, vector<bool>(N));
vector<int> color(N);
int m;

// 依序替每個點試顏色 1..m，與已著色的鄰居衝突就換色；都不行就回溯到上一個點
bool bt(int v) {
    if (v == N) return true;
    for (int c = 1; c <= m; c++) {
        bool ok = true;
        for (int u = 0; u < N; u++)
            if (adj[v][u] && color[u] == c) ok = false;
        if (!ok) continue;
        color[v] = c;
        if (bt(v + 1)) return true;
        color[v] = 0;
    }
    return false;
}

int main() {
    istringstream in("AB AC AD BC BE CD CE DF EF CF");
    string e;
    while (in >> e) adj[e[0] - 'A'][e[1] - 'A'] = adj[e[1] - 'A'][e[0] - 'A'] = true;
    for (m = 3; m <= 4; m++) {
        fill(color.begin(), color.end(), 0);
        cout << "m = " << m << ":";
        if (!bt(0)) cout << " no solution\n";
        else {
            for (int v = 0; v < N; v++) cout << " " << char('A' + v) << "=" << color[v];
            cout << "\n";
        }
    }
}
