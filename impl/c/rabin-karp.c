#include <stdio.h>
#include <string.h>

/* 比較雜湊值取代逐字比較；視窗右移一格時用 O(1) 更新雜湊（滾動雜湊）。雜湊相同時仍需確認，避免碰撞 */
int main(void) {
    const char *t = "31415926535897932384626", *p = "26";
    int n = (int)strlen(t), m = (int)strlen(p), q = 13, d = 256, h = 1, hp = 0, ht = 0;
    for (int i = 0; i < m - 1; i++) h = h * d % q; /* 最高位的權重 */
    for (int i = 0; i < m; i++) {
        hp = (hp * d + (unsigned char)p[i]) % q;
        ht = (ht * d + (unsigned char)t[i]) % q;
    }
    int matches[64], nm = 0, spurious[64], ns = 0;
    for (int s = 0; s + m <= n; s++) {
        if (hp == ht) {
            if (strncmp(t + s, p, m) == 0) matches[nm++] = s;
            else spurious[ns++] = s;
        }
        if (s < n - m) {
            ht = ((ht - (unsigned char)t[s] * h) * d + (unsigned char)t[s + m]) % q;
            if (ht < 0) ht += q; /* C 的 % 可能得到負數 */
        }
    }
    printf("matches at:");
    for (int i = 0; i < nm; i++) printf(" %d", matches[i]);
    printf("\nspurious hits (hash collision):");
    for (int i = 0; i < ns; i++) printf(" %d", spurious[i]);
    printf("\n");
    return 0;
}
