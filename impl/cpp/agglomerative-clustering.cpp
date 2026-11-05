#include <algorithm>
#include <cmath>
#include <cstdio>
#include <map>
#include <queue>
#include <string>
#include <tuple>
#include <vector>
using namespace std;

vector<pair<double, double>> P = {{1.8, 2.5}, {3.1, 3.4}, {2.2, 4.0}, {3.0, 2.1}, {6.4, 7.0}, {7.6, 8.1}, {7.2, 6.6}, {6.6, 8.4}, {8.1, 2.9}, {7.0, 2.0}, {7.9, 1.6}};
double d(int i, int j) { double dx = P[i].first - P[j].first, dy = P[i].second - P[j].second; return sqrt(dx * dx + dy * dy); }
string setStr(vector<int> v) { sort(v.begin(), v.end()); string s = "{"; for (size_t i = 0; i < v.size(); i++) s += (i ? "," : "") + to_string(v[i]); return s + "}"; }

// 最小堆存所有群對距離；取出時若有一群已被合併就略過（延遲刪除）
void run(const string &linkage) {
    int n = P.size();
    auto link = [&](const vector<int> &A, const vector<int> &B) {
        double mn = 1e18, mx = -1, sum = 0;
        for (int i : A) for (int j : B) { double v = d(i, j); mn = min(mn, v); mx = max(mx, v); sum += v; }
        return linkage == "single" ? mn : linkage == "complete" ? mx : sum / (A.size() * B.size());
    };
    map<int, vector<int>> clusters;
    for (int i = 0; i < n; i++) clusters[i] = {i};
    priority_queue<tuple<double, int, int>, vector<tuple<double, int, int>>, greater<tuple<double, int, int>>> pq;
    for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) pq.push(make_tuple(link({i}, {j}), i, j));
    int nxt = n;
    vector<pair<int, int>> hist;
    printf("%s:", linkage.c_str());
    while (clusters.size() > 1) {
        double dist; int a, b;
        tie(dist, a, b) = pq.top();
        pq.pop();
        if (!clusters.count(a) || !clusters.count(b)) continue;
        vector<int> A = clusters[a], B = clusters[b];
        clusters.erase(a); clusters.erase(b);
        printf(" %s+%s@%.3f", setStr(A).c_str(), setStr(B).c_str(), dist);
        hist.push_back({a, b});
        vector<int> AB = A;
        AB.insert(AB.end(), B.begin(), B.end());
        clusters[nxt] = AB;
        for (auto &c : clusters) if (c.first != nxt) pq.push(make_tuple(link(c.second, AB), min(c.first, nxt), max(c.first, nxt)));
        nxt++;
    }
    map<int, vector<int>> groups;
    for (int i = 0; i < n; i++) groups[i] = {i};
    for (int s = 0; s < n - 3; s++) {
        vector<int> g = groups[hist[s].first];
        g.insert(g.end(), groups[hist[s].second].begin(), groups[hist[s].second].end());
        groups.erase(hist[s].first); groups.erase(hist[s].second);
        groups[n + s] = g;
    }
    vector<vector<int>> gs;
    for (auto &g : groups) { vector<int> v = g.second; sort(v.begin(), v.end()); gs.push_back(v); }
    sort(gs.begin(), gs.end());
    printf("\n  3 clusters:");
    for (auto &g : gs) printf(" %s", setStr(g).c_str());
    printf("\n");
}

int main() {
    run("single");
    run("complete");
    run("average");
}
