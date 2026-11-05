#include <stdio.h>

/* 數學上的模：C 的 % 對負數會得到負餘數，需加 m 修正到 [0, m) */
int norm_mod(int a, int m) { return ((a % m) + m) % m; }

int main(void) {
    int nums[] = {-1, 27, 52, 13, -27}, m = 26;
    for (int i = 0; i < 5; i++) printf("%d mod %d = %d\n", nums[i], m, norm_mod(nums[i], m));
    int a = nums[0], b = nums[1];
    printf("(%d + %d) mod %d = %d = %d\n", a, b, m, norm_mod(a + b, m), norm_mod(norm_mod(a, m) + norm_mod(b, m), m));
    printf("(%d * %d) mod %d = %d = %d\n", a, b, m, norm_mod(a * b, m), norm_mod(norm_mod(a, m) * norm_mod(b, m), m));
    printf("27 ≡ 1 (mod 26): %s\n", norm_mod(27, m) == norm_mod(1, m) ? "True" : "False");
    return 0;
}
