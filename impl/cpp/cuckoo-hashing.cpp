#include <iostream>
#include <vector>
using namespace std;

bool isPrime(int n) { if (n < 2) return false; for (int d = 2; d * d <= n; d++) if (n % d == 0) return false; return true; }

// 兩張表；鍵只能在 T1[x mod N] 或 T2[(x / N) mod N]。踢太多次視為循環，換更大的質數表重建
struct Cuckoo {
    int n;
    vector<vector<int>> t;  // -1 表示空格
    Cuckoo(int n = 7) : n(n), t(2, vector<int>(n, -1)) {}
    int h(int i, int x) const { return i == 0 ? x % n : (x / n) % n; }
    bool find(int x) const { return t[0][h(0, x)] == x || t[1][h(1, x)] == x; }
    int place(int x) {  // 成功回傳 -1，循環時回傳手上剩下的鍵
        int cur = x;
        for (int k = 0; k < 2 * n; k++)
            for (int i = 0; i < 2; i++) {
                int p = h(i, cur);
                swap(cur, t[i][p]);
                if (cur == -1) return -1;
            }
        return cur;
    }
    void insert(int x) {
        if (find(x)) return;
        int left = place(x);
        if (left == -1) return;
        vector<int> items;
        for (auto &row : t) for (int v : row) if (v != -1) items.push_back(v);
        items.push_back(left);
        for (;;) {
            int m = n + 1;
            while (!isPrime(m)) m++;
            n = m;
            t.assign(2, vector<int>(n, -1));
            bool ok = true;
            for (int v : items) if (place(v) != -1) { ok = false; break; }
            if (ok) break;
        }
        cout << "  rehash -> N = " << n << "\n";
    }
    void erase(int x) { for (int i = 0; i < 2; i++) if (t[i][h(i, x)] == x) t[i][h(i, x)] = -1; }
};

int main() {
    Cuckoo c;
    for (int x : {20, 50, 53, 75, 100, 67, 105, 3, 36, 39, 6}) { cout << "insert " << x << "\n"; c.insert(x); }
    for (int i = 0; i < 2; i++) {
        cout << (i ? "T2:" : "T1:");
        for (int v : c.t[i]) { if (v == -1) cout << " ."; else cout << " " << v; }
        cout << "\n";
    }
    cout << "find 36: " << (c.find(36) ? "True" : "False") << " | find 37: " << (c.find(37) ? "True" : "False") << "\n";
    c.erase(36);
    cout << "after delete 36, find 36: " << (c.find(36) ? "True" : "False") << "\n";
}
