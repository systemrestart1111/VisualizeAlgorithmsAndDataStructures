#include <stdio.h>

/* 輾轉相除：gcd(a, b) = gcd(b, a mod b)，直到餘數為 0 */
long long gcd(long long a, long long b) {
    while (b) {
        printf("%lld = %lld x %lld + %lld\n", a, a / b, b, a % b);
        long long r = a % b;
        a = b;
        b = r;
    }
    return a;
}

int main(void) {
    printf("gcd = %lld\n", gcd(252, 105));
    return 0;
}
