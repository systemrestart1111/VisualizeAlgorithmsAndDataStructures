#include <algorithm>
#include <iostream>
#include <map>
#include <set>
#include <string>
#include <tuple>
#include <vector>
using namespace std;

vector<tuple<char, char, int>> E = {{'C', 'D', 3}, {'C', 'E', 2}, {'D', 'F', 4}, {'E', 'D', 1}, {'E', 'F', 2}, {'E', 'G', 3}, {'F', 'G', 2}, {'F', 'H', 1}, {'G', 'H', 2}};
string NODES = "CDEFGH";
struct Path { string nodes; vector<int> edges; int cost; };

// 同距離時取名稱較小的點；只有嚴格更短才更新前驅
bool dijkstra(char s, char t, const set<int> &banE, const set<char> &banN, Path &out) {
    map<char, int> dist{{s, 0}}, prev;
    set<char> done;
    for (;;) {
        char u = 0;
        for (char v : NODES) if (!done.count(v) && dist.count(v) && !banN.count(v) && (!u || dist[v] < dist[u])) u = v;
        if (!u) return false;
        if (u == t) break;
        done.insert(u);
        vector<pair<char, int>> nb;
        for (size_t i = 0; i < E.size(); i++) if (get<0>(E[i]) == u) nb.push_back({get<1>(E[i]), (int)i});
        sort(nb.begin(), nb.end());
        for (auto &p : nb) {
            char v = p.first;
            int i = p.second, w = get<2>(E[i]);
            if (!banE.count(i) && !banN.count(v) && (!dist.count(v) || dist[u] + w < dist[v])) { dist[v] = dist[u] + w; prev[v] = i; }
        }
    }
    out.nodes = string(1, t); out.edges.clear(); out.cost = dist[t];
    while (out.nodes[0] != s) { int i = prev[out.nodes[0]]; out.edges.insert(out.edges.begin(), i); out.nodes = string(1, get<0>(E[i])) + out.nodes; }
    return true;
}

int main() {
    Path first;
    vector<Path> A, B;
    if (!dijkstra('C', 'H', {}, {}, first)) return 0;
    A.push_back(first);
    for (int k = 1; k < 4; k++) {
        Path last = A.back();
        for (size_t i = 0; i + 1 < last.nodes.size(); i++) {
            string rootN = last.nodes.substr(0, i + 1);
            vector<int> rootE(last.edges.begin(), last.edges.begin() + i);
            set<int> banE;
            for (auto &p : A) if (p.nodes.substr(0, i + 1) == rootN) banE.insert(p.edges[i]);
            set<char> banN(rootN.begin(), rootN.end() - 1);
            Path spur;
            if (!dijkstra(last.nodes[i], 'H', banE, banN, spur)) continue;
            int rc = 0;
            for (int e : rootE) rc += get<2>(E[e]);
            Path cand{rootN + spur.nodes.substr(1), rootE, rc + spur.cost};
            cand.edges.insert(cand.edges.end(), spur.edges.begin(), spur.edges.end());
            bool dup = false;
            for (auto &p : A) dup |= p.nodes == cand.nodes;
            for (auto &p : B) dup |= p.nodes == cand.nodes;
            if (!dup) B.push_back(cand);
        }
        if (B.empty()) break;
        stable_sort(B.begin(), B.end(), [](const Path &a, const Path &b) { return make_tuple(a.cost, a.nodes.size(), a.nodes) < make_tuple(b.cost, b.nodes.size(), b.nodes); });
        A.push_back(B.front());
        B.erase(B.begin());
    }
    for (size_t k = 0; k < A.size(); k++) {
        cout << k + 1 << ":";
        for (size_t i = 0; i < A[k].nodes.size(); i++) cout << (i ? " -> " : " ") << A[k].nodes[i];
        cout << " cost " << A[k].cost << "\n";
    }
}
