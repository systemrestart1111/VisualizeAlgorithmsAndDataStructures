#include <iostream>
#include <vector>
using namespace std;

int mobius(int x) {
    int k = 0;
    bool sq = false;
    for (int d = 2; d * d <= x; d++)
        if (x % d == 0) { x /= d; k++; if (x % d == 0) sq = true; while (x % d == 0) x /= d; }
    if (x > 1) k++;
    return sq ? 0 : (k % 2 ? -1 : 1);
}

// g(n) = Σ_{d|n} f(d)；再以 f(n) = Σ_{d|n} μ(n/d)·g(d) 還原
void run(const vector<int> &f) {
    int N = f.size();
    vector<int> g(N + 1, 0), back(N + 1, 0);
    for (int n = 1; n <= N; n++) for (int d = 1; d <= n; d++) if (n % d == 0) g[n] += f[d - 1];
    bool ok = true;
    for (int n = 1; n <= N; n++) { for (int d = 1; d <= n; d++) if (n % d == 0) back[n] += mobius(n / d) * g[d]; if (back[n] != f[n - 1]) ok = false; }
    cout << "g:";
    for (int n = 1; n <= N; n++) cout << " " << g[n];
    cout << "\nf recovered:";
    for (int n = 1; n <= N; n++) cout << " " << back[n];
    cout << " (match " << (ok ? "True" : "False") << ")\n";
}

int main() {
    run({1, 1, 2, 2, 4, 2, 6, 4, 6, 4, 10, 4});
    run({3, -1, 4, 1, -5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3});
    run(vector<int>(12, 1));
}
