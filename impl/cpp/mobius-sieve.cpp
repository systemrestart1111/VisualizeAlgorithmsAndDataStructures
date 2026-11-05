#include <iostream>
#include <vector>
using namespace std;

// 線性篩：質數 μ = −1；i % p == 0 時 i·p 含 p²，μ = 0；否則 μ(i·p) = −μ(i)
vector<int> mobiusSieve(int N) {
    vector<int> mu(N + 1, 0), primes;
    vector<bool> comp(N + 1, false);
    mu[1] = 1;
    for (int i = 2; i <= N; i++) {
        if (!comp[i]) { primes.push_back(i); mu[i] = -1; }
        for (int p : primes) {
            if (i * p > N) break;
            comp[i * p] = true;
            if (i % p == 0) { mu[i * p] = 0; break; }
            mu[i * p] = -mu[i];
        }
    }
    return mu;
}
int byFactoring(int x) {
    int k = 0;
    for (int d = 2; d * d <= x; d++)
        if (x % d == 0) { x /= d; if (x % d == 0) return 0; k++; }
    if (x > 1) k++;
    return k % 2 ? -1 : 1;
}

int main() {
    auto mu = mobiusSieve(30);
    cout << "mu(1..30):";
    for (int i = 1; i <= 30; i++) cout << " " << mu[i];
    cout << "\n";
    const int N = 1000;
    mu = mobiusSieve(N);
    int pos = 0, neg = 0, zero = 0, sum = 0;
    bool ok = true;
    for (int x = 1; x <= N; x++) { pos += mu[x] == 1; neg += mu[x] == -1; zero += mu[x] == 0; sum += mu[x]; if (mu[x] != byFactoring(x)) ok = false; }
    cout << "N=" << N << ": +1 " << pos << ", -1 " << neg << ", 0 " << zero << ", Mertens " << sum << "\n";
    cout << "check by factoring: " << (ok ? "True" : "False") << "\n";
}
