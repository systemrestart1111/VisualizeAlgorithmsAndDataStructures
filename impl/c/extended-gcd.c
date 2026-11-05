#include <stdio.h>

/* 同時維護係數：每一列都滿足 r = a·s + b·t；最後非零的 r 就是 gcd */
int main(void) {
    long long a = 240, b = 46, old_r = a, r = b, old_s = 1, s = 0, old_t = 0, t = 1;
    printf("%4s %5s %5s %5s\n", "q", "r", "s", "t");
    printf("%4s %5lld %5lld %5lld\n", "", old_r, old_s, old_t);
    while (r) {
        long long q = old_r / r, tmp;
        tmp = r; r = old_r - q * r; old_r = tmp;
        tmp = s; s = old_s - q * s; old_s = tmp;
        tmp = t; t = old_t - q * t; old_t = tmp;
        printf("%4lld %5lld %5lld %5lld\n", q, old_r, old_s, old_t);
    }
    printf("gcd = %lld, 240 x (%lld) + 46 x (%lld) = %lld\n", old_r, old_s, old_t, a * old_s + b * old_t);
    return 0;
}
