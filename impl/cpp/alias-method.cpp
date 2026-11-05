#include <cstdio>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;

// Vose 別名法：縮放成平均 1，矮欄用高欄補滿，每欄最多兩個選項
void build(const vector<double> &W, vector<double> &prob, vector<int> &alias) {
    double total = 0;
    for (double w : W) { if (w < 0) throw invalid_argument("weights must be non-negative"); total += w; }
    if (total <= 0) throw invalid_argument("total weight must be positive");
    int n = W.size();
    vector<double> p(n);
    vector<int> small, large;
    prob.assign(n, 0);
    alias.assign(n, -1);
    for (int i = 0; i < n; i++) { p[i] = W[i] / total * n; (p[i] < 1 ? small : large).push_back(i); }
    while (!small.empty() && !large.empty()) {
        int s = small.back(), l = large.back();
        small.pop_back(); large.pop_back();
        prob[s] = p[s]; alias[s] = l;
        p[l] -= 1 - p[s];
        (p[l] < 1 ? small : large).push_back(l);
    }
    for (int i : small) { prob[i] = 1; alias[i] = i; }
    for (int i : large) { prob[i] = 1; alias[i] = i; }
}
string list(const vector<double> &W) { string s = "["; char b[32]; for (size_t i = 0; i < W.size(); i++) { snprintf(b, sizeof b, "%s%g", i ? ", " : "", W[i]); s += b; } return s + "]"; }

int main() {
    for (auto W : vector<vector<double>>{{5, 1, 3, 1, 8, 2}, {0, 3, 0, 1}, {1, 1, 1, 1}, {7}}) {
        vector<double> prob;
        vector<int> alias;
        build(W, prob, alias);
        long long st = 7;
        int n = W.size(), N = 10000;
        vector<int> cnt(n, 0);
        // 隨機選一欄，再擲硬幣決定取本身或別名：O(1)
        for (int k = 0; k < N; k++) { st = st * 48271 % 2147483647; int i = st % n; st = st * 48271 % 2147483647; cnt[st / 2147483647.0 < prob[i] ? i : alias[i]]++; }
        double total = 0, chi = 0;
        for (double w : W) total += w;
        for (int i = 0; i < n; i++) if (W[i] > 0) { double e = W[i] / total * N; chi += (cnt[i] - e) * (cnt[i] - e) / e; }
        printf("weights %s: prob", list(W).c_str());
        for (double p : prob) printf(" %.4f", p);
        printf(", alias");
        for (int a : alias) printf(" %d", a);
        printf(", counts");
        for (int c : cnt) printf(" %d", c);
        printf(", chi-square %.3f\n", chi);
    }
    for (auto W : vector<vector<double>>{{1, -1}, {0, 0}}) {
        vector<double> prob;
        vector<int> alias;
        try { build(W, prob, alias); } catch (const invalid_argument &e) { printf("weights %s: %s\n", list(W).c_str(), e.what()); }
    }
}
