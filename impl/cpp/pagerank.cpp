#include <algorithm>
#include <cstdio>
#include <numeric>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

// PR(v) = (1-d)/N + d·Σ PR(u)/出度(u)（u 指向 v）；重複套用直到收斂（冪迭代）
int main() {
    istringstream in("AB AC BC CA DC EA ED FE BD DA");
    const int n = 6;
    vector<vector<int>> out(n);
    string e;
    while (in >> e) out[e[0] - 'A'].push_back(e[1] - 'A');
    double D = 0.85;
    vector<double> pr(n, 1.0 / n);
    for (int it = 1; it <= 20; it++) {
        vector<double> nw(n, (1 - D) / n);
        for (int u = 0; u < n; u++)
            for (int v : out[u]) nw[v] += D * pr[u] / out[u].size();
        pr = nw;
        if (it == 1 || it == 5 || it == 20) {
            printf("iteration %2d:", it);
            for (int v = 0; v < n; v++) printf(" %c=%.4f", 'A' + v, pr[v]);
            printf("\n");
        }
    }
    vector<int> order(n);
    iota(order.begin(), order.end(), 0);
    stable_sort(order.begin(), order.end(), [&](int a, int b) { return pr[a] > pr[b]; });
    printf("ranking:");
    for (int t = 0; t < n; t++) printf(t ? " > %c" : " %c", 'A' + order[t]);
    printf("\nsum = %.4f\n", accumulate(pr.begin(), pr.end(), 0.0));
}
