#include <stdio.h>

long long gcd(long long a, long long b) { return b ? gcd(b, a % b) : a; }

/* lcm(a, b) = a / gcd(a, b) * b；多個數就依序兩兩求（先除後乘，避免溢位） */
int main(void) {
    long long nums[] = {12, 18, 30, 8}, cur = nums[0];
    for (int i = 1; i < 4; i++) {
        long long g = gcd(cur, nums[i]), nxt = cur / g * nums[i];
        printf("lcm(%lld, %lld) = %lld / %lld x %lld = %lld\n", cur, nums[i], cur, g, nums[i], nxt);
        cur = nxt;
    }
    printf("lcm = %lld\n", cur);
    return 0;
}
