#include <stdio.h>
#include <string.h>

/* 依第 d 個字元分桶（桶 0 是結尾桶，其餘依字元碼），對有兩個以上元素的桶遞迴 */
void msd(const char **w, int n, int d) {
    if (n <= 1) return;
    int c[258] = {0};
    const char *tmp[64];
    for (int i = 0; i < n; i++) c[(int)strlen(w[i]) <= d ? 0 : (unsigned char)w[i][d] + 1]++;
    int start[258], pos[258];
    start[0] = 0;
    for (int k = 1; k < 258; k++) start[k] = start[k - 1] + c[k - 1];
    memcpy(pos, start, sizeof pos);
    for (int i = 0; i < n; i++) tmp[pos[(int)strlen(w[i]) <= d ? 0 : (unsigned char)w[i][d] + 1]++] = w[i];
    memcpy(w, tmp, n * sizeof *w);
    for (int k = 1; k < 257; k++) if (c[k] > 1) msd(w + start[k], c[k], d + 1);
}

void run(const char **w, int n) {
    msd(w, n, 0);
    for (int i = 0; i < n; i++) printf(i ? " %s" : "%s", w[i]);
    printf("\n");
}

int main(void) {
    const char *a[] = {"she", "sells", "sea", "shells", "by", "the", "sea", "shore", "app", "apple", "ape"};
    const char *b[] = {"b", "a", "", "ab", "abc", "aa", "a"};
    run(a, 11);
    run(b, 7);
    return 0;
}
