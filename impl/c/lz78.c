#include <stdio.h>
#include <string.h>

/* 字典從空開始：找出字典中最長的前綴 w，輸出 (w 的編號, 下一個字元)，並把 w+字元 加入字典 */
char dict[64][32];
int nd;

int find(const char *w) {
    for (int i = 0; i < nd; i++) if (strcmp(dict[i], w) == 0) return i + 1;
    return 0;
}

int main(void) {
    const char *s = "ABBCBCABABCAABCAAB";
    char w[32] = "", wc[32];
    printf("output:");
    for (int i = 0; s[i]; i++) {
        sprintf(wc, "%s%c", w, s[i]);
        if (find(wc)) { strcpy(w, wc); continue; }
        printf(" (%d,%c)", find(w), s[i]);
        strcpy(dict[nd++], wc);
        w[0] = '\0';
    }
    if (w[0]) printf(" (%d,)", find(w));
    printf("\ndictionary:");
    for (int i = 0; i < nd; i++) printf(" %d:%s", i + 1, dict[i]);
    printf("\n");
    return 0;
}
