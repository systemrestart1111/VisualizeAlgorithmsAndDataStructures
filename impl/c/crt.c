#include <stdio.h>

long long mod_inverse(long long a, long long m) {
    long long old_r = m, r = a % m, old_t = 0, t = 1;
    while (r) {
        long long q = old_r / r, tmp;
        tmp = r; r = old_r - q * r; old_r = tmp;
        tmp = t; t = old_t - q * t; old_t = tmp;
    }
    return (old_t % m + m) % m;
}

/* x = Σ a_i · M_i · (M_i⁻¹ mod m_i)，其中 M_i = M / m_i；每一項只在自己的模數下不為 0 */
int main(void) {
    long long eq[][2] = {{2, 3}, {3, 5}, {2, 7}}, M = 1, x = 0; /* x ≡ a (mod m)，模數兩兩互質 */
    for (int i = 0; i < 3; i++) M *= eq[i][1];
    for (int i = 0; i < 3; i++) {
        long long a = eq[i][0], m = eq[i][1], Mi = M / m, inv = mod_inverse(Mi, m);
        printf("a=%lld, m=%lld: M_i = %lld, M_i^-1 mod %lld = %lld, term = %lld\n", a, m, Mi, m, inv, a * Mi * inv);
        x += a * Mi * inv;
    }
    printf("x = %lld (mod %lld)\n", x % M, M);
    return 0;
}
