#include <stdio.h>
#include <string.h>

/* 在前面 window 個字元的「搜尋視窗」中找最長匹配，輸出 (往回距離, 長度, 下一個字元)；匹配可延伸到尚未編碼的部分 */
int main(void) {
    const char *s = "abracadabrarray";
    int n = (int)strlen(s), window = 8, off_[64], len_[64], nt = 0;
    char ch_[64];
    for (int i = 0; i < n;) {
        int best_len = 0, best_off = 0;
        for (int off = 1; off <= (window < i ? window : i); off++) {
            int len = 0;
            while (i + len < n - 1 && s[i - off + len] == s[i + len]) len++;
            if (len > best_len) { best_len = len; best_off = off; }
        }
        off_[nt] = best_off; len_[nt] = best_len; ch_[nt++] = s[i + best_len];
        i += best_len + 1;
    }
    printf("tokens:");
    for (int t = 0; t < nt; t++) printf(" (%d,%d,%c)", off_[t], len_[t], ch_[t]);
    char out[64];
    int k = 0;
    for (int t = 0; t < nt; t++) {
        for (int r = 0; r < len_[t]; r++, k++) out[k] = out[k - off_[t]];
        out[k++] = ch_[t];
    }
    out[k] = '\0';
    printf("\ndecode ok: %s\n", strcmp(out, s) == 0 ? "True" : "False");
    return 0;
}
