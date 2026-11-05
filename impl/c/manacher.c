#include <stdio.h>
#include <string.h>

/* 在字元間插入 #，奇偶長度回文統一處理；利用目前最右回文的對稱性，p[i] 可從鏡像位置繼承，O(n) */
int main(void) {
    const char *s = "babcbabcbaccba";
    int len = (int)strlen(s), n = 2 * len + 1, p[128] = {0};
    char t[128];
    for (int i = 0; i < n; i++) t[i] = i % 2 ? s[i / 2] : '#';
    for (int i = 0, c = 0, r = 0; i < n; i++) { /* p[i] = 以 i 為中心的回文半徑（不含中心） */
        if (i < r) p[i] = r - i < p[2 * c - i] ? r - i : p[2 * c - i];
        while (i - p[i] - 1 >= 0 && i + p[i] + 1 < n && t[i - p[i] - 1] == t[i + p[i] + 1]) p[i]++;
        if (i + p[i] > r) { c = i; r = i + p[i]; }
    }
    int best = 0;
    for (int i = 1; i < n; i++) if (p[i] > p[best]) best = i; /* 同長度取最先出現的 */
    int start = (best - p[best]) / 2;
    printf("longest palindrome = %.*s\nstart = %d length = %d\n", p[best], s + start, start, p[best]);
    return 0;
}
