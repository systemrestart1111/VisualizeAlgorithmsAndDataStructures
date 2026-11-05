#include <cstdio>

// 同時維護係數：每一列都滿足 r = a·s + b·t；最後非零的 r 就是 gcd
int main() {
    long long a = 240, b = 46, oldR = a, r = b, oldS = 1, s = 0, oldT = 0, t = 1;
    printf("%4s %5s %5s %5s\n", "q", "r", "s", "t");
    printf("%4s %5lld %5lld %5lld\n", "", oldR, oldS, oldT);
    while (r) {
        long long q = oldR / r, tmp;
        tmp = r; r = oldR - q * r; oldR = tmp;
        tmp = s; s = oldS - q * s; oldS = tmp;
        tmp = t; t = oldT - q * t; oldT = tmp;
        printf("%4lld %5lld %5lld %5lld\n", q, oldR, oldS, oldT);
    }
    printf("gcd = %lld, 240 x (%lld) + 46 x (%lld) = %lld\n", oldR, oldS, oldT, a * oldS + b * oldT);
}
