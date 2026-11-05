#include <iostream>
#include <string>
#include <vector>
using namespace std;

// 比較雜湊值取代逐字比較；視窗右移一格時用 O(1) 更新雜湊（滾動雜湊）。雜湊相同時仍需確認，避免碰撞
int main() {
    string t = "31415926535897932384626", p = "26";
    int n = (int)t.size(), m = (int)p.size(), q = 13, d = 256, h = 1, hp = 0, ht = 0;
    for (int i = 0; i < m - 1; i++) h = h * d % q;  // 最高位的權重
    for (int i = 0; i < m; i++) {
        hp = (hp * d + (unsigned char)p[i]) % q;
        ht = (ht * d + (unsigned char)t[i]) % q;
    }
    vector<int> matches, spurious;
    for (int s = 0; s + m <= n; s++) {
        if (hp == ht) (t.compare(s, m, p) == 0 ? matches : spurious).push_back(s);
        if (s < n - m) {
            ht = ((ht - (unsigned char)t[s] * h) * d + (unsigned char)t[s + m]) % q;
            if (ht < 0) ht += q;  // C++ 的 % 可能得到負數
        }
    }
    cout << "matches at:";
    for (int s : matches) cout << " " << s;
    cout << "\nspurious hits (hash collision):";
    for (int s : spurious) cout << " " << s;
    cout << "\n";
}
