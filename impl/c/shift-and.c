#include <stdio.h>
#include <string.h>

/* D 的第 j 位表示 pat[0..j] 目前是否匹配；D = ((D << 1) | 1) & B[c] */
static void run(const char *text, const char *pat) {
    unsigned B[256] = {0}, D = 0;
    int m = (int)strlen(pat), n = (int)strlen(text), first = 1;
    for (int j = 0; j < m; j++) B[(unsigned char)pat[j]] |= 1u << j;
    printf("'%s' in '%s': [", pat, text);
    for (int i = 0; i < n; i++) {
        D = ((D << 1) | 1) & B[(unsigned char)text[i]];
        if (D & (1u << (m - 1))) { printf(first ? "%d" : ", %d", i - m + 1); first = 0; }
    }
    printf("] (brute [");
    first = 1;
    for (int i = 0; i + m <= n; i++) if (!strncmp(text + i, pat, m)) { printf(first ? "%d" : ", %d", i); first = 0; }
    printf("])\n");
}

int main(void) {
    run("abracadabra cadabra", "abra");
    run("aaaaa", "aa");
    run("the cat sat on the mat", "at");
    run("abc", "abcd");
    return 0;
}
