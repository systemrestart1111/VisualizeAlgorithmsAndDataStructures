#include <iostream>
#include <vector>
using namespace std;

// 一次處理一個位元：含第 b 位的 mask 加上「去掉第 b 位」的值
vector<int> sos(vector<int> F) {
    int N = F.size();
    for (int b = 0; (1 << b) < N; b++)
        for (int m = 0; m < N; m++) if (m >> b & 1) F[m] += F[m ^ (1 << b)];
    return F;
}
vector<int> brute(const vector<int> &a) {
    vector<int> out;
    for (int m = 0; m < (int)a.size(); m++) {
        int s = 0;
        for (int sub = m;; sub = (sub - 1) & m) { s += a[sub]; if (!sub) break; }
        out.push_back(s);
    }
    return out;
}

int main() {
    vector<int> a = {3, 1, 4, 1, 5, 9, 2, 6}, b;
    auto F = sos(a);
    cout << "F:";
    for (int x : F) cout << " " << x;
    cout << "\nmatches brute force: " << (F == brute(a) ? "True" : "False") << "\n";
    for (int i = 1; i <= 16; i++) b.push_back(i);
    auto G = sos(b);
    cout << "F (16):";
    for (int x : G) cout << " " << x;
    cout << " | ok: " << (G == brute(b) ? "True" : "False") << "\n";
}
