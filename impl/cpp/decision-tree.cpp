#include <algorithm>
#include <cstdio>
#include <set>
#include <string>
#include <vector>
using namespace std;
struct S { double x[2]; int y; };
vector<S> D;
int K;

void data(const string &kind) {
    long long s = 3;
    D.clear();
    K = 0;
    for (int i = 0; i < 30; i++) {
        s = s * 48271 % 2147483647; double x = (s % 1000) / 100.0;
        s = s * 48271 % 2147483647; double y = (s % 1000) / 100.0;
        int c = kind == "xor" ? ((x < 5) != (y < 5)) : kind == "diag" ? (x + y > 10) : (x > 6 ? 2 : y > 5 ? 1 : 0);
        D.push_back({{x, y}, c});
        K = max(K, c + 1);
    }
}
double gini(const vector<int> &idx) {
    if (idx.empty()) return 0;
    vector<int> c(K, 0);
    for (int i : idx) c[D[i].y]++;
    double s = 1;
    for (int v : c) s -= ((double)v / idx.size()) * ((double)v / idx.size());
    return s;
}
int majority(const vector<int> &idx) {
    vector<int> c(K, 0);
    for (int i : idx) c[D[i].y]++;
    return max_element(c.begin(), c.end()) - c.begin();
}

// Gini 最低的切分；停止：純淨、達深度上限或樣本 < 2；平手取特徵小、門檻小
void build(const vector<int> &idx, int depth, int maxDepth, int indent) {
    double g = gini(idx);
    string pad(indent + 2, ' ');
    if (g < 1e-12 || depth >= maxDepth || idx.size() < 2) { printf("%sleaf class %d (n=%d)\n", pad.c_str(), majority(idx), (int)idx.size()); return; }
    int bf = -1;
    double bs = 0, bt = 0;
    for (int f = 0; f < 2; f++) {
        set<double> vs;
        for (int i : idx) vs.insert(D[i].x[f]);
        vector<double> vals(vs.begin(), vs.end());
        for (size_t k = 0; k + 1 < vals.size(); k++) {
            double t = (vals[k] + vals[k + 1]) / 2;
            vector<int> L, R;
            for (int i : idx) (D[i].x[f] <= t ? L : R).push_back(i);
            double s = (double)L.size() / idx.size() * gini(L) + (double)R.size() / idx.size() * gini(R);
            if (bf < 0 || s < bs - 1e-12) { bf = f; bs = s; bt = t; }
        }
    }
    if (bf < 0) { printf("%sleaf class %d (n=%d)\n", pad.c_str(), majority(idx), (int)idx.size()); return; }
    vector<int> L, R;
    for (int i : idx) (D[i].x[bf] <= bt ? L : R).push_back(i);
    printf("%sx%d <= %.3f (n=%d, gini %.3f -> %.3f)\n", pad.c_str(), bf + 1, bt, (int)idx.size(), g, bs);
    build(L, depth + 1, maxDepth, indent + 2);
    build(R, depth + 1, maxDepth, indent + 2);
}

int main() {
    vector<pair<string, int>> tests = {{"blocks", 2}, {"xor", 2}, {"xor", 3}, {"diag", 3}};
    for (auto &t : tests) {
        data(t.first);
        vector<int> idx;
        for (int i = 0; i < 30; i++) idx.push_back(i);
        printf("%s, max depth %d:\n", t.first.c_str(), t.second);
        build(idx, 0, t.second, 0);
    }
}
