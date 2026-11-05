#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

map<char, vector<char>> adj;
vector<char> path;
int visits;

bool dls(char u, char t, int lim) {
    visits++;
    path.push_back(u);
    if (u == t) return true;
    if (lim > 0)
        for (char v : adj[u]) if (find(path.begin(), path.end(), v) == path.end() && dls(v, t, lim - 1)) return true;
    path.pop_back();
    return false;
}

int main() {
    for (string e : {"AB", "AC", "BD", "BE", "CF", "CG", "DH", "EI", "FJ", "GK", "EF"}) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); }
    for (auto &kv : adj) sort(kv.second.begin(), kv.second.end());
    for (char t : {'J', 'H', 'A'}) {
        vector<int> counts;
        bool found = false;
        // 深度上限 0、1、2…逐一做深度受限 DFS
        for (int limit = 0; limit <= (int)adj.size() && !found; limit++) {
            visits = 0; path.clear();
            found = dls('A', t, limit);
            counts.push_back(visits);
        }
        int total = 0;
        cout << "A -> " << t << ": depth " << path.size() - 1 << ", path ";
        for (size_t i = 0; i < path.size(); i++) cout << (i ? " -> " : "") << path[i];
        cout << ", visits per limit [";
        for (size_t i = 0; i < counts.size(); i++) { cout << (i ? ", " : "") << counts[i]; total += counts[i]; }
        cout << "], total " << total << "\n";
    }
}
