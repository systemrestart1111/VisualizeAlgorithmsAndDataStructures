#include <stdio.h>
#include <stdlib.h>
#include <string.h>

const char *s = "banana$";

static int cmp(const void *a, const void *b) { return strcmp(s + *(const int *)a, s + *(const int *)b); }

/* 依原字串順序處理後綴；相鄰後綴的 LCP 最多只會比前一個少 1，因此總共只需 O(n) 次比較 */
int main(void) {
    int n = (int)strlen(s), sa[64], rnk[64], lcp[64] = {0};
    for (int i = 0; i < n; i++) sa[i] = i;
    qsort(sa, n, sizeof(int), cmp); /* 這裡直接排序後綴取得後綴陣列 */
    for (int i = 0; i < n; i++) rnk[sa[i]] = i;
    for (int i = 0, k = 0; i < n; i++) { /* lcp[i] = sa[i] 與 sa[i-1] 的最長共同前綴 */
        if (rnk[i] == 0) { k = 0; continue; }
        int j = sa[rnk[i] - 1];
        while (i + k < n && j + k < n && s[i + k] == s[j + k]) k++;
        lcp[rnk[i]] = k;
        if (k) k--;
    }
    printf(" i  SA LCP suffix\n");
    for (int i = 0; i < n; i++) printf("%2d %3d %3d %s\n", i, sa[i], lcp[i], s + sa[i]);
    return 0;
}
