#include <cstdio>
#include <string>
#include <vector>
using namespace std;

// 與其他語言一致的示範亂數；真正的 OTP 需要密碼學安全的亂數
struct ParkMiller {
    long long s;
    int byte() { s = s * 48271 % 2147483647; return int(s % 256); }
};
void hex(const char *label, const vector<int> &b) {
    printf("%s", label);
    for (int x : b) printf("%02x", x);
    printf("\n");
}

int main() {
    string m1 = "HELLO WORLD", m2 = "SECRET PLAN";
    ParkMiller rng{42};
    size_t n = m1.size();
    vector<int> key(n), c1(n), c2(n), x1(n), x2(n);
    string back;
    for (auto &k : key) k = rng.byte();
    for (size_t i = 0; i < n; i++) { c1[i] = m1[i] ^ key[i]; c2[i] = m2[i] ^ key[i]; back += char(c1[i] ^ key[i]); }
    hex("key : ", key);
    hex("c1  : ", c1);
    printf("back: %s\n", back.c_str());
    bool same = true;
    for (size_t i = 0; i < n; i++) { x1[i] = c1[i] ^ c2[i]; x2[i] = m1[i] ^ m2[i]; same &= x1[i] == x2[i]; }
    hex("c1^c2: ", x1);
    hex("m1^m2: ", x2);
    printf("key reuse leaks m1^m2: %s\n", same ? "True" : "False");
}
