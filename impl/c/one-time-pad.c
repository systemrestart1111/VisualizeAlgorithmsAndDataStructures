#include <stdio.h>
#include <string.h>

static long long s = 42;
/* 與其他語言一致的示範亂數；真正的 OTP 需要密碼學安全的亂數 */
int rand_byte(void) { s = s * 48271 % 2147483647; return (int)(s % 256); }

void hex(const char *label, const unsigned char *b, int n) {
    printf("%s", label);
    for (int i = 0; i < n; i++) printf("%02x", b[i]);
    printf("\n");
}

int main(void) {
    const char *m1 = "HELLO WORLD", *m2 = "SECRET PLAN";
    int n = (int)strlen(m1);
    unsigned char key[16], c1[16], c2[16], x1[16], x2[16];
    char back[16];
    for (int i = 0; i < n; i++) key[i] = (unsigned char)rand_byte();
    for (int i = 0; i < n; i++) { c1[i] = m1[i] ^ key[i]; c2[i] = m2[i] ^ key[i]; back[i] = (char)(c1[i] ^ key[i]); }
    back[n] = 0;
    hex("key : ", key, n);
    hex("c1  : ", c1, n);
    printf("back: %s\n", back);
    int same = 1;
    for (int i = 0; i < n; i++) { x1[i] = c1[i] ^ c2[i]; x2[i] = m1[i] ^ m2[i]; same &= x1[i] == x2[i]; }
    hex("c1^c2: ", x1, n);
    hex("m1^m2: ", x2, n);
    printf("key reuse leaks m1^m2: %s\n", same ? "True" : "False");
    return 0;
}
