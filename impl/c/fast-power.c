#include <stdio.h>

/* 把 n 看成二進位，由低位到高位：base 每次平方，該位是 1 時就乘進結果，只需 O(log n) 次乘法 */
long long fast_power(long long a, long long n) {
    long long result = 1, base = a;
    while (n) {
        int bit = n & 1;
        if (bit) result *= base;
        printf("bit %d: result = %lld, base = %lld\n", bit, result, base);
        base *= base;
        n >>= 1;
    }
    return result;
}

int main(void) {
    printf("3^13 = %lld\n", fast_power(3, 13));
    return 0;
}
