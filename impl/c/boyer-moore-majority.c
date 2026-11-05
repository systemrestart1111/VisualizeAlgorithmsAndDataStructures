#include <stdio.h>

/* 多數投票：相同就 +1、不同就 -1，歸零時換候選人；最後再驗證一次是否過半 */
int main(void) {
    int a[] = {2, 2, 1, 3, 2, 1, 2, 2, 3, 2, 1, 2, 2};
    int n = sizeof a / sizeof a[0], cand = 0, count = 0, occ = 0;
    for (int i = 0; i < n; i++) {
        if (count == 0) cand = a[i];
        count += a[i] == cand ? 1 : -1;
    }
    for (int i = 0; i < n; i++) occ += a[i] == cand;
    if (occ * 2 > n) printf("majority = %d (%d/%d)\n", cand, occ, n);
    else printf("majority = None (%d/%d)\n", occ, n);
    return 0;
}
