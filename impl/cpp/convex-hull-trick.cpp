#include <algorithm>
#include <climits>
#include <deque>
#include <iostream>
#include <vector>
using namespace std;
using ll = long long;

struct L { ll m, b; ll at(ll X) const { return m * X + b; } };
bool bad(const L &l1, const L &l2, const L &l3) { return (l3.b - l1.b) * (l1.m - l2.m) <= (l2.b - l1.b) * (l1.m - l3.m); }

// dp[i] = min_j dp[j] + (x_i − x_j)² + C；直線 y = −2x_j·X + dp[j] + x_j²，斜率遞減、查詢遞增
vector<ll> frog(const vector<ll> &x, ll C) {
    int n = x.size();
    vector<ll> dp(n);
    deque<L> dq{{-2 * x[0], x[0] * x[0]}};
    for (int i = 1; i < n; i++) {
        while (dq.size() >= 2 && dq[1].at(x[i]) <= dq[0].at(x[i])) dq.pop_front();
        dp[i] = dq[0].at(x[i]) + x[i] * x[i] + C;
        L nl{-2 * x[i], dp[i] + x[i] * x[i]};
        while (dq.size() >= 2 && bad(dq[dq.size() - 2], dq.back(), nl)) dq.pop_back();
        dq.push_back(nl);
    }
    return dp;
}

int main() {
    vector<ll> x = {1, 3, 4, 7, 8, 11, 12, 15};
    for (ll C : {10LL, 0LL, 100LL}) {
        auto dp = frog(x, C);
        vector<ll> nd(x.size(), LLONG_MAX);
        nd[0] = 0;
        for (size_t i = 1; i < x.size(); i++) for (size_t j = 0; j < i; j++) nd[i] = min(nd[i], nd[j] + (x[i] - x[j]) * (x[i] - x[j]) + C);
        cout << "C = " << C << ": dp =";
        for (ll v : dp) cout << " " << v;
        cout << " | naive last = " << nd.back() << "\n";
    }
}
