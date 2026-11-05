#include <cstdio>
#include <map>
#include <string>
using namespace std;

long long ipow(long long b, int e) { long long r = 1; while (e--) r *= b; return r; }

// num / total^k 的十進位表示（total = 5 時恰好是有限小數）
string dec(long long num, int k, long long total) {
    char buf[64];
    if (k == 0) snprintf(buf, sizeof buf, "%lld", num);
    else {
        long long v = num * ipow(10, k) / ipow(total, k), p = ipow(10, k);
        snprintf(buf, sizeof buf, "%lld.%0*lld", v / p, k, v % p);
    }
    return buf;
}

// 依出現頻率把 [0, 1) 切給各符號；每編一個符號就把目前區間縮小到該符號負責的那一段
// 區間以分數 low/denom、(low+width)/denom 表示，全程整數運算，沒有浮點誤差
int main() {
    string msg = "BACAB";
    int n = (int)msg.size();
    long long total = n, acc = 0;
    map<char, long long> freq, cum;
    for (char c : msg) freq[c]++;
    for (auto& p : freq) { cum[p.first] = acc; acc += p.second; }
    printf("model:");
    for (auto& p : freq) printf(" %c:[%lld/%lld,%lld/%lld)", p.first, cum[p.first], total, cum[p.first] + p.second, total);
    printf("\n");
    long long low = 0, width = 1;
    for (int k = 1; k <= n; k++) {
        char ch = msg[k - 1];
        low = low * total + width * cum[ch];
        width *= freq[ch];
        printf("after '%c': [%s, %s)\n", ch, dec(low, k, total).c_str(), dec(low + width, k, total).c_str());
    }
    printf("code = %s (= %lld/%lld)\n", dec(low, n, total).c_str(), low, ipow(total, n));
    // 解碼：看 code 落在哪個符號的區段，再把它放大回 [0, 1)
    long long num = low, den = ipow(total, n);
    string out;
    for (int k = 0; k < n; k++) {
        long long scaled = num * total;
        char ch = 0;
        for (auto it = freq.rbegin(); it != freq.rend(); ++it)
            if (scaled >= cum[it->first] * den) { ch = it->first; break; }
        out += ch;
        num = scaled - cum[ch] * den;
        den *= freq[ch];
    }
    printf("decoded: %s\n", out.c_str());
}
