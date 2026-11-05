#include <stdio.h>
#include <string.h>

/* 輸出字元目前的位置，再把它移到最前面；解碼時依位置取字元並同樣移到前面 */
static void move_front(char *table, int i) { char c = table[i]; memmove(table + 1, table, i); table[0] = c; }

int main(void) {
    const char *tests[4] = {"bananaaa", "aaabbbccc", "abcabcabc", "annb"};
    for (int t = 0; t < 4; t++) {
        const char *s = tests[t];
        char table[27], out[64];
        int codes[64], n = (int)strlen(s);
        strcpy(table, "abcdefghijklmnopqrstuvwxyz");
        for (int k = 0; k < n; k++) { int i = (int)(strchr(table, s[k]) - table); codes[k] = i; move_front(table, i); }
        strcpy(table, "abcdefghijklmnopqrstuvwxyz");
        for (int k = 0; k < n; k++) { out[k] = table[codes[k]]; move_front(table, codes[k]); }
        out[n] = 0;
        printf("%s:", s);
        for (int k = 0; k < n; k++) printf(" %d", codes[k]);
        printf(" -> %s\n", out);
    }
    return 0;
}
