#include <stdio.h>
#include <string.h>

char dict[512][32];
int nd;

int find(const char *w) {
    if (strlen(w) == 1) return (unsigned char)w[0];
    for (int i = 256; i < nd; i++) if (strcmp(dict[i], w) == 0) return i;
    return -1;
}

/* 字典預先放入所有單一字元（0..255）；持續延長 w，遇到不在字典裡的 w+c 就輸出 w 的編號並把 w+c 加入字典 */
int main(void) {
    const char *s = "TOBEORNOTTOBEORTOBEORNOT";
    for (int i = 0; i < 256; i++) { dict[i][0] = (char)i; dict[i][1] = '\0'; }
    nd = 256;
    int codes[64], nc = 0;
    char w[32] = "", wc[32];
    for (int i = 0; s[i]; i++) {
        sprintf(wc, "%s%c", w, s[i]);
        if (find(wc) >= 0) { strcpy(w, wc); continue; }
        codes[nc++] = find(w);
        strcpy(dict[nd++], wc);
        w[0] = s[i]; w[1] = '\0';
    }
    if (w[0]) codes[nc++] = find(w);
    printf("codes:");
    for (int i = 0; i < nc; i++) printf(" %d", codes[i]);
    printf("\nnew entries:");
    for (int i = 256; i < nd; i++) printf(" %d:%s", i, dict[i]);
    /* 解碼：特殊情況是編號剛好是正要建立的那一個 */
    char out[128] = "", prev[32], entry[32];
    int m = 256;
    strcpy(prev, dict[codes[0]]);
    strcat(out, prev);
    for (int i = 1; i < nc; i++) {
        if (codes[i] < m) strcpy(entry, dict[codes[i]]);
        else sprintf(entry, "%s%c", prev, prev[0]);
        strcat(out, entry);
        sprintf(dict[m++], "%s%c", prev, entry[0]);
        strcpy(prev, entry);
    }
    printf("\n%d chars -> %d codes, decode ok: %s\n", (int)strlen(s), nc, strcmp(out, s) == 0 ? "True" : "False");
    return 0;
}
