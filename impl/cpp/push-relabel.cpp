#include <algorithm>
#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

const string NAMES = "SACBDT";
const int N = 6;
int cap[N][N], S = 0, T = 5;

int main() {
    vector<pair<string, int>> edges = {{"SA", 10}, {"SC", 10}, {"AB", 4}, {"AC", 2}, {"AD", 8}, {"CD", 9}, {"DB", 6}, {"BT", 10}, {"DT", 10}};
    for (auto& e : edges) cap[NAMES.find(e.first[0])][NAMES.find(e.first[1])] += e.second;
    // 前置流：先把 S 的出邊全部灌滿；之後不斷把「溢出」的點的多餘流量往較低的鄰居推，推不動就把自己抬高
    vector<int> height(N, 0), excess(N, 0);
    queue<int> active;
    int pushes = 0, relabels = 0;
    height[S] = N;
    for (int v = 0; v < N; v++)
        if (cap[S][v] > 0) {
            excess[v] += cap[S][v];
            cap[v][S] += cap[S][v];
            cap[S][v] = 0;
            if (v != T) active.push(v);
        }
    while (!active.empty()) {  // FIFO：依序處理溢出的點
        int u = active.front();
        active.pop();
        while (excess[u] > 0) {
            for (int v = 0; v < N && excess[u] > 0; v++)
                if (cap[u][v] > 0 && height[u] == height[v] + 1) {  // 只能往低一層推
                    int d = min(excess[u], cap[u][v]);
                    cap[u][v] -= d; cap[v][u] += d;
                    excess[u] -= d; excess[v] += d;
                    pushes++;
                    if (v != S && v != T && excess[v] == d) active.push(v);
                }
            if (excess[u] > 0) {  // 推不出去：抬高到比最低的可達鄰居高一層
                int mn = 1 << 30;
                for (int v = 0; v < N; v++) if (cap[u][v] > 0) mn = min(mn, height[v]);
                height[u] = mn + 1;
                relabels++;
            }
        }
    }
    cout << "max flow = " << excess[T] << "\npushes = " << pushes << " relabels = " << relabels << "\n";
    vector<bool> reach(N);
    vector<int> st = {S};
    reach[S] = true;
    while (!st.empty()) {
        int u = st.back();
        st.pop_back();
        for (int v = 0; v < N; v++) if (cap[u][v] > 0 && !reach[v]) { reach[v] = true; st.push_back(v); }
    }
    cout << "min cut S-side:";
    for (int v = 0; v < N; v++) if (reach[v]) cout << " " << NAMES[v];
    cout << "\n";
}
