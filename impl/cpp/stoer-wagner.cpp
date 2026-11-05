#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<vector<int>> E = {{1, 2, 2}, {1, 5, 3}, {2, 3, 3}, {2, 5, 2}, {2, 6, 2}, {3, 4, 4}, {3, 7, 2}, {4, 7, 2}, {4, 8, 2}, {5, 6, 3}, {6, 7, 1}, {7, 8, 3}};
    vector<int> nodes;
    for (auto &e : E) for (int k = 0; k < 2; k++) if (find(nodes.begin(), nodes.end(), e[k]) == nodes.end()) nodes.push_back(e[k]);
    int n = nodes.size();
    auto idx = [&](int x) { return int(find(nodes.begin(), nodes.end(), x) - nodes.begin()); };
    vector<vector<int>> W(n, vector<int>(n)), members(n);
    for (auto &e : E) { W[idx(e[0])][idx(e[1])] += e[2]; W[idx(e[1])][idx(e[0])] += e[2]; }
    for (int i = 0; i < n; i++) members[i] = {nodes[i]};
    vector<bool> alive(n, true);
    int best = 1 << 30;
    vector<int> bestSet;
    cout << "cut of each phase:";
    // 每階段做最大鄰接排序，切出最後加入的點，再把最後兩點合併
    for (int phase = 0; phase < n - 1; phase++) {
        vector<int> ids, order;
        for (int i = 0; i < n; i++) if (alive[i]) ids.push_back(i);
        vector<int> w(n);
        vector<bool> inA(n);
        for (int v = 0; v < n; v++) w[v] = W[ids[0]][v];
        order.push_back(ids[0]); inA[ids[0]] = true;
        while (order.size() < ids.size()) {
            int nxt = -1;
            for (int v : ids) if (!inA[v] && (nxt < 0 || w[v] > w[nxt])) nxt = v;
            inA[nxt] = true; order.push_back(nxt);
            for (int v : ids) if (!inA[v]) w[v] += W[nxt][v];
        }
        int s = order[order.size() - 2], t = order.back(), cut = 0;
        for (int v : ids) if (v != t) cut += W[t][v];
        cout << " " << cut;
        if (cut < best) { best = cut; bestSet = members[t]; }
        for (int v = 0; v < n; v++) { W[s][v] += W[t][v]; W[v][s] = W[s][v]; }
        members[s].insert(members[s].end(), members[t].begin(), members[t].end());
        alive[t] = false;
    }
    sort(bestSet.begin(), bestSet.end());
    cout << "\nmin cut: " << best << " side: [";
    for (size_t i = 0; i < bestSet.size(); i++) cout << (i ? ", " : "") << bestSet[i];
    cout << "]\n";
}
