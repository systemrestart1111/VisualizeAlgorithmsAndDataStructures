#include <algorithm>
#include <climits>
#include <functional>
#include <iostream>
#include <vector>
using namespace std;
using ll = long long;

int main() {
    vector<int> a = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8};
    int n = a.size(), K = 4, evals = 0, naive = 0;
    vector<ll> S(n + 1);
    for (int i = 0; i < n; i++) S[i + 1] = S[i] + a[i];
    auto cost = [&](int i, int j) { return (S[j] - S[i]) * (S[j] - S[i]); };
    vector<ll> prev(n + 1), cur(n + 1);
    for (int j = 0; j <= n; j++) prev[j] = cost(0, j);
    // 最佳切點單調：先算 mid，再把左右兩半的搜尋範圍限制在 opt 兩側
    function<void(int, int, int, int)> solve = [&](int l, int r, int optl, int optr) {
        if (l > r) return;
        int mid = (l + r) / 2, bi = optl;
        ll best = LLONG_MAX;
        for (int i = optl; i <= min(mid - 1, optr); i++) { evals++; ll v = prev[i] + cost(i, mid); if (v < best) { best = v; bi = i; } }
        cur[mid] = best;
        solve(l, mid - 1, optl, bi);
        solve(mid + 1, r, bi, optr);
    };
    for (int g = 2; g <= K; g++) { solve(1, n, 0, n - 1); prev = cur; }
    vector<ll> nd(n + 1), nc(n + 1);
    for (int j = 0; j <= n; j++) nd[j] = cost(0, j);
    for (int g = 2; g <= K; g++) {
        for (int j = 1; j <= n; j++) { nc[j] = LLONG_MAX; for (int i = 0; i < j; i++) { naive++; nc[j] = min(nc[j], nd[i] + cost(i, j)); } }
        for (int j = 1; j <= n; j++) nd[j] = nc[j];
    }
    cout << "min sum of squares: " << prev[n] << " | naive: " << nd[n] << "\ntransitions evaluated: " << evals << " vs " << naive << "\n";
}
