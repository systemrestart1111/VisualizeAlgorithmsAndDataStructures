#include <stdio.h>
#include <string.h>

/* z[i] = s 與 s[i:] 的最長共同前綴長度；利用目前最右的 Z-box [l, r) 避免重複比較，O(n) */
void z_function(const char *s, int n, int *z) {
    z[0] = 0;
    for (int i = 1, l = 0, r = 0; i < n; i++) {
        z[i] = 0;
        if (i < r) z[i] = r - i < z[i - l] ? r - i : z[i - l];
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
}

int main(void) {
    const char *s = "aab$baabaaab";
    int n = (int)strlen(s), z[64], m = (int)(strchr(s, '$') - s); /* 把「樣式$文字」接起來，z[i] == len(樣式) 就是一次匹配 */
    z_function(s, n, z);
    printf("z:");
    for (int i = 0; i < n; i++) printf(" %d", z[i]);
    printf("\npattern %.*s found in text at:", m, s);
    for (int i = 0; i < n; i++) if (z[i] == m) printf(" %d", i - m - 1);
    printf("\n");
    return 0;
}
